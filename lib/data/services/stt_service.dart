import 'package:speech_to_text/speech_to_text.dart';

/// Envuelve `speech_to_text`. Igual que `TtsService`, es el único archivo
/// que importa el paquete externo (regla de arquitectura #2).
class SttService {
  final SpeechToText _stt = SpeechToText();
  bool _disponible = false;

  bool get disponible => _disponible;
  bool get escuchando => _stt.isListening;

  Future<bool> inicializar({
    void Function(String error)? onError,
    void Function(String estado)? onEstado,
  }) async {
    _disponible = await _stt.initialize(
      onError: (e) => onError?.call(e.errorMsg),
      onStatus: (estado) => onEstado?.call(estado),
    );
    return _disponible;
  }

  /// Empieza a escuchar. [onResultado] se llama cada vez que hay una
  /// transcripción nueva (parcial o final) — quien llama decide qué hacer
  /// con `esFinal`.
  Future<void> escuchar({
    required void Function(String texto, bool esFinal) onResultado,
  }) async {
    if (!_disponible) return;
    await _stt.listen(
      listenOptions: SpeechListenOptions(localeId: 'es_PE'),
      onResult: (r) => onResultado(r.recognizedWords, r.finalResult),
    );
  }

  Future<void> detener() => _stt.stop();

  Future<void> cancelar() => _stt.cancel();
}
