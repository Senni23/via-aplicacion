import '../../core/accessibility/anunciador.dart';
import '../../core/state/perfil_provider.dart';
import '../../data/models/perfil_accesibilidad.dart';

/// La lógica de P-01: qué se anuncia al abrir y qué pasa al elegir y
/// confirmar un perfil. La pantalla solo dibuja; esto decide
/// (docs/03-arquitectura.md, regla 1).
class OnboardingController {
  final PerfilProvider perfilProvider;
  OnboardingController(this.perfilProvider);

  Future<void> anunciarBienvenida() {
    return perfilProvider.anunciador.anunciar(
      'Configuración de accesibilidad. ¿Cómo prefieres recibir la '
      'información? Tres opciones. Uno: solo voz, para ceguera total. '
      'Dos: texto ampliado más voz, para baja visión. Tres: colores '
      'adaptados, para daltonismo. Di el número de tu opción o tócala en '
      'pantalla.',
    );
  }

  Future<void> anunciarSeleccion(TipoPerfil perfil) {
    return perfilProvider.anunciador.anunciar(
      'Seleccionado: ${perfil.titulo}.',
      vibracion: TipoVibracion.accionEjecutada,
    );
  }

  Future<void> anunciarFaltaSeleccion() {
    return perfilProvider.anunciador.anunciar(
      'Elige una opción primero: uno, dos o tres.',
      vibracion: TipoVibracion.error,
    );
  }

  Future<void> confirmar(TipoPerfil perfil) {
    return perfilProvider.elegirPerfilInicial(perfil);
  }
}
