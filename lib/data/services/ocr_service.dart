import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';

/// Envuelve `google_mlkit_text_recognition`. Corre en el propio dispositivo,
/// sin nube (RNF-08) — coherente con la regla de arquitectura #3.
class OcrService {
  final TextRecognizer _reconocedor =
      TextRecognizer(script: TextRecognitionScript.latin);

  /// Extrae el texto de la foto en [rutaImagen]. Devuelve cadena vacía si no
  /// encontró texto reconocible.
  Future<String> reconocerTexto(String rutaImagen) async {
    final imagen = InputImage.fromFilePath(rutaImagen);
    final resultado = await _reconocedor.processImage(imagen);
    return resultado.text.trim();
  }

  void dispose() {
    _reconocedor.close();
  }
}
