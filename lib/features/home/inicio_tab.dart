import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/state/perfil_provider.dart';
import '../../core/theme/tema_via.dart';
import '../../data/models/perfil_accesibilidad.dart';
import '../../shared/widgets/tarjeta_accesible.dart';
import 'home_controller.dart';

/// El contenido de la pestaña «Inicio» de P-02: el orbe de escucha activa,
/// la transcripción en vivo y los accesos rápidos (docs/05-pantallas.md).
class InicioTab extends StatelessWidget {
  final HomeController controlador;
  final VoidCallback onAbrirWeb;
  final VoidCallback onOjoIa;
  final VoidCallback onLeerDocumento;
  final VoidCallback onTocarOrbe;

  const InicioTab({
    super.key,
    required this.controlador,
    required this.onAbrirWeb,
    required this.onOjoIa,
    required this.onLeerDocumento,
    required this.onTocarOrbe,
  });

  @override
  Widget build(BuildContext context) {
    final c = context.coloresVia;
    final ajustes = context.watch<PerfilProvider>().ajustes;

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(TemaVia.margenLateral),
        children: [
          Row(
            children: [
              const _LogoVia(),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('VÍA', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: c.texto)),
                  Text(
                    ajustes.perfil == null ? 'Hola' : 'Hola · perfil «${ajustes.perfil!.titulo}»',
                    style: TextStyle(fontSize: 12, color: c.textoSuave),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 26),
          Center(
            child: Column(
              children: [
                GestureDetector(
                  onTap: onTocarOrbe,
                  child: ValueListenableBuilder<bool>(
                    valueListenable: controlador.escuchando,
                    builder: (_, escuchando, _) => _Orbe(
                      activo: escuchando,
                      animar: !ajustes.reducirAnimaciones,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                ValueListenableBuilder<bool>(
                  valueListenable: controlador.microfonoDisponible,
                  builder: (_, disponible, _) {
                    if (!disponible) {
                      return Text(
                        'No se pudo usar el micrófono. Toca el orbe para intentar de nuevo.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: c.error, fontWeight: FontWeight.bold),
                      );
                    }
                    return ValueListenableBuilder<bool>(
                      valueListenable: controlador.escuchando,
                      builder: (_, escuchando, _) => Text(
                        escuchando ? '● ESCUCHANDO…' : 'Reconectando el micrófono…',
                        style: TextStyle(
                          color: escuchando ? c.accion : c.textoSuave,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.6,
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 12),
                ValueListenableBuilder<String>(
                  valueListenable: controlador.transcripcion,
                  builder: (_, texto, _) => texto.isEmpty
                      ? const SizedBox.shrink()
                      : Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          child: Text(
                            '«$texto»',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: c.texto, fontSize: 18),
                          ),
                        ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
          Text(
            'ACCESOS RÁPIDOS',
            style: TextStyle(
              color: c.textoSuave,
              fontSize: 12.5,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 10),
          TarjetaAccesible(
            emoji: '🌐',
            titulo: 'Abrir una web',
            descripcion: 'Se reconstruye en modo accesible',
            acento: AcentoTarjeta.accion,
            onTap: onAbrirWeb,
          ),
          const SizedBox(height: 10),
          TarjetaAccesible(
            emoji: '📷',
            titulo: 'Ojo IA',
            descripcion: 'Describe lo que apunta la cámara',
            acento: AcentoTarjeta.info,
            onTap: onOjoIa,
          ),
          const SizedBox(height: 10),
          TarjetaAccesible(
            emoji: '📄',
            titulo: 'Leer un documento',
            descripcion: 'Documento de ejemplo mientras llega el lector de archivos',
            onTap: onLeerDocumento,
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

class _LogoVia extends StatelessWidget {
  const _LogoVia();

  @override
  Widget build(BuildContext context) {
    final c = context.coloresVia;
    return Container(
      width: 36,
      height: 36,
      alignment: Alignment.center,
      decoration: BoxDecoration(color: c.accion, borderRadius: BorderRadius.circular(10)),
      child: Text(
        'V',
        style: TextStyle(color: c.fondoPrincipal, fontWeight: FontWeight.w900, fontSize: 18),
      ),
    );
  }
}

/// El orbe amarillo del micrófono. Pulsa mientras escucha, salvo que el
/// usuario haya activado "reducir animaciones" (docs/05-pantallas.md).
class _Orbe extends StatefulWidget {
  final bool activo;
  final bool animar;
  const _Orbe({required this.activo, required this.animar});

  @override
  State<_Orbe> createState() => _OrbeState();
}

class _OrbeState extends State<_Orbe> with SingleTickerProviderStateMixin {
  late final AnimationController _controlador = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 900),
  )..repeat(reverse: true);

  @override
  void dispose() {
    _controlador.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = context.coloresVia;
    final debePulsar = widget.activo && widget.animar;
    return AnimatedBuilder(
      animation: _controlador,
      builder: (context, child) {
        final escala = debePulsar ? 1.0 + (_controlador.value * 0.08) : 1.0;
        return Transform.scale(scale: escala, child: child);
      },
      child: Container(
        width: 108,
        height: 108,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: c.accion,
          boxShadow: widget.activo
              ? [BoxShadow(color: c.accion.withAlpha(90), blurRadius: 28, spreadRadius: 6)]
              : null,
        ),
        alignment: Alignment.center,
        child: Icon(Icons.mic_rounded, size: 46, color: c.fondoPrincipal),
      ),
    );
  }
}
