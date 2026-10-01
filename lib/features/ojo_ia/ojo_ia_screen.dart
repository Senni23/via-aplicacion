import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/state/perfil_provider.dart';
import '../../core/theme/tema_via.dart';
import '../../shared/widgets/boton_accesible.dart';
import '../../shared/widgets/chip_via.dart';
import '../ayuda/ayuda_screen.dart';
import 'ojo_ia_controller.dart';

/// P-04 · Ojo IA. La pantalla más importante del proyecto: responde
/// directamente al 28 % de fotos inservibles que documentaron Gurari et al.
/// (2018), guiando por voz antes de disparar (docs/05-pantallas.md).
class OjoIaScreen extends StatefulWidget {
  const OjoIaScreen({super.key});

  @override
  State<OjoIaScreen> createState() => _OjoIaScreenState();
}

class _OjoIaScreenState extends State<OjoIaScreen> with WidgetsBindingObserver {
  late final OjoIaController _controlador;
  bool _iniciado = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _controlador = OjoIaController(context.read<PerfilProvider>());
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await _controlador.iniciar();
      _iniciado = true;
    });
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (!_iniciado) return;
    if (state == AppLifecycleState.inactive || state == AppLifecycleState.paused) {
      _controlador.dispose();
      _iniciado = false;
    } else if (state == AppLifecycleState.resumed) {
      _controlador.iniciar().then((ok) => _iniciado = ok);
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _controlador.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.coloresVia;
    return Scaffold(
      appBar: AppBar(title: const Text('Ojo IA')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(TemaVia.margenLateral),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Apunta la cámara y VÍA describe', style: TextStyle(color: c.textoSuave)),
              const SizedBox(height: 12),
              _vistaCamara(context),
              const SizedBox(height: 14),
              ValueListenableBuilder<String>(
                valueListenable: _controlador.textoLeido,
                builder: (_, texto, _) {
                  if (texto.isEmpty) return const SizedBox.shrink();
                  return Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    margin: const EdgeInsets.only(bottom: 14),
                    decoration: BoxDecoration(
                      color: c.superficie,
                      border: Border.all(color: c.accion, width: 2),
                      borderRadius: BorderRadius.circular(TemaVia.radioTarjeta),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '🔊 LEYENDO EN VOZ ALTA',
                          style: TextStyle(
                            color: c.accion,
                            fontWeight: FontWeight.bold,
                            fontSize: 12.5,
                            letterSpacing: 1.2,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(texto, style: TextStyle(color: c.texto, fontSize: 16, height: 1.4)),
                      ],
                    ),
                  );
                },
              ),
              const Wrap(
                spacing: 10,
                runSpacing: 8,
                children: [
                  ChipVia(texto: 'Texto', estilo: EstiloChip.activo),
                  ChipVia(texto: 'Escena · próximamente'),
                  ChipVia(texto: 'Billetes · próximamente'),
                  ChipVia(texto: 'Productos · próximamente'),
                ],
              ),
              const SizedBox(height: 14),
              Container(
                width: double.infinity,
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
                      '¿La IA no basta?',
                      style: TextStyle(color: c.info, fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Di «ayuda humana» o toca aquí para conectarte con un voluntario '
                      'en menos de 30 segundos.',
                      style: TextStyle(color: c.texto, fontSize: 15),
                    ),
                    const SizedBox(height: 10),
                    BotonAccesible(
                      texto: 'Ayuda humana',
                      destacado: false,
                      etiquetaSemantica: 'Conectar con un voluntario por videollamada',
                      onPressed: () => Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const AyudaScreen()),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _vistaCamara(BuildContext context) {
    final c = context.coloresVia;
    return ValueListenableBuilder<EstadoOjoIa>(
      valueListenable: _controlador.estado,
      builder: (context, estado, _) {
        Widget interior;
        if (estado == EstadoOjoIa.sinPermiso || estado == EstadoOjoIa.error) {
          interior = _mensajeCentro(
            context,
            estado == EstadoOjoIa.sinPermiso ? Icons.no_photography_rounded : Icons.error_outline_rounded,
            _controlador.mensajeGuia.value,
          );
        } else if (_controlador.camara == null || !_controlador.camara!.value.isInitialized) {
          interior = const Center(child: CircularProgressIndicator());
        } else {
          interior = GestureDetector(
            onTap: estado == EstadoOjoIa.guiando ? _controlador.capturar : null,
            child: Stack(
              fit: StackFit.expand,
              children: [
                CameraPreview(_controlador.camara!),
                Padding(
                  padding: const EdgeInsets.all(22),
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      border: Border.all(color: c.accion, width: 3),
                      borderRadius: BorderRadius.circular(18),
                    ),
                  ),
                ),
                if (estado == EstadoOjoIa.capturando || estado == EstadoOjoIa.leyendo)
                  Container(
                    color: c.fondoPrincipal.withAlpha(160),
                    alignment: Alignment.center,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const CircularProgressIndicator(),
                        const SizedBox(height: 10),
                        Text(
                          estado == EstadoOjoIa.capturando ? 'Capturando…' : 'Leyendo…',
                          style: TextStyle(color: c.texto),
                        ),
                      ],
                    ),
                  ),
                Positioned(
                  left: 12,
                  right: 12,
                  bottom: 12,
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: ValueListenableBuilder<String>(
                      valueListenable: _controlador.mensajeGuia,
                      builder: (_, mensaje, _) => ValueListenableBuilder<bool>(
                        valueListenable: _controlador.listoParaCapturar,
                        builder: (_, listo, _) => ChipVia(
                          texto: listo ? '✓ $mensaje' : mensaje,
                          estilo: listo ? EstiloChip.exito : EstiloChip.normal,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        }
        return AspectRatio(
          aspectRatio: 3 / 4,
          child: Container(
            decoration: BoxDecoration(
              color: c.superficie,
              borderRadius: BorderRadius.circular(TemaVia.radioTarjeta),
              border: Border.all(color: c.borde, width: 2),
            ),
            clipBehavior: Clip.antiAlias,
            child: interior,
          ),
        );
      },
    );
  }

  Widget _mensajeCentro(BuildContext context, IconData icono, String texto) {
    final c = context.coloresVia;
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icono, size: 40, color: c.error),
          const SizedBox(height: 12),
          Text(texto, textAlign: TextAlign.center, style: TextStyle(color: c.texto)),
        ],
      ),
    );
  }
}
