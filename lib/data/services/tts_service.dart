import 'package:flutter_tts/flutter_tts.dart';

/// Envuelve `flutter_tts`. Es el único archivo del proyecto que lo importa
/// (regla de arquitectura #2 de docs/03-arquitectura.md): si mañana cambiamos
/// de paquete de voz, solo se toca este archivo.
class TtsService {
  final FlutterTts _tts = FlutterTts();
  bool _listo = false;

  Future<void> inicializar({double velocidadInicial = 1.0}) async {
    if (_listo) return;
    try {
      final idiomas = await _tts.getLanguages;
      final disponibles =
          idiomas is List ? idiomas.map((e) => e.toString()).toList() : <String>[];
      final idioma = disponibles.contains('es-PE')
          ? 'es-PE'
          : (disponibles.contains('es-ES') ? 'es-ES' : 'es-PE');
      await _tts.setLanguage(idioma);
    } catch (_) {
      // Si el dispositivo no reporta idiomas (pasa en algunos emuladores),
      // seguimos con es-PE como valor por defecto; el motor decide el resto.
      await _tts.setLanguage('es-PE');
    }
    await _tts.setPitch(1.0);
    await _tts.awaitSpeakCompletion(true);
    await cambiarVelocidad(velocidadInicial);
    _listo = true;
  }

  /// Dice [texto] en voz alta. Si [interrumpir] es true, corta lo que se
  /// esté diciendo antes de empezar — se usa para avisos urgentes como los
  /// de la guía de captura de Ojo IA.
  Future<void> hablar(String texto, {bool interrumpir = false}) async {
    if (texto.trim().isEmpty) return;
    if (!_listo) await inicializar();
    if (interrumpir) await detener();
    await _tts.speak(texto);
  }

  Future<void> detener() => _tts.stop();

  Future<void> pausar() => _tts.pause();

  /// [x] es el multiplicador de velocidad de VÍA, donde 1.0 es normal
  /// (rango 0.5x a 3x, ver docs/04-design-system.md). `flutter_tts` espera
  /// un valor de 0.0 a 1.0, así que se reescala aquí: este es el único lugar
  /// del proyecto que necesita conocer ese detalle de la librería.
  Future<void> cambiarVelocidad(double x) async {
    final valorPlugin = (x / 2.6).clamp(0.05, 1.0);
    await _tts.setSpeechRate(valorPlugin);
  }

  void dispose() {
    _tts.stop();
  }
}
