import 'package:flutter/material.dart';
import '../../core/accessibility/anunciador.dart';
import '../../core/theme/tema_via.dart';

/// Botón con las reglas que no se negocian (docs/04-design-system.md):
/// 48×48 dp mínimo, etiqueta semántica de la ACCIÓN (no del ícono) y
/// vibración al tocar.
class BotonAccesible extends StatelessWidget {
  final String texto;
  final String etiquetaSemantica;
  final VoidCallback? onPressed;
  final IconData? icono;
  final bool destacado; // true = botón amarillo (acción principal); false = contorneado
  final TipoVibracion vibracion;

  const BotonAccesible({
    super.key,
    required this.texto,
    required this.onPressed,
    String? etiquetaSemantica,
    this.icono,
    this.destacado = true,
    this.vibracion = TipoVibracion.accionEjecutada,
  }) : etiquetaSemantica = etiquetaSemantica ?? texto;

  @override
  Widget build(BuildContext context) {
    final contenido = icono == null
        ? Text(texto, textAlign: TextAlign.center)
        : Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icono, size: 22),
              const SizedBox(width: 10),
              Flexible(child: Text(texto, textAlign: TextAlign.center)),
            ],
          );

    void alPresionar() {
      vibracion.ejecutar();
      onPressed?.call();
    }

    return Semantics(
      button: true,
      label: etiquetaSemantica,
      excludeSemantics: true,
      child: ConstrainedBox(
        constraints: const BoxConstraints(minHeight: TemaVia.areaTactilMinima),
        child: destacado
            ? ElevatedButton(onPressed: onPressed == null ? null : alPresionar, child: contenido)
            : OutlinedButton(onPressed: onPressed == null ? null : alPresionar, child: contenido),
      ),
    );
  }
}
