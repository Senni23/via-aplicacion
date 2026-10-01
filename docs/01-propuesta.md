# 01 — La propuesta

## El problema

La información indispensable para la vida cotidiana —trámites del Estado, servicios
bancarios, matrículas, recibos, noticias— se distribuye a través de sitios web y
documentos digitales diseñados bajo el supuesto de que quien los consulta puede ver.

Los datos que sustentan el problema:

| Dato | Fuente |
|---|---|
| 2 200 millones de personas en el mundo tienen alguna deficiencia visual | OMS, 2026 |
| 95.9 % de las páginas de inicio más visitadas tiene fallos WCAG detectables, con 56 errores por página en promedio | WebAIM Million, 2026 |
| 61 % de los 3 209 261 peruanos con discapacidad declara limitación permanente para ver (cerca de 2 millones de personas) | INEI, Censo 2017 |

Las cuatro barreras concretas, con su frecuencia real:

1. **Texto de bajo contraste** — 83.9 % de las webs. Ilegible para alguien con baja visión
   aunque la página sea técnicamente navegable.
2. **Imágenes sin texto alternativo** — 53.1 %. El lector de pantalla anuncia solamente la
   palabra «imagen» y toda la información contenida ahí se pierde.
3. **Campos de formulario sin etiqueta** — 51 %. El usuario oye «cuadro de edición» sin
   saber qué dato se le pide, y tiene que abandonar el trámite o pedir ayuda.
4. **Documentos escaneados sin capa de texto** — frecuentes en la administración pública
   peruana. Para el software lector equivalen a una hoja en blanco.

**La consecuencia** es la pérdida de autonomía: la persona queda obligada a depender de un
tercero para gestiones que cualquiera resuelve solo desde su teléfono. Eso compromete la
privacidad de datos sensibles y limita el ejercicio de derechos.

**Pregunta que el proyecto responde:** ¿de qué manera puede una aplicación móvil permitir
que una persona con discapacidad visual acceda de forma autónoma a información digital que
no fue diseñada de manera accesible?

## El giro de la propuesta

Como es inviable esperar a que millones de sitios web corrijan su código, VÍA interviene
**del lado del usuario** y reconstruye la presentación del contenido en el propio
dispositivo.

## Objetivos

**General.** Proponer el diseño de una aplicación móvil que facilite el acceso autónomo a
la información digital a las personas con discapacidad visual en el Perú, combinando
síntesis de voz, visión por computador y adaptación automática de contenidos conforme a las
pautas WCAG 2.2.

**Específicos.**

1. Identificar las principales barreras de accesibilidad digital que enfrentan las personas
   con discapacidad visual, mediante revisión documental y entrevistas a usuarios.
2. Definir los requisitos funcionales y no funcionales a partir de los principios del
   diseño universal y del estándar WCAG 2.2.
3. Diseñar la arquitectura funcional y el prototipo de alta fidelidad de la interfaz,
   priorizando la interacción por voz y el alto contraste.
4. Evaluar la usabilidad del prototipo con usuarios con discapacidad visual, usando pruebas
   de tarea y la escala SUS.

## Los seis módulos

| # | Módulo | Qué hace |
|---|---|---|
| 1 | Lector adaptativo | Reconstruye cualquier web o documento según WCAG 2.2: jerarquía de encabezados, contraste ≥ 7:1, texto escalable a 400 % |
| 2 | Ojo IA | Visión por computador: describe imágenes sin texto alternativo y lee documentos físicos por cámara (OCR) |
| 3 | Navegación por voz | Comandos naturales en español peruano, síntesis de voz de 0.5× a 3× |
| 4 | Perfil de accesibilidad | Se configura una vez —ceguera total, baja visión o daltonismo— y todo el contenido se adapta |
| 5 | Ayuda humana | Cuando la IA no basta, un voluntario verificado entra por videollamada en menos de 30 s |
| 6 | Modo sin conexión | OCR y lectura por voz en el propio dispositivo, para zonas con conectividad limitada |

## Alcance

**Incluye:** app móvil nativa Android e iOS en español; lectura y reconstrucción accesible
de webs y de documentos PDF, Word y texto plano; OCR y descripción de imágenes; control por
voz y gestos con retroalimentación háptica y compatibilidad con líneas braille; tres
perfiles de accesibilidad; red de voluntarios; prototipo navegable y pruebas de usabilidad.

**No incluye:** corregir el código fuente de sitios de terceros; diagnóstico o tratamiento
de salud visual; navegación física o GPS peatonal; traducción a lengua de señas; contenido
con DRM que impida extraer texto.

## El marco teórico que justifica las decisiones de diseño

Estos tres autores no son adorno académico: cada uno explica *por qué* la interfaz es como
es. Cuando dudes de una decisión de diseño, la respuesta suele estar aquí.

- **Story, Mueller y Mace (1998), diseño universal.** Los siete principios. Dos importan
  especialmente: *uso equitativo* —todos reciben la misma información, no una versión
  empobrecida, por eso la app entrega el contenido íntegro por otro canal y no un resumen— e
  *información perceptible* —la información esencial se presenta en modos redundantes, por
  eso cada elemento se comunica por voz, contraste y vibración a la vez—.

- **Norman (2013), diseño centrado en el usuario.** La usabilidad depende de las
  *affordances*, los *significantes* y la *retroalimentación*. En una interfaz sin salida
  visual, el significante que normalmente es la apariencia de un botón debe trasladarse
  íntegramente al canal sonoro y táctil. De ahí la regla: cada acción se anuncia antes de
  ejecutarse y se confirma después.

- **Shneiderman (2000), usabilidad universal.** Propone interfaces multicapa en lugar de
  diseñar para un usuario «promedio» inexistente. De ahí los perfiles de accesibilidad y
  los niveles graduables de detalle en la lectura.

## Lo que el estado del arte dejó sin resolver

Cada módulo de VÍA responde a una falla documentada:

| Antecedente | Brecha que persiste | Cómo responde VÍA |
|---|---|---|
| Bigham et al. (2010), VizWiz | Depende de voluntarios disponibles las 24 horas; no escala ni funciona sin conexión | La ayuda humana es respaldo excepcional, no el mecanismo principal; el modo sin conexión cubre lo básico |
| Gurari et al. (2018), VizWiz Grand Challenge | El 28 % de las fotos que toman usuarios ciegos es ininterpretable por mala luz, desenfoque o encuadre | La cámara guía el encuadre y la iluminación **por voz antes de disparar**, en vez de evaluar la foto después |
| Adnin y Das (2024), IA generativa y personas ciegas | Las interfaces de IA no son accesibles: botones sin etiquetar, sin aviso al terminar la respuesta; y hay sesgos capacitistas | La interfaz cumple WCAG 2.2 desde el inicio y las descripciones se formulan en lenguaje neutro y descriptivo |

La segunda fila es la más importante para programar: **la guía de captura por voz no es un
adorno, es la respuesta a un problema medido.** No la recortes.
