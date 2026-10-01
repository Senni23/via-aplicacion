import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/state/perfil_provider.dart';
import '../../core/theme/tema_via.dart';
import '../../data/models/perfil_accesibilidad.dart';
import '../../shared/widgets/boton_accesible.dart';
import '../../shared/widgets/tarjeta_accesible.dart';
import '../home/home_screen.dart';
import 'onboarding_controller.dart';

/// P-01 · Perfil de accesibilidad. La primera pantalla al instalar
/// (docs/05-pantallas.md). El reconocimiento por voz de "uno/dos/tres"
/// (RF-02) llega con los comandos de voz en la Fase 5, en Inicio; aquí la
/// selección es táctil.
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  late final OnboardingController _controlador;
  TipoPerfil? _seleccionado;

  @override
  void initState() {
    super.initState();
    _controlador = OnboardingController(context.read<PerfilProvider>());
    WidgetsBinding.instance.addPostFrameCallback((_) => _controlador.anunciarBienvenida());
  }

  Future<void> _seleccionar(TipoPerfil perfil) async {
    setState(() => _seleccionado = perfil);
    await _controlador.anunciarSeleccion(perfil);
  }

  Future<void> _confirmar() async {
    final perfil = _seleccionado;
    if (perfil == null) {
      await _controlador.anunciarFaltaSeleccion();
      return;
    }
    await _controlador.confirmar(perfil);
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const HomeScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = context.coloresVia;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 4),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(color: c.accion, borderRadius: BorderRadius.circular(10)),
                    child: Text(
                      'V',
                      style: TextStyle(color: c.fondoPrincipal, fontWeight: FontWeight.w900, fontSize: 18),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('VÍA', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: c.texto)),
                      Text(
                        'Paso 2 de 3 · Perfil de accesibilidad',
                        style: TextStyle(fontSize: 12, color: c.textoSuave),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(
                  TemaVia.margenLateral,
                  14,
                  TemaVia.margenLateral,
                  0,
                ),
                children: [
                  Text(
                    '¿Cómo prefieres\nrecibir la información?',
                    style: Theme.of(context).textTheme.headlineLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Toca una opción. Podrás cambiarla cuando quieras desde Ajustes.',
                    style: TextStyle(color: c.textoSuave, fontSize: 15),
                  ),
                  const SizedBox(height: 18),
                  ...TipoPerfil.values.map(
                    (perfil) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: TarjetaAccesible(
                        emoji: perfil.emoji,
                        titulo: perfil.titulo,
                        descripcion: perfil.descripcion,
                        seleccionada: _seleccionado == perfil,
                        acento: _seleccionado == perfil ? AcentoTarjeta.accion : AcentoTarjeta.neutro,
                        onTap: () => _seleccionar(perfil),
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
              child: BotonAccesible(
                texto: 'Continuar',
                etiquetaSemantica: 'Continuar con el perfil seleccionado',
                onPressed: _confirmar,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
