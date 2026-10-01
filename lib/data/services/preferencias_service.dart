import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/perfil_accesibilidad.dart';
import '../models/documento_leido.dart';

/// Único lugar del proyecto que toca `shared_preferences` directamente
/// (regla de arquitectura #2: los paquetes externos se quedan envueltos
/// en `data/services/`).
class PreferenciasService {
  static const _claveAjustes = 'via_ajustes_accesibilidad';
  static const _claveHistorial = 'via_historial_documentos';

  Future<AjustesAccesibilidad> cargarAjustes() async {
    final prefs = await SharedPreferences.getInstance();
    final texto = prefs.getString(_claveAjustes);
    if (texto == null) return AjustesAccesibilidad.porDefecto();
    try {
      return AjustesAccesibilidad.desdeJson(
        jsonDecode(texto) as Map<String, dynamic>,
      );
    } catch (_) {
      // Si el JSON guardado quedó corrupto por una versión vieja de la app,
      // no tumbamos el arranque: volvemos a los valores por defecto.
      return AjustesAccesibilidad.porDefecto();
    }
  }

  Future<void> guardarAjustes(AjustesAccesibilidad ajustes) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_claveAjustes, jsonEncode(ajustes.aJson()));
  }

  Future<List<DocumentoLeido>> cargarHistorial() async {
    final prefs = await SharedPreferences.getInstance();
    final lista = prefs.getStringList(_claveHistorial);
    if (lista == null) return [];
    return lista
        .map((texto) {
          try {
            return DocumentoLeido.desdeJson(
              jsonDecode(texto) as Map<String, dynamic>,
            );
          } catch (_) {
            return null;
          }
        })
        .whereType<DocumentoLeido>()
        .toList();
  }

  Future<void> guardarHistorial(List<DocumentoLeido> documentos) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(
      _claveHistorial,
      documentos.map((d) => jsonEncode(d.aJson())).toList(),
    );
  }
}
