# 05 — Las seis pantallas

Cada pantalla tiene su PNG de referencia en `mockups/png/`. Ábrelo antes de programarla.

Para cada una se especifica **qué anuncia al abrirse**, porque para el usuario ciego eso
*es* la pantalla.

---

## P-01 · Perfil de accesibilidad

📎 `mockups/png/p01.png` · carpeta `features/onboarding/` · **Fase 3**

Primera pantalla al instalar. Pregunta cómo quiere recibir la información.

**Contenido**

- Marca VÍA arriba, con el paso: «Paso 2 de 3 · Perfil de accesibilidad».
- Título: «¿Cómo prefieres recibir la información?».
- Subtítulo: «Toca una opción o dilo en voz alta. Podrás cambiarla cuando quieras».
- Tres tarjetas grandes, cada una con ícono, título y descripción:
  1. **Solo voz** — «Ceguera total · lectura por audio y gestos»
  2. **Texto ampliado + voz** — «Baja visión · fuente 200 % y alto contraste»
  3. **Colores adaptados** — «Daltonismo · paletas seguras y etiquetas»
- Tarjeta cian de escucha: «🎙️ VÍA está escuchando — Di uno, dos o tres para elegir».
- Botón amarillo «Continuar» abajo.

**Al abrirse anuncia:** «Configuración de accesibilidad. ¿Cómo prefieres recibir la
información? Tres opciones. Uno: solo voz, para ceguera total. Dos: texto ampliado más voz,
para baja visión. Tres: colores adaptados, para daltonismo. Di el número de tu opción o
tócala en pantalla.»

**Comportamiento**

- La tarjeta seleccionada lleva borde amarillo de 3 dp y halo.
- Al elegir, anuncia la selección y vibra (`lightImpact`).
- Guarda con `shared_preferences` (RF-03) y no vuelve a mostrarse.

**Requisitos:** RF-01, RF-02, RF-03.

---

## P-02 · Inicio con escucha activa

📎 `mockups/png/p02.png` · carpeta `features/home/` · **Fase 4**

Pantalla principal. El micrófono está activo desde que abre.

**Contenido**

- Marca VÍA y saludo con el perfil: «Hola, Lucía · perfil "Solo voz"».
- Orbe amarillo grande con ícono de micrófono, con dos anillos concéntricos.
- Etiqueta «● ESCUCHANDO…» en amarillo.
- Onda de audio animada en cian (12 barras de altura variable).
- Transcripción de lo escuchado, en grande: «"Léeme las noticias de El Comercio"».
- Sección «ACCESOS RÁPIDOS» con tres tarjetas:
  - 🌐 **Abrir una web** — «Se reconstruye en modo accesible»
  - 📷 **Ojo IA** — «Describe lo que apunta la cámara»
  - 📄 **Leer un documento** — «PDF, Word o foto de un papel»
- Barra inferior de 4 pestañas: Inicio · Navegar · Ojo IA · Ajustes.

**Al abrirse anuncia:** «Inicio. Te escucho. Puedes decir: leer documento, abrir cámara o
ajustes.»

**Comportamiento**

- El orbe pulsa mientras escucha. Si el usuario activó «reducir animaciones», no pulsa.
- La transcripción aparece en pantalla en tiempo real (RF-17).
- Comando reconocido → confirma por voz y navega.
- Comando no reconocido → «No entendí. Puedes decir: leer documento, abrir cámara o
  ajustes.» Nunca un simple «error».

**Requisitos:** RF-15, RF-16, RF-17.

---

## P-03 · Lector adaptativo

📎 `mockups/png/p03.png` · carpeta `features/lector/` · **Fase 4 (local) y 10 (web)**

Muestra contenido ya reconstruido de forma accesible.

**Contenido**

- Cabecera con botón atrás, título «Lector adaptativo» y fuente: «elcomercio.pe ·
  reconstruido».
- Tres chips de estado: «✓ Contraste 15.8:1», «✓ 12 alt generados», «Texto 180 %».
- Marcador de posición: «ENCABEZADO 1 DE 6» en amarillo.
- Titular grande.
- Tarjeta cian: «🖼 DESCRIPCIÓN GENERADA POR IA» con el texto alternativo generado.
- Cuerpo del texto a 18 sp.
- Reproductor: «▶ Reproduciendo», «Voz Sofía (es-PE) · 1.25×», tiempo «2:14 / 4:38» y barra
  de progreso.
- Barra inferior de controles: Anterior · Pausar · Siguiente · Índice.

**Al abrirse anuncia:** «Lector adaptativo. [Título del contenido]. Seis encabezados.
Reproduciendo.»

**Comportamiento**

- Anuncia siempre la posición: «encabezado 1 de 6» (RF-08).
- «Anterior» y «Siguiente» saltan de encabezado, no de párrafo (RF-09).
- «Índice» abre la lista de encabezados para saltar directo.
- El reproductor responde también a comandos de voz.

**Requisitos:** RF-05, RF-06, RF-08, RF-09, RF-18, RF-19.

---

## P-04 · Ojo IA

📎 `mockups/png/p04.png` · carpeta `features/ojo_ia/` · **Fases 7 y 8**

Cámara con guía de captura. **La pantalla más importante del proyecto**: es la que responde
a la brecha del 28 % que documentaron Gurari et al. (2018).

**Contenido**

- Cabecera: «Ojo IA» / «Apunta la cámara y VÍA describe».
- Vista de cámara con marco punteado amarillo de guía.
- Insignia amarilla de estado abajo a la izquierda: «✓ Documento enfocado · buena luz».
- Tarjeta de lectura con borde amarillo: «🔊 LEYENDO EN VOZ ALTA» y el texto reconocido.
- Chips de modo: Texto · Escena · Billetes · Productos.
- Tarjeta cian: «¿La IA no basta? Di "ayuda humana" y te conectamos con un voluntario por
  videollamada en menos de 30 s».
- Barra inferior de navegación.

**Al abrirse anuncia:** «Cámara abierta. Apunta al documento. Te aviso cuando esté bien
encuadrado.»

**Comportamiento — la guía de captura (RF-11)**

Esto es el corazón de la pantalla. Mientras la cámara está abierta, la app evalúa
continuamente y avisa por voz:

| Situación detectada | Qué dice |
|---|---|
| Poca luz | «Hay poca luz, busca un lugar más iluminado» |
| Documento muy lejos | «Acerca un poco la cámara» |
| Documento cortado | «El documento se sale por la derecha» |
| Todo correcto | «Documento enfocado, buena luz. Toca para capturar.» + vibración media |

Los avisos se espacian **al menos 2 segundos** entre sí. Un asistente que habla sin parar es
inutilizable.

Cuando todo está bien, la app puede capturar automáticamente tras un instante o esperar el
toque. Se decide al programarlo.

**Requisitos:** RF-10, RF-11, RF-12, RF-13.

---

## P-05 · Ajustes de accesibilidad

📎 `mockups/png/p05.png` · carpeta `features/ajustes/` · **Fase 6**

**Contenido**

- Cabecera: «Ajustes de accesibilidad» / «Se aplican a todo el contenido».
- Sección **LECTURA**:
  - Tamaño de texto — chip «180 %» + deslizador. Nota: «Escalable hasta 400 % sin pérdida de
    contenido (WCAG 1.4.4)».
  - Velocidad de voz — chip «1.25×» + deslizador.
- Sección **VISUALIZACIÓN**:
  - Alto contraste — interruptor. «Negro sobre amarillo · 15.8:1».
  - Descripción de imágenes con IA — interruptor. «Genera alt cuando la web no lo trae».
  - Reducir animaciones — interruptor. «Evita mareo y distracción».

**Al abrirse anuncia:** «Ajustes de accesibilidad. Cinco opciones.»

**Comportamiento**

- Cada cambio se aplica **de inmediato**, sin botón de guardar.
- Cada cambio se anuncia con su nuevo valor: «Velocidad de voz, 1.5 veces».
- Los deslizadores se pueden mover con gestos de TalkBack.
- Todo se persiste con `shared_preferences`.

**Requisitos:** RF-04, RF-07.

---

## P-06 · Ayuda humana

📎 `mockups/png/p06.png` · carpeta `features/ayuda/` · **Fase 12** (la última)

**Contenido**

- Cabecera: «Ayuda humana» / «Red de voluntarios VÍA».
- Tarjeta destacada con borde amarillo: avatar, «Conectado con Marco T.», «Voluntario
  verificado · Lima, Perú · ⭐ 4.9», chip verde «● En llamada · 00:42».
- Tarjeta cian: «💬 Transcripción en vivo» con lo que dice el voluntario.
- Tres botones: Silenciar · Compartir pantalla · Guardar nota.
- Botón contorneado «Finalizar llamada».

**Al abrirse anuncia:** «Buscando voluntario disponible.» y luego «Conectado con Marco,
voluntario verificado de Lima.»

**Nota importante:** esta pantalla necesita infraestructura de videollamada (WebRTC) y una
red real de voluntarios. Para el curso basta con **simularla**: la interfaz completa y
funcional, con datos de ejemplo. Que quede claro en el código con un comentario, para no
confundirlo con algo que sí conecta.

**Requisitos:** RF-21, RF-22.

---

## Resumen de navegación

```
                    ┌─────────────┐
   primer arranque  │ P-01 Perfil │
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
        ┌───────────│ P-02 Inicio │───────────┐
        │           └──────┬──────┘           │
        ↓                  ↓                  ↓
┌───────────────┐  ┌──────────────┐  ┌───────────────┐
│ P-03 Lector   │  │ P-04 Ojo IA  │  │ P-05 Ajustes  │
└───────────────┘  └──────┬───────┘  └───────────────┘
                          │ «ayuda humana»
                          ↓
                   ┌──────────────┐
                   │ P-06 Ayuda   │
                   └──────────────┘
```

La barra inferior de 4 pestañas está en P-02, P-04, P-05 y P-06. P-01 no la tiene (es el
onboarding) y P-03 la reemplaza por los controles de lectura.
