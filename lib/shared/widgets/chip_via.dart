import 'package:flutter/material.dart';
import '../../core/theme/tema_via.dart';

/// De qué manera se pinta un [ChipVia].
enum EstiloChip { normal, activo, exito }

/// La "píldora" de estado que aparece en varias pantallas: "✓ Contraste
/// 15.8:1", "Texto 180 %", "● En llamada · 00:42" (docs/05-pantallas.md).
/// Nunca lleva solo color: siempre trae texto, por RNF-07.
class ChipVia extends StatelessWidget {
  final String texto;
  final EstiloChip estilo;

  const ChipVia({super.key, required this.texto, this.estilo = EstiloChip.normal});

  @override
  Widget build(BuildContext context) {
    final c = context.coloresVia;
    late final Color fondo;
    late final Color borde;
    late final Color tinta;
    switch (estilo) {
      case EstiloChip.activo:
        fondo = c.accion.withAlpha(40);
        borde = c.accion;
        tinta = c.accion;
        break;
      case EstiloChip.exito:
        fondo = c.exito.withAlpha(35);
        borde = c.exito;
        tinta = c.exito;
        break;
      case EstiloChip.normal:
        fondo = c.superficie2;
        borde = c.borde;
        tinta = c.textoSuave;
        break;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        color: fondo,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: borde, width: 1.5),
      ),
      child: Text(
        texto,
        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: tinta),
      ),
    );
  }
}
