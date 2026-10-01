/// Una sección de contenido, delimitada por un encabezado. El lector
/// adaptativo (P-03) salta de sección en sección, no de párrafo en párrafo
/// (RF-08, RF-09) — por eso todo lo que se lee en VÍA, venga de una web, de
/// una foto con OCR o de un documento de ejemplo, se representa así.
class SeccionLectura {
  final String encabezado;
  final List<String> parrafos;
  final List<String> imagenesSinAlt;

  const SeccionLectura({
    required this.encabezado,
    this.parrafos = const [],
    this.imagenesSinAlt = const [],
  });

  String get textoCompleto =>
      parrafos.isEmpty ? encabezado : '$encabezado. ${parrafos.join(' ')}';
}

/// De dónde salió el contenido que se está leyendo. Cambia el subtítulo de
/// P-03 y el ícono en el historial.
enum OrigenLectura { web, fotoOcr, ejemplo }

class ContenidoLectura {
  final String titulo;
  final String fuente;
  final OrigenLectura origen;
  final List<SeccionLectura> secciones;

  const ContenidoLectura({
    required this.titulo,
    required this.fuente,
    required this.origen,
    required this.secciones,
  });

  int get totalImagenesSinAlt =>
      secciones.fold(0, (total, s) => total + s.imagenesSinAlt.length);

  String get textoCompleto => secciones.map((s) => s.textoCompleto).join('\n\n');
}
