import 'package:flutter/foundation.dart';
import '../../core/constants/comandos_voz.dart';
import '../../core/state/perfil_provider.dart';
import '../../data/services/stt_service.dart';

/// La lógica de P-02: el anuncio de apertura y el ciclo de escucha continua
/// del orbe — el micrófono está activo desde que abre la pantalla
/// (docs/05-pantallas.md) y se reinicia solo cada vez que el reconocedor de
/// voz hace una pausa.
class HomeController {
  final PerfilProvider perfilProvider;
  final SttService stt = SttService();
  bool _activo = false;
  int _reintentosSeguidos = 0;

  /// Tras esta cantidad de reintentos sin un solo resultado real, dejamos de
  /// reabrir el micrófono solos. Sin este límite, un micrófono que no
  /// funciona (como el de varios emuladores, que no tienen hardware de audio
  /// real) hace que la app lo abra y lo cierre sin parar — el "sonido
  /// extraño" que se nota al probarla ahí.
  static const _maxReintentosSeguidos = 3;

  HomeController(this.perfilProvider);

  final ValueNotifier<String> transcripcion = ValueNotifier('');
  final ValueNotifier<bool> escuchando = ValueNotifier(false);

  /// En falso cuando se agotaron los reintentos automáticos: la pantalla
  /// puede ofrecer un botón para que el usuario lo intente de nuevo a mano.
  final ValueNotifier<bool> microfonoDisponible = ValueNotifier(true);

  Future<void> anunciarInicio() {
    return perfilProvider.anunciador.anunciar(
      'Inicio. Te escucho. Puedes decir: leer documento, abrir cámara o ajustes.',
    );
  }

  /// Empieza el ciclo de escucha continua. [onComando] se llama cada vez que
  /// se reconoce uno de los comandos de `ComandosVoz`.
  Future<bool> iniciarEscuchaContinua(void Function(ComandoVia) onComando) async {
    _activo = true;
    _reintentosSeguidos = 0;
    microfonoDisponible.value = true;
    // Se explica antes de que aparezca el permiso del sistema (regla de
    // docs/03-arquitectura.md): nunca un diálogo sorpresa.
    await perfilProvider.anunciador.anunciar(
      'VÍA va a pedir permiso de micrófono para escucharte.',
    );
    final ok = await stt.inicializar(
      onError: (_) => _manejarFinDeEscucha(onComando),
      onEstado: (estado) {
        if (!_activo) return;
        if (estado == 'notListening' || estado == 'done') {
          _manejarFinDeEscucha(onComando);
        }
      },
    );
    if (!ok) {
      microfonoDisponible.value = false;
      return false;
    }
    await _escuchar(onComando);
    return true;
  }

  void _manejarFinDeEscucha(void Function(ComandoVia) onComando) {
    escuchando.value = false;
    _reintentosSeguidos++;
    if (_reintentosSeguidos > _maxReintentosSeguidos) {
      microfonoDisponible.value = false;
      return;
    }
    // El plugin se detiene solo tras una pausa; lo reiniciamos para que la
    // escucha se sienta continua, tal como muestra P-02 — con una espera
    // cada vez más larga, para no martillar el micrófono si sigue fallando.
    final espera = Duration(milliseconds: 400 * _reintentosSeguidos);
    Future.delayed(espera, () {
      if (_activo) _escuchar(onComando);
    });
  }

  Future<void> _escuchar(void Function(ComandoVia) onComando) async {
    if (!_activo || stt.escuchando) return;
    escuchando.value = true;
    await stt.escuchar(
      onResultado: (texto, esFinal) {
        _reintentosSeguidos = 0; // llegó un resultado real: el micro sí sirve
        transcripcion.value = texto;
        if (!esFinal || texto.trim().isEmpty) return;
        final comando = ComandosVoz.reconocer(texto);
        if (comando != null) onComando(comando);
      },
    );
  }

  /// Para reintentar a mano cuando `microfonoDisponible` quedó en falso.
  Future<void> reintentarEscucha(void Function(ComandoVia) onComando) async {
    _reintentosSeguidos = 0;
    microfonoDisponible.value = true;
    await _escuchar(onComando);
  }

  Future<void> detener() async {
    _activo = false;
    escuchando.value = false;
    await stt.cancelar();
  }
}
