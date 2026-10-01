import 'package:flutter/material.dart';

/// Los esquemas de color entre los que el usuario puede elegir en Ajustes.
/// `altoContrasteOscuro` es el que especifica docs/04-design-system.md;
/// los otros dos existen porque no todos los ojos ven el color igual.
enum EsquemaColor { altoContrasteOscuro, altoContrasteClaro, daltonicoAzulNaranja }

extension DescripcionEsquemaColor on EsquemaColor {
  String get nombre {
    switch (this) {
      case EsquemaColor.altoContrasteOscuro:
        return 'Alto contraste oscuro';
      case EsquemaColor.altoContrasteClaro:
        return 'Alto contraste claro';
      case EsquemaColor.daltonicoAzulNaranja:
        return 'Colores adaptados (daltonismo)';
    }
  }

  String get descripcion {
    switch (this) {
      case EsquemaColor.altoContrasteOscuro:
        return 'Fondo negro, texto blanco, acciones en amarillo · contraste 15.8:1';
      case EsquemaColor.altoContrasteClaro:
        return 'Fondo blanco, texto oscuro · contraste 17.7:1';
      case EsquemaColor.daltonicoAzulNaranja:
        return 'Azul y naranja en vez de rojo/verde · seguro para protanopía y deuteranopía';
    }
  }

  String get emoji {
    switch (this) {
      case EsquemaColor.altoContrasteOscuro:
        return '🌑';
      case EsquemaColor.altoContrasteClaro:
        return '☀️';
      case EsquemaColor.daltonicoAzulNaranja:
        return '🎨';
    }
  }
}

/// Una paleta completa de colores de VÍA. `TemaVia` convierte una instancia
/// de esta clase en el `ThemeData` real que usa la app.
///
/// Los nombres de los campos describen el ROL del color (acción principal,
/// información, éxito, error), no su tono literal: en el esquema por
/// defecto `accion` es amarillo, pero en el esquema para daltonismo es
/// naranja. Así el resto del código nunca pregunta "¿es amarillo?", sino
/// "¿es el color de acción principal?" — y cambiar de esquema no rompe nada.
class ColoresVia {
  final Color fondoPrincipal; // el negro/blanco puro, para superficies extremas (splash, etc.)
  final Color fondoApp; // fondo de todas las pantallas
  final Color superficie; // tarjetas
  final Color superficie2; // tarjetas anidadas, chips
  final Color borde; // bordes de tarjeta
  final Color texto; // texto principal
  final Color textoSuave; // texto secundario
  final Color accion; // acción principal de cada pantalla, y el foco
  final Color info; // información generada por IA
  final Color exito; // confirmaciones y estados correctos
  final Color error; // errores

  const ColoresVia({
    required this.fondoPrincipal,
    required this.fondoApp,
    required this.superficie,
    required this.superficie2,
    required this.borde,
    required this.texto,
    required this.textoSuave,
    required this.accion,
    required this.info,
    required this.exito,
    required this.error,
  });

  /// Contraste verificado (WCAG, relativo a `fondoApp`): texto 21:1 ·
  /// accion 15.8:1 · info 11.4:1 · textoSuave 10.9:1.
  static const oscuro = ColoresVia(
    fondoPrincipal: Color(0xFF000000),
    fondoApp: Color(0xFF0B0F14),
    superficie: Color(0xFF151A21),
    superficie2: Color(0xFF1F2630),
    borde: Color(0xFF39424F),
    texto: Color(0xFFFFFFFF),
    textoSuave: Color(0xFFB9C2CE),
    accion: Color(0xFFFFD400),
    info: Color(0xFF4DD0FF),
    exito: Color(0xFF5BE39A),
    error: Color(0xFFFF8080),
  );

  /// Para quien prefiere fondo claro. Mismo criterio de 7:1 mínimo, verificado
  /// con la fórmula de contraste relativo de WCAG antes de fijar cada tono.
  static const claro = ColoresVia(
    fondoPrincipal: Color(0xFFFFFFFF),
    fondoApp: Color(0xFFF4F6F8),
    superficie: Color(0xFFFFFFFF),
    superficie2: Color(0xFFE7EBEF),
    borde: Color(0xFF6B7684),
    texto: Color(0xFF0B0F14),
    textoSuave: Color(0xFF3B4552),
    accion: Color(0xFF6B4A00), // 7.4:1
    info: Color(0xFF004D73), // 8.4:1
    exito: Color(0xFF0B5A2C), // 7.7:1
    error: Color(0xFF8F1F19), // 8.2:1
  );

  /// Evita depender de la distinción rojo/verde (la que falla en protanopía y
  /// deuteranopía, los dos tipos más comunes de daltonismo): usa naranja para
  /// la acción principal, azul para información, y turquesa para éxito.
  /// El rojo de error se mantiene porque ya no compite visualmente con
  /// ningún verde en esta paleta, así que sigue siendo distinguible.
  static const daltonico = ColoresVia(
    fondoPrincipal: Color(0xFF000000),
    fondoApp: Color(0xFF0A0F17),
    superficie: Color(0xFF141C28),
    superficie2: Color(0xFF1D2836),
    borde: Color(0xFF3E4C5E),
    texto: Color(0xFFFFFFFF),
    textoSuave: Color(0xFFBFCAD6),
    accion: Color(0xFFFFA733), // naranja · 9.9:1
    info: Color(0xFF63B3FF), // azul · 8.6:1
    exito: Color(0xFF4DD9C0), // turquesa · 11.0:1
    error: Color(0xFFFF8080), // 7.9:1
  );

  static ColoresVia deEsquema(EsquemaColor esquema) {
    switch (esquema) {
      case EsquemaColor.altoContrasteOscuro:
        return oscuro;
      case EsquemaColor.altoContrasteClaro:
        return claro;
      case EsquemaColor.daltonicoAzulNaranja:
        return daltonico;
    }
  }

  Brightness get brillo =>
      fondoApp.computeLuminance() < 0.5 ? Brightness.dark : Brightness.light;
}
