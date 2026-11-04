// Herramienta de línea de comandos (no forma parte de la app): audita la
// accesibilidad básica de una página web y prueba el lector web de VÍA sobre
// ella. Uso:  dart run tool/auditoria_web.dart https://www.onpe.gob.pe
//
// Cuenta los cuatro fallos de WCAG más frecuentes según WebAIM (2026) —
// imágenes sin texto alternativo, enlaces vacíos, campos sin etiqueta y
// ausencia de encabezados— y luego reconstruye la página con
// LectorWebService, exactamente igual que la app.

import 'dart:convert';

import 'package:html/parser.dart' as html_parser;
import 'package:http/http.dart' as http;
import 'package:via_app/data/services/lector_web_service.dart';

Future<void> main(List<String> args) async {
  final url = args.isEmpty ? 'https://www.onpe.gob.pe' : args.first;
  final uri = Uri.parse(url.contains('://') ? url : 'https://$url');

  final respuesta = await http.get(uri, headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; VIA-lector-accesible/1.0)',
  }).timeout(const Duration(seconds: 25));

  final doc = html_parser.parse(respuesta.body);

  final imagenes = doc.querySelectorAll('img');
  final sinAlt = imagenes.where((i) => !i.attributes.containsKey('alt')).length;
  final altVacio = imagenes.where((i) => i.attributes['alt']?.trim().isEmpty ?? false).length;

  final enlaces = doc.querySelectorAll('a');
  final enlacesVacios = enlaces.where((a) {
    final texto = a.text.trim();
    final etiqueta = (a.attributes['aria-label'] ?? a.attributes['title'] ?? '').trim();
    final tieneImagenConAlt =
        a.querySelectorAll('img').any((i) => (i.attributes['alt'] ?? '').trim().isNotEmpty);
    return texto.isEmpty && etiqueta.isEmpty && !tieneImagenConAlt;
  }).length;

  final campos = doc.querySelectorAll('input, select, textarea').where((c) {
    final tipo = (c.attributes['type'] ?? 'text').toLowerCase();
    return !const ['hidden', 'submit', 'button', 'image', 'reset'].contains(tipo);
  }).toList();
  final camposSinEtiqueta = campos.where((c) {
    final id = c.attributes['id'];
    final conLabel = id != null && doc.querySelectorAll('label[for="$id"]').isNotEmpty;
    final conAria = (c.attributes['aria-label'] ?? c.attributes['aria-labelledby'] ?? c.attributes['title'] ?? '')
        .trim()
        .isNotEmpty;
    final envuelto = c.parent?.localName == 'label';
    return !conLabel && !conAria && !envuelto;
  }).length;

  final encabezados = doc.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
  final tieneIdioma = (doc.documentElement?.attributes['lang'] ?? '').isNotEmpty;

  Map<String, Object?> lector;
  try {
    final contenido = await LectorWebService().leerUrl(uri.toString());
    lector = {
      'ok': true,
      'titulo': contenido.titulo,
      'secciones': contenido.secciones.length,
      'parrafos': contenido.secciones.fold<int>(0, (t, s) => t + s.parrafos.length),
      'imagenesSinAltDetectadas': contenido.totalImagenesSinAlt,
      'caracteresLeibles': contenido.textoCompleto.length,
    };
  } catch (e) {
    lector = {'ok': false, 'error': e.toString()};
  }

  final salida = {
    'url': uri.toString(),
    'estado': respuesta.statusCode,
    'bytes': respuesta.bodyBytes.length,
    'imagenes': imagenes.length,
    'imagenesSinAlt': sinAlt,
    'imagenesAltVacio': altVacio,
    'enlaces': enlaces.length,
    'enlacesVacios': enlacesVacios,
    'camposDeFormulario': campos.length,
    'camposSinEtiqueta': camposSinEtiqueta,
    'encabezados': encabezados,
    'declaraIdioma': tieneIdioma,
    'lectorVia': lector,
  };
  // ignore: avoid_print
  print(const JsonEncoder.withIndent('  ').convert(salida));
}
