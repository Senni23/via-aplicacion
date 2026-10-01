/// De dónde vino el contenido de un [DocumentoLeido]. Sirve para mostrar un
/// ícono distinto en el historial y para saber cómo volver a reproducirlo.
enum OrigenDocumento { fotoOcr, web, texto }

/// Un documento que VÍA ya leyó en voz alta, guardado para poder volver a
/// escucharlo (RF-14, Fase 9).
class DocumentoLeido {
  final String id;
  final String titulo;
  final String contenido;
  final OrigenDocumento origen;
  final DateTime fecha;

  const DocumentoLeido({
    required this.id,
    required this.titulo,
    required this.contenido,
    required this.origen,
    required this.fecha,
  });

  Map<String, dynamic> aJson() => {
        'id': id,
        'titulo': titulo,
        'contenido': contenido,
        'origen': origen.name,
        'fecha': fecha.toIso8601String(),
      };

  factory DocumentoLeido.desdeJson(Map<String, dynamic> json) {
    return DocumentoLeido(
      id: json['id'] as String,
      titulo: json['titulo'] as String,
      contenido: json['contenido'] as String,
      origen: OrigenDocumento.values.firstWhere(
        (o) => o.name == json['origen'],
        orElse: () => OrigenDocumento.texto,
      ),
      fecha: DateTime.parse(json['fecha'] as String),
    );
  }
}
