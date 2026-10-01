import 'package:flutter/foundation.dart';
import '../../core/accessibility/anunciador.dart';
import '../../core/state/perfil_provider.dart';
import '../../data/models/contenido_lectura.dart';
import '../../data/models/documento_leido.dart';

enum EstadoLectura { reproduciendo, pausado, detenido }

/// La lógica de P-03: el anuncio de apertura, el avance automático de
/// encabezado en encabezado (RF-08, RF-09) y los controles de reproducción
/// (RF-06). Cuando termina de leer todo, guarda el documento en el
/// historial (RF-14).
class LectorController {
  final PerfilProvider perfilProvider;
  final ContenidoLectura contenido;

  LectorController(this.perfilProvider, this.contenido);

  final ValueNotifier<int> indice = ValueNotifier(0);
  final ValueNotifier<EstadoLectura> estado = ValueNotifier(EstadoLectura.detenido);

  int get total => contenido.secciones.length;
  SeccionLectura get seccionActual => contenido.secciones[indice.value];

  Future<void> iniciar() async {
    await perfilProvider.anunciador.anunciar(
      'Lector adaptativo. ${contenido.titulo}. $total encabezados. Reproduciendo.',
    );
    await _leerActual();
  }

  Future<void> _leerActual() async {
    estado.value = EstadoLectura.reproduciendo;
    final seccion = seccionActual;
    await perfilProvider.tts.hablar(
      'Encabezado ${indice.value + 1} de $total. ${seccion.textoCompleto}',
    );
    // Si nadie pausó ni navegó mientras se leía, avanza solo (RF-09).
    if (estado.value != EstadoLectura.reproduciendo) return;
    if (indice.value < total - 1) {
      await siguiente();
    } else {
      estado.value = EstadoLectura.detenido;
      await perfilProvider.anunciador.anunciar('Fin del documento.');
      _guardarEnHistorial();
    }
  }

  Future<void> pausar() async {
    if (estado.value != EstadoLectura.reproduciendo) return;
    estado.value = EstadoLectura.pausado;
    await perfilProvider.tts.detener();
    await perfilProvider.anunciador.anunciar(
      'Pausado.',
      vibracion: TipoVibracion.accionEjecutada,
    );
  }

  Future<void> reanudar() async {
    if (estado.value == EstadoLectura.reproduciendo) return;
    await perfilProvider.anunciador.anunciar(
      'Reanudando.',
      vibracion: TipoVibracion.accionEjecutada,
    );
    await _leerActual();
  }

  Future<void> siguiente() async {
    if (indice.value >= total - 1) {
      await perfilProvider.anunciador.anunciar('Este es el último encabezado.');
      return;
    }
    indice.value++;
    await _leerActual();
  }

  Future<void> anterior() async {
    if (indice.value <= 0) {
      await perfilProvider.anunciador.anunciar('Este es el primer encabezado.');
      return;
    }
    indice.value--;
    await _leerActual();
  }

  Future<void> irA(int i) async {
    if (i < 0 || i >= total || i == indice.value) return;
    indice.value = i;
    await _leerActual();
  }

  Future<void> repetir() => _leerActual();

  Future<void> detener() async {
    estado.value = EstadoLectura.detenido;
    await perfilProvider.tts.detener();
  }

  void _guardarEnHistorial() {
    final origen = switch (contenido.origen) {
      OrigenLectura.web => OrigenDocumento.web,
      OrigenLectura.fotoOcr => OrigenDocumento.fotoOcr,
      OrigenLectura.ejemplo => OrigenDocumento.texto,
    };
    perfilProvider.agregarAlHistorial(DocumentoLeido(
      id: DateTime.now().microsecondsSinceEpoch.toString(),
      titulo: contenido.titulo,
      contenido: contenido.textoCompleto,
      origen: origen,
      fecha: DateTime.now(),
    ));
  }
}
