import 'package:html/dom.dart';
import 'package:html/parser.dart' as html_parser;
import 'package:http/http.dart' as http;
import '../models/contenido_lectura.dart';

/// Abre una URL, extrae su contenido y lo reconstruye con jerarquía de
/// encabezados (RF-18) y marca las imágenes sin texto alternativo (RF-19).
/// La descripción de esas imágenes con IA es la Fase 11 — aquí solo se
/// detectan y se dejan pendientes, nunca se inventa una descripción.
class LectorWebService {
  /// Tope de párrafos por sección, para que una página sin apenas
  /// encabezados no se convierta en una sola sección interminable.
  static const _maxParrafosPorSeccion = 40;

  Future<ContenidoLectura> leerUrl(String url) async {
    final uri = Uri.parse(url.contains('://') ? url : 'https://$url');
    final respuesta = await http.get(uri, headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; VIA-lector-accesible/1.0)',
    }).timeout(const Duration(seconds: 15));

    if (respuesta.statusCode != 200) {
      throw Exception(
        'No se pudo abrir la página (código ${respuesta.statusCode}).',
      );
    }

    final documento = html_parser.parse(respuesta.body);
    final tituloTag = documento.querySelector('title')?.text.trim();
    final titulo = (tituloTag != null && tituloTag.isNotEmpty) ? tituloTag : uri.host;

    return ContenidoLectura(
      titulo: titulo,
      fuente: '${uri.host} · reconstruido',
      origen: OrigenLectura.web,
      secciones: _construirSecciones(documento, titulo),
    );
  }

  bool _esEncabezado(Element e) =>
      e.localName == 'h1' || e.localName == 'h2' || e.localName == 'h3';

  /// Recorre el cuerpo en un solo paso, EN ORDEN DE DOCUMENTO, en vez de
  /// saltar de "hermano en hermano" desde cada encabezado. Eso importa
  /// porque muchos sitios reales (Wikipedia incluida) envuelven cada
  /// encabezado en un `<div>` contenedor — con `nextElementSibling` el
  /// "hermano" del encabezado es ese div, nunca el párrafo real, y la
  /// sección queda vacía. `querySelectorAll` sobre varias etiquetas a la
  /// vez siempre respeta el orden real del documento, sin importar cuántos
  /// contenedores haya de por medio, así que esto funciona en cualquier
  /// estructura de HTML.
  List<SeccionLectura> _construirSecciones(Document documento, String tituloPagina) {
    final cuerpo = documento.body;
    if (cuerpo == null) return [SeccionLectura(encabezado: tituloPagina)];

    final nodos = cuerpo.querySelectorAll('h1, h2, h3, p, img');

    final secciones = <SeccionLectura>[];
    var encabezadoActual = tituloPagina;
    var parrafos = <String>[];
    var imagenes = <String>[];

    void cerrarSeccionActual() {
      // Solo se guarda si de verdad trae contenido — si no, un artículo
      // que empieza con un encabezado dejaría una primera sección vacía y
      // silenciosa antes de la real.
      if (parrafos.isNotEmpty || imagenes.isNotEmpty) {
        secciones.add(SeccionLectura(
          encabezado: encabezadoActual,
          parrafos: List.of(parrafos),
          imagenesSinAlt: List.of(imagenes),
        ));
      }
    }

    for (final nodo in nodos) {
      if (_esEncabezado(nodo)) {
        final texto = nodo.text.trim();
        if (texto.isEmpty) continue;
        cerrarSeccionActual();
        encabezadoActual = texto;
        parrafos = [];
        imagenes = [];
      } else if (nodo.localName == 'p') {
        final t = nodo.text.trim();
        if (t.isNotEmpty && parrafos.length < _maxParrafosPorSeccion) parrafos.add(t);
      } else if (nodo.localName == 'img') {
        final alt = nodo.attributes['alt'];
        if (alt == null || alt.trim().isEmpty) {
          final src = nodo.attributes['src'];
          if (src != null && src.isNotEmpty) imagenes.add(src);
        }
      }
    }
    cerrarSeccionActual();

    return secciones.isEmpty ? [SeccionLectura(encabezado: tituloPagina)] : secciones;
  }
}
