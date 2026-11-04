// Pruebas de accesibilidad de VÍA: contraste de los tres esquemas de color
// (fórmula de la W3C), tamaño mínimo de las áreas táctiles, etiquetas para
// lectores de pantalla y comportamiento del modo simplificado. Se ejecutan
// con `flutter test` y no necesitan un teléfono.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:via_app/core/constants/comandos_voz.dart';
import 'package:via_app/core/state/perfil_provider.dart';
import 'package:via_app/core/theme/colores.dart';
import 'package:via_app/core/theme/tema_via.dart';
import 'package:via_app/data/models/perfil_accesibilidad.dart';
import 'package:via_app/features/ajustes/ajustes_screen.dart';
import 'package:via_app/shared/widgets/barra_navegacion.dart';
import 'package:via_app/shared/widgets/boton_accesible.dart';
import 'package:via_app/shared/widgets/tarjeta_accesible.dart';

double _contraste(Color a, Color b) {
  final la = a.computeLuminance();
  final lb = b.computeLuminance();
  final claro = la > lb ? la : lb;
  final oscuro = la > lb ? lb : la;
  return (claro + 0.05) / (oscuro + 0.05);
}

void _silenciarVoz() {
  TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
      .setMockMethodCallHandler(const MethodChannel('flutter_tts'), (_) async => null);
}

Widget _componentes(EsquemaColor esquema) {
  final colores = ColoresVia.deEsquema(esquema);
  return MaterialApp(
    theme: TemaVia.construir(colores),
    home: Scaffold(
      body: Column(
        children: [
          BotonAccesible(texto: 'Abrir página', onPressed: () {}),
          BotonAccesible(texto: 'Volver', destacado: false, onPressed: () {}),
          TarjetaAccesible(
            emoji: '📷',
            titulo: 'Ojo IA',
            descripcion: 'Lee en voz alta un texto con la cámara',
            onTap: () {},
          ),
        ],
      ),
      bottomNavigationBar: BarraNavegacionVia(indiceActual: 0, onCambiar: (_) {}),
    ),
  );
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Contraste de color (WCAG, relativo al fondo de la app)', () {
    for (final esquema in EsquemaColor.values) {
      test('${esquema.name}: todos los textos superan 7:1 (nivel AAA)', () {
        final c = ColoresVia.deEsquema(esquema);
        final roles = <String, Color>{
          'texto': c.texto,
          'textoSuave': c.textoSuave,
          'accion': c.accion,
          'info': c.info,
          'exito': c.exito,
          'error': c.error,
        };
        roles.forEach((nombre, color) {
          final razon = _contraste(color, c.fondoApp);
          // ignore: avoid_print
          print('CONTRASTE ${esquema.name} $nombre ${razon.toStringAsFixed(2)}');
          expect(razon, greaterThanOrEqualTo(7.0), reason: '$nombre en ${esquema.name}');
        });
      });
    }
  });

  group('Áreas táctiles y etiquetas (guías de Flutter)', () {
    for (final esquema in EsquemaColor.values) {
      testWidgets('${esquema.name}: 48 dp mínimo y etiquetas semánticas', (tester) async {
        final semantica = tester.ensureSemantics();
        await tester.pumpWidget(_componentes(esquema));
        await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
        await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
        semantica.dispose();
      });
    }
  });

  group('Modo simplificado', () {
    setUp(() {
      SharedPreferences.setMockInitialValues({});
      _silenciarVoz();
    });

    Future<void> abrirAjustes(WidgetTester tester, PerfilProvider provider) async {
      await tester.binding.setSurfaceSize(const Size(800, 3200));
      await tester.pumpWidget(
        ChangeNotifierProvider<PerfilProvider>.value(
          value: provider,
          child: Consumer<PerfilProvider>(
            builder: (context, p, _) => MaterialApp(
              theme: TemaVia.construir(ColoresVia.deEsquema(p.ajustes.esquemaColor)),
              home: const AjustesScreen(),
            ),
          ),
        ),
      );
      await tester.pump();
    }

    testWidgets('por defecto Ajustes muestra todas las secciones', (tester) async {
      final provider = PerfilProvider();
      await abrirAjustes(tester, provider);
      expect(find.text('COLOR E INTERFAZ'), findsOneWidget);
      expect(find.text('VISUALIZACIÓN'), findsOneWidget);
      expect(find.text('HISTORIAL'), findsOneWidget);
      await tester.binding.setSurfaceSize(null);
    });

    testWidgets('con el modo simplificado Ajustes oculta las opciones avanzadas', (tester) async {
      final provider = PerfilProvider();
      await provider.alternarModoSimplificado(true);
      await abrirAjustes(tester, provider);
      expect(find.text('Modo simplificado'), findsOneWidget);
      expect(find.text('PERFIL'), findsOneWidget);
      expect(find.text('COLOR E INTERFAZ'), findsNothing);
      expect(find.text('VISUALIZACIÓN'), findsNothing);
      expect(find.text('HISTORIAL'), findsNothing);
      await tester.binding.setSurfaceSize(null);
    });

    testWidgets('Ajustes cumple las guías de área táctil y etiquetas en modo simplificado', (tester) async {
      final semantica = tester.ensureSemantics();
      final provider = PerfilProvider();
      await provider.alternarModoSimplificado(true);
      await abrirAjustes(tester, provider);
      await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
      await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
      semantica.dispose();
      await tester.binding.setSurfaceSize(null);
    });

    test('el ajuste se guarda y se restaura en el JSON', () {
      final original = AjustesAccesibilidad.porDefecto().copyWith(modoSimplificado: true);
      expect(original.modoSimplificado, isTrue);
      expect(AjustesAccesibilidad.desdeJson(original.aJson()).modoSimplificado, isTrue);
      expect(AjustesAccesibilidad.porDefecto().modoSimplificado, isFalse);
    });

    test('las versiones antiguas del JSON (sin el campo) siguen cargando', () {
      final restaurado = AjustesAccesibilidad.desdeJson({'perfil': 'bajaVision', 'escalaTexto': 2.0});
      expect(restaurado.modoSimplificado, isFalse);
      expect(restaurado.escalaTexto, 2.0);
    });
  });

  group('Comandos de voz nuevos y variantes', () {
    test('"modo simple" y sus variantes activan el modo simplificado', () {
      expect(ComandosVoz.reconocer('modo simple'), ComandoVia.modoSimple);
      expect(ComandosVoz.reconocer('activar modo simplificado'), ComandoVia.modoSimple);
      expect(ComandosVoz.reconocer('modo fácil'), ComandoVia.modoSimple);
    });

    test('la sigla "IA" mal transcrita sigue abriendo la cámara', () {
      expect(ComandosVoz.reconocer('ojo ia'), ComandoVia.abrirCamara);
      expect(ComandosVoz.reconocer('ojo i a'), ComandoVia.abrirCamara);
      expect(ComandosVoz.reconocer('ojo ya'), ComandoVia.abrirCamara);
    });

    test('"ayuda" lista los comandos', () {
      expect(ComandosVoz.reconocer('ayuda'), ComandoVia.ayudaComandos);
      expect(ComandosVoz.reconocer('qué puedo decir'), ComandoVia.ayudaComandos);
    });
  });
}
