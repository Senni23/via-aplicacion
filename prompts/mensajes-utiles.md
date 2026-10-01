# Mensajes listos para copiar

Cuando no sepas cómo pedir algo, busca aquí. Copia y pega.

---

## Para arrancar

**El primer mensaje de todos**

> Hola. Vamos a programar VÍA. Ya leíste CLAUDE.md, así que conoces el proyecto.
>
> Antes de escribir código: lee `docs/06-plan-fases.md` y dime en tus palabras qué haremos
> en la Fase 1, para confirmar que estamos de acuerdo.
>
> Después ejecuta `flutter doctor` y dime si el entorno está listo o qué falta.
>
> No crees el proyecto todavía. Espera a que yo te dé el visto bueno.

**Al empezar cualquier fase**

> Vamos con la Fase N. Léela en `docs/06-plan-fases.md` y explícame en tres líneas qué vamos
> a construir y qué archivos vas a tocar. Después empieza, un archivo a la vez.

**Al retomar después de días**

> Retomo el proyecto. Revisa qué hay hecho en `lib/` y dime en qué fase estamos y cuál sigue.

---

## Para entender

**No entiendo el código**

> Explícame línea por línea qué hace `[nombre del archivo]`. Asume que sé JavaScript y Java
> pero que Flutter es nuevo para mí.

**No entiendo un concepto**

> Explícame qué es `[StatefulWidget / Future / setState / BuildContext]` con un ejemplo del
> propio proyecto, no uno genérico.

**Por qué se hizo así**

> ¿Por qué elegiste esta forma y no otra? Dame la alternativa que descartaste y por qué.

---

## Cuando algo falla

**Error al compilar**

> No compila. Este es el error completo:
>
> ```
> [pega aquí todo el texto, sin resumirlo]
> ```
>
> Diagnostícalo antes de cambiar nada: dime qué crees que pasa y por qué.

**Corre pero se ve mal**

> La pantalla `[nombre]` no se parece a `mockups/png/[archivo].png`. Compara las dos y dime
> las tres diferencias más importantes antes de tocar el código.

**No suena la voz**

> El TTS no dice nada. Revisa `data/services/tts_service.dart`, comprueba que el idioma
> es-PE esté disponible en el dispositivo y dime si el problema es el código o el emulador.

---

## Para revisar

**Revisión de accesibilidad**

> Revisa la pantalla `[nombre]` contra la lista de accesibilidad de `docs/06-plan-fases.md`.
> Ve punto por punto y dime cuáles cumple y cuáles no. No arregles nada todavía.

**Revisión contra el diseño**

> Compara `[archivo].dart` con `mockups/png/[archivo].png` y con `docs/04-design-system.md`.
> ¿Los colores, tamaños y medidas coinciden?

**Revisión contra los requisitos**

> Revisa qué requisitos de `docs/02-requisitos.md` están cumplidos con el código actual.
> Hazme una tabla con código, estado y qué falta.

---

## Para guardar y cerrar

**Guardar el avance**

> Haz un commit con lo que llevamos. Mensaje descriptivo en español.

**Cerrar una fase**

> Damos por terminada la Fase N. Actualiza la casilla en `docs/06-plan-fases.md`, actualiza
> el «Estado actual» de `CLAUDE.md` y haz un commit.

**Al terminar la sesión**

> Voy a cerrar. Resume en cinco líneas qué hicimos hoy, en qué punto quedamos y cuál es el
> siguiente paso. Guárdalo al final de `CLAUDE.md` en una sección «Última sesión».

---

## Para frenarlo

Estos son útiles. Úsalos sin culpa.

> Espera. Vas muy rápido. Explícame lo último antes de seguir.

> No escribas más código todavía. Primero quiero entender qué hay.

> Eso es demasiado para un solo paso. Divídelo en tres partes y hagamos solo la primera.

> Deshaz eso y hagámoslo de la forma más simple posible, aunque sea menos elegante.
