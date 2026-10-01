const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, AlignmentType, ImageRun, PageBreak,
  TableOfContents, Header, Footer, PageNumber, TabStopType, TabStopPosition,
  LevelFormat, VerticalAlign,
} = require("docx");

const NEGRO = "000000";
const AZUL_H1 = "2E74B5";
const AZUL_H2 = "2E74B5";
const AZUL_H3 = "1F4D78";
const GRIS_NOTA = "404040";

const SIN_BORDE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const BORDE_TABLA = {
  top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  left: SIN_BORDE, right: SIN_BORDE,
};
const BORDE_CELDA_INTERNA = {
  top: SIN_BORDE, bottom: { style: BorderStyle.SINGLE, size: 2, color: "BFBFBF" },
  left: SIN_BORDE, right: SIN_BORDE,
};

function parr(runsOTexto, opts = {}) {
  const children = typeof runsOTexto === "string"
    ? [new TextRun({ text: runsOTexto, size: 24 })]
    : runsOTexto;
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 200 },
    children,
    ...opts,
  });
}
function cita(texto) { return new TextRun({ text: texto, size: 24, italics: true }); }
function normal(texto, extra = {}) { return new TextRun({ text: texto, size: 24, ...extra }); }

function h1(num, texto) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    children: [new TextRun({ text: `${num}. ${texto}`, bold: true, size: 32, color: AZUL_H1 })],
  });
}
function h2(num, texto) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 140 },
    children: [new TextRun({ text: `${num}. ${texto}`, bold: true, size: 26, color: AZUL_H2 })],
  });
}
function h3(num, texto) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 120 },
    children: [new TextRun({ text: `${num}. ${texto}`, bold: true, size: 24, color: AZUL_H3 })],
  });
}

function tablaCaption(numero, titulo) {
  return [
    new Paragraph({ spacing: { before: 240, after: 0 }, children: [new TextRun({ text: `Tabla ${numero}`, bold: true, size: 24 })] }),
    new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: titulo, italics: true, size: 24 })] }),
  ];
}
function notaTabla(texto) {
  return new Paragraph({
    spacing: { before: 100, after: 240 },
    children: [new TextRun({ text: "Nota. ", italics: true, size: 22, color: GRIS_NOTA }), new TextRun({ text: texto, size: 22, color: GRIS_NOTA, italics: true })],
  });
}

function celda(texto, { header = false, width, bold = false } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: BORDE_CELDA_INTERNA,
    verticalAlign: VerticalAlign.TOP,
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    shading: header ? { type: ShadingType.CLEAR, fill: "D9E2F3" } : undefined,
    children: [new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text: texto, bold: header || bold, size: 21 })],
    })],
  });
}
function tabla(anchos, filas) {
  const total = anchos.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: anchos,
    borders: BORDE_TABLA,
    rows: filas.map((fila, i) => new TableRow({
      children: fila.map((t, j) => celda(t, { header: i === 0, width: anchos[j] })),
    })),
  });
}

function codigo(lineas) {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    shading: { type: ShadingType.CLEAR, fill: "F2F2F2" },
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" }, left: { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" }, right: { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" } },
    children: lineas.flatMap((l, i) => i === 0
      ? [new TextRun({ text: l, font: "Consolas", size: 18, color: "1F1F1F" })]
      : [new TextRun({ text: l, font: "Consolas", size: 18, color: "1F1F1F", break: 1 })]),
  });
}

function salto() { return new Paragraph({ children: [new PageBreak()] }); }
function centrado(texto, extra = {}) {
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: texto, size: 24, ...extra })] });
}
function refHanging(runs) {
  return new Paragraph({
    spacing: { after: 200 },
    indent: { left: 720, hanging: 720 },
    children: runs,
  });
}

function imagen(ruta, anchoPx) {
  const data = fs.readFileSync(ruta);
  const altoPx = Math.round(anchoPx * (2400 / 1080));
  return new ImageRun({ type: "jpg", data, transformation: { width: anchoPx, height: altoPx } });
}

const BASE = "C:\\Users\\Sebastian Poma N\\Documents\\Ciclo8\\HombreYMquina\\via-app\\via-app\\docs\\entregables\\_build\\web\\";

// ====================== CARÁTULA ======================
const caratula = [
  centrado("UNIVERSIDAD TECNOLÓGICA DEL PERÚ", { bold: true }),
  centrado("Facultad de Ingeniería", {}),
  new Paragraph({ spacing: { after: 1200 }, children: [] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 1200 },
    children: [new TextRun({
      text: "VÍA: diseño, prototipado y evaluación inicial de una aplicación móvil para el acceso autónomo a la información digital de personas con discapacidad visual en el Perú",
      bold: true, size: 32,
    })],
  }),
  centrado("Segunda entrega: del prototipo de interfaz al producto funcional", { italics: true, size: 26 }),
  new Paragraph({ spacing: { after: 1000 }, children: [] }),
  centrado("Curso: Interacción entre Hombre y Máquina"),
  centrado("Proyecto final de ciclo — Segunda entrega"),
  new Paragraph({ spacing: { after: 600 }, children: [] }),
  centrado("Integrantes", { bold: true }),
  centrado("Enrique Sebastian Poma Nizama — U23200217"),
  centrado("[Nombre del integrante 2] — [código]"),
  centrado("[Nombre del integrante 3] — [código]"),
  new Paragraph({ spacing: { after: 800 }, children: [] }),
  centrado("Docente: [Nombre del docente]"),
  centrado("Lima, Perú — 2026"),
];

// ====================== ÍNDICE ======================
const indice = [
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "Índice", bold: true, size: 32, color: AZUL_H1 })] }),
  new TableOfContents("Índice", { hyperlink: true, headingStyleRange: "1-3" }),
  new Paragraph({
    spacing: { before: 200 },
    children: [new TextRun({ text: "Nota: el índice se actualiza automáticamente en Word con clic derecho → Actualizar campos.", italics: true, size: 20, color: GRIS_NOTA })],
  }),
];

// ====================== RESUMEN ======================
const resumen = [
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "Resumen", bold: true, size: 32, color: AZUL_H1 })] }),
  parr("La primera entrega de este trabajo propuso VÍA (Voz, Imagen y Accesibilidad), una aplicación móvil que opera como capa de accesibilidad entre el contenido digital y la persona con discapacidad visual que lo consulta. La presente entrega documenta el paso de esa propuesta a un prototipo funcional: una aplicación Flutter real, instalable en un teléfono Android, compuesta por 32 archivos de código fuente y 3 708 líneas, que sintetiza voz, escucha comandos y adapta su interfaz completa — incluido el esquema de color, con una paleta adicional segura para daltonismo — sin reiniciarse. El desarrollo siguió las cinco etapas del Diseño Centrado en el Usuario y se sometió a una evaluación heurística según los diez principios de usabilidad de Nielsen (1994), de la que se derivan tres hallazgos documentados con su severidad. Se formula además un protocolo de evaluación con usuarios mediante la escala de usabilidad del sistema (SUS; Brooke, 1996), pendiente de ejecución antes de la presentación final. El trabajo concluye que el prototipo funcional cumple los objetivos definidos en la primera entrega y que la validación empírica con usuarios con discapacidad visual constituye el siguiente paso indispensable."),
  new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: "Palabras clave: ", bold: true, size: 24 }), new TextRun({ text: "prototipo funcional, Diseño Centrado en el Usuario, evaluación heurística, accesibilidad móvil, Flutter.", size: 24, italics: true })],
  }),
];

// ====================== 1. INTRODUCCIÓN ======================
const s1 = [
  h1(1, "Introducción"),
  parr([normal("La primera entrega de este trabajo presentó la propuesta de VÍA y un prototipo estático de alta fidelidad: seis pantallas diseñadas y justificadas, pero sin funcionamiento real. El presente informe documenta la segunda etapa del proyecto, en la que esa propuesta se convierte en un prototipo funcional — código fuente real que compila, se instala en un teléfono y responde a la voz, al tacto y a la cámara — y se somete a una primera evaluación de usabilidad.")]),
  parr("El informe se organiza en nueve secciones. La sección 2 explica y justifica una decisión de alcance tomada durante esta etapa. La sección 3 documenta la aplicación de las cinco etapas del Diseño Centrado en el Usuario. La sección 4 describe la arquitectura del código implementado, con el propósito explícito de sustentar las decisiones técnicas tomadas. La sección 5 presenta los resultados del prototipo funcional mediante capturas reales de la aplicación en ejecución. La sección 6 reporta la evaluación heurística realizada sobre el prototipo. La sección 7 formula el protocolo de evaluación con usuarios que se ejecutará antes de la presentación final. Las secciones 8 y 9 cierran el informe con las conclusiones y las referencias."),
];

// ====================== 2. DECISIÓN DE ALCANCE ======================
const s2 = [
  h1(2, "Decisión de alcance"),
  parr("El enunciado de esta entrega solicita una aplicación inclusiva orientada a cinco poblaciones: personas con discapacidad visual, auditiva, motora, con dificultades cognitivas leves y adultos mayores con limitaciones tecnológicas. El equipo decidió mantener el alcance definido en la primera entrega — discapacidad visual exclusivamente — en lugar de ampliarlo a los cinco grupos."),
  parr([normal("La decisión se sustenta en el marco teórico ya expuesto en la primera entrega. "), cita("The universal design file"), normal(" (Story, Mueller y Mace, 1998) sostiene que el diseño accesible exige adaptación a necesidades específicas, no una solución genérica aplicada por igual a poblaciones con requerimientos distintos entre sí; y Shneiderman (2000) plantea explícitamente que la alternativa frente al usuario «promedio» inexistente es una interfaz multicapa construida sobre perfiles concretos, no una interfaz única que intente servir a todos. Diseñar simultáneamente para cinco poblaciones sin investigación específica de cada una —subtítulos automáticos para personas sordas, un modo cognitivo simplificado, adaptaciones motoras— habría producido cinco soluciones superficiales en el tiempo disponible, en lugar de una solución investigada, verificada por contraste matemático y probada en dispositivo real para una población.")]),
  parr("Esta decisión no reduce el cumplimiento de los requisitos de la consigna relativos a accesibilidad general: la lectura automática por voz, la conversión de voz a texto, la interfaz de alto contraste, los tamaños de letra configurables, la navegación por comandos de voz, los accesos rápidos simplificados y la compatibilidad con lectores de pantalla —todos ellos solicitados explícitamente— están implementados y funcionando en el prototipo que se documenta en las secciones siguientes."),
];

// ====================== 3. DCU ======================
const s3 = [
  h1(3, "Metodología: Diseño Centrado en el Usuario"),
  parr("El desarrollo de esta etapa siguió las cinco etapas del Diseño Centrado en el Usuario revisadas en el curso. La Tabla 1 sintetiza lo realizado en cada una y la evidencia verificable dentro del propio proyecto."),
  ...tablaCaption(1, "Etapas del Diseño Centrado en el Usuario aplicadas al desarrollo de VÍA"),
  tabla([2200, 4600, 2600],
    [
      ["Etapa", "Qué se realizó", "Evidencia"],
      ["Empatizar e investigar", "Revisión de la literatura sobre accesibilidad para personas ciegas (Bigham et al., 2010; Gurari et al., 2018; Adnin y Das, 2024) ya documentada en la primera entrega.", "Documento de propuesta, sección de estado del arte"],
      ["Definir", "22 requisitos funcionales y 11 no funcionales, cada uno trazable a una fase del plan de trabajo.", "Documento de requisitos del proyecto"],
      ["Idear y diseñar", "Sistema de diseño con colores verificados mediante la fórmula de contraste relativo de la W3C y medidas táctiles mínimas de 48 × 48 píxeles independientes de densidad.", "Documento de sistema de diseño"],
      ["Prototipar", "Tránsito de un prototipo estático en HTML a un prototipo de alta fidelidad funcional: una aplicación Flutter que compila, se instala y corre en un teléfono Android.", "32 archivos de código fuente, 3 708 líneas"],
      ["Evaluar", "Evaluación heurística según Nielsen (1994) sobre el prototipo funcional (sección 6) y protocolo de evaluación con usuarios mediante la escala SUS (sección 7).", "Secciones 6 y 7 de este informe"],
    ]
  ),
  notaTabla("La etapa de evaluación se documenta en dos niveles: una evaluación heurística ya ejecutada por el equipo (sección 6) y un protocolo de evaluación con usuarios reales, formulado y pendiente de ejecución (sección 7)."),
];

// ====================== 4. ARQUITECTURA ======================
const s4 = [
  h1(4, "Arquitectura e implementación del prototipo"),
  h2("4.1", "Organización del código fuente"),
  parr("El código se organiza en cuatro capas sucesivas, replicando en la implementación la arquitectura funcional de cuatro capas ya presentada en la primera entrega. Cada capa tiene una única responsabilidad, lo que permite explicar y modificar una pieza sin afectar a las demás. La Tabla 2 describe esta organización."),
  ...tablaCaption(2, "Organización del código fuente de VÍA por capas"),
  tabla([1600, 4800, 3000],
    [
      ["Capa", "Responsabilidad", "Archivo representativo"],
      ["core/", "Tema visual, accesibilidad (síntesis de voz, vibración y anuncio combinados) y el diccionario de comandos de voz.", "anunciador.dart"],
      ["data/", "Modelos de datos y servicios; cada paquete externo (síntesis de voz, cámara, reconocimiento óptico de caracteres) queda envuelto en un único archivo.", "tts_service.dart"],
      ["features/", "Una carpeta por cada una de las seis pantallas: el archivo de pantalla dibuja la interfaz y un archivo de controlador separado decide la lógica.", "ojo_ia_controller.dart"],
      ["shared/", "Componentes visuales reutilizados por varias pantallas (botones, tarjetas, barra de navegación).", "tarjeta_accesible.dart"],
    ]
  ),
  notaTabla("La separación entre pantalla y controlador implica que ningún widget de interfaz invoca directamente un paquete externo; si en el futuro se sustituyera el motor de voz, el cambio se realizaría en un único archivo."),
  h2("4.2", "Ejemplo de implementación: el anunciador"),
  parr([normal("La pieza más utilizada del código es la clase "), normal("Anunciador", { font: "Consolas" }), normal(", que combina en una sola llamada la síntesis de voz, la vibración háptica y el anuncio al lector de pantalla del sistema operativo. Esta clase concentra el requisito no funcional de que toda acción del usuario se confirme por voz y por vibración: si una pantalla cambia su estado y no pasa por esta clase, ese cambio resulta imperceptible para una persona con ceguera total. La Figura 1 reproduce su implementación completa.")]),
  new Paragraph({ spacing: { before: 200, after: 0 }, children: [new TextRun({ text: "Figura 1", bold: true, size: 24 })] }),
  new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Implementación de la clase Anunciador (lib/core/accessibility/anunciador.dart)", italics: true, size: 24 })] }),
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
  notaTabla("Elaboración propia. El código completo de los 32 archivos del proyecto se documenta en un visor interactivo entregado junto con este informe."),
  h2("4.3", "Decisiones técnicas de implementación"),
  parr("El prototipo se implementó en Flutter, lo que permite compartir la totalidad de la lógica entre Android e iOS desde una sola base de código, conforme a lo previsto en la primera entrega. La síntesis y el reconocimiento de voz se apoyan en los motores nativos del sistema operativo, de modo que funcionan sin conexión a internet. El reconocimiento óptico de caracteres emplea una biblioteca que se ejecuta íntegramente en el dispositivo, sin enviar las fotografías del usuario a un servidor externo, lo que protege la privacidad de documentos que con frecuencia contienen datos personales."),
  h2("4.4", "Herramientas y tecnologías utilizadas"),
  parr("La Tabla 3 detalla cada herramienta empleada en la construcción del prototipo y su propósito específico dentro de la aplicación. Se distingue entre las herramientas de desarrollo, empleadas para construir y depurar el proyecto, y las bibliotecas de software (dependencias) que se incorporan al código y se ejecutan dentro de la aplicación."),
  ...tablaCaption(3, "Herramientas y tecnologías utilizadas en el desarrollo de VÍA"),
  tabla([2400, 2200, 4200],
    [
      ["Herramienta", "Tipo", "Para qué se utilizó"],
      ["Flutter (SDK)", "Framework de desarrollo", "Marco de trabajo de Google que permite escribir una sola base de código y compilarla tanto para Android como para iOS."],
      ["Dart", "Lenguaje de programación", "Lenguaje en el que está escrito la totalidad del código fuente de la aplicación (32 archivos, 3 708 líneas); es el lenguaje nativo de Flutter."],
      ["Android Studio", "Entorno de desarrollo", "Proveedor del SDK de Android y del emulador de teléfono utilizados para compilar, instalar y depurar la aplicación."],
      ["Visual Studio Code", "Editor de código", "Edición y revisión del código fuente del proyecto."],
      ["provider (6.1.5)", "Dependencia — manejo de estado", "Permite que un cambio de ajuste (por ejemplo, el esquema de color) se refleje al instante en toda la aplicación, sin reiniciarla."],
      ["flutter_tts (4.2.5)", "Dependencia — síntesis de voz", "Convierte texto en voz hablada, usando el motor de voz nativo del sistema operativo (texto a voz, RF-05)."],
      ["speech_to_text (7.5.0)", "Dependencia — reconocimiento de voz", "Convierte lo que el usuario dice en texto, usando el reconocedor de voz nativo del sistema operativo (voz a texto, RF-15): en Android corresponde al servicio de reconocimiento de voz de Google integrado en el sistema, no a una API externa contratada por el equipo."],
      ["camera (0.12.1)", "Dependencia — acceso a hardware", "Da acceso a la cámara del dispositivo para el módulo Ojo IA (captura de documentos y fotografías)."],
      ["google_mlkit_text_recognition (0.17.1)", "Dependencia — visión por computador", "Reconocimiento óptico de caracteres (OCR): extrae el texto de una fotografía, ejecutándose íntegramente en el dispositivo y sin conexión a internet."],
      ["permission_handler (13.0.2)", "Dependencia — permisos del sistema", "Solicita y verifica los permisos de cámara y micrófono de forma unificada entre Android e iOS."],
      ["shared_preferences (2.5.5)", "Dependencia — almacenamiento local", "Guarda en el propio dispositivo los ajustes de accesibilidad del usuario (perfil, esquema de color, velocidad de voz) para que persistan entre una sesión y otra."],
      ["http (1.6.0)", "Dependencia — red", "Realiza la descarga del contenido HTML de una página web para el lector adaptativo (RF-18)."],
      ["html (0.15.7)", "Dependencia — procesamiento de texto", "Analiza el HTML descargado para extraer encabezados, párrafos e imágenes y reconstruir el contenido en secciones navegables."],
    ]
  ),
  notaTabla("Entre paréntesis se indica la versión de cada dependencia utilizada en el prototipo. Todas las dependencias se obtuvieron del repositorio oficial de paquetes de Dart y Flutter (pub.dev)."),
];

// ====================== 5. RESULTADOS: PROTOTIPO FUNCIONAL ======================
const s5 = [
  h1(5, "Resultados: el prototipo funcional"),
  parr("El prototipo implementa las seis pantallas diseñadas en la primera entrega, más dos capacidades adicionales no solicitadas explícitamente: un lector de páginas web con jerarquía de encabezados reconstruida y un historial de documentos leídos. El Anexo A reproduce capturas de pantalla tomadas directamente de la aplicación en ejecución, no de maquetas estáticas."),
  h2("5.1", "Personalización del esquema de color"),
  parr("Además de lo solicitado en la consigna, el prototipo permite cambiar el esquema de color de toda la interfaz en tiempo real, sin reiniciar la aplicación. Se implementaron tres esquemas: alto contraste oscuro (el definido en la primera entrega, con una relación de contraste de 15.8:1), alto contraste claro (17.7:1) y una paleta segura para personas con daltonismo que evita depender de la distinción entre rojo y verde —la que falla en la protanopía y la deuteranopía, los dos tipos más frecuentes— sustituyéndola por una combinación de azul y naranja. Los tres esquemas fueron verificados matemáticamente con la fórmula de contraste relativo de la W3C antes de incorporarse, siguiendo el mismo criterio normativo aplicado en la primera entrega."),
  parr("La Figura 2, en el Anexo A, muestra la misma pantalla de inicio antes y después de seleccionar el esquema para daltonismo, capturada en la aplicación real."),
];

// ====================== 6. EVALUACIÓN HEURÍSTICA ======================
const s6 = [
  h1(6, "Evaluación heurística de usabilidad"),
  h2("6.1", "Metodología"),
  parr([normal("Se realizó una evaluación heurística siguiendo el método propuesto por Nielsen (1994), en el cual uno o más evaluadores recorren una interfaz y juzgan su cumplimiento frente a un conjunto reducido de principios de usabilidad ampliamente validados. A diferencia de una prueba con usuarios, la evaluación heurística no requiere participantes externos y resulta adecuada como primer filtro antes de someter el prototipo a usuarios reales, paso que se formula en la sección 7. El equipo recorrió las seis pantallas del prototipo funcional —no maquetas— evaluando cada una contra los diez principios de Nielsen.")]),
  h2("6.2", "Resultados por heurística"),
  ...tablaCaption(4, "Cumplimiento de las diez heurísticas de usabilidad de Nielsen (1994) en el prototipo de VÍA"),
  tabla([2800, 6400],
    [
      ["Heurística", "Cumplimiento observado en VÍA"],
      ["1. Visibilidad del estado del sistema", "Toda acción se confirma por voz, vibración y anuncio al lector de pantalla a la vez, mediante la clase Anunciador descrita en la sección 4.2. La pantalla de inicio muestra «ESCUCHANDO…» mientras el micrófono está activo."],
      ["2. Coincidencia entre el sistema y el mundo real", "Los mensajes de voz presentan primero el dato y después el adorno (por ejemplo, «87.40 soles, total a pagar»), sin jerga técnica ni referencias a íconos."],
      ["3. Control y libertad del usuario", "Comandos de voz «repetir», «parar» y «más rápido» o «más lento» disponibles en cualquier pantalla; el lector permite retroceder, pausar y avanzar en cualquier momento."],
      ["4. Consistencia y estándares", "Un único sistema de diseño aplicado a las seis pantallas: las mismas medidas táctiles mínimas, el mismo radio de tarjeta y el mismo patrón de anuncio por voz."],
      ["5. Prevención de errores", "El módulo de cámara evalúa la iluminación real antes de capturar y avisa por voz si es insuficiente, en lugar de permitir una fotografía inutilizable."],
      ["6. Reconocimiento antes que recuerdo", "Los comandos de voz disponibles se anuncian explícitamente en cada pantalla («puedes decir: leer documento, abrir cámara o ajustes») en vez de exigir que el usuario los memorice de antemano."],
      ["7. Flexibilidad y eficiencia de uso", "Cada acción cuenta con un equivalente táctil y uno de voz, de modo que un usuario con resto visual puede tocar y uno sin visión puede hablar."],
      ["8. Diseño estético y minimalista", "Una sola acción principal por pantalla, señalada en amarillo; ningún otro elemento compite por la atención."],
      ["9. Ayuda para reconocer y resolver errores", "Un comando de voz no reconocido se responde con «No entendí. Puedes decir: leer documento, abrir cámara o ajustes», nunca con un error técnico."],
      ["10. Ayuda y documentación", "La pantalla de ayuda humana conecta al usuario con un voluntario cuando la inteligencia artificial no resuelve la consulta (funcionalidad simulada, según lo previsto para esta etapa del proyecto)."],
    ]
  ),
  notaTabla("Evaluación realizada por el equipo de desarrollo sobre el prototipo funcional en ejecución, no sobre maquetas."),
  h2("6.3", "Hallazgos y oportunidades de mejora"),
  parr("Una evaluación heurística que no identifica ninguna oportunidad de mejora no resulta rigurosa. A continuación se documentan tres hallazgos reales, con la heurística afectada y su severidad, clasificada según la escala habitual de 0 (sin problema) a 4 (catástrofe de usabilidad)."),
  parr([normal("Hallazgo 1 (heurística 10; severidad 1, cosmética). ", { bold: true }), normal("La pantalla inicial de configuración del perfil no enseña todavía los comandos de voz disponibles, que el usuario recién conoce al llegar a la pantalla de inicio. Mejora propuesta: incorporar un comando «ayuda» que enumere los comandos disponibles desde cualquier pantalla.")]),
  parr([normal("Hallazgo 2 (heurística 1; severidad 1, cosmética). ", { bold: true }), normal("Durante procesos de varios segundos —el reconocimiento óptico de una fotografía o la descarga de una página web— la interfaz muestra un texto estático («Leyendo…») sin una señal de progreso audible intermedia. Mejora propuesta: un aviso sonoro breve cada tres segundos durante esperas prolongadas.")]),
  parr([normal("Hallazgo 3 (heurística 5; limitación de alcance documentada). ", { bold: true }), normal("El módulo de cámara evalúa la iluminación real del encuadre mediante el muestreo del plano de luminancia de la imagen, una señal medible y efectiva. No evalúa, en cambio, si el documento aparece cortado o demasiado lejos, pues esa detección exige reconocer los bordes del documento mediante una biblioteca de visión por computador más pesada, que queda fuera del alcance de esta etapa y se deja documentada como trabajo futuro en el propio código fuente.")]),
];

// ====================== 7. PROTOCOLO SUS ======================
const s7 = [
  h1(7, "Protocolo de evaluación con usuarios"),
  parr([normal("Conforme al cuarto objetivo específico formulado en la primera entrega —evaluar la usabilidad del prototipo con usuarios con discapacidad visual mediante pruebas de tarea y la escala SUS—, se formula a continuación el protocolo que se ejecutará con tres a cinco participantes antes de la presentación final. Los participantes podrán ser personas con discapacidad visual o personas sin ella que realicen la prueba con los ojos cubiertos, procedimiento habitual para una primera aproximación cuando no se dispone todavía de acceso a la población objetivo.")]),
  h2("7.1", "Tareas a ejecutar"),
  parr("Se solicitará a cada participante, sin asistencia del equipo, que: (a) seleccione un perfil de accesibilidad en la pantalla inicial; (b) pronuncie el comando «leer documento» y escuche el resultado completo; (c) pause y reanude la lectura por voz; (d) modifique la velocidad de la voz desde los ajustes; y (e) pronuncie el comando «ayuda humana» y llegue hasta la pantalla correspondiente. Se registrará el tiempo y la cantidad de intentos de cada tarea."),
  h2("7.2", "Instrumento: escala de usabilidad del sistema"),
  parr([normal("Al finalizar las tareas, cada participante responderá el instrumento SUS (Brooke, 1996), compuesto por diez afirmaciones calificadas en una escala de uno a cinco puntos, reproducido en la Tabla 5.")]),
  ...tablaCaption(5, "Instrumento de evaluación de usabilidad del sistema (SUS)"),
  tabla([700, 7700, 1200],
    [
      ["N.°", "Afirmación", "Puntaje"],
      ["1", "Creo que usaría esta aplicación con frecuencia.", "1–5"],
      ["2", "Encontré la aplicación innecesariamente compleja.", "1–5"],
      ["3", "Me pareció que la aplicación es fácil de usar.", "1–5"],
      ["4", "Creo que necesitaría la ayuda de una persona técnica para usarla.", "1–5"],
      ["5", "Las funciones de la aplicación están bien integradas.", "1–5"],
      ["6", "Encontré demasiada inconsistencia en la aplicación.", "1–5"],
      ["7", "Creo que la mayoría de las personas aprendería a usarla rápidamente.", "1–5"],
      ["8", "Sentí la aplicación incómoda de usar.", "1–5"],
      ["9", "Me sentí segura o seguro usando la aplicación.", "1–5"],
      ["10", "Necesité aprender muchas cosas antes de poder usar la aplicación.", "1–5"],
    ]
  ),
  notaTabla("Adaptado de Brooke (1996). Los ítems impares se puntúan como (puntaje − 1) y los pares como (5 − puntaje); la suma de los diez valores se multiplica por 2.5 para obtener un puntaje entre 0 y 100."),
  h2("7.3", "Criterio de interpretación"),
  parr("Se adopta como meta un puntaje igual o superior a 68 puntos, el valor que Brooke (1996) y la literatura posterior sobre SUS identifican como el promedio de referencia por encima del cual un sistema se considera de usabilidad aceptable."),
];

// ====================== 8. CONCLUSIONES ======================
const s8 = [
  h1(8, "Conclusiones"),
  parr([normal("Primera. ", { bold: true }), normal("El prototipo dejó de ser una maqueta estática y es, a la fecha de este informe, una aplicación funcional de 32 archivos y 3 708 líneas de código que se instala y ejecuta en un teléfono Android real, con los módulos de voz, perfil de accesibilidad, navegación y ajustes operativos.")]),
  parr([normal("Segunda. ", { bold: true }), normal("La decisión de mantener el alcance en la discapacidad visual, en lugar de ampliarlo a las cinco poblaciones sugeridas en la consigna, es coherente con el marco teórico adoptado desde la primera entrega y permitió alcanzar profundidad de implementación y verificación en vez de una cobertura superficial.")]),
  parr([normal("Tercera. ", { bold: true }), normal("La evaluación heurística según Nielsen (1994) encontró cumplimiento satisfactorio en las diez heurísticas evaluadas y, a la vez, tres oportunidades de mejora documentadas con su severidad, lo que indica que el ejercicio de evaluación fue riguroso y no meramente confirmatorio.")]),
  parr([normal("Cuarta. ", { bold: true }), normal("El protocolo de evaluación con usuarios mediante la escala SUS (Brooke, 1996), formulado en la sección 7, constituye el paso inmediato siguiente y pendiente: ninguna decisión de diseño de accesibilidad puede considerarse validada sin la verificación de las personas que usarán el sistema.")]),
];

// ====================== 9. REFERENCIAS ======================
const refs = [
  h1(9, "Referencias"),
  refHanging([normal("Adnin, R., y Das, M. (2024). "), normal('"I look at it as the king of knowledge": How blind people use and understand generative AI tools. En '), cita("Proceedings of the 26th International ACM SIGACCESS Conference on Computers and Accessibility"), normal(" (pp. 1-17). Association for Computing Machinery. https://doi.org/10.1145/3663548.3675631")]),
  refHanging([normal("Bigham, J. P., Jayant, C., Ji, H., Little, G., Miller, A., Miller, R. C., Miller, R., Tatarowicz, A., White, B., White, S., y Yeh, T. (2010). VizWiz: Nearly real-time answers to visual questions. En "), cita("Proceedings of the 23rd Annual ACM Symposium on User Interface Software and Technology"), normal(" (pp. 333-342). Association for Computing Machinery. https://doi.org/10.1145/1866029.1866080")]),
  refHanging([normal("Brooke, J. (1996). SUS: A \"quick and dirty\" usability scale. En P. W. Jordan, B. Thomas, B. A. Weerdmeester y A. L. McClelland (Eds.), "), cita("Usability Evaluation in Industry"), normal(" (pp. 189-194). Taylor & Francis.")]),
  refHanging([normal("Gurari, D., Li, Q., Stangl, A. J., Guo, A., Lin, C., Grauman, K., Luo, J., y Bigham, J. P. (2018). VizWiz Grand Challenge: Answering visual questions from blind people. En "), cita("2018 IEEE/CVF Conference on Computer Vision and Pattern Recognition"), normal(" (pp. 3608-3617). IEEE. https://doi.org/10.1109/CVPR.2018.00380")]),
  refHanging([normal("Nielsen, J. (1994). Heuristic evaluation. En J. Nielsen y R. L. Mack (Eds.), "), cita("Usability Inspection Methods"), normal(" (pp. 25-62). John Wiley & Sons.")]),
  refHanging([normal("Shneiderman, B. (2000). Universal usability. "), cita("Communications of the ACM, 43"), normal("(5), 84-91. https://doi.org/10.1145/332833.332843")]),
  refHanging([normal("Story, M. F., Mueller, J. L., y Mace, R. L. (1998). "), cita("The universal design file: Designing for people of all ages and abilities"), normal(". Center for Universal Design, North Carolina State University.")]),
  refHanging([normal("World Wide Web Consortium. (2023). "), cita("Web Content Accessibility Guidelines (WCAG) 2.2"), normal(". W3C. https://www.w3.org/TR/WCAG22/")]),
];

// ====================== ANEXO A ======================
const anexo = [
  new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 180 }, children: [new TextRun({ text: "Anexo A. Capturas del prototipo funcional", bold: true, size: 32, color: AZUL_H1 })] }),
  parr("Las siguientes capturas se tomaron directamente de la aplicación VÍA en ejecución, no de maquetas de diseño."),
  new Paragraph({ spacing: { before: 200, after: 0 }, children: [new TextRun({ text: "Figura 2", bold: true, size: 24 })] }),
  new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Pantallas P-01 (perfil de accesibilidad) y P-02 (inicio con escucha activa)", italics: true, size: 24 })] }),
  new Table({
    width: { size: 9000, type: WidthType.DXA }, columnWidths: [4500, 4500], borders: BORDE_TABLA,
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: 4500, type: WidthType.DXA }, borders: BORDE_CELDA_INTERNA, margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [imagen(BASE + "onboarding.jpg", 380)] })] }),
      new TableCell({ width: { size: 4500, type: WidthType.DXA }, borders: BORDE_CELDA_INTERNA, margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [imagen(BASE + "inicio.jpg", 380)] })] }),
    ]})],
  }),
  notaTabla("Elaboración propia, capturas de la aplicación en ejecución."),
  salto(),
  new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: "Figura 3", bold: true, size: 24 })] }),
  new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Personalización en tiempo real: esquema de color para daltonismo aplicado en Ajustes y reflejado al instante en Inicio", italics: true, size: 24 })] }),
  new Table({
    width: { size: 9000, type: WidthType.DXA }, columnWidths: [4500, 4500], borders: BORDE_TABLA,
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: 4500, type: WidthType.DXA }, borders: BORDE_CELDA_INTERNA, margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [imagen(BASE + "ajustes_daltonico.jpg", 380)] })] }),
      new TableCell({ width: { size: 4500, type: WidthType.DXA }, borders: BORDE_CELDA_INTERNA, margins: { top: 100, bottom: 100, left: 100, right: 100 }, children: [new Paragraph({ children: [imagen(BASE + "inicio_daltonico.jpg", 380)] })] }),
    ]})],
  }),
  notaTabla("Elaboración propia, capturas de la aplicación en ejecución."),
];

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Times New Roman", size: 24 }, paragraph: { spacing: { line: 480, lineRule: "auto" } } } },
  },
  features: { updateFields: true },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440, header: 708, footer: 708 } } },
    headers: {
      default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "VÍA — Segunda entrega", size: 18, color: "595959" })] })] }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ size: 18, color: "595959", children: [PageNumber.CURRENT] })],
        })],
      }),
    },
    children: [
      ...caratula, salto(),
      ...indice, salto(),
      ...resumen, salto(),
      ...s1,
      ...s2,
      ...s3, salto(),
      ...s4, salto(),
      ...s5, salto(),
      ...s6, salto(),
      ...s7, salto(),
      ...s8, salto(),
      ...refs, salto(),
      ...anexo,
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("C:\\Users\\Sebastian Poma N\\Documents\\Ciclo8\\HombreYMquina\\via-app\\via-app\\docs\\entregables\\VIA_Segunda_Entrega_Informe.docx", buf);
  console.log("Informe DOCX generado OK");
});
