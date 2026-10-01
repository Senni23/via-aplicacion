// Pruebas de la lógica que no depende de plugins nativos (TTS, cámara,
// permisos): para probar esas hace falta un dispositivo real o un emulador,
// por eso viven en `flutter run`, no aquí. Esto cubre el reconocimiento de
// comandos de voz y el modelo de ajustes, que sí son Dart puro.

import 'package:flutter_test/flutter_test.dart';
import 'package:via_app/core/constants/comandos_voz.dart';
import 'package:via_app/data/models/perfil_accesibilidad.dart';

void main() {
  group('ComandosVoz.reconocer', () {
    test('reconoce "leer documento" con variaciones', () {
      expect(ComandosVoz.reconocer('leer documento'), ComandoVia.leerDocumento);
      expect(ComandosVoz.reconocer('quiero leer un documento por favor'), ComandoVia.leerDocumento);
    });

    test('ignora tildes y mayúsculas', () {
      expect(ComandosVoz.reconocer('AJUSTES'), ComandoVia.ajustes);
      expect(ComandosVoz.reconocer('Configuración'), ComandoVia.ajustes);
    });

    test('devuelve null si no reconoce nada', () {
      expect(ComandosVoz.reconocer('quiero pedir una pizza'), isNull);
    });
  });

  group('AjustesAccesibilidad', () {
    test('los valores por defecto no tienen perfil (onboarding pendiente)', () {
      final ajustes = AjustesAccesibilidad.porDefecto();
      expect(ajustes.perfil, isNull);
      expect(ajustes.escalaTexto, 1.0);
    });

    test('paraPerfil(bajaVision) sugiere texto al 200 %', () {
      final ajustes = AjustesAccesibilidad.paraPerfil(TipoPerfil.bajaVision);
      expect(ajustes.escalaTexto, 2.0);
    });

    test('el ida y vuelta por JSON conserva los valores', () {
      final original = AjustesAccesibilidad.paraPerfil(TipoPerfil.daltonismo)
          .copyWith(velocidadVoz: 1.5);
      final restaurado = AjustesAccesibilidad.desdeJson(original.aJson());
      expect(restaurado.perfil, original.perfil);
      expect(restaurado.esquemaColor, original.esquemaColor);
      expect(restaurado.velocidadVoz, original.velocidadVoz);
    });
  });
}
