import '../../core/theme/colores.dart';

/// Las tres formas de recibir la información que VÍA ofrece en el onboarding
/// (P-01). No cambia qué funciones existen, solo los valores iniciales de
/// [AjustesAccesibilidad] y el saludo de la pantalla de inicio.
enum TipoPerfil { cegueraTotal, bajaVision, daltonismo }

extension InfoTipoPerfil on TipoPerfil {
  String get titulo {
    switch (this) {
      case TipoPerfil.cegueraTotal:
        return 'Solo voz';
      case TipoPerfil.bajaVision:
        return 'Texto ampliado + voz';
      case TipoPerfil.daltonismo:
        return 'Colores adaptados';
    }
  }

  String get descripcion {
    switch (this) {
      case TipoPerfil.cegueraTotal:
        return 'Ceguera total · lectura por audio y gestos';
      case TipoPerfil.bajaVision:
        return 'Baja visión · fuente 200 % y alto contraste';
      case TipoPerfil.daltonismo:
        return 'Daltonismo · paletas seguras y etiquetas';
    }
  }

  String get emoji {
    switch (this) {
      case TipoPerfil.cegueraTotal:
        return '🔊';
      case TipoPerfil.bajaVision:
        return '🔍';
      case TipoPerfil.daltonismo:
        return '🎨';
    }
  }
}

/// Todo lo que el usuario personaliza en VÍA. Se guarda completo en
/// `shared_preferences` (ver `preferencias_service.dart`) y se aplica a la
/// app entera a través de `PerfilProvider`.
class AjustesAccesibilidad {
  final TipoPerfil? perfil; // null = onboarding todavía no completado
  final EsquemaColor esquemaColor;
  final double escalaTexto; // 1.0 = 100 % ... hasta 4.0 = 400 % (RNF-03)
  final double velocidadVoz; // 0.5x a 3.0x (RF-07)
  final bool descripcionIA; // Fase 11
  final bool reducirAnimaciones;

  const AjustesAccesibilidad({
    required this.perfil,
    required this.esquemaColor,
    required this.escalaTexto,
    required this.velocidadVoz,
    required this.descripcionIA,
    required this.reducirAnimaciones,
  });

  factory AjustesAccesibilidad.porDefecto() => const AjustesAccesibilidad(
        perfil: null,
        esquemaColor: EsquemaColor.altoContrasteOscuro,
        escalaTexto: 1.0,
        velocidadVoz: 1.0,
        descripcionIA: true,
        reducirAnimaciones: false,
      );

  /// Valores iniciales sugeridos al elegir un perfil en el onboarding.
  /// El usuario puede cambiarlos todos después, en Ajustes (RF-04).
  factory AjustesAccesibilidad.paraPerfil(TipoPerfil perfil) {
    switch (perfil) {
      case TipoPerfil.cegueraTotal:
        return AjustesAccesibilidad.porDefecto().copyWith(perfil: perfil);
      case TipoPerfil.bajaVision:
        return AjustesAccesibilidad.porDefecto().copyWith(
          perfil: perfil,
          escalaTexto: 2.0,
        );
      case TipoPerfil.daltonismo:
        return AjustesAccesibilidad.porDefecto().copyWith(
          perfil: perfil,
          esquemaColor: EsquemaColor.daltonicoAzulNaranja,
        );
    }
  }

  AjustesAccesibilidad copyWith({
    TipoPerfil? perfil,
    EsquemaColor? esquemaColor,
    double? escalaTexto,
    double? velocidadVoz,
    bool? descripcionIA,
    bool? reducirAnimaciones,
  }) {
    return AjustesAccesibilidad(
      perfil: perfil ?? this.perfil,
      esquemaColor: esquemaColor ?? this.esquemaColor,
      escalaTexto: escalaTexto ?? this.escalaTexto,
      velocidadVoz: velocidadVoz ?? this.velocidadVoz,
      descripcionIA: descripcionIA ?? this.descripcionIA,
      reducirAnimaciones: reducirAnimaciones ?? this.reducirAnimaciones,
    );
  }

  Map<String, dynamic> aJson() => {
        'perfil': perfil?.name,
        'esquemaColor': esquemaColor.name,
        'escalaTexto': escalaTexto,
        'velocidadVoz': velocidadVoz,
        'descripcionIA': descripcionIA,
        'reducirAnimaciones': reducirAnimaciones,
      };

  factory AjustesAccesibilidad.desdeJson(Map<String, dynamic> json) {
    final base = AjustesAccesibilidad.porDefecto();
    return base.copyWith(
      perfil: _porNombre(TipoPerfil.values, json['perfil'] as String?),
      esquemaColor:
          _porNombre(EsquemaColor.values, json['esquemaColor'] as String?),
      escalaTexto: (json['escalaTexto'] as num?)?.toDouble(),
      velocidadVoz: (json['velocidadVoz'] as num?)?.toDouble(),
      descripcionIA: json['descripcionIA'] as bool?,
      reducirAnimaciones: json['reducirAnimaciones'] as bool?,
    );
  }

  static T? _porNombre<T extends Enum>(List<T> valores, String? nombre) {
    if (nombre == null) return null;
    for (final valor in valores) {
      if (valor.name == nombre) return valor;
    }
    return null;
  }
}
