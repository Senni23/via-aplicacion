# 04 — Sistema de diseño

Todos estos valores salieron de criterios WCAG, no de gusto personal. Cada uno tiene su
justificación al lado, porque en la exposición te los pueden preguntar.

## Colores

```dart
// core/theme/colores.dart
class ColoresVia {
  // Fondos
  static const negro        = Color(0xFF000000); // fondo principal
  static const fondoApp     = Color(0xFF0B0F14); // fondo de pantallas
  static const superficie   = Color(0xFF151A21); // tarjetas
  static const superficie2  = Color(0xFF1F2630); // tarjetas anidadas, chips
  static const borde        = Color(0xFF39424F); // bordes de tarjetas

  // Texto
  static const texto        = Color(0xFFFFFFFF); // texto principal
  static const textoSuave   = Color(0xFFB9C2CE); // texto secundario

  // Acentos
  static const amarillo     = Color(0xFFFFD400); // acción principal, foco
  static const cian         = Color(0xFF4DD0FF); // información, IA
  static const verde        = Color(0xFF5BE39A); // éxito, confirmación
  static const rojo         = Color(0xFFFF8080); // error, exclusión
}
```

### Contrastes verificados

| Combinación | Ratio | Criterio WCAG |
|---|---|---|
| Blanco sobre negro | 21:1 | 1.4.6 AAA (pide 7:1) ✔ |
| Amarillo `FFD400` sobre negro | 15.8:1 | 1.4.6 AAA ✔ |
| Negro sobre amarillo `FFD400` | 15.8:1 | 1.4.6 AAA ✔ |
| Cian `4DD0FF` sobre negro | 11.4:1 | 1.4.6 AAA ✔ |
| Texto suave `B9C2CE` sobre `0B0F14` | 10.9:1 | 1.4.6 AAA ✔ |

**Regla:** si inventas un color nuevo, verifica su contraste antes de usarlo. Cualquier
comprobador en línea sirve. Si baja de 7:1, no entra.

### Uso del color

- **Amarillo** = la acción principal de la pantalla y el indicador de foco. Solo una acción
  principal por pantalla.
- **Cian** = información generada por la IA (descripciones, transcripciones). Que sea un
  color distinto ayuda a quien tiene resto visual a distinguir lo que dijo la máquina de lo
  que dice el contenido original.
- **Verde** = confirmaciones y estados correctos.
- **Rojo** = errores.

**Nunca** uses solo el color para comunicar algo (RNF-07). El verde de «documento enfocado»
va siempre acompañado del texto «✓ Documento enfocado» y de un anuncio por voz.

## Tipografía

La app usa la fuente del sistema. No cargues fuentes personalizadas: las del sistema están
optimizadas para lectura y respetan mejor los ajustes de accesibilidad del usuario.

| Uso | Tamaño base | Peso |
|---|---|---|
| Título de pantalla | 26 sp | bold |
| Encabezado de sección | 19 sp | bold |
| Cuerpo | 16 sp | regular |
| Cuerpo de contenido leído | 18 sp | regular |
| Etiqueta secundaria | 14 sp | regular |
| Micro-etiqueta | 12.5 sp | bold |

**Regla crítica (RNF-03):** nunca fijes un tamaño que ignore el escalado del sistema. En
Flutter, usar `Theme.of(context).textTheme` y dejar que `MediaQuery.textScalerOf(context)`
haga su trabajo. Si un texto se corta al subir la escala al 200 %, el layout está mal, no el
usuario.

Prueba obligatoria antes de cerrar una pantalla: subir el tamaño de fuente del sistema al
máximo y comprobar que no se pierde nada.

## Medidas

| Elemento | Medida | Por qué |
|---|---|---|
| Área táctil mínima | 48×48 dp | WCAG 2.5.8 pide 44 px; 48 es el mínimo cómodo de Material |
| Separación entre elementos táctiles | 8 dp | Evita toques accidentales sin mirar |
| Margen lateral de pantalla | 20 dp | |
| Radio de esquinas de tarjetas | 18 dp | |
| Radio de botones | 16 dp | |
| Grosor de borde de tarjeta | 2 dp | Un borde de 1 dp casi no se ve en alto contraste |
| Anillo de foco | 3 dp amarillo | Debe verse sin ninguna duda |

## El indicador de foco

Para quien navega con teclado, switch o TalkBack, saber **dónde está** es todo. El foco se
marca con:

- Borde amarillo de 3 dp alrededor del elemento.
- Un halo amarillo translúcido detrás (`rgba(255, 212, 0, 0.25)`).
- Anuncio por voz del elemento enfocado y su posición.

Nunca desactives el indicador de foco por motivos estéticos.

## Retroalimentación háptica

| Situación | Vibración |
|---|---|
| Cambio de foco | `HapticFeedback.selectionClick()` |
| Acción ejecutada | `HapticFeedback.lightImpact()` |
| Confirmación importante | `HapticFeedback.mediumImpact()` |
| Error | `HapticFeedback.heavyImpact()` |

## Voz

| Parámetro | Valor |
|---|---|
| Idioma | `es-PE`, con `es-ES` de reserva si el dispositivo no lo tiene |
| Velocidad por defecto | 1.0× |
| Rango de velocidad | 0.5× a 3.0× (RF-07) |
| Tono | 1.0 |

### Cómo se redactan los mensajes de voz

Esto importa más de lo que parece. Reglas:

- **Primero la información, después el adorno.** «S/ 87.40, total a pagar» es mejor que
  «El total a pagar del recibo es de S/ 87.40», porque el usuario oye el dato antes.
- **Frases cortas.** Una idea por frase.
- **Sin descripciones del ícono.** Di la acción: «Abrir cámara para leer un documento», no
  «botón de cámara».
- **Sin lástima ni condescendencia.** Es la crítica directa de Adnin y Das (2024): las
  respuestas de IA con sesgo capacitista. Describe, no compadezcas.
- **Anuncia la posición en las listas.** «Opción 2 de 3: texto ampliado más voz».

## Referencia visual

Las seis pantallas ya diseñadas están en `mockups/png/`, a resolución real de móvil
(390×844 puntos, exportadas a 1170×2532 px).

**Replícalas, no las reinventes.** Si algo del diseño no se puede hacer en Flutter tal cual,
dilo y proponemos una alternativa, pero no lo cambies en silencio.

Si quieres verlas en grande, `mockups/html/` tiene el código con el que se hicieron: abre
cualquier `p01.html` … `p06.html` en el navegador.
