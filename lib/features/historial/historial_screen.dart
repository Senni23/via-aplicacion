import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/state/perfil_provider.dart';
import '../../core/theme/tema_via.dart';
import '../../data/models/contenido_lectura.dart';
import '../../data/models/documento_leido.dart';
import '../lector/lector_screen.dart';

/// Fase 9 (RF-14): los documentos que VÍA ya leyó, para volver a
/// escucharlos sin repetir la captura o la búsqueda.
class HistorialScreen extends StatelessWidget {
  const HistorialScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final c = context.coloresVia;
    final provider = context.watch<PerfilProvider>();
    final documentos = provider.historial;

    return Scaffold(
      appBar: AppBar(title: const Text('Historial')),
      body: SafeArea(
        child: documentos.isEmpty
            ? Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Text(
                    'Todavía no hay documentos guardados. Los que leas con Ojo IA, '
                    'el lector web o el de ejemplo aparecerán aquí.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: c.textoSuave, fontSize: 16),
                  ),
                ),
              )
            : ListView.separated(
                padding: const EdgeInsets.all(TemaVia.margenLateral),
                itemCount: documentos.length,
                separatorBuilder: (_, _) => const SizedBox(height: 10),
                itemBuilder: (context, i) {
                  final doc = documentos[i];
                  return Dismissible(
                    key: ValueKey(doc.id),
                    direction: DismissDirection.endToStart,
                    onDismissed: (_) {
                      provider.borrarDelHistorial(doc.id);
                      provider.anunciador.anunciar('Documento eliminado del historial.');
                    },
                    background: Container(
                      alignment: Alignment.centerRight,
                      padding: const EdgeInsets.only(right: 20),
                      decoration: BoxDecoration(
                        color: c.error,
                        borderRadius: BorderRadius.circular(TemaVia.radioTarjeta),
                      ),
                      child: Icon(Icons.delete_outline_rounded, color: c.fondoPrincipal),
                    ),
                    child: Card(
                      child: ListTile(
                        leading: Icon(_icono(doc.origen), color: c.info),
                        title: Text(
                          doc.titulo,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(color: c.texto),
                        ),
                        subtitle: Text(_fecha(doc.fecha), style: TextStyle(color: c.textoSuave)),
                        trailing: Icon(Icons.play_arrow_rounded, color: c.accion),
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => LectorScreen(contenido: _aContenido(doc)),
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
      ),
    );
  }

  ContenidoLectura _aContenido(DocumentoLeido doc) {
    final origen = switch (doc.origen) {
      OrigenDocumento.web => OrigenLectura.web,
      OrigenDocumento.fotoOcr => OrigenLectura.fotoOcr,
      OrigenDocumento.texto => OrigenLectura.ejemplo,
    };
    return ContenidoLectura(
      titulo: doc.titulo,
      fuente: 'Del historial · ${_fecha(doc.fecha)}',
      origen: origen,
      secciones: [SeccionLectura(encabezado: doc.titulo, parrafos: [doc.contenido])],
    );
  }

  IconData _icono(OrigenDocumento origen) {
    switch (origen) {
      case OrigenDocumento.fotoOcr:
        return Icons.camera_alt_rounded;
      case OrigenDocumento.web:
        return Icons.public_rounded;
      case OrigenDocumento.texto:
        return Icons.description_rounded;
    }
  }

  String _fecha(DateTime f) {
    String dos(int n) => n.toString().padLeft(2, '0');
    return '${dos(f.day)}/${dos(f.month)}/${f.year} · ${dos(f.hour)}:${dos(f.minute)}';
  }
}
