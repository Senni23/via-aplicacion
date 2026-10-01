import 'package:flutter/material.dart';
import '../../core/accessibility/anunciador.dart';
import '../../core/theme/tema_via.dart';

class _PestanaVia {
  final IconData icono;
  final String etiqueta;
  const _PestanaVia(this.icono, this.etiqueta);
}

const _pestanas = [
  _PestanaVia(Icons.home_rounded, 'Inicio'),
  _PestanaVia(Icons.public_rounded, 'Navegar'),
  _PestanaVia(Icons.camera_alt_rounded, 'Ojo IA'),
  _PestanaVia(Icons.settings_rounded, 'Ajustes'),
];

/// La barra inferior de 4 pestañas de P-02, P-04, P-05 y P-06
/// (docs/05-pantallas.md). Cada pestaña mide 48 dp de alto y anuncia su
/// posición: "Ajustes, pestaña 4 de 4".
class BarraNavegacionVia extends StatelessWidget {
  final int indiceActual;
  final void Function(int indice) onCambiar;

  const BarraNavegacionVia({
    super.key,
    required this.indiceActual,
    required this.onCambiar,
  });

  @override
  Widget build(BuildContext context) {
    final c = context.coloresVia;
    return Container(
      decoration: BoxDecoration(
        color: c.fondoApp,
        border: Border(top: BorderSide(color: c.borde, width: 1)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Row(
            children: List.generate(_pestanas.length, (i) {
              final activa = i == indiceActual;
              final pestana = _pestanas[i];
              return Expanded(
                child: Semantics(
                  button: true,
                  selected: activa,
                  label:
                      '${pestana.etiqueta}, pestaña ${i + 1} de ${_pestanas.length}',
                  excludeSemantics: true,
                  child: InkWell(
                    onTap: () {
                      if (!activa) {
                        TipoVibracion.cambioFoco.ejecutar();
                        onCambiar(i);
                      }
                    },
                    child: ConstrainedBox(
                      constraints:
                          const BoxConstraints(minHeight: TemaVia.areaTactilMinima),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            pestana.icono,
                            color: activa ? c.accion : c.textoSuave,
                            size: 24,
                          ),
                          const SizedBox(height: 3),
                          Text(
                            pestana.etiqueta,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: activa ? FontWeight.bold : FontWeight.normal,
                              color: activa ? c.accion : c.textoSuave,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}
