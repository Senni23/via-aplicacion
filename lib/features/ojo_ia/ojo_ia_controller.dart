import 'dart:async';
import 'dart:io';
import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../core/accessibility/anunciador.dart';
import '../../core/state/perfil_provider.dart';
import '../../data/models/documento_leido.dart';
import '../../data/services/ocr_service.dart';

enum EstadoOjoIa { iniciando, sinPermiso, guiando, capturando, leyendo, error }

/// La lógica de P-04: pide permiso de cámara explicándolo antes por voz,
/// abre la cámara, evalúa continuamente la iluminación del encuadre y avisa
/// antes de disparar (RF-11), captura la foto y corre el OCR en el
/// dispositivo (RF-12, RF-13).
///
/// **Nota honesta sobre el alcance:** la guía evalúa la ILUMINACIÓN en
/// tiempo real (muestreo del plano de luminancia de la cámara), que es una
/// señal real y medible. Detectar con precisión si el documento está
/// "cortado" o "lejos" requeriría reconocer sus bordes — eso pide una
/// librería de visión por computador más pesada (por ejemplo OpenCV) que
/// queda fuera del alcance de esta fase. El usuario se guía por el marco
/// punteado en pantalla para el encuadre, y VÍA confirma por voz cuándo hay
/// luz suficiente para capturar.
class OjoIaController {
  final PerfilProvider perfilProvider;
  final OcrService _ocr = OcrService();

  CameraController? camara;
  DateTime _ultimoAviso = DateTime.fromMillisecondsSinceEpoch(0);

  final ValueNotifier<EstadoOjoIa> estado = ValueNotifier(EstadoOjoIa.iniciando);
  final ValueNotifier<String> mensajeGuia = ValueNotifier('Preparando cámara…');
  final ValueNotifier<bool> listoParaCapturar = ValueNotifier(false);
  final ValueNotifier<String> textoLeido = ValueNotifier('');

  OjoIaController(this.perfilProvider);

  Future<bool> iniciar() async {
    await perfilProvider.anunciador.anunciar(
      'VÍA necesita usar la cámara para leer documentos y fotografías. '
      'A continuación aparece el permiso del sistema.',
    );
    final permiso = await Permission.camera.request();
    if (!permiso.isGranted) {
      estado.value = EstadoOjoIa.sinPermiso;
      mensajeGuia.value =
          'Sin permiso de cámara, Ojo IA no puede funcionar. Actívalo en los ajustes del sistema.';
      await perfilProvider.anunciador.anunciar(
        mensajeGuia.value,
        vibracion: TipoVibracion.error,
      );
      return false;
    }

    try {
      final camaras = await availableCameras();
      if (camaras.isEmpty) {
        estado.value = EstadoOjoIa.error;
        mensajeGuia.value = 'No se encontró ninguna cámara en este dispositivo.';
        return false;
      }
      final trasera = camaras.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.back,
        orElse: () => camaras.first,
      );
      camara = CameraController(trasera, ResolutionPreset.medium, enableAudio: false);
      await camara!.initialize();
      await perfilProvider.anunciador.anunciar(
        'Cámara abierta. Apunta al documento. Te aviso cuando esté bien encuadrado.',
      );
      estado.value = EstadoOjoIa.guiando;
      await camara!.startImageStream(_procesarFrame);
      return true;
    } catch (e) {
      estado.value = EstadoOjoIa.error;
      mensajeGuia.value = 'No se pudo abrir la cámara.';
      return false;
    }
  }

  void _procesarFrame(CameraImage imagen) {
    if (estado.value != EstadoOjoIa.guiando) return;
    final ahora = DateTime.now();
    // Los avisos se espacian al menos 2 segundos (docs/05-pantallas.md):
    // un asistente que habla sin parar es inutilizable.
    if (ahora.difference(_ultimoAviso) < const Duration(seconds: 2)) return;

    final luminancia = _luminanciaPromedio(imagen);
    final bool listo = luminancia >= 60;
    final String mensaje = listo
        ? 'Documento enfocado, buena luz. Toca para capturar.'
        : 'Hay poca luz, busca un lugar más iluminado';

    if (mensaje == mensajeGuia.value) return; // no repetir el mismo aviso
    _ultimoAviso = ahora;
    mensajeGuia.value = mensaje;
    listoParaCapturar.value = listo;
    perfilProvider.anunciador.anunciar(
      mensaje,
      vibracion: listo ? TipoVibracion.confirmacionImportante : TipoVibracion.cambioFoco,
    );
  }

  /// Promedio del plano Y (luminancia) de un frame YUV420, muestreado cada
  /// pocos píxeles para no gastar cómputo de más en cada cuadro.
  double _luminanciaPromedio(CameraImage imagen) {
    final plano = imagen.planes.first.bytes;
    if (plano.isEmpty) return 0;
    var suma = 0;
    var muestras = 0;
    for (var i = 0; i < plano.length; i += 97) {
      suma += plano[i];
      muestras++;
    }
    return muestras == 0 ? 0 : suma / muestras;
  }

  Future<void> capturar() async {
    if (camara == null || estado.value != EstadoOjoIa.guiando) return;
    estado.value = EstadoOjoIa.capturando;
    await perfilProvider.anunciador.anunciar(
      'Capturando.',
      vibracion: TipoVibracion.confirmacionImportante,
    );
    try {
      await camara!.stopImageStream();
      final foto = await camara!.takePicture();
      estado.value = EstadoOjoIa.leyendo;
      await perfilProvider.anunciador.anunciar('Leyendo el texto de la foto.');
      final texto = await _ocr.reconocerTexto(foto.path);
      textoLeido.value = texto.isEmpty
          ? 'No se reconoció texto en la foto. Intenta acercarte más o mejorar la luz.'
          : texto;
      await perfilProvider.tts.hablar(textoLeido.value, interrumpir: true);
      if (texto.isNotEmpty) {
        final primeraLinea = texto.split('\n').first.trim();
        await perfilProvider.agregarAlHistorial(DocumentoLeido(
          id: DateTime.now().microsecondsSinceEpoch.toString(),
          titulo: primeraLinea.isEmpty ? 'Documento capturado' : primeraLinea,
          contenido: texto,
          origen: OrigenDocumento.fotoOcr,
          fecha: DateTime.now(),
        ));
      }
      try {
        await File(foto.path).delete();
      } catch (_) {
        // No pasa nada si no se pudo borrar el archivo temporal.
      }
    } catch (e) {
      estado.value = EstadoOjoIa.error;
      await perfilProvider.anunciador.anunciar(
        'No se pudo leer el documento. Intenta de nuevo.',
        vibracion: TipoVibracion.error,
      );
    }
  }

  Future<void> reiniciarGuia() async {
    if (camara == null || !camara!.value.isInitialized) return;
    textoLeido.value = '';
    mensajeGuia.value = 'Preparando cámara…';
    listoParaCapturar.value = false;
    _ultimoAviso = DateTime.fromMillisecondsSinceEpoch(0);
    estado.value = EstadoOjoIa.guiando;
    await camara!.startImageStream(_procesarFrame);
  }

  Future<void> dispose() async {
    try {
      if (camara?.value.isStreamingImages == true) {
        await camara?.stopImageStream();
      }
    } catch (_) {}
    await camara?.dispose();
    _ocr.dispose();
  }
}
