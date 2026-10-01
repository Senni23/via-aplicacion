/// Los comandos de voz que VÍA reconoce (RF-15, RF-16). Cada uno tiene
/// varias formas de decirlo porque nadie memoriza una sintaxis exacta, y el
/// reconocimiento de voz rara vez transcribe una frase perfecta — en
/// particular, una sigla como "IA" dicha en voz alta muchas veces se
/// transcribe como "i a" (con espacio) o incluso "ya", así que esas
/// variantes están incluidas a propósito, no son un error de tipeo.
enum ComandoVia {
  leerDocumento,
  abrirCamara,
  ajustes,
  inicio,
  repetir,
  parar,
  masRapido,
  masLento,
  ayudaHumana,
  ayudaComandos,
  pausar,
  reanudar,
  siguiente,
  anterior,
  indice,
  opcionUno,
  opcionDos,
  opcionTres,
}

class ComandosVoz {
  ComandosVoz._();

  static const Map<ComandoVia, List<String>> _frases = {
    ComandoVia.leerDocumento: [
      'leer documento',
      'leer un documento',
      'abrir documento',
      'leer archivo',
      'quiero leer',
    ],
    ComandoVia.abrirCamara: [
      'ojo ia',
      'ojo i a',
      'ojo ya',
      'ojo hay',
      'modo ojo',
      'abrir camara',
      'abrir la camara',
      'usar camara',
      'quiero usar la camara',
      'camara',
      'inteligencia artificial',
      'vision artificial',
    ],
    ComandoVia.ajustes: [
      'ajustes',
      'configuracion',
      'abrir ajustes',
      'abrir configuracion',
      'ir a ajustes',
    ],
    ComandoVia.inicio: [
      'ir a inicio',
      'ir al inicio',
      'volver a inicio',
      'volver al inicio',
      'pantalla de inicio',
      'inicio',
    ],
    ComandoVia.repetir: ['repetir', 'repite', 'otra vez', 'dilo de nuevo', 'puedes repetir'],
    ComandoVia.parar: ['parar', 'detener', 'silencio', 'callate', 'para'],
    ComandoVia.masRapido: ['mas rapido', 'mas veloz', 'acelerar', 'habla mas rapido', 'mas rapida'],
    ComandoVia.masLento: ['mas lento', 'mas despacio', 'habla mas lento', 'mas lenta'],
    ComandoVia.ayudaHumana: [
      'ayuda humana',
      'quiero ayuda humana',
      'conectar con un voluntario',
      'necesito ayuda humana',
      'hablar con una persona',
      'quiero hablar con alguien',
    ],
    ComandoVia.ayudaComandos: [
      'ayuda',
      'que puedo decir',
      'que comandos hay',
      'lista de comandos',
      'comandos',
      'necesito ayuda',
    ],
    ComandoVia.pausar: ['pausar', 'pausa'],
    ComandoVia.reanudar: ['reanudar', 'continuar', 'seguir leyendo', 'sigue leyendo'],
    ComandoVia.siguiente: ['siguiente', 'avanzar', 'pasar', 'el siguiente'],
    ComandoVia.anterior: ['anterior', 'atras', 'retroceder', 'el anterior'],
    ComandoVia.indice: ['indice', 'ver indice', 'lista de encabezados', 'mostrar indice'],
    ComandoVia.opcionUno: ['uno', 'opcion uno', 'primera opcion', 'la primera'],
    ComandoVia.opcionDos: ['dos', 'opcion dos', 'segunda opcion', 'la segunda'],
    ComandoVia.opcionTres: ['tres', 'opcion tres', 'tercera opcion', 'la tercera'],
  };

  /// Devuelve la lista de frases de ejemplo de un comando, para mostrarlas
  /// como ayuda en pantalla.
  static List<String> frasesDe(ComandoVia comando) => _frases[comando] ?? [];

  /// Busca en [textoEscuchado] alguna frase conocida. No exige coincidencia
  /// exacta: basta con que el texto la contenga. Compara dos veces — con el
  /// texto normal y con los espacios quitados — para que variantes como
  /// "ojo i a" (con espacios de más, típico al transcribir una sigla) sigan
  /// reconociéndose aunque no estén escritas letra por letra en la lista.
  static ComandoVia? reconocer(String textoEscuchado) {
    final normalizado = _normalizar(textoEscuchado);
    if (normalizado.isEmpty) return null;
    final sinEspacios = normalizado.replaceAll(' ', '');

    for (final entrada in _frases.entries) {
      for (final frase in entrada.value) {
        if (normalizado.contains(frase)) return entrada.key;
        if (sinEspacios.contains(frase.replaceAll(' ', ''))) return entrada.key;
      }
    }
    return null;
  }

  static String _normalizar(String texto) {
    var t = texto.toLowerCase().trim();
    const acentos = {
      'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n',
    };
    for (final entrada in acentos.entries) {
      t = t.replaceAll(entrada.key, entrada.value);
    }
    return t;
  }
}
