import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../core/accessibility/anunciador.dart';
import '../../core/state/perfil_provider.dart';
import '../../core/theme/tema_via.dart';
import '../../shared/widgets/chip_via.dart';

/// P-06 · Ayuda humana.
///
/// **Esta pantalla está SIMULADA.** No hay red de voluntarios real ni
/// videollamada: conectar con una persona de verdad necesita infraestructura
/// de videollamada (WebRTC) y voluntarios reales, algo que queda fuera del
/// alcance de este curso (docs/05-pantallas.md lo aclara explícitamente).
/// Toda la interfaz sí es real y funcional — botones, cronómetro,
/// transcripción — pero "Marco T." y su conversación son datos de ejemplo.
class AyudaScreen extends StatefulWidget {
  const AyudaScreen({super.key});

  @override
  State<AyudaScreen> createState() => _AyudaScreenState();
}

class _AyudaScreenState extends State<AyudaScreen> {
  bool _conectado = false;
  bool _silenciado = false;
  Timer? _cronometro;
  Duration _duracion = Duration.zero;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _simularConexion());
  }

  Future<void> _simularConexion() async {
    final anunciador = context.read<PerfilProvider>().anunciador;
    await anunciador.anunciar('Buscando voluntario disponible.');
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;
    setState(() => _conectado = true);
    await anunciador.anunciar(
      'Conectado con Marco, voluntario verificado de Lima.',
      vibracion: TipoVibracion.confirmacionImportante,
    );
    _cronometro = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() => _duracion += const Duration(seconds: 1));
    });
  }

  @override
  void dispose() {
    _cronometro?.cancel();
    super.dispose();
  }

  String get _tiempo {
    final m = _duracion.inMinutes.toString().padLeft(2, '0');
    final s = (_duracion.inSeconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  Future<void> _finalizar() async {
    _cronometro?.cancel();
    await context.read<PerfilProvider>().anunciador.anunciar(
          'Llamada finalizada.',
          vibracion: TipoVibracion.accionEjecutada,
        );
    if (mounted) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.coloresVia;
    return Scaffold(
      appBar: AppBar(title: const Text('Ayuda humana')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(TemaVia.margenLateral),
          child: !_conectado
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const CircularProgressIndicator(),
                      const SizedBox(height: 16),
                      Text(
                        'Buscando voluntario disponible…',
                        style: TextStyle(color: c.texto, fontSize: 17),
                      ),
                    ],
                  ),
                )
              : ListView(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 18),
                      decoration: BoxDecoration(
                        color: c.superficie,
                        borderRadius: BorderRadius.circular(TemaVia.radioTarjeta),
                        border: Border.all(color: c.accion, width: 3),
                      ),
                      child: Column(
                        children: [
                          Container(
                            width: 74,
                            height: 74,
                            decoration: BoxDecoration(color: c.info, shape: BoxShape.circle),
                            alignment: Alignment.center,
                            child: const Text('👤', style: TextStyle(fontSize: 34)),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            'Conectado con Marco T.',
                            style: TextStyle(fontSize: 22, color: c.texto, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Voluntario verificado · Lima, Perú · ⭐ 4.9',
                            style: TextStyle(color: c.textoSuave),
                          ),
                          const SizedBox(height: 10),
                          ChipVia(texto: '● En llamada · $_tiempo', estilo: EstiloChip.exito),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: c.superficie,
                        border: Border.all(color: c.info, width: 2),
                        borderRadius: BorderRadius.circular(TemaVia.radioTarjeta),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '💬 Transcripción en vivo',
                            style: TextStyle(color: c.info, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '«El formulario pide tu número de DNI en el tercer campo, justo '
                            'debajo del correo. Te voy guiando.»',
                            style: TextStyle(color: c.texto, fontSize: 15, height: 1.4),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'DURANTE LA LLAMADA',
                      style: TextStyle(
                        color: c.textoSuave,
                        fontSize: 12.5,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: _botonAccion(
                            context,
                            _silenciado ? Icons.mic_off_rounded : Icons.mic_rounded,
                            _silenciado ? 'Reactivar\nmicrófono' : 'Silenciar',
                            () => setState(() => _silenciado = !_silenciado),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _botonAccion(context, Icons.screen_share_rounded, 'Compartir\npantalla', () {
                            context.read<PerfilProvider>().anunciador.anunciar(
                                  'Función simulada: en una versión real, esto compartiría tu '
                                  'pantalla con el voluntario.',
                                );
                          }),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _botonAccion(context, Icons.edit_note_rounded, 'Guardar\nnota', () {
                            context.read<PerfilProvider>().anunciador.anunciar(
                                  'Nota guardada.',
                                  vibracion: TipoVibracion.accionEjecutada,
                                );
                          }),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    OutlinedButton(
                      onPressed: _finalizar,
                      child: const Padding(
                        padding: EdgeInsets.symmetric(vertical: 4),
                        child: Text('Finalizar llamada'),
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _botonAccion(BuildContext context, IconData icono, String etiqueta, VoidCallback onTap) {
    final c = context.coloresVia;
    return Semantics(
      button: true,
      label: etiqueta.replaceAll('\n', ' '),
      excludeSemantics: true,
      child: InkWell(
        onTap: () {
          HapticFeedback.selectionClick();
          onTap();
        },
        borderRadius: BorderRadius.circular(TemaVia.radioTarjeta),
        child: Container(
          constraints: const BoxConstraints(minHeight: TemaVia.areaTactilMinima),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: c.superficie,
            border: Border.all(color: c.borde, width: 2),
            borderRadius: BorderRadius.circular(TemaVia.radioTarjeta),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icono, color: c.texto, size: 24),
              const SizedBox(height: 4),
              Text(etiqueta, textAlign: TextAlign.center, style: TextStyle(fontSize: 12.5, color: c.texto)),
            ],
          ),
        ),
      ),
    );
  }
}
