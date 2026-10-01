import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/state/perfil_provider.dart';
import '../../core/theme/colores.dart';
import '../../core/theme/tema_via.dart';
import '../../data/models/perfil_accesibilidad.dart';
import '../../shared/widgets/tarjeta_accesible.dart';
import '../historial/historial_screen.dart';

/// P-05 · Ajustes de accesibilidad. Todo lo personalizable de VÍA vive
/// aquí: perfil, esquema de color (incluyendo las paletas seguras para
/// daltonismo), tamaño de texto, velocidad de voz y visualización. Cada
/// cambio se aplica al instante y se anuncia (docs/05-pantallas.md).
class AjustesScreen extends StatefulWidget {
  const AjustesScreen({super.key});

  @override
  State<AjustesScreen> createState() => _AjustesScreenState();
}

class _AjustesScreenState extends State<AjustesScreen> {
  bool _anunciado = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_anunciado) {
      _anunciado = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        context.read<PerfilProvider>().anunciador.anunciar(
              'Ajustes de accesibilidad. Perfil, color, lectura y visualización.',
            );
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = context.coloresVia;
    final provider = context.watch<PerfilProvider>();
    final ajustes = provider.ajustes;

    return Scaffold(
      appBar: AppBar(title: const Text('Ajustes de accesibilidad')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(TemaVia.margenLateral),
          children: [
            Text('Se aplican a todo el contenido', style: TextStyle(color: c.textoSuave)),
            const SizedBox(height: 18),

            _tituloSeccion(context, 'Perfil'),
            ...TipoPerfil.values.map((perfil) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: TarjetaAccesible(
                    emoji: perfil.emoji,
                    titulo: perfil.titulo,
                    descripcion: perfil.descripcion,
                    seleccionada: ajustes.perfil == perfil,
                    acento: ajustes.perfil == perfil ? AcentoTarjeta.accion : AcentoTarjeta.neutro,
                    onTap: () {
                      provider.cambiarPerfil(perfil);
                      provider.anunciador.anunciar('Perfil: ${perfil.titulo}.');
                    },
                  ),
                )),

            _tituloSeccion(context, 'Color e interfaz'),
            ...EsquemaColor.values.map((esquema) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: TarjetaAccesible(
                    emoji: esquema.emoji,
                    titulo: esquema.nombre,
                    descripcion: esquema.descripcion,
                    seleccionada: ajustes.esquemaColor == esquema,
                    acento: ajustes.esquemaColor == esquema ? AcentoTarjeta.info : AcentoTarjeta.neutro,
                    onTap: () {
                      provider.cambiarEsquemaColor(esquema);
                      provider.anunciador.anunciar('Esquema de color: ${esquema.nombre}.');
                    },
                  ),
                )),

            _tituloSeccion(context, 'Lectura'),
            _tarjetaDeslizador(
              context,
              titulo: 'Tamaño de texto',
              valorMostrado: '${(ajustes.escalaTexto * 100).round()} %',
              nota: 'Escalable hasta 400 % sin pérdida de contenido (WCAG 1.4.4)',
              valor: ajustes.escalaTexto,
              min: 1.0,
              max: 4.0,
              divisiones: 30,
              onChanged: (v) => provider.cambiarEscalaTexto(v),
              onChangeEnd: (v) => provider.anunciador.anunciar(
                'Tamaño de texto, ${(v * 100).round()} por ciento.',
              ),
            ),
            _tarjetaDeslizador(
              context,
              titulo: 'Velocidad de voz',
              valorMostrado: '${ajustes.velocidadVoz.toStringAsFixed(2)}×',
              valor: ajustes.velocidadVoz,
              min: 0.5,
              max: 3.0,
              divisiones: 25,
              onChanged: (v) => provider.cambiarVelocidadVoz(v),
              onChangeEnd: (v) => provider.anunciador.anunciar(
                'Velocidad de voz, ${v.toStringAsFixed(2)} veces.',
              ),
            ),

            _tituloSeccion(context, 'Visualización'),
            _tarjetaInterruptor(
              context,
              titulo: 'Descripción de imágenes con IA',
              descripcion: 'Genera alt cuando la web no lo trae (Fase 11)',
              valor: ajustes.descripcionIA,
              onChanged: (v) {
                provider.alternarDescripcionIA(v);
                provider.anunciador.anunciar('Descripción con IA ${v ? "activada" : "desactivada"}.');
              },
            ),
            _tarjetaInterruptor(
              context,
              titulo: 'Reducir animaciones',
              descripcion: 'Evita mareo y distracción',
              valor: ajustes.reducirAnimaciones,
              onChanged: (v) {
                provider.alternarReducirAnimaciones(v);
                provider.anunciador.anunciar(
                  'Reducir animaciones ${v ? "activado" : "desactivado"}.',
                );
              },
            ),

            _tituloSeccion(context, 'Historial'),
            Card(
              child: ListTile(
                leading: Icon(Icons.history_rounded, color: c.texto),
                title: Text('Documentos leídos', style: TextStyle(color: c.texto)),
                subtitle: Text(
                  '${provider.historial.length} guardado(s)',
                  style: TextStyle(color: c.textoSuave),
                ),
                trailing: Icon(Icons.chevron_right_rounded, color: c.textoSuave),
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const HistorialScreen()),
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _tituloSeccion(BuildContext context, String texto) {
    final c = context.coloresVia;
    return Padding(
      padding: const EdgeInsets.only(top: 6, bottom: 10),
      child: Text(
        texto.toUpperCase(),
        style: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.2,
          color: c.textoSuave,
        ),
      ),
    );
  }

  Widget _tarjetaDeslizador(
    BuildContext context, {
    required String titulo,
    required String valorMostrado,
    required double valor,
    required double min,
    required double max,
    required int divisiones,
    required ValueChanged<double> onChanged,
    required ValueChanged<double> onChangeEnd,
    String? nota,
  }) {
    final c = context.coloresVia;
    return Card(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(titulo, style: TextStyle(fontSize: 17, color: c.texto)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: c.accion.withAlpha(40),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    valorMostrado,
                    style: TextStyle(color: c.accion, fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ),
              ],
            ),
            Semantics(
              slider: true,
              label: '$titulo, $valorMostrado',
              child: Slider(
                value: valor,
                min: min,
                max: max,
                divisions: divisiones,
                onChanged: onChanged,
                onChangeEnd: onChangeEnd,
              ),
            ),
            if (nota != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Text(nota, style: TextStyle(fontSize: 13, color: c.textoSuave)),
              ),
          ],
        ),
      ),
    );
  }

  Widget _tarjetaInterruptor(
    BuildContext context, {
    required String titulo,
    required String descripcion,
    required bool valor,
    required ValueChanged<bool> onChanged,
  }) {
    final c = context.coloresVia;
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(titulo, style: TextStyle(fontSize: 17, color: c.texto)),
                  const SizedBox(height: 2),
                  Text(descripcion, style: TextStyle(fontSize: 13, color: c.textoSuave)),
                ],
              ),
            ),
            Semantics(
              label: '$titulo, ${valor ? "activado" : "desactivado"}',
              toggled: valor,
              child: Switch(value: valor, onChanged: onChanged),
            ),
          ],
        ),
      ),
    );
  }
}
