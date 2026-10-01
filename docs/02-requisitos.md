# 02 — Requisitos

Cada requisito tiene un código. Úsalos al hablar del avance: «terminé RF-03» es más claro
que «ya lee documentos».

La columna **Fase** indica en qué fase del plan (`06-plan-fases.md`) se implementa.

## Requisitos funcionales

### Perfil de accesibilidad

| Código | Requisito | Fase |
|---|---|---|
| RF-01 | Al primer arranque, la app pide al usuario elegir su perfil: ceguera total, baja visión o daltonismo. | 3 |
| RF-02 | La pantalla de perfil se puede responder **por voz**, diciendo «uno», «dos» o «tres», sin tocar la pantalla. | 5 |
| RF-03 | El perfil se guarda en el dispositivo y no se vuelve a preguntar en arranques posteriores. | 3 |
| RF-04 | El perfil se puede cambiar en cualquier momento desde Ajustes. | 6 |

### Lectura por voz

| Código | Requisito | Fase |
|---|---|---|
| RF-05 | La app lee cualquier texto en voz alta usando el motor TTS del sistema, en español. | 2 |
| RF-06 | El usuario controla la lectura: reproducir, pausar, retroceder y avanzar. | 4 |
| RF-07 | La velocidad de la voz es regulable entre 0.5× y 3×, y el valor se guarda. | 6 |
| RF-08 | Al leer contenido estructurado, la app anuncia la posición: «encabezado 1 de 6», «campo 1 de 3». | 4 |
| RF-09 | El usuario puede saltar de encabezado en encabezado sin escuchar todo el texto. | 4 |

### Ojo IA — cámara y OCR

| Código | Requisito | Fase |
|---|---|---|
| RF-10 | La app abre la cámara y captura una fotografía de un documento físico. | 7 |
| RF-11 | **Antes de disparar**, la app evalúa el encuadre y la iluminación y guía al usuario por voz: «acerca un poco», «hay poca luz», «documento enfocado». | 7 |
| RF-12 | La app extrae el texto de la fotografía mediante OCR ejecutado en el dispositivo. | 8 |
| RF-13 | El texto extraído se lee en voz alta automáticamente al terminar el reconocimiento. | 8 |
| RF-14 | El resultado se puede guardar para volver a escucharlo después. | 9 |

### Comandos de voz

| Código | Requisito | Fase |
|---|---|---|
| RF-15 | La app reconoce comandos hablados en español peruano (`es-PE`). | 5 |
| RF-16 | Comandos mínimos: «leer documento», «abrir cámara», «ajustes», «repetir», «parar», «más rápido», «más lento». | 5 |
| RF-17 | La app muestra en pantalla la transcripción de lo que escuchó, para quien conserva resto visual. | 5 |

### Lector adaptativo (fase avanzada)

| Código | Requisito | Fase |
|---|---|---|
| RF-18 | La app abre una URL, extrae el contenido y lo reconstruye con jerarquía de encabezados y contraste ≥ 7:1. | 10 |
| RF-19 | Detecta imágenes sin texto alternativo y las marca como pendientes de descripción. | 10 |
| RF-20 | Genera la descripción de esas imágenes mediante un servicio de visión en la nube. | 11 |

### Ayuda humana (fase final)

| Código | Requisito | Fase |
|---|---|---|
| RF-21 | El usuario puede solicitar asistencia humana diciendo «ayuda humana». | 12 |
| RF-22 | La app conecta con un voluntario por videollamada. | 12 |

## Requisitos no funcionales

| Código | Requisito | Cómo se verifica |
|---|---|---|
| RNF-01 | **Toda** área interactiva mide al menos 48×48 dp. | Revisión visual con la cuadrícula de Flutter Inspector |
| RNF-02 | El contraste de texto sobre fondo es de 7:1 como mínimo. | La paleta de `04-design-system.md` da 15.8:1 |
| RNF-03 | El texto respeta el escalado del sistema hasta el 400 % sin que se pierda contenido ni funcionalidad. | Subir el tamaño de fuente en los ajustes de Android y recorrer la app |
| RNF-04 | Cada widget interactivo tiene una etiqueta semántica que describe la acción. | Recorrer la app con TalkBack activado |
| RNF-05 | La app es utilizable **completamente a ciegas**: pantalla apagada o vista tapada. | Prueba real: tápate los ojos y completa una tarea |
| RNF-06 | Cada acción se confirma por voz y por vibración. | Prueba manual |
| RNF-07 | Ninguna información se comunica solo mediante color. | Revisión de cada pantalla |
| RNF-08 | El OCR y la síntesis de voz funcionan sin conexión a internet. | Poner el teléfono en modo avión y probar |
| RNF-09 | El tiempo entre el comando de voz y la respuesta audible no supera 1 segundo. | Cronometrar |
| RNF-10 | La app no envía documentos del usuario a servidores externos salvo que él lo autorice explícitamente. | Revisión del código: ninguna llamada de red no consentida |
| RNF-11 | La interfaz está íntegramente en español. | Revisión |

## Criterios de aceptación de las fases

Una fase está terminada cuando:

1. La app **compila y corre** en el emulador o en un teléfono real.
2. El requisito de esa fase se puede demostrar en vivo.
3. Se puede recorrer la pantalla nueva con TalkBack sin quedarse trabado.
4. Enrique entendió qué hace el código nuevo. Si no, la fase no terminó.
