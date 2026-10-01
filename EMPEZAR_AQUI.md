# Empezar aquí

Tres pasos. No te saltes el primero.

---

## Paso 1 — Verifica que tengas Flutter

Abre la terminal de Windows (busca «cmd» o «PowerShell» en el menú inicio) y escribe:

```
flutter --version
```

**Si te responde con un número de versión**, ya lo tienes. Pasa al paso 2.

**Si te dice que el comando no existe**, hay que instalarlo. Son dos cosas:

1. **Flutter SDK** — descárgalo de https://docs.flutter.dev/get-started/install/windows
   y sigue las instrucciones de esa página (básicamente: descomprimir en `C:\src\flutter`
   y agregar `C:\src\flutter\bin` al PATH de Windows).
2. **Android Studio** — de https://developer.android.com/studio. No lo vas a usar para
   escribir código, pero trae el SDK de Android y el emulador de teléfono, que sí
   necesitas.

Cuando termines, vuelve a la terminal y escribe:

```
flutter doctor
```

Ese comando revisa qué falta y te lo dice. Si sale algo con ✗ en rojo, no te pelees solo:
copia lo que dice y pégaselo a Claude Code en el paso 3, que te guía.

---

## Paso 2 — Abre esta carpeta en Claude Code

Descomprime esta carpeta donde quieras tenerla, por ejemplo en
`C:\Users\TuUsuario\Documentos\via-app`.

Después, en la terminal:

```
cd C:\Users\TuUsuario\Documentos\via-app
claude
```

Claude Code arranca y lee automáticamente el archivo `CLAUDE.md`, así que ya sabe qué es
VÍA, cómo trabajas y qué reglas seguir. No tienes que explicarle nada de eso.

---

## Paso 3 — El primer mensaje

Cópialo tal cual y pégalo:

> Hola. Vamos a programar VÍA. Ya leíste CLAUDE.md, así que conoces el proyecto.
>
> Antes de escribir código: lee `docs/06-plan-fases.md` y dime en tus palabras qué
> haremos en la Fase 1, para confirmar que estamos de acuerdo.
>
> Después ejecuta `flutter doctor` y dime si el entorno está listo o qué falta.
>
> No crees el proyecto todavía. Espera a que yo te dé el visto bueno.

A partir de ahí déjate llevar por las fases. Cada una es pequeña y termina con algo que
puedes correr y ver funcionando.

---

## Qué hay en esta carpeta

| Archivo | Para qué sirve |
|---|---|
| `CLAUDE.md` | El contexto que Claude Code lee solo. No lo borres. |
| `docs/01-propuesta.md` | El proyecto explicado: problema, objetivos, módulos |
| `docs/02-requisitos.md` | Los requisitos numerados (RF-01, RNF-01…) |
| `docs/03-arquitectura.md` | Las cuatro capas y cómo se traducen a código |
| `docs/04-design-system.md` | Colores, tipografía y medidas exactas |
| `docs/05-pantallas.md` | Qué hace cada una de las seis pantallas |
| `docs/06-plan-fases.md` | **El plan de trabajo. Es la hoja de ruta.** |
| `mockups/png/` | Las seis pantallas diseñadas, a resolución real |
| `mockups/html/` | El código HTML con el que se hicieron, por si quieres verlas en el navegador |
| `prompts/` | Mensajes listos para copiar cuando te trabes |

---

## Consejos para no atascarte

**Cuando algo falle, pega el error completo.** No lo resumas. El texto exacto del error es
lo que permite diagnosticar.

**Si no entiendes algo del código, pregunta.** Escribe literalmente «explícame qué hace
esta parte y por qué». Es parte del trabajo, no una interrupción.

**Guarda tu avance seguido.** Al terminar cada fase, pídele: «haz un commit con lo que
llevamos». Si algo se rompe después, puedes volver atrás.

**No pases a la fase siguiente si la actual no corre.** Un proyecto a medias que funciona
vale más que uno completo que no compila.
