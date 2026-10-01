const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, AlignmentType, ImageRun, PageBreak,
  LevelFormat, convertInchesToTwip,
} = require("docx");

const AMARILLO = "B8860B"; // ambar oscuro, legible en blanco (el amarillo puro no se lee en Word)
const AZUL = "1565C0";
const VERDE = "1E7D46";
const ROJO = "B3261E";
const GRIS = "5A6472";
const NEGRO = "1A1A1A";

const BORDES_CELDA = {
  top: { style: BorderStyle.SINGLE, size: 2, color: "CBD2D9" },
  bottom: { style: BorderStyle.SINGLE, size: 2, color: "CBD2D9" },
  left: { style: BorderStyle.SINGLE, size: 2, color: "CBD2D9" },
  right: { style: BorderStyle.SINGLE, size: 2, color: "CBD2D9" },
};

function h1(texto) {
  return new Paragraph({ text: texto, heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 150 } });
}
function h2(texto) {
  return new Paragraph({ text: texto, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } });
}
function kicker(texto) {
  return new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: texto.toUpperCase(), bold: true, color: AMARILLO, size: 18, characterSpacing: 20 })],
  });
}
function p(texto, opts = {}) {
  return new Paragraph({
    spacing: { after: 160 },
    children: [new TextRun({ text: texto, size: 22, color: NEGRO, ...opts })],
  });
}
function bullet(texto) {
  return new Paragraph({ text: texto, bullet: { level: 0 }, spacing: { after: 60 } });
}
function celda(texto, { header = false, width, shade } = {}) {
  return new TableCell({
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    shading: shade ? { type: ShadingType.CLEAR, fill: shade } : undefined,
    borders: BORDES_CELDA,
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({ text: texto, bold: header, size: header ? 19 : 20, color: header ? "FFFFFF" : NEGRO })],
    })],
  });
}
function tabla(anchos, filas) {
  const total = anchos.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: anchos,
    rows: filas.map((fila, i) =>
      new TableRow({
        children: fila.map((texto, j) => celda(texto, {
          header: i === 0,
          width: anchos[j],
          shade: i === 0 ? "2B3440" : undefined,
        })),
      })
    ),
  });
}
function imagen(ruta, anchoPx) {
  const data = fs.readFileSync(ruta);
  const altoPx = Math.round(anchoPx * (2400 / 1080));
  return new ImageRun({ type: "jpg", data, transformation: { width: anchoPx, height: altoPx } });
}
function codigo(lineas) {
  return new Paragraph({
    shading: { type: ShadingType.CLEAR, fill: "151A21" },
    spacing: { after: 60 },
    children: lineas.map((l, i) => new TextRun({ text: l, font: "Consolas", size: 17, color: "4DD0FF", break: i === 0 ? 0 : 1 })),
  });
}
function salto() { return new Paragraph({ children: [new PageBreak()] }); }

const BASE = "C:\\Users\\Sebastian Poma N\\Documents\\Ciclo8\\HombreYMquina\\via-app\\via-app\\docs\\entregables\\_build\\web\\";

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri" } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, color: NEGRO }, paragraph: { spacing: { before: 280, after: 140 } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: "2B3440" }, paragraph: { spacing: { before: 200, after: 100 } } },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 } } },
    children: [
      // PORTADA
      new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "VÍA", bold: true, size: 56, color: NEGRO })] }),
      new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: "Voz, Imagen y Accesibilidad", size: 24, color: GRIS })] }),
      kicker("Segunda entrega"),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Del prototipo al producto funcional", bold: true, size: 40, color: NEGRO })] }),
      p("Diseño, prototipado y evaluación inicial de la aplicación inclusiva. En esta entrega VÍA dejó de ser una maqueta estática: es una aplicación Flutter real, instalable en un teléfono Android, que lee en voz alta, escucha comandos y se repinta al instante según el perfil de accesibilidad elegido."),
      p("Curso: Interacción entre Hombre y Máquina · Universidad Tecnológica del Perú", { bold: true }),
      p("Integrantes — Enrique Sebastian Poma Nizama · U23200217"),
      salto(),

      // RESUMEN EJECUTIVO
      kicker("Resumen ejecutivo"),
      h1("Qué cambió desde la primera entrega"),
      p("La Entrega 1 propuso y diseñó la solución (teoría, requisitos, mockups estáticos). Esta entrega la construye: hay código fuente real, corriendo en un dispositivo real, que se puede tocar, hablar y escuchar."),
      tabla([3200, 6200],
        [
          ["Qué", "Detalle"],
          ["Entrega 1 → Entrega 2", "De 6 mockups en HTML/PNG (sin funcionar) a 32 archivos Dart, 3 676 líneas de código, compilando a un APK real para Android."],
          ["Alcance: profundidad, no ancho", "La consigna pide cubrir 5 grupos (visual, auditivo, motor, cognitivo, adultos mayores). Se decidió, como parte del DCU, profundizar en uno solo — discapacidad visual — en vez de hacer cinco soluciones superficiales. Justificación completa más adelante."],
          ["Nuevo: personalización de color", "Más allá de lo pedido: el usuario cambia el esquema de color en vivo (alto contraste oscuro, claro, o una paleta segura para daltonismo) sin reiniciar la app."],
          ["Cifras del código", "32 archivos Dart · 3 676 líneas · 6 pantallas completas y navegables."],
        ]
      ),
      salto(),

      // DCU
      kicker("Diseño Centrado en el Usuario"),
      h1("Las cinco etapas, aplicadas a VÍA"),
      p("Siguiendo el proceso de DCU visto en el curso, cada etapa dejó una evidencia concreta dentro del propio proyecto:"),
      tabla([2400, 4600, 2400],
        [
          ["Etapa", "Qué se hizo", "Evidencia"],
          ["1 · Empatizar / investigar", "Revisión de literatura sobre accesibilidad para personas ciegas (VizWiz, VizWiz Grand Challenge, estudio de Adnin & Das) y de datos duros (OMS, WebAIM, INEI).", "docs/01-propuesta.md"],
          ["2 · Definir", "22 requisitos funcionales y 11 no funcionales, cada uno trazable a una fase del plan de trabajo.", "docs/02-requisitos.md"],
          ["3 · Idear / diseñar", "Sistema de diseño con colores verificados matemáticamente (fórmula de contraste WCAG) y medidas táctiles mínimas de 48×48 dp.", "docs/04-design-system.md"],
          ["4 · Prototipar", "De baja fidelidad (HTML estático) a alta fidelidad funcional: una app Flutter real que compila, instala y corre en Android.", "32 archivos · lib/"],
          ["5 · Evaluar", "Evaluación heurística de Nielsen sobre el prototipo funcional + protocolo de prueba con usuarios y escala SUS.", "Ver páginas siguientes"],
        ]
      ),
      salto(),

      // ARQUITECTURA
      kicker("Para sustentar el trabajo"),
      h1("Cómo está armado el código"),
      p("VÍA separa el código en 4 capas, para que cada pieza tenga un único trabajo y se pueda explicar sin enredarse con las demás."),
      tabla([1800, 4600, 3000],
        [
          ["Capa", "Qué vive ahí", "Ejemplo real"],
          ["core/", "Tema visual, accesibilidad (voz + vibración + anuncio), comandos de voz", "anunciador.dart"],
          ["data/", "Modelos y servicios — cada paquete externo (TTS, cámara, OCR) vive envuelto en un único archivo", "tts_service.dart"],
          ["features/", "Una carpeta por pantalla: la vista dibuja, el controlador decide", "ojo_ia_controller.dart"],
          ["shared/", "Botones y tarjetas reutilizados en varias pantallas", "tarjeta_accesible.dart"],
        ]
      ),
      p("Regla que no se negocia: ningún widget llama a un paquete externo directamente. Si mañana se cambia el motor de voz, se toca un solo archivo — nunca las 14 pantallas.", { italics: true }),
      h2("El Anunciador — la pieza más usada"),
      p("Une voz + vibración + lector de pantalla en una sola llamada. Toda acción del usuario pasa por aquí: si algo cambia en la pantalla y no se anuncia, para un usuario ciego ese cambio no existe."),
      codigo([
        "class Anunciador {",
        "  Future<void> anunciar(",
        "    String mensaje, {",
        "    bool interrumpir = false,",
        "    TipoVibracion vibracion = TipoVibracion.cambioFoco,",
        "  }) async {",
        "    vibracion.ejecutar();",
        "    SemanticsService.announce(mensaje, TextDirection.ltr);",
        "    await _tts.hablar(mensaje, interrumpir: interrumpir);",
        "  }",
        "}",
      ]),
      salto(),

      // CAPTURAS 1
      kicker("Prototipo funcional · capturas reales"),
      h1("Perfil e inicio por voz"),
      p("Capturas tomadas de la app real corriendo (no mockups)."),
      new Table({
        width: { size: 9400, type: WidthType.DXA },
        columnWidths: [4700, 4700],
        rows: [new TableRow({ children: [
          new TableCell({ width: { size: 4700, type: WidthType.DXA }, borders: BORDES_CELDA, margins:{top:80,bottom:80,left:80,right:80}, children: [new Paragraph({ children: [imagen(BASE + "onboarding.jpg", 400)] }), new Paragraph({ children:[new TextRun({text:"P-01 · Perfil de accesibilidad", size:18, color: GRIS})]})] }),
          new TableCell({ width: { size: 4700, type: WidthType.DXA }, borders: BORDES_CELDA, margins:{top:80,bottom:80,left:80,right:80}, children: [new Paragraph({ children: [imagen(BASE + "inicio.jpg", 400)] }), new Paragraph({ children:[new TextRun({text:"P-02 · Inicio con escucha activa", size:18, color: GRIS})]})] }),
        ]})],
      }),
      salto(),

      // CAPTURAS 2 - PERSONALIZACION
      kicker("Lo que pide el profesor, y algo más"),
      h1("Personalización de color en vivo"),
      p("Un cambio en Ajustes repinta la app entera, al instante, sin reiniciar nada — incluida la paleta segura para daltonismo (protanopía/deuteranopía), con contraste verificado matemáticamente igual que el esquema por defecto."),
      new Table({
        width: { size: 9400, type: WidthType.DXA },
        columnWidths: [4700, 4700],
        rows: [new TableRow({ children: [
          new TableCell({ width: { size: 4700, type: WidthType.DXA }, borders: BORDES_CELDA, margins:{top:80,bottom:80,left:80,right:80}, children: [new Paragraph({ children: [imagen(BASE + "ajustes_daltonico.jpg", 400)] }), new Paragraph({ children:[new TextRun({text:"Ajustes: esquema \"daltonismo\" elegido", size:18, color: GRIS})]})] }),
          new TableCell({ width: { size: 4700, type: WidthType.DXA }, borders: BORDES_CELDA, margins:{top:80,bottom:80,left:80,right:80}, children: [new Paragraph({ children: [imagen(BASE + "inicio_daltonico.jpg", 400)] }), new Paragraph({ children:[new TextRun({text:"Inicio repintado al instante", size:18, color: GRIS})]})] }),
        ]})],
      }),
      salto(),

      // NIELSEN 1
      kicker("Evaluación heurística"),
      h1("Las 10 heurísticas de Nielsen, aplicadas a VÍA"),
      tabla([3000, 6400],
        [
          ["Heurística", "Cómo la cumple VÍA"],
          ["1. Visibilidad del estado", "Toda acción se confirma por voz + vibración + anuncio al lector de pantalla a la vez (clase Anunciador). El orbe de Inicio muestra «● ESCUCHANDO…» en tiempo real."],
          ["2. Coincidencia con el mundo real", "Los mensajes de voz dan primero el dato, después el adorno («S/ 87.40, total a pagar»), sin jerga técnica ni nombres de íconos."],
          ["3. Control y libertad", "Comandos «repetir», «parar», «más rápido/lento» en cualquier pantalla; el lector permite anterior/siguiente/pausar en cualquier momento."],
          ["4. Consistencia y estándares", "Un solo sistema de diseño (ColoresVia, TemaVia) usado por las 6 pantallas: mismos 48 dp mínimos, mismo radio de tarjeta, mismo patrón de anuncio."],
          ["5. Prevención de errores", "Ojo IA avisa por voz antes de capturar («hay poca luz», «acércate») en vez de dejar que el usuario tome una foto inservible."],
          ["6. Reconocer antes que recordar", "Los accesos rápidos y los comandos de voz se anuncian explícitamente («puedes decir: leer documento, abrir cámara o ajustes») en vez de exigir memorizarlos."],
          ["7. Flexibilidad y eficiencia", "Cada acción tiene equivalente táctil y de voz — un usuario con resto visual toca, uno sin visión habla."],
          ["8. Diseño estético y minimalista", "Una sola acción principal por pantalla (amarillo); nada compite por atención. Jerarquía tipográfica fija."],
          ["9. Ayudar a reconocer y resolver errores", "«No entendí. Puedes decir: leer documento, abrir cámara o ajustes» en vez de un error seco."],
          ["10. Ayuda y documentación", "P-06 conecta con un voluntario humano cuando la IA no alcanza (simulado)."],
        ]
      ),
      salto(),

      // NIELSEN 2 - HALLAZGOS
      kicker("Evaluación heurística · hallazgos"),
      h1("Lo que la evaluación encontró para mejorar"),
      p("Una evaluación heurística que no encuentra nada que mejorar no es rigurosa. Estos son los hallazgos reales de recorrer el prototipo funcional:"),
      h2("H10 — Comandos no descubribles de entrada (severidad baja)"),
      p("El onboarding no enseña todavía los comandos de voz disponibles. Mejora propuesta: un comando «ayuda» que liste los comandos, accesible desde cualquier pantalla."),
      h2("H1 — Silencio durante procesos largos (severidad baja)"),
      p("Mientras el OCR procesa una foto o el lector web descarga una página, solo hay un texto estático («Leyendo…»), sin progreso audible intermedio. Mejora propuesta: un sonido de progreso cada ~3 s."),
      h2("H5 — Guía de encuadre simplificada (limitación de alcance, documentada)"),
      p("Ojo IA avisa de la luz real del encuadre (medida de verdad), pero no detecta si el documento está «cortado» o «lejos» con precisión — eso pide reconocer bordes, con una librería de visión más pesada (OpenCV), fuera del alcance de esta fase."),
      salto(),

      // SUS
      kicker("Siguiente paso de esta entrega"),
      h1("Protocolo de prueba con usuarios (escala SUS)"),
      p("Listo para ejecutarse con 3 a 5 personas (ciegas, con baja visión, o con los ojos vendados simulando ceguera total)."),
      h2("Tareas a cronometrar"),
      ...[
        "Elegir un perfil de accesibilidad sin ayuda (P-01).",
        "Decir «leer documento» y escuchar el resultado completo.",
        "Pausar y reanudar la lectura por voz.",
        "Cambiar la velocidad de voz desde Ajustes.",
        "Decir «ayuda humana» y llegar hasta P-06.",
      ].map(bullet),
      h2("Cuestionario SUS (10 ítems, escala 1 a 5)"),
      ...[
        "Usaría esta app frecuentemente.",
        "La encontré innecesariamente compleja.",
        "La app me pareció fácil de usar.",
        "Necesitaría ayuda de alguien técnico para usarla.",
        "Las funciones de la app están bien integradas.",
        "Hay demasiada inconsistencia en esta app.",
        "La mayoría de la gente aprendería a usarla muy rápido.",
        "La sentí incómoda de usar.",
        "Me sentí segura(o) usando la app.",
        "Necesité aprender muchas cosas antes de poder usarla.",
      ].map(bullet),
      p("Cálculo: ítems impares, puntaje − 1; ítems pares, 5 − puntaje. Sumar los 10 y multiplicar por 2.5 (escala 0-100). Un puntaje sobre 68 está por encima del promedio de usabilidad (Brooke, 1996).", { italics: true }),
      salto(),

      // CIERRE
      kicker("Cierre"),
      h1("Conclusiones y lo que falta"),
      h2("Lo que ya funciona (fases 0-6 del plan)"),
      p("Entorno, tema visual con 3 esquemas de color, voz (TTS), perfil de accesibilidad, navegación por voz, lector adaptativo con contenido de ejemplo, y ajustes con todo aplicándose en vivo."),
      h2("Lo que sigue (fases 7-12 del plan)"),
      p("Cámara + OCR en el dispositivo, historial, lector web completo (ya con servicio implementado), descripción de imágenes con IA en la nube, y la simulación de ayuda humana."),
      h2("Decisión de alcance"),
      p("El profesor pidió cubrir 5 grupos de usuarios; VÍA profundiza en uno. Esto sigue el propio Diseño Centrado en el Usuario: diseñar «para todos» sin investigación específica de cada grupo produce soluciones superficiales. El marco teórico de la Entrega 1 (Shneiderman, 2000; Story, Mueller & Mace, 1998) respalda esta decisión: interfaces multicapa y flexibles, no un diseño único forzado a todos los perfiles."),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("C:\\Users\\Sebastian Poma N\\Documents\\Ciclo8\\HombreYMquina\\via-app\\via-app\\docs\\entregables\\VIA_Segunda_Entrega.docx", buf);
  console.log("DOCX generado OK");
});
