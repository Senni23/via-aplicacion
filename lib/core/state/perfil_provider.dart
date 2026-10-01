import 'package:flutter/material.dart';
import '../../data/models/documento_leido.dart';
import '../../data/models/perfil_accesibilidad.dart';
import '../../data/services/preferencias_service.dart';
import '../../data/services/tts_service.dart';
import '../accessibility/anunciador.dart';
import '../theme/colores.dart';

/// El estado global de VÍA: los ajustes de accesibilidad del usuario, el
/// motor de voz y el anunciador. Se expone con `provider` (el paquete de
/// estado elegido en docs/CLAUDE.md) para que cualquier pantalla lo lea y
/// cualquier cambio — cambiar el esquema de color, subir el tamaño de
/// texto — repinte la app entera al instante, sin reiniciar nada (Fase 6).
class PerfilProvider extends ChangeNotifier {
  final PreferenciasService _preferencias = PreferenciasService();
  final TtsService tts = TtsService();
  late final Anunciador anunciador = Anunciador(tts);

  AjustesAccesibilidad _ajustes = AjustesAccesibilidad.porDefecto();
  List<DocumentoLeido> _historial = [];
  bool _cargando = true;

  AjustesAccesibilidad get ajustes => _ajustes;
  List<DocumentoLeido> get historial => List.unmodifiable(_historial);
  bool get cargando => _cargando;
  bool get onboardingCompletado => _ajustes.perfil != null;

  Future<void> cargar() async {
    _ajustes = await _preferencias.cargarAjustes();
    _historial = await _preferencias.cargarHistorial();
    await tts.inicializar(velocidadInicial: _ajustes.velocidadVoz);
    _cargando = false;
    notifyListeners();
  }

  /// P-01, onboarding: fija el perfil y aplica sus valores iniciales
  /// sugeridos (RF-01, RF-03).
  Future<void> elegirPerfilInicial(TipoPerfil perfil) async {
    _ajustes = AjustesAccesibilidad.paraPerfil(perfil);
    notifyListeners();
    await tts.cambiarVelocidad(_ajustes.velocidadVoz);
    await _guardar();
  }

  /// P-05, Ajustes (RF-04): cambia solo el perfil declarado, sin pisar los
  /// ajustes que el usuario ya personalizó.
  Future<void> cambiarPerfil(TipoPerfil perfil) async {
    _ajustes = _ajustes.copyWith(perfil: perfil);
    notifyListeners();
    await _guardar();
  }

  Future<void> cambiarEsquemaColor(EsquemaColor esquema) async {
    _ajustes = _ajustes.copyWith(esquemaColor: esquema);
    notifyListeners();
    await _guardar();
  }

  /// [escala] va de 1.0 (100 %) a 4.0 (400 %, tope de RNF-03).
  Future<void> cambiarEscalaTexto(double escala) async {
    _ajustes = _ajustes.copyWith(escalaTexto: escala);
    notifyListeners();
    await _guardar();
  }

  /// [velocidad] va de 0.5x a 3.0x (RF-07).
  Future<void> cambiarVelocidadVoz(double velocidad) async {
    _ajustes = _ajustes.copyWith(velocidadVoz: velocidad);
    notifyListeners();
    await tts.cambiarVelocidad(velocidad);
    await _guardar();
  }

  Future<void> alternarDescripcionIA(bool valor) async {
    _ajustes = _ajustes.copyWith(descripcionIA: valor);
    notifyListeners();
    await _guardar();
  }

  Future<void> alternarReducirAnimaciones(bool valor) async {
    _ajustes = _ajustes.copyWith(reducirAnimaciones: valor);
    notifyListeners();
    await _guardar();
  }

  Future<void> _guardar() => _preferencias.guardarAjustes(_ajustes);

  Future<void> agregarAlHistorial(DocumentoLeido documento) async {
    _historial = [documento, ..._historial].take(50).toList();
    notifyListeners();
    await _preferencias.guardarHistorial(_historial);
  }

  Future<void> borrarDelHistorial(String id) async {
    _historial = _historial.where((d) => d.id != id).toList();
    notifyListeners();
    await _preferencias.guardarHistorial(_historial);
  }

  @override
  void dispose() {
    tts.dispose();
    super.dispose();
  }
}
