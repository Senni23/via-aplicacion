# VÍA — contexto del proyecto

> Este archivo lo lee Claude Code automáticamente al abrir la carpeta.
> No hace falta que se lo pegues en el chat.

## Qué es

**VÍA (Voz, Imagen y Accesibilidad)** es una aplicación móvil Flutter para Android e iOS
que actúa como una capa de accesibilidad sobre cualquier contenido digital. Recibe una
página web, un documento o una fotografía y devuelve la misma información en un formato
que una persona con discapacidad visual sí puede percibir: voz, texto ampliado de alto
contraste o línea braille.

**La frase que gobierna cada decisión:** *no corrige la web ajena; corrige cómo esa web
llega al usuario.*

Es el proyecto final del curso Interacción entre Hombre y Máquina (UTP). La propuesta,
el marco teórico y el prototipo ya están hechos y aprobados; lo que falta es programarlo.

## Con quién estás trabajando

Enrique Sebastian Poma Nizama, estudiante de ingeniería de sistemas.

- **Sabe:** HTML, CSS, JavaScript, MySQL, Java con NetBeans, Visual Studio.
- **No sabe todavía:** Flutter, Dart, desarrollo móvil.
- **Cómo quiere trabajar:** despacio y paso a paso, entendiendo cada pieza antes de
  seguir. No le entregues quinientas líneas de golpe.

### Reglas de colaboración

1. **Un paso a la vez.** Termina una fase, verifica que corre, y recién entonces propón
   la siguiente. Nunca adelantes fases sin que él lo pida.
2. **Explica antes de escribir.** Antes de crear un archivo, di en dos o tres líneas qué
   va a hacer y por qué. Después escríbelo.
3. **Dart es nuevo para él.** Cuando uses algo propio de Dart o Flutter que no exista en
   JavaScript o Java (`Widget`, `StatefulWidget`, `Future`, `async`, `setState`,
   `BuildContext`), explícalo la primera vez en una línea, comparándolo con lo que ya
   conoce si ayuda.
4. **Comenta el código en español.** Comentarios cortos que digan *por qué*, no *qué*.
5. **Si algo falla, primero diagnostica.** No cambies cinco cosas a la vez esperando que
   una funcione. Lee el error, explícalo, corrige una cosa.
6. **Pregunta cuando haya una bifurcación real.** No inventes decisiones de producto.

## Stack

| Pieza | Elección | Por qué |
|---|---|---|
| Framework | Flutter (Dart) | Una sola base de código para Android e iOS |
| Estado | `provider` | Es el más simple de entender para empezar |
| Voz que habla (TTS) | `flutter_tts` | Usa el motor nativo del sistema: funciona sin internet |
| Voz que escucha (ASR) | `speech_to_text` | Reconocimiento nativo, soporta `es-PE` |
| Cámara | `camera` | Captura para el módulo Ojo IA |
| OCR | `google_mlkit_text_recognition` | Corre en el propio dispositivo, sin nube |
| Permisos | `permission_handler` | Micrófono y cámara |
| Guardado local | `shared_preferences` | Solo el perfil de accesibilidad |

**Regla de arquitectura que no se negocia:** todo lo que pueda correr en el dispositivo,
corre en el dispositivo. La nube se reserva para la descripción de imágenes complejas, y
esa parte va al final. Motivo doble: latencia (en una interfaz por voz medio segundo se
nota) y privacidad (los documentos que se leen traen datos personales).

## Accesibilidad: no es un extra, es el producto

Esta app es una herramienta de accesibilidad. Si la app no es accesible, no sirve. Toda
pantalla debe cumplir, sin excepción:

- Cada widget interactivo lleva `Semantics` con un `label` que describa la **acción**, no
  el ícono. `'Abrir la cámara para leer un documento'`, no `'botón cámara'`.
- Ninguna área táctil mide menos de **48×48 dp** (WCAG 2.5.8 pide 44 px; en Flutter el
  mínimo cómodo es 48).
- El contraste mínimo es **7:1** (nivel AAA). La paleta de `docs/04-design-system.md` ya
  cumple: 15.8:1.
- El texto respeta el escalado del sistema. Nunca fijes un tamaño que ignore
  `MediaQuery.textScalerOf(context)`.
- Cada acción se confirma por voz **y** por vibración. Quien no ve la pantalla necesita
  saber que su toque hizo algo.
- Nada se comunica solo con color. Siempre acompaña con texto o ícono.

Antes de dar una pantalla por terminada, revísala con TalkBack activado (Android) y
comprueba que se puede recorrer entera sin mirar.

## Estructura de carpetas

```
lib/
├── main.dart
├── core/
│   ├── theme/          colores, tipografía, tema de alto contraste
│   ├── accessibility/  helpers de voz, vibración y anuncios
│   └── constants/
├── data/
│   ├── models/         PerfilAccesibilidad, DocumentoLeido...
│   └── services/       tts_service, stt_service, ocr_service
├── features/
│   ├── onboarding/     P-01 perfil de accesibilidad
│   ├── home/           P-02 inicio por voz
│   ├── lector/         P-03 lector adaptativo
│   ├── ojo_ia/         P-04 cámara + OCR
│   ├── ajustes/        P-05 ajustes
│   └── ayuda/          P-06 ayuda humana
└── shared/widgets/     botones y tarjetas accesibles reutilizables
```

## Documentación del proyecto

Léela cuando la necesites, no toda de golpe:

- `docs/01-propuesta.md` — el problema, los objetivos y qué hace la app
- `docs/02-requisitos.md` — requisitos funcionales y no funcionales numerados
- `docs/03-arquitectura.md` — las cuatro capas y cómo se traducen a código
- `docs/04-design-system.md` — colores exactos, tipografía, medidas
- `docs/05-pantallas.md` — qué hace cada una de las seis pantallas
- `docs/06-plan-fases.md` — **el plan de trabajo; síguelo en orden**

`mockups/png/` tiene las seis pantallas ya diseñadas a resolución real (390×844).
Son la referencia visual: replícalas, no las reinventes.

## Estado actual

Fase 0. Todavía no existe código Flutter. El primer paso es verificar que el entorno esté
instalado y crear el proyecto.
