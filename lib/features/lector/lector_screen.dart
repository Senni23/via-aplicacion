import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../core/state/perfil_provider.dart';
import '../../core/theme/tema_via.dart';
import '../../data/models/contenido_lectura.dart';
import '../../shared/widgets/chip_via.dart';
import 'lector_controller.dart';

/// P-03 · Lector adaptativo. Muestra el contenido ya reconstruido de forma
/// accesible y avanza de encabezado en encabezado (docs/05-pantallas.md).
class LectorScreen extends StatefulWidget {
  final ContenidoLectura contenido;
  const LectorScreen({super.key, required this.contenido});

  @override
  State<LectorScreen> createState() => _LectorScreenState();
}

class _LectorScreenState extends State<LectorScreen> {
  late final LectorController _controlador;

  @override
  void initState() {
    super.initState();
    _controlador = LectorController(context.read<PerfilProvider>(), widget.contenido);
    WidgetsBinding.instance.addPostFrameCallback((_) => _controlador.iniciar());
  }

  @override
  void dispose() {
    _controlador.detener();
    super.dispose();
  }

  void _mostrarIndice() {
    final c = context.coloresVia;
    showModalBottomSheet(
      context: context,
      backgroundColor: c.superficie,
      builder: (dialogContext) => SafeArea(
        child: ListView(
          shrinkWrap: true,
          children: List.generate(widget.contenido.secciones.length, (i) {
            final seccion = widget.contenido.secciones[i];
            return ListTile(
              title: Text(seccion.encabezado, style: TextStyle(color: c.texto)),
              subtitle: Text(
                'Encabezado ${i + 1} de ${widget.contenido.secciones.length}',
                style: TextStyle(color: c.textoSuave),
              ),
              onTap: () {
                Navigator.pop(dialogContext);
                _controlador.irA(i);
              },
            );
          }),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = context.coloresVia;
    return Scaffold(
      appBar: AppBar(
        leading: BackButton(
          onPressed: () {
            _controlador.detener();
            Navigator.pop(context);
          },
        ),
        title: Text('Lector adaptativo'),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: TemaVia.margenLateral),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.contenido.fuente, style: TextStyle(color: c.textoSuave, fontSize: 13)),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      const ChipVia(texto: '✓ Contraste 7:1 o más', estilo: EstiloChip.exito),
                      if (widget.contenido.totalImagenesSinAlt > 0)
                        ChipVia(
                          texto: '${widget.contenido.totalImagenesSinAlt} sin descripción',
                        ),
                      Selector<PerfilProvider, double>(
                        selector: (_, p) => p.ajustes.escalaTexto,
                        builder: (_, escala, _) => ChipVia(
                          texto: 'Texto ${(escala * 100).round()} %',
                          estilo: EstiloChip.activo,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: ValueListenableBuilder<int>(
                valueListenable: _controlador.indice,
                builder: (context, indice, _) {
                  final total = widget.contenido.secciones.length;
                  final seccion = widget.contenido.secciones[indice];
                  return ListView(
                    padding: const EdgeInsets.symmetric(horizontal: TemaVia.margenLateral),
                    children: [
                      Text(
                        'ENCABEZADO ${indice + 1} DE $total',
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(color: c.accion),
                      ),
                      const SizedBox(height: 8),
                      Text(seccion.encabezado, style: Theme.of(context).textTheme.headlineLarge),
                      const SizedBox(height: 14),
                      if (seccion.imagenesSinAlt.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.all(14),
                          margin: const EdgeInsets.only(bottom: 14),
                          decoration: BoxDecoration(
                            color: c.superficie,
                            border: Border.all(color: c.info, width: 2),
                            borderRadius: BorderRadius.circular(TemaVia.radioTarjeta),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '🖼 IMAGEN SIN DESCRIPCIÓN',
                                style: TextStyle(
                                  color: c.info,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12.5,
                                  letterSpacing: 1.2,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'VÍA detectó ${seccion.imagenesSinAlt.length} imagen(es) sin texto '
                                'alternativo en esta sección. La descripción automática con IA es '
                                'la Fase 11 del proyecto; por ahora queda marcada, nunca inventada.',
                                style: TextStyle(color: c.texto, fontSize: 15, height: 1.4),
                              ),
                            ],
                          ),
                        ),
                      ...seccion.parrafos.map(
                        (p) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Text(p, style: Theme.of(context).textTheme.bodyLarge),
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],
                  );
                },
              ),
            ),
            _barraReproductor(context),
          ],
        ),
      ),
    );
  }

  Widget _barraReproductor(BuildContext context) {
    final c = context.coloresVia;
    return Container(
      decoration: BoxDecoration(
        color: c.fondoApp,
        border: Border(top: BorderSide(color: c.borde)),
      ),
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: SafeArea(
        top: false,
        child: ValueListenableBuilder<EstadoLectura>(
          valueListenable: _controlador.estado,
          builder: (context, estado, _) {
            final reproduciendo = estado == EstadoLectura.reproduciendo;
            return Row(
              children: [
                _botonControl(
                  context,
                  icono: Icons.skip_previous_rounded,
                  etiqueta: 'Anterior',
                  onTap: _controlador.anterior,
                ),
                _botonControl(
                  context,
                  icono: reproduciendo ? Icons.pause_rounded : Icons.play_arrow_rounded,
                  etiqueta: reproduciendo ? 'Pausar' : 'Reproducir',
                  onTap: reproduciendo ? _controlador.pausar : _controlador.reanudar,
                  destacado: true,
                ),
                _botonControl(
                  context,
                  icono: Icons.skip_next_rounded,
                  etiqueta: 'Siguiente',
                  onTap: _controlador.siguiente,
                ),
                _botonControl(
                  context,
                  icono: Icons.list_rounded,
                  etiqueta: 'Índice',
                  onTap: _mostrarIndice,
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _botonControl(
    BuildContext context, {
    required IconData icono,
    required String etiqueta,
    required VoidCallback onTap,
    bool destacado = false,
  }) {
    final c = context.coloresVia;
    return Expanded(
      child: Semantics(
        button: true,
        label: etiqueta,
        excludeSemantics: true,
        child: InkWell(
          onTap: () {
            HapticFeedback.selectionClick();
            onTap();
          },
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: TemaVia.areaTactilMinima),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icono, color: destacado ? c.accion : c.texto, size: destacado ? 30 : 24),
                const SizedBox(height: 2),
                Text(
                  etiqueta,
                  style: TextStyle(
                    fontSize: 11.5,
                    color: destacado ? c.accion : c.textoSuave,
                    fontWeight: destacado ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
