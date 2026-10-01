import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/state/perfil_provider.dart';
import 'core/theme/colores.dart';
import 'core/theme/tema_via.dart';
import 'features/home/home_screen.dart';
import 'features/onboarding/onboarding_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ViaApp());
}

/// El punto de entrada de VÍA. `PerfilProvider` vive arriba de todo para que
/// cualquier pantalla pueda leer los ajustes de accesibilidad y cualquier
/// cambio — el esquema de color, el tamaño de texto — repinte la app entera
/// al instante (Fase 6, RF-04).
class ViaApp extends StatelessWidget {
  const ViaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<PerfilProvider>(
      create: (_) => PerfilProvider()..cargar(),
      child: Consumer<PerfilProvider>(
        builder: (context, provider, _) {
          final colores = ColoresVia.deEsquema(provider.ajustes.esquemaColor);
          return MaterialApp(
            title: 'VÍA',
            debugShowCheckedModeBanner: false,
            theme: TemaVia.construir(colores),
            builder: (context, child) {
              if (child == null) return const SizedBox.shrink();
              // Combina el escalado de texto del SISTEMA (RNF-03: nunca lo
              // ignoramos) con el del deslizador de Ajustes (RF-07: hasta
              // 400 %), multiplicándolos — así ninguno de los dos anula al
              // otro.
              final mediaQuery = MediaQuery.of(context);
              final factorSistema = mediaQuery.textScaler.scale(100) / 100;
              final escalaCombinada = factorSistema * provider.ajustes.escalaTexto;
              return MediaQuery(
                data: mediaQuery.copyWith(
                  textScaler: TextScaler.linear(escalaCombinada),
                ),
                child: child,
              );
            },
            // `home` es siempre el mismo widget: la decisión de qué mostrar
            // (carga, onboarding o inicio) se resuelve DENTRO de _RaizVia en
            // cada reconstrucción, para no depender de si Navigator vuelve
            // a leer `home` tras el primer montaje.
            home: const _RaizVia(),
          );
        },
      ),
    );
  }
}

class _RaizVia extends StatelessWidget {
  const _RaizVia();

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PerfilProvider>();
    if (provider.cargando) return const _PantallaCarga();
    return provider.onboardingCompletado ? const HomeScreen() : const OnboardingScreen();
  }
}

class _PantallaCarga extends StatelessWidget {
  const _PantallaCarga();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: Color(0xFF0B0F14),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _LogoCarga(),
            SizedBox(height: 18),
            CircularProgressIndicator(color: Color(0xFFFFD400)),
          ],
        ),
      ),
    );
  }
}

class _LogoCarga extends StatelessWidget {
  const _LogoCarga();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 64,
      height: 64,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: const Color(0xFFFFD400),
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Text(
        'V',
        style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 30),
      ),
    );
  }
}
