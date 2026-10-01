import 'package:flutter/material.dart';
import '../../core/accessibility/anunciador.dart';
import '../../core/theme/tema_via.dart';

/// De qué color es el círculo del ícono de la tarjeta.
enum AcentoTarjeta { accion, info, neutro }

/// La tarjeta grande de ícono + título + descripción de P-01 y P-02
/// (docs/05-pantallas.md): 48 dp mínimos, semántica de la acción completa
/// y borde amarillo + halo cuando está seleccionada.
class TarjetaAccesible extends StatelessWidget {
  final String emoji;
  final String titulo;
  final String descripcion;
  final String? etiquetaSemantica;
  final VoidCallback? onTap;
  final bool seleccionada;
  final AcentoTarjeta acento;

  const TarjetaAccesible({
    super.key,
    required this.emoji,
    required this.titulo,
    required this.descripcion,
    this.etiquetaSemantica,
    this.onTap,
    this.seleccionada = false,
    this.acento = AcentoTarjeta.neutro,
  });

  @override
  Widget build(BuildContext context) {
    final c = context.coloresVia;
    final texto = Theme.of(context).textTheme;

    final colorIcono = switch (acento) {
      AcentoTarjeta.accion => c.accion,
      AcentoTarjeta.info => c.info,
      AcentoTarjeta.neutro => c.superficie2,
    };
    final colorSobreIcono =
        acento == AcentoTarjeta.neutro ? c.texto : c.fondoPrincipal;
    final colorBorde = seleccionada ? c.accion : c.borde;

    final tarjeta = Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: c.superficie,
        borderRadius: BorderRadius.circular(TemaVia.radioTarjeta),
        border: Border.all(color: colorBorde, width: seleccionada ? 3 : 2),
        boxShadow: seleccionada
            ? [BoxShadow(color: c.accion.withAlpha(60), blurRadius: 10, spreadRadius: 2)]
            : null,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            width: 48,
            height: 48,
            alignment: Alignment.center,
            decoration: BoxDecoration(color: colorIcono, shape: BoxShape.circle),
            child: Text(emoji, style: TextStyle(fontSize: 22, color: colorSobreIcono)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(titulo, style: texto.titleLarge),
                const SizedBox(height: 3),
                Text(descripcion, style: texto.labelLarge),
              ],
            ),
          ),
          if (seleccionada) ...[
            const SizedBox(width: 8),
            Icon(Icons.check_circle, color: c.accion, size: 26),
          ],
        ],
      ),
    );

    if (onTap == null) return tarjeta;

    return Semantics(
      button: true,
      selected: seleccionada,
      label: etiquetaSemantica ?? '$titulo. $descripcion',
      excludeSemantics: true,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(TemaVia.radioTarjeta),
          onTap: () {
            TipoVibracion.accionEjecutada.ejecutar();
            onTap!();
          },
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: TemaVia.areaTactilMinima),
            child: tarjeta,
          ),
        ),
      ),
    );
  }
}
