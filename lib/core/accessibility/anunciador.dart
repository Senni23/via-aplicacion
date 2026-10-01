import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import '../../data/services/tts_service.dart';

/// Los cuatro patrones de vibración de docs/04-design-system.md. Cada uno
/// tiene un significado fijo: nunca se usan al revés.
enum TipoVibracion { cambioFoco, accionEjecutada, confirmacionImportante, error }

extension EjecutarVibracion on TipoVibracion {
  void ejecutar() {
    switch (this) {
      case TipoVibracion.cambioFoco:
        HapticFeedback.selectionClick();
        break;
      case TipoVibracion.accionEjecutada:
        HapticFeedback.lightImpact();
        break;
      case TipoVibracion.confirmacionImportante:
        HapticFeedback.mediumImpact();
        break;
      case TipoVibracion.error:
        HapticFeedback.heavyImpact();
        break;
    }
  }
}

/// Une las tres formas de confirmar una acción: voz, vibración y el lector
/// de pantalla del sistema (RNF-06). Es la pieza más usada de todo el
/// proyecto — toda la app pasa por aquí. Si algo cambia en la pantalla y no
/// se anuncia con esto, para el usuario ciego ese cambio no existe
/// (docs/03-arquitectura.md).
class Anunciador {
  final TtsService _tts;

  Anunciador(this._tts);

  /// Anuncia [mensaje] por voz, vibra y lo entrega también al lector de
  /// pantalla del sistema (TalkBack/VoiceOver), para quien lo tenga activo.
  /// [interrumpir] corta lo que se esté diciendo — útil para avisos urgentes
  /// como los de la guía de captura de Ojo IA.
  Future<void> anunciar(
    String mensaje, {
    bool interrumpir = false,
    TipoVibracion vibracion = TipoVibracion.cambioFoco,
  }) async {
    vibracion.ejecutar();
    // `announce` está marcado obsoleto a favor de `sendAnnouncement`, que
    // pide una `FlutterView` — eso obligaría a pasar un `BuildContext` por
    // todos los controladores (home, lector, ojo_ia...) que hoy no lo
    // necesitan. Sigue funcionando igual en TalkBack; se migra si Flutter
    // llega a quitarlo de verdad.
    // ignore: deprecated_member_use
    SemanticsService.announce(mensaje, TextDirection.ltr);
    await _tts.hablar(mensaje, interrumpir: interrumpir);
  }

  Future<void> detener() => _tts.detener();
}
