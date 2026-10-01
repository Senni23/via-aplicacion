import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/accessibility/anunciador.dart';
import '../../core/state/perfil_provider.dart';
import '../../core/theme/tema_via.dart';
import '../../data/services/lector_web_service.dart';
import '../../shared/widgets/boton_accesible.dart';
import '../lector/lector_screen.dart';

/// La pestaña «Navegar»: abre una URL y VÍA la reconstruye en modo
/// accesible (RF-18, RF-19, Fase 10).
class NavegarTab extends StatefulWidget {
  const NavegarTab({super.key});

  @override
  State<NavegarTab> createState() => _NavegarTabState();
}

class _NavegarTabState extends State<NavegarTab> {
  final _controladorTexto = TextEditingController();
  final _servicio = LectorWebService();
  bool _cargando = false;
  String? _error;

  @override
  void dispose() {
    _controladorTexto.dispose();
    super.dispose();
  }

  Future<void> _abrir() async {
    final url = _controladorTexto.text.trim();
    if (url.isEmpty) return;
    setState(() {
      _cargando = true;
      _error = null;
    });
    final anunciador = context.read<PerfilProvider>().anunciador;
    // Se anuncia solo el dominio, no la URL completa: escuchar un enlace
    // largo entero (con "https", barras y parámetros) es tedioso y no
    // aporta nada que el usuario necesite oír en ese momento.
    final dominio = Uri.tryParse(url.contains('://') ? url : 'https://$url')?.host;
    await anunciador.anunciar('Abriendo ${dominio != null && dominio.isNotEmpty ? dominio : 'la página'}.');
    try {
      final contenido = await _servicio.leerUrl(url);
      if (!mounted) return;
      setState(() => _cargando = false);
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => LectorScreen(contenido: contenido)),
      );
    } catch (e) {
      if (!mounted) return;
      final mensaje = 'No se pudo abrir la página. Revisa la dirección o tu conexión.';
      setState(() {
        _cargando = false;
        _error = mensaje;
      });
      await anunciador.anunciar(mensaje, vibracion: TipoVibracion.error);
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.coloresVia;
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(TemaVia.margenLateral),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Navegar', style: Theme.of(context).textTheme.headlineLarge),
            const SizedBox(height: 6),
            Text(
              'Escribe una dirección web y VÍA la reconstruye en modo accesible: '
              'con jerarquía de encabezados y contraste de 7:1 o más.',
              style: TextStyle(color: c.textoSuave, fontSize: 15, height: 1.4),
            ),
            const SizedBox(height: 20),
            Semantics(
              textField: true,
              label: 'Dirección web a abrir',
              child: TextField(
                controller: _controladorTexto,
                keyboardType: TextInputType.url,
                style: TextStyle(color: c.texto, fontSize: 16),
                decoration: InputDecoration(
                  hintText: 'ejemplo.com',
                  hintStyle: TextStyle(color: c.textoSuave),
                  filled: true,
                  fillColor: c.superficie,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(TemaVia.radioBoton),
                    borderSide: BorderSide(color: c.borde, width: 2),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(TemaVia.radioBoton),
                    borderSide: BorderSide(color: c.borde, width: 2),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(TemaVia.radioBoton),
                    borderSide: BorderSide(color: c.accion, width: 3),
                  ),
                ),
                onSubmitted: (_) => _abrir(),
              ),
            ),
            const SizedBox(height: 14),
            BotonAccesible(
              texto: _cargando ? 'Abriendo…' : 'Abrir página',
              etiquetaSemantica: 'Abrir la página web escrita',
              onPressed: _cargando ? null : _abrir,
            ),
            if (_error != null)
              Padding(
                padding: const EdgeInsets.only(top: 14),
                child: Text(_error!, style: TextStyle(color: c.error, fontSize: 14)),
              ),
          ],
        ),
      ),
    );
  }
}
