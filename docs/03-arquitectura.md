# 03 — Arquitectura

## Las cuatro capas

Este es el diagrama que está en la presentación (`mockups/png/arquitectura.png`). El
usuario solo interactúa con la capa 1 y percibe la capa 4; las dos del medio son
automáticas e invisibles para él.

```
CAPA 1 — ENTRADA MULTIMODAL
  voz (ASR)  ·  gestos  ·  cámara  ·  URL o archivo
                    ↓
CAPA 2 — MOTOR DE PROCESAMIENTO
  analizador WCAG  ·  visión por computador (OCR + descripción)  ·  simplificador semántico
                    ↓
CAPA 3 — ADAPTACIÓN AL PERFIL
  ceguera total  ·  baja visión  ·  daltonismo  ·  fallback humano
                    ↓
CAPA 4 — SALIDA ACCESIBLE
  voz (TTS)  ·  alto contraste  ·  línea braille  ·  háptica
```

## Cómo se traducen a código

| Capa | Dónde vive en el proyecto |
|---|---|
| 1 · Entrada | `data/services/stt_service.dart`, `features/ojo_ia/`, widgets con gestos |
| 2 · Procesamiento | `data/services/ocr_service.dart`, más adelante `analizador_wcag.dart` |
| 3 · Adaptación | `data/models/perfil_accesibilidad.dart` + `core/theme/` |
| 4 · Salida | `data/services/tts_service.dart`, `core/accessibility/` |

## Estructura de carpetas

```
lib/
├── main.dart                          punto de entrada, providers globales
│
├── core/
│   ├── theme/
│   │   ├── colores.dart               la paleta de 04-design-system.md
│   │   ├── tipografia.dart            escalas de texto
│   │   └── tema_via.dart              el ThemeData completo
│   ├── accessibility/
│   │   ├── anunciador.dart            dice algo en voz + vibra, en una sola llamada
│   │   └── semantica.dart             helpers para etiquetas semánticas
│   └── constants/
│       └── comandos_voz.dart          el diccionario de comandos reconocidos
│
├── data/
│   ├── models/
│   │   ├── perfil_accesibilidad.dart  enum: cegueraTotal, bajaVision, daltonismo
│   │   └── documento_leido.dart
│   └── services/
│       ├── tts_service.dart           envuelve flutter_tts
│       ├── stt_service.dart           envuelve speech_to_text
│       ├── ocr_service.dart           envuelve google_mlkit_text_recognition
│       └── preferencias_service.dart  envuelve shared_preferences
│
├── features/
│   ├── onboarding/                    P-01
│   ├── home/                          P-02
│   ├── lector/                        P-03
│   ├── ojo_ia/                        P-04
│   ├── ajustes/                       P-05
│   └── ayuda/                         P-06
│
└── shared/widgets/
    ├── boton_accesible.dart           botón con tamaño mínimo, semántica y háptica
    ├── tarjeta_accesible.dart
    └── barra_navegacion.dart
```

Cada carpeta en `features/` tiene la misma forma:

```
features/onboarding/
├── onboarding_screen.dart      la pantalla (widgets)
└── onboarding_controller.dart  la lógica y el estado
```

**Por qué separar pantalla y controlador:** la pantalla solo dibuja; el controlador decide.
Así puedes cambiar el diseño sin tocar la lógica, y probar la lógica sin abrir la app. Es la
misma idea que separar el HTML del JavaScript.

## Reglas de arquitectura

1. **Los widgets no llaman servicios directamente.** Un widget habla con su controlador, y
   el controlador con los servicios. Si ves `FlutterTts()` dentro de un widget, está mal.

2. **Los servicios envuelven los paquetes externos.** Nada fuera de `data/services/` importa
   `flutter_tts` o `speech_to_text`. Si mañana cambiamos de paquete, se toca un solo
   archivo.

3. **Todo lo que se puede hacer en el dispositivo, se hace en el dispositivo.** La nube
   entra solo en la Fase 11, y solo para describir imágenes complejas. Motivo: latencia y
   privacidad.

4. **Nada de texto quemado en los widgets.** Los textos de la interfaz van en constantes, en
   un solo lugar. Cuando haya que ajustar cómo suena una frase leída en voz alta —y va a
   pasar— se cambia en un sitio.

5. **Cada acción del usuario pasa por el anunciador.** No hay atajos: si algo cambia en la
   pantalla y no se anuncia, para el usuario ciego ese cambio no existe.

## El anunciador

Es la pieza más usada de todo el proyecto. Concentra en un solo lugar la regla de Norman:
toda acción se confirma. Algo así:

```dart
// core/accessibility/anunciador.dart
// Une las tres formas de confirmar una acción: voz, vibración y el
// lector de pantalla del sistema. Toda la app pasa por aquí.
class Anunciador {
  final TtsService _tts;

  Anunciador(this._tts);

  /// Anuncia [mensaje] por voz y vibra suavemente.
  /// [interrumpir] corta lo que se esté diciendo (útil para errores).
  Future<void> anunciar(String mensaje, {bool interrumpir = false}) async {
    if (interrumpir) await _tts.detener();
    HapticFeedback.selectionClick();
    await _tts.hablar(mensaje);
  }
}
```

Cuando construyas una pantalla nueva, la pregunta obligatoria es: *¿qué anuncia esta
pantalla al abrirse, y qué anuncia cada acción?*

## Permisos que la app necesita

| Permiso | Para qué | Cuándo pedirlo |
|---|---|---|
| Micrófono | Comandos de voz | Fase 5, la primera vez que se usa |
| Cámara | Ojo IA | Fase 7, la primera vez que se usa |

Se piden **en el momento de usar la función**, nunca todos juntos al abrir la app. Y se
explica por voz para qué sirve cada uno antes de mostrar el diálogo del sistema.
