import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/comandos_voz.dart';
import '../../core/state/perfil_provider.dart';
import '../../shared/widgets/barra_navegacion.dart';
import '../ajustes/ajustes_screen.dart';
import '../ayuda/ayuda_screen.dart';
import '../lector/documento_ejemplo.dart';
import '../lector/lector_screen.dart';
import '../ojo_ia/ojo_ia_screen.dart';
import 'home_controller.dart';
import 'inicio_tab.dart';
import 'navegar_tab.dart';

/// El contenedor de las 4 pestañas (Inicio, Navegar, Ojo IA, Ajustes) y el
/// despachador de comandos de voz reconocidos en cualquiera de ellas
/// (docs/05-pantallas.md: la barra inferior está en P-02, P-04, P-05 y P-06).
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _indice = 0;
  late final HomeController _controlador;

  @override
  void initState() {
    super.initState();
    _controlador = HomeController(context.read<PerfilProvider>());
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await _controlador.anunciarInicio();
      await _controlador.iniciarEscuchaContinua(_manejarComando);
    });
  }

  @override
  void dispose() {
    _controlador.detener();
    super.dispose();
  }

  void _manejarComando(ComandoVia comando) {
    final anunciador = _controlador.perfilProvider.anunciador;
    switch (comando) {
      case ComandoVia.leerDocumento:
        _abrirLectorEjemplo();
        break;
      case ComandoVia.abrirCamara:
        setState(() => _indice = 2);
        break;
      case ComandoVia.ajustes:
        setState(() => _indice = 3);
        break;
      case ComandoVia.inicio:
        setState(() => _indice = 0);
        break;
      case ComandoVia.ayudaHumana:
        Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AyudaScreen()));
        break;
      case ComandoVia.repetir:
        anunciador.anunciar('Puedes decir: leer documento, abrir cámara o ajustes.');
        break;
      case ComandoVia.ayudaComandos:
        anunciador.anunciar(
          'Comandos disponibles: leer documento, ojo IA, ajustes, inicio, '
          'repetir, parar, más rápido, más lento, y ayuda humana.',
        );
        break;
      case ComandoVia.masRapido:
        _cambiarVelocidad(0.25);
        break;
      case ComandoVia.masLento:
        _cambiarVelocidad(-0.25);
        break;
      case ComandoVia.parar:
        _controlador.perfilProvider.tts.detener();
        break;
      default:
        anunciador.anunciar('No entendí. Puedes decir: leer documento, abrir cámara o ajustes.');
    }
  }

  void _cambiarVelocidad(double delta) {
    final provider = _controlador.perfilProvider;
    final nueva = (provider.ajustes.velocidadVoz + delta).clamp(0.5, 3.0);
    provider.cambiarVelocidadVoz(nueva);
    provider.anunciador.anunciar('Velocidad, ${nueva.toStringAsFixed(2)} veces.');
  }

  void _abrirLectorEjemplo() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => LectorScreen(contenido: documentoEjemplo)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final Widget pantalla = switch (_indice) {
      1 => const NavegarTab(),
      2 => const OjoIaScreen(),
      3 => const AjustesScreen(),
      _ => InicioTab(
          controlador: _controlador,
          onAbrirWeb: () => setState(() => _indice = 1),
          onOjoIa: () => setState(() => _indice = 2),
          onLeerDocumento: _abrirLectorEjemplo,
          onTocarOrbe: () => _controlador.reintentarEscucha(_manejarComando),
        ),
    };

    return Scaffold(
      body: pantalla,
      bottomNavigationBar: BarraNavegacionVia(
        indiceActual: _indice,
        onCambiar: (i) => setState(() => _indice = i),
      ),
    );
  }
}
