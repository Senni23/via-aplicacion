import 'package:flutter/material.dart';
import 'colores.dart';

/// Lleva la paleta [ColoresVia] completa dentro del `ThemeData` de Flutter,
/// como una extensión de tema. Los roles que Material ya modela bien
/// (acción, información, error) están también en `colorScheme`; esta
/// extensión existe para los que no tienen un hueco estándar: `superficie2`,
/// `borde`, `textoSuave`, `exito`.
class ColoresViaExtension extends ThemeExtension<ColoresViaExtension> {
  final ColoresVia colores;
  const ColoresViaExtension(this.colores);

  @override
  ColoresViaExtension copyWith({ColoresVia? colores}) =>
      ColoresViaExtension(colores ?? this.colores);

  @override
  ColoresViaExtension lerp(ThemeExtension<ColoresViaExtension>? other, double t) {
    // Los esquemas de color no se interpolan entre sí (son elecciones
    // discretas del usuario, no una animación de color), así que al t<0.5
    // se queda con el actual y al final ya adoptó el nuevo.
    if (other is! ColoresViaExtension) return this;
    return t < 0.5 ? this : other;
  }
}

/// Acceso corto a la paleta activa: `context.coloresVia.superficie2`.
extension ColoresViaContext on BuildContext {
  ColoresVia get coloresVia =>
      Theme.of(this).extension<ColoresViaExtension>()!.colores;
}

/// Construye el `ThemeData` completo de Flutter a partir de una [ColoresVia].
/// Todo widget de la app debe tomar sus colores de `Theme.of(context)`, nunca
/// de `ColoresVia` directamente — así un solo cambio de esquema en Ajustes
/// repinta la app entera sin tocar cada pantalla.
class TemaVia {
  TemaVia._();

  static const double radioTarjeta = 18;
  static const double radioBoton = 16;
  static const double margenLateral = 20;
  static const double areaTactilMinima = 48;

  static ThemeData construir(ColoresVia c) {
    final brillo = c.brillo;

    final colorScheme = ColorScheme(
      brightness: brillo,
      primary: c.accion,
      onPrimary: c.fondoPrincipal,
      secondary: c.info,
      onSecondary: c.fondoPrincipal,
      error: c.error,
      onError: c.fondoPrincipal,
      surface: c.fondoApp,
      onSurface: c.texto,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: brillo,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: c.fondoApp,
      canvasColor: c.fondoApp,
      splashFactory: InkRipple.splashFactory,
      textTheme: _textTheme(c),
      appBarTheme: AppBarTheme(
        backgroundColor: c.fondoApp,
        foregroundColor: c.texto,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.bold,
          color: c.texto,
        ),
      ),
      cardTheme: CardThemeData(
        color: c.superficie,
        elevation: 0,
        margin: const EdgeInsets.symmetric(vertical: 6),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radioTarjeta),
          side: BorderSide(color: c.borde, width: 2),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: c.accion,
          foregroundColor: c.fondoPrincipal,
          disabledBackgroundColor: c.superficie2,
          disabledForegroundColor: c.textoSuave,
          minimumSize: const Size(double.infinity, areaTactilMinima),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radioBoton),
          ),
          textStyle: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: c.texto,
          side: BorderSide(color: c.borde, width: 2),
          minimumSize: const Size(double.infinity, areaTactilMinima),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radioBoton),
          ),
          textStyle: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
        ),
      ),
      iconTheme: IconThemeData(color: c.texto, size: 26),
      dividerTheme: DividerThemeData(color: c.borde, thickness: 1),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith(
          (states) => states.contains(WidgetState.selected)
              ? c.accion
              : c.textoSuave,
        ),
        trackColor: WidgetStateProperty.resolveWith(
          (states) => states.contains(WidgetState.selected)
              ? c.accion.withAlpha(110)
              : c.superficie2,
        ),
      ),
      sliderTheme: SliderThemeData(
        activeTrackColor: c.accion,
        inactiveTrackColor: c.superficie2,
        thumbColor: c.accion,
        overlayColor: c.accion.withAlpha(60),
        valueIndicatorColor: c.accion,
        valueIndicatorTextStyle: TextStyle(color: c.fondoPrincipal),
      ),
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: c.accion,
        linearTrackColor: c.superficie2,
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: c.superficie2,
        contentTextStyle: TextStyle(color: c.texto, fontSize: 16),
        behavior: SnackBarBehavior.floating,
      ),
      focusColor: c.accion.withAlpha(64),
      highlightColor: c.accion.withAlpha(40),
      splashColor: c.accion.withAlpha(30),
      extensions: [ColoresViaExtension(c)],
    );
  }

  static TextTheme _textTheme(ColoresVia c) {
    return TextTheme(
      // Título de pantalla · 26 sp · bold
      headlineLarge: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: c.texto, height: 1.2),
      // Encabezado de sección · 19 sp · bold
      titleLarge: TextStyle(fontSize: 19, fontWeight: FontWeight.bold, color: c.texto),
      // Cuerpo · 16 sp
      bodyMedium: TextStyle(fontSize: 16, color: c.texto, height: 1.4),
      // Cuerpo de contenido leído · 18 sp
      bodyLarge: TextStyle(fontSize: 18, color: c.texto, height: 1.5),
      // Etiqueta secundaria · 14 sp
      labelLarge: TextStyle(fontSize: 14, color: c.textoSuave),
      // Micro-etiqueta · 12.5 sp · bold
      labelSmall: TextStyle(
        fontSize: 12.5,
        fontWeight: FontWeight.bold,
        color: c.textoSuave,
        letterSpacing: 1.2,
      ),
    );
  }
}
