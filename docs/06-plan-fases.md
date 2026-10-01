# 06 — Plan de fases

Doce fases pequeñas. Cada una termina con **algo que puedes correr y enseñar**.

Regla que no se rompe: **no se empieza una fase si la anterior no corre.**

Marca aquí mismo tu avance cambiando `[ ]` por `[x]`.

---

## Fase 0 — Entorno · [ ]

Que la computadora esté lista. Todavía no hay código de VÍA.

1. `flutter doctor` y resolver lo que salga en rojo.
2. Instalar Android Studio si falta (trae el SDK de Android y el emulador).
3. Crear un emulador de teléfono, o conectar un Android real con depuración USB activada.
4. `flutter create via_app` dentro de esta carpeta.
5. `flutter run` — debe aparecer la app de ejemplo del contador.

**Terminada cuando:** ves la app de ejemplo corriendo y puedes pulsar el botón `+`.

> Si esto se complica, no es tu culpa: preparar el entorno de Flutter en Windows es la parte
> más molesta de todo el proyecto. Pega los errores completos y se van resolviendo uno a uno.

---

## Fase 1 — El tema de alto contraste · [ ]

La primera pieza propia de VÍA.

1. Crear `core/theme/colores.dart` con la paleta de `04-design-system.md`.
2. Crear `core/theme/tema_via.dart` con el `ThemeData` completo.
3. Aplicarlo en `main.dart`.
4. Reemplazar la pantalla de ejemplo por una pantalla mínima: fondo negro, título «VÍA» en
   blanco y un botón amarillo que no hace nada todavía.

**Terminada cuando:** la app arranca en negro y amarillo, y tú entiendes qué es un `Widget`
y qué hace `ThemeData`.

**Qué vas a aprender:** widget, `StatelessWidget`, `build()`, `MaterialApp`, `ThemeData`.

---

## Fase 2 — La voz · [ ]  ← *el momento en que esto se vuelve real*

1. Agregar `flutter_tts` a `pubspec.yaml`.
2. Crear `data/services/tts_service.dart` con: `hablar(String texto)`, `detener()`,
   `cambiarVelocidad(double v)`.
3. Configurar el idioma en `es-PE`, con `es-ES` de reserva.
4. Conectar el botón de la Fase 1 para que diga: «Hola, soy VÍA. Tu camino a la información
   digital.»

**Terminada cuando:** pulsas el botón y el teléfono habla en español.

**Qué vas a aprender:** `async`, `await`, `Future`. Son el equivalente a las promesas de
JavaScript, que ya conoces.

**Requisito cubierto:** RF-05.

---

## Fase 3 — Pantalla P-01, el perfil · [ ]

Tu primera pantalla completa del diseño.

1. Crear `features/onboarding/onboarding_screen.dart` replicando `mockups/png/p01.png`.
2. Crear `shared/widgets/tarjeta_accesible.dart`: tarjeta con 48 dp mínimos, semántica y
   háptica.
3. Al abrir, anunciar por voz las tres opciones.
4. Guardar la elección con `shared_preferences`.
5. Que no se vuelva a mostrar si ya hay un perfil guardado.

**Terminada cuando:** eliges una opción con los ojos cerrados, guiándote solo por la voz, y
al reabrir la app ya no te pregunta.

**Qué vas a aprender:** `StatefulWidget`, `setState`, `Semantics`, persistencia local.

**Requisitos cubiertos:** RF-01, RF-03.

---

## Fase 4 — Pantalla P-02 y navegación · [ ]

1. Crear `features/home/home_screen.dart` según `mockups/png/p02.png` (sin la parte de voz
   todavía: el orbe se dibuja pero aún no escucha).
2. Crear `shared/widgets/barra_navegacion.dart`, la barra inferior de 4 pestañas.
3. Conectar la navegación entre P-01 y P-02.
4. Crear una versión simple de P-03 que lea un texto de ejemplo con controles de
   reproducir, pausar, anterior y siguiente.

**Terminada cuando:** navegas entre las pantallas y P-03 lee un texto que puedes pausar y
reanudar.

**Requisitos cubiertos:** RF-06, RF-08, RF-09.

---

## Fase 5 — Comandos de voz · [ ]

1. Agregar `speech_to_text` y `permission_handler`.
2. Crear `data/services/stt_service.dart`.
3. Pedir el permiso de micrófono **explicándolo antes por voz**.
4. Crear `core/constants/comandos_voz.dart` con el diccionario de comandos.
5. Conectar la escucha a la pantalla P-02: el orbe se anima, la transcripción aparece.
6. Manejar el comando no reconocido con un mensaje útil, no con un error seco.

**Terminada cuando:** dices «leer documento» y la app navega sola.

**Requisitos cubiertos:** RF-02, RF-15, RF-16, RF-17.

---

## Fase 6 — Pantalla P-05, ajustes · [ ]

1. Crear `features/ajustes/ajustes_screen.dart` según `mockups/png/p05.png`.
2. Deslizadores de tamaño de texto y velocidad de voz.
3. Interruptores de alto contraste, descripción con IA y reducir animaciones.
4. Que cada cambio se aplique al instante y se anuncie con su valor.
5. Persistir todo.

**Terminada cuando:** cambias la velocidad de voz y la siguiente frase suena distinta, sin
reiniciar nada.

**Requisitos cubiertos:** RF-04, RF-07.

---

## Fase 7 — Cámara y guía de captura · [ ]  ← *la fase que distingue al proyecto*

1. Agregar `camera`. Pedir el permiso explicándolo por voz.
2. Crear `features/ojo_ia/ojo_ia_screen.dart` con la vista previa según
   `mockups/png/p04.png`.
3. **Implementar la guía por voz (RF-11):** evaluar brillo y encuadre del cuadro de la
   cámara y avisar «acerca un poco», «hay poca luz», «documento enfocado».
4. Espaciar los avisos al menos 2 segundos.
5. Capturar la fotografía.

**Terminada cuando:** apuntas al papel con los ojos cerrados y la app te guía hasta lograr
una foto usable.

**Por qué importa tanto:** esta es la respuesta directa al hallazgo de Gurari et al. (2018),
el 28 % de fotos inservibles. Es el argumento más fuerte de tu proyecto.

**Requisitos cubiertos:** RF-10, RF-11.

---

## Fase 8 — OCR en el dispositivo · [ ]

1. Agregar `google_mlkit_text_recognition`.
2. Crear `data/services/ocr_service.dart`.
3. Procesar la foto capturada y extraer el texto.
4. Leerlo en voz alta automáticamente.
5. Mostrarlo también en pantalla, para quien conserva resto visual.

**Terminada cuando:** fotografías un recibo y el teléfono te lo lee. **Aquí VÍA ya sirve de
verdad para algo.**

**Requisitos cubiertos:** RF-12, RF-13, RNF-08.

---

## Fase 9 — Historial · [ ]

1. Guardar los documentos leídos.
2. Pantalla para volver a escucharlos.

**Terminada cuando:** cierras la app, la abres y puedes reproducir lo que leíste ayer.

**Requisito cubierto:** RF-14.

---

## Fase 10 — Lector web · [ ]

1. Abrir una URL y extraer su contenido.
2. Reconstruirlo: encabezados, contraste, tamaño.
3. Detectar imágenes sin `alt` y marcarlas.
4. Completar P-03 con contenido web real.

**Terminada cuando:** le das la URL de una web de trámites y la app te la lee ordenada.

**Requisitos cubiertos:** RF-18, RF-19.

---

## Fase 11 — Descripción de imágenes con IA · [ ]

La primera y única parte que sale del dispositivo.

1. Elegir un servicio de visión.
2. Enviar solo las imágenes sin `alt`, nunca el documento completo.
3. Pedir consentimiento explícito la primera vez (RNF-10).
4. Insertar la descripción en el flujo de lectura, marcada como generada por IA.

**Terminada cuando:** una web con fotos sin descripción se lee con descripciones útiles.

**Requisito cubierto:** RF-20.

---

## Fase 12 — Ayuda humana (simulada) · [ ]

1. Crear `features/ayuda/ayuda_screen.dart` según `mockups/png/p06.png`.
2. Simular la conexión con un voluntario, con datos de ejemplo.
3. Comentar claramente en el código que es una simulación.
4. Conectar el comando de voz «ayuda humana».

**Terminada cuando:** dices «ayuda humana» y aparece la pantalla de llamada.

**Requisitos cubiertos:** RF-21, RF-22.

---

## Revisión de accesibilidad — al final de cada fase

No es opcional. Cada vez que cierras una fase:

- [ ] Activa TalkBack y recorre la pantalla nueva entera.
- [ ] Sube el tamaño de fuente del sistema al máximo: ¿se pierde algo?
- [ ] Tápate los ojos y haz la tarea principal de la pantalla.
- [ ] Comprueba que cada botón anuncia una **acción**, no un ícono.
- [ ] Comprueba que ninguna información dependa solo del color.

Si algo falla en esta lista, la fase no está terminada aunque el código compile.

---

## Sobre el ritmo

Doce fases parecen muchas. No lo son: las primeras cinco son las que enseñan Flutter, y a
partir de la sexta el ritmo se acelera solo porque ya entiendes el patrón.

Si tienes poco tiempo, **las fases 0 a 8 ya son un proyecto demostrable y honesto**: una app
que escucha comandos, guía la captura de una foto y lee un documento en voz alta sin
internet. Eso es más de lo que muchos proyectos finales enseñan funcionando.

Las fases 9 a 12 son ampliación.
