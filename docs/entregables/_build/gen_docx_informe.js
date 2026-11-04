const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, AlignmentType, ImageRun, PageBreak,
  TableOfContents, Header, Footer, PageNumber, LevelFormat, VerticalAlign,
} = require("docx");

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

// ---------- utilidades de texto ----------
function parr(runsOTexto, opts = {}) {
  const children = typeof runsOTexto === "string"
    ? [new TextRun({ text: runsOTexto, size: 24 })]
    : runsOTexto;
  return new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 200 }, children, ...opts });
}
function cita(texto) { return new TextRun({ text: texto, size: 24, italics: true }); }
function normal(texto, extra = {}) { return new TextRun({ text: texto, size: 24, ...extra }); }
function negrita(texto) { return new TextRun({ text: texto, size: 24, bold: true }); }

function h1(num, texto) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 180 },
    children: [new TextRun({ text: `${num}. ${texto}`, bold: true, size: 32, color: AZUL_H1 })],
  });
}
function h1Sin(texto) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 180 },
    children: [new TextRun({ text: texto, bold: true, size: 32, color: AZUL_H1 })],
  });
}
function h2(num, texto) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 140 },
    children: [new TextRun({ text: `${num}. ${texto}`, bold: true, size: 26, color: AZUL_H2 })],
  });
}
function h3(num, texto) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3, spacing: { before: 220, after: 120 },
    children: [new TextRun({ text: `${num}. ${texto}`, bold: true, size: 24, color: AZUL_H3 })],
  });
}

// ---------- tablas y figuras (patrón APA: "Tabla N" + título en cursiva + "Nota.") ----------
function rotulo(tipo, numero, titulo) {
  return [
    new Paragraph({ keepNext: true, spacing: { before: 240, after: 0 }, children: [new TextRun({ text: `${tipo} ${numero}`, bold: true, size: 24 })] }),
    new Paragraph({ keepNext: true, spacing: { after: 100 }, children: [new TextRun({ text: titulo, italics: true, size: 24 })] }),
  ];
}
function tablaCaption(n, t) { return rotulo("Tabla", n, t); }
function figuraCaption(n, t) { return rotulo("Figura", n, t); }
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
      alignment: AlignmentType.LEFT, spacing: { line: 276, lineRule: "auto" },
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
      cantSplit: true,
      tableHeader: i === 0,
      children: fila.map((t, j) => celda(t, { header: i === 0, width: anchos[j] })),
    })),
  });
}

function codigo(lineas) {
  const borde = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
  return new Paragraph({
    spacing: { before: 120, after: 120, line: 276, lineRule: "auto" },
    shading: { type: ShadingType.CLEAR, fill: "F2F2F2" },
    border: { top: borde, bottom: borde, left: borde, right: borde },
    children: lineas.map((l, i) => new TextRun({ text: l, font: "Consolas", size: 18, color: "1F1F1F", ...(i > 0 ? { break: 1 } : {}) })),
  });
}

function salto() { return new Paragraph({ children: [new PageBreak()] }); }
function centrado(texto, extra = {}) {
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: texto, size: 24, ...extra })] });
}
function espacio(after) { return new Paragraph({ spacing: { after }, children: [] }); }
function refHanging(runs) {
  return new Paragraph({ spacing: { after: 200 }, indent: { left: 720, hanging: 720 }, children: runs });
}
function objetivo(runs) {
  return new Paragraph({
    numbering: { reference: "objetivos", level: 0 },
    alignment: AlignmentType.JUSTIFIED, spacing: { after: 120 }, children: runs,
  });
}

// ---------- imágenes ----------
const BUILD = "C:\\Users\\Sebastian Poma N\\Documents\\Ciclo8\\HombreYMquina\\via-app\\via-app\\docs\\entregables\\_build\\";
const E1 = BUILD + "e1media\\word\\media\\";
const WEB = BUILD + "web\\";

function img(ruta, tipo, ancho, alto, alt) {
  return new ImageRun({
    type: tipo, data: fs.readFileSync(ruta), transformation: { width: ancho, height: alto },
    altText: { title: alt, description: alt, name: alt },
  });
}
function imagenCentrada(run) {
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60, line: 240, lineRule: "auto" }, children: [run] });
}
function celdaImagen(ancho, run, leyenda) {
  const hijos = [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 40, line: 240, lineRule: "auto" }, children: [run] })];
  if (leyenda) hijos.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60, line: 240, lineRule: "auto" }, children: [new TextRun({ text: leyenda, size: 20, italics: true })] }));
  return new TableCell({
    width: { size: ancho, type: WidthType.DXA }, borders: BORDE_CELDA_INTERNA,
    margins: { top: 80, bottom: 80, left: 60, right: 60 }, children: hijos,
  });
}
function filaImagenes(celdas, anchoTotal) {
  return new TableRow({ cantSplit: true, children: celdas });
}
function tablaImagenes(anchos, filas) {
  return new Table({
    width: { size: anchos.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: anchos, borders: BORDE_TABLA, rows: filas,
  });
}

// ====================== CARÁTULA ======================
const caratula = [
  centrado("UNIVERSIDAD TECNOLÓGICA DEL PERÚ", { bold: true }),
  centrado("Facultad de Ingeniería"),
  espacio(1000),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 800 },
    children: [new TextRun({
      text: "VÍA: diseño, prototipado y evaluación inicial de una aplicación móvil para el acceso autónomo a la información digital de personas con discapacidad visual en el Perú",
      bold: true, size: 32,
    })],
  }),
  centrado("Segunda entrega", { italics: true, size: 26 }),
  espacio(800),
  centrado("Curso: Interacción entre Hombre y Máquina"),
  centrado("Proyecto final de ciclo"),
  espacio(500),
  centrado("Integrantes", { bold: true }),
  centrado("Enrique Sebastian Poma Nizama — U23200217"),
  centrado("José Leonardo Rodríguez —"),
  espacio(600),
  centrado("Docente: David William Cota Sencara"),
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
  h1Sin("Resumen"),
  parr("La información indispensable para la vida cotidiana —trámites del Estado, servicios bancarios, recibos y noticias— se distribuye hoy a través de sitios y documentos digitales diseñados bajo el supuesto de que quien los consulta puede ver, un supuesto que excluye a más de dos millones de peruanos con discapacidad visual. El presente trabajo propone VÍA (Voz, Imagen y Accesibilidad), una aplicación móvil que opera como capa de accesibilidad entre el contenido digital y el usuario: en lugar de esperar la corrección de millones de sitios ajenos, reconstruye la presentación del contenido en el propio dispositivo y la entrega por voz, por texto ampliado de alto contraste o por línea braille, según el perfil que el usuario configura una sola vez. La propuesta se sustenta en el diseño universal, el diseño centrado en el usuario y la usabilidad universal, y toma como referencia normativa las Pautas de Accesibilidad para el Contenido Web (WCAG) 2.2. El estado del arte revisado revela brechas concretas —dependencia de voluntarios, fotografías que los modelos de visión no logran interpretar e interfaces de inteligencia artificial que no son accesibles— que la arquitectura propuesta busca cubrir."),
  parr("El resultado es una propuesta con un prototipo de alta fidelidad de seis pantallas y un plan de evaluación de usabilidad. Esta segunda entrega la complementa con la metodología de Diseño Centrado en el Usuario seguida, las herramientas y tecnologías seleccionadas para su construcción —entre ellas la tecnología prevista para los comandos de voz—, una evaluación heurística del prototipo según los diez principios de Nielsen (1994), de la que se derivan tres hallazgos documentados con su severidad, y el protocolo de evaluación con usuarios mediante la escala de usabilidad del sistema (SUS; Brooke, 1996)."),
  new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: "Palabras clave: ", bold: true, size: 24 }), new TextRun({ text: "accesibilidad digital, discapacidad visual, diseño universal, WCAG 2.2, diseño centrado en el usuario, evaluación heurística, interfaz por voz.", size: 24, italics: true })],
  }),
];

// ====================== 1. INTRODUCCIÓN ======================
const s1 = [
  h1(1, "Introducción"),
  parr("La transformación digital de los servicios públicos y privados en el Perú ha avanzado con rapidez durante la última década: cada vez más trámites se inician y concluyen en línea, y una parte creciente de la información necesaria para ejercer derechos existe únicamente en formato digital. Ese avance no ha venido acompañado de un cuidado equivalente por la accesibilidad, de modo que la digitalización ha trasladado al entorno virtual las mismas barreras que durante décadas se combatieron en el entorno físico. Para una persona con discapacidad visual, el software lector de pantalla es el intermediario entre el contenido y el sentido del oído, pero solo puede leer lo que el desarrollador escribió correctamente: si una imagen carece de texto alternativo, el lector anuncia únicamente la palabra «imagen». El problema, por lo tanto, no reside en la persona ni en su tecnología de apoyo, sino en la manera en que el contenido fue construido."),
  parr("El presente informe documenta la propuesta de VÍA, una aplicación móvil concebida en el marco del curso de Interacción entre Hombre y Máquina. La premisa que la organiza es deliberadamente pragmática: dado que resulta inviable esperar a que millones de sitios web corrijan su código, la aplicación interviene del lado del usuario. El documento presenta la descripción de la propuesta, la problemática que la justifica, su alcance y objetivos, el marco teórico y el estado del arte que la sustentan, la metodología de diseño seguida, el desarrollo de la propuesta —incluidas su arquitectura, las herramientas y tecnologías seleccionadas y la tecnología prevista para los comandos de voz—, la evaluación heurística del prototipo, el protocolo de evaluación con usuarios y, finalmente, las referencias."),
];

// ====================== 2. DESCRIPCIÓN DE LA PROPUESTA ======================
const s2 = [
  h1(2, "Descripción de la propuesta"),
  parr("VÍA —acrónimo de Voz, Imagen y Accesibilidad— es una aplicación móvil para los sistemas Android e iOS que funciona como una capa de accesibilidad sobre cualquier contenido digital. La aplicación recibe una dirección web, un documento en formato PDF o Word, o una fotografía tomada con la cámara del dispositivo, y devuelve esa misma información en un formato que la persona con discapacidad visual sí puede percibir. La idea que resume la propuesta puede enunciarse en una sola frase: la aplicación no corrige el sitio web ajeno, corrige la forma en que ese sitio llega al usuario."),
  parr("La aplicación se organiza en seis módulos funcionales que operan de manera coordinada bajo un mismo perfil de accesibilidad. Estos módulos se describen en la Tabla 1."),
  ...tablaCaption(1, "Módulos funcionales de la aplicación VÍA"),
  tabla([2400, 6960], [
    ["Módulo", "Función principal"],
    ["Lector adaptativo", "Reconstruye cualquier página web o documento aplicando las WCAG 2.2: restablece la jerarquía de encabezados, eleva el contraste por encima de 7:1 y permite escalar el texto hasta 400 % sin pérdida de contenido."],
    ["Ojo IA", "Emplea visión por computador para describir imágenes que carecen de texto alternativo y para reconocer texto impreso mediante OCR en documentos físicos, envases y carteles."],
    ["Navegación por voz", "Permite operar la totalidad de la aplicación mediante comandos naturales en español peruano, con síntesis de voz de velocidad regulable entre 0.5× y 3×."],
    ["Perfil de accesibilidad", "Configura una única vez el tipo de necesidad —ceguera total, baja visión o daltonismo— y adapta automáticamente todo el contenido posterior."],
    ["Ayuda humana", "Conecta al usuario con un voluntario verificado mediante videollamada en menos de treinta segundos cuando la inteligencia artificial no resuelve la consulta."],
    ["Modo sin conexión", "Ejecuta el reconocimiento de texto y la síntesis de voz en el propio dispositivo, para zonas del país con conectividad limitada."],
  ]),
  notaTabla("Los seis módulos comparten el perfil de accesibilidad configurado por el usuario, de modo que la adaptación del contenido es coherente en toda la aplicación."),
  parr("El usuario objetivo es toda persona con discapacidad visual que utilice un teléfono inteligente, tanto con ceguera total como con baja visión o alteraciones de la percepción del color. De manera secundaria, la propuesta beneficia a adultos mayores con presbicia y a cualquier usuario en situaciones de visión temporalmente limitada, un efecto característico de las soluciones diseñadas bajo criterios de diseño universal."),
];

// ====================== 3. PROBLEMÁTICA ======================
const s3 = [
  h1(3, "Problemática"),
  h2("3.1", "Magnitud del problema"),
  parr("La Organización Mundial de la Salud (2026) estima que al menos 2 200 millones de personas en el mundo presentan alguna deficiencia de la visión y que la prevalencia de la discapacidad visual de lejos es cuatro veces superior en las regiones de ingreso bajo y mediano que en las de ingreso alto, con pérdidas anuales de productividad calculadas en 411 000 millones de dólares. En el Perú, el Censo Nacional de 2017 registró 3 209 261 personas con alguna discapacidad, equivalentes al 10.3 % de la población, y determinó que la limitación permanente para ver es la más frecuente entre ellas: la declara el 61 % de ese grupo (Instituto Nacional de Estadística e Informática, 2018). En términos absolutos, cerca de dos millones de peruanos enfrentan alguna forma de limitación visual permanente."),
  h2("3.2", "El estado real de la accesibilidad web"),
  parr("El informe anual WebAIM Million, que analiza el millón de páginas de inicio más visitadas del mundo, encontró que el 95.9 % de ellas presenta fallos de conformidad con las WCAG 2 detectables por software, con un promedio de 56.1 errores por página (WebAIM, 2026). Los cuatro tipos de error más frecuentes afectan de manera directa a las personas con discapacidad visual: el texto de bajo contraste aparece en el 83.9 % de las páginas, la ausencia de texto alternativo en imágenes en el 53.1 %, la falta de etiquetas en campos de formulario en el 51 % y los enlaces vacíos en el 46.3 %."),
  parr("Estas cifras describen consecuencias concretas: cuando un campo de formulario no está etiquetado, el usuario no puede saber qué dato se le solicita y debe abandonar el trámite o pedir ayuda a un tercero; cuando el texto se presenta con un contraste de 2:1, resulta ilegible para una persona con baja visión aunque la página sea técnicamente navegable. A ello se suman los documentos escaneados sin capa de texto, frecuentes en la administración pública peruana, que para el software lector equivalen a una hoja en blanco."),
  h2("3.3", "Formulación del problema"),
  parr("La consecuencia agregada de estas barreras es una pérdida de autonomía: la persona con discapacidad visual queda obligada a depender de un tercero para completar gestiones que cualquier otra persona resuelve sola desde su teléfono, lo que compromete la privacidad de datos sensibles y limita el ejercicio efectivo de derechos. El problema puede formularse entonces en los siguientes términos: ¿de qué manera puede una aplicación móvil permitir que una persona con discapacidad visual acceda de forma autónoma a información digital que no fue diseñada de manera accesible?"),
];

// ====================== 4. ALCANCE ======================
const s4 = [
  h1(4, "Alcance"),
  parr("El alcance del presente trabajo corresponde al de una propuesta de diseño de interacción acompañada de un prototipo de alta fidelidad, no al de un producto en producción. La delimitación se establece en los siguientes términos."),
  ...tablaCaption(2, "Delimitación del alcance de la propuesta"),
  tabla([4680, 4680], [
    ["La propuesta comprende", "La propuesta excluye"],
    ["Una aplicación móvil nativa para Android e iOS, con interfaz íntegramente en español.", "La corrección del código fuente de sitios web de terceros: la aplicación adapta la presentación del lado del usuario."],
    ["La lectura y reconstrucción accesible de páginas web y de documentos PDF, Word y de texto plano.", "Cualquier forma de diagnóstico, tratamiento o servicio de salud visual."],
    ["El reconocimiento óptico de caracteres y la descripción automática de imágenes mediante visión por computador.", "La navegación física o el desplazamiento en la vía pública, propios de soluciones de orientación y movilidad."],
    ["El control por voz y por gestos, con retroalimentación háptica y compatibilidad con líneas braille por Bluetooth.", "La traducción a lengua de señas, por cuanto la propuesta se centra en la discapacidad visual."],
    ["Tres perfiles de accesibilidad configurables: ceguera total, baja visión y daltonismo.", "El contenido audiovisual protegido por gestión de derechos digitales que impida la extracción de texto."],
    ["Una red de voluntarios verificados para asistencia humana por videollamada, y un prototipo navegable con su plan de pruebas.", "El desarrollo e implantación del backend en un entorno productivo, que excede los alcances del curso."],
  ]),
  notaTabla("La delimitación distingue entre las funciones que la propuesta diseña y aquellas que quedan fuera de su ámbito de intervención."),
  h2("4.1", "Delimitación poblacional y geográfica"),
  parr("La propuesta se dirige a personas con discapacidad visual residentes en el Perú que dispongan de un teléfono inteligente con conexión intermitente a internet. La elección del español peruano para el reconocimiento y la síntesis de voz responde a esta delimitación, así como la incorporación de un modo sin conexión que atiende a la desigual cobertura de datos móviles en el territorio nacional."),
  h2("4.2", "Decisión de alcance frente a la consigna de cinco poblaciones"),
  parr("El enunciado de la segunda entrega solicita una aplicación inclusiva orientada a cinco poblaciones: personas con discapacidad visual, auditiva, motora, con dificultades cognitivas leves y adultos mayores con limitaciones tecnológicas. El equipo decidió mantener el alcance definido en la primera entrega —discapacidad visual exclusivamente— en lugar de ampliarlo a los cinco grupos."),
  parr([normal("La decisión se sustenta en el marco teórico expuesto en la sección 6. "), cita("The universal design file"), normal(" (Story, Mueller y Mace, 1998) sostiene que el diseño accesible exige adaptación a necesidades específicas, no una solución genérica aplicada por igual a poblaciones con requerimientos distintos entre sí; y Shneiderman (2000) plantea explícitamente que la alternativa frente al usuario «promedio» inexistente es una interfaz multicapa construida sobre perfiles concretos, no una interfaz única que intente servir a todos. Diseñar simultáneamente para cinco poblaciones sin investigación específica de cada una —subtítulos automáticos para personas sordas, un modo cognitivo simplificado, adaptaciones motoras— habría producido cinco soluciones superficiales en el tiempo disponible, en lugar de una solución investigada y verificada por contraste matemático para una población.")]),
  parr("Esta decisión no reduce el cumplimiento de los requisitos de la consigna relativos a accesibilidad general: la lectura automática por voz, la conversión de voz a texto, la interfaz de alto contraste, los tamaños de letra configurables, la navegación por comandos de voz, los accesos rápidos simplificados y la compatibilidad con lectores de pantalla —todos ellos solicitados explícitamente— están contemplados en el diseño de la propuesta que se documenta en la sección 9."),
];

// ====================== 5. OBJETIVOS ======================
const s5 = [
  h1(5, "Objetivos"),
  h2("5.1", "Objetivo general"),
  parr("Proponer el diseño de una aplicación móvil que facilite el acceso autónomo a la información digital a las personas con discapacidad visual en el Perú, combinando síntesis de voz, visión por computador y adaptación automática de contenidos conforme a las pautas WCAG 2.2."),
  h2("5.2", "Objetivos específicos"),
  objetivo([normal("Identificar las principales barreras de accesibilidad digital que enfrentan las personas con discapacidad visual, mediante revisión documental de informes especializados y entrevistas a usuarios.")]),
  objetivo([normal("Definir los requisitos funcionales y no funcionales de la aplicación a partir de los principios del diseño universal y del estándar WCAG 2.2.")]),
  objetivo([normal("Diseñar la arquitectura funcional y el prototipo de alta fidelidad de la interfaz, priorizando la interacción por voz y el alto contraste como canales principales.")]),
  objetivo([normal("Evaluar la usabilidad del prototipo con usuarios con discapacidad visual mediante pruebas de ejecución de tareas y la escala de usabilidad del sistema (SUS).")]),
];

// ====================== 6. MARCO TEÓRICO ======================
const s6 = [
  h1(6, "Marco teórico"),
  h2("6.1", "El diseño universal"),
  parr([normal("El marco conceptual más amplio de esta propuesta procede del diseño universal, formulado por Story, Mueller y Mace (1998) en "), cita("The universal design file"), normal(". Los autores plantean que los productos y entornos deben ser utilizables por el mayor número posible de personas sin necesidad de adaptación ni diseño especializado posterior, y sistematizan esa idea en siete principios: uso equitativo, flexibilidad de uso, uso simple e intuitivo, información perceptible, tolerancia al error, bajo esfuerzo físico y dimensiones apropiadas de aproximación y uso.")]),
  parr("Dos de esos principios estructuran el diseño de VÍA. El de uso equitativo exige que todos los usuarios reciban la misma información y no una versión empobrecida, por lo que la aplicación no ofrece un resumen simplificado a quien no puede ver, sino el mismo contenido íntegro por un canal distinto. El de información perceptible sostiene que la información esencial debe presentarse en modos redundantes: de ahí que cada elemento se comunique por voz, por contraste visual y por retroalimentación háptica."),
  h2("6.2", "El diseño centrado en el usuario"),
  parr([normal("Norman (2013) sostiene en "), cita("The design of everyday things"), normal(" que la usabilidad de un objeto depende de tres elementos: las affordances o posibilidades de acción que el objeto ofrece, los significantes que comunican dónde y cómo actuar, y la retroalimentación que confirma el resultado de cada acción. Cuando el diseño falla en alguno de ellos, el usuario construye un modelo mental equivocado del sistema y termina culpándose a sí mismo por errores que son de diseño.")]),
  parr("Este planteamiento es especialmente exigente en una interfaz sin salida visual: si el usuario no ve la pantalla, el significante que indica que un botón puede pulsarse debe trasladarse íntegramente a los canales sonoro y táctil. La propuesta responde haciendo que cada acción se anuncie antes de ejecutarse y se confirme después mediante voz y vibración, de modo que el usuario mantenga un modelo mental correcto del estado del sistema."),
  h2("6.3", "La usabilidad universal"),
  parr("Shneiderman (2000) amplía la noción de usabilidad con el concepto de usabilidad universal, entendido como la capacidad de un sistema de servir a la diversidad de usuarios, a la variedad tecnológica de los dispositivos y a la brecha de conocimiento entre quienes dominan una tecnología y quienes se aproximan a ella por primera vez. Frente al diseño orientado a un usuario «promedio» inexistente, propone interfaces multicapa que permitan a cada persona operar en el nivel de complejidad adecuado. La propuesta adopta esta idea mediante los perfiles de accesibilidad, que definen desde el inicio el canal de la interacción, y mediante niveles graduables de detalle en la lectura: el usuario puede solicitar solo los titulares, un resumen o el texto completo."),
  h2("6.4", "Referencia normativa: WCAG 2.2"),
  parr("Las Pautas de Accesibilidad para el Contenido Web en su versión 2.2 (World Wide Web Consortium, 2023) constituyen el estándar internacional de referencia y organizan sus criterios en cuatro principios: el contenido debe ser perceptible, operable, comprensible y robusto. Cumplen en el proyecto una doble función: son el criterio con el que el módulo analizador evalúa cada página y son también la norma que la propia interfaz debe cumplir, pues resultaría contradictorio que una herramienta de accesibilidad no fuera accesible."),
];

// ====================== 7. ESTADO DEL ARTE ======================
const s7 = [
  h1(7, "Estado del arte"),
  h2("7.1", "Asistencia visual remota mediante colaboración humana"),
  parr("Bigham et al. (2010) presentaron VizWiz, el primer sistema capaz de responder preguntas visuales formuladas por personas ciegas en un tiempo cercano al real. El funcionamiento era directo: el usuario fotografiaba un objeto con su teléfono, grababa una pregunta en voz y el sistema distribuía la imagen entre trabajadores remotos que respondían en segundos. El trabajo, distinguido con el premio al mejor artículo en el congreso UIST de ese año, demostró que la asistencia visual bajo demanda era técnicamente viable y estableció el paradigma que siguen numerosas aplicaciones actuales."),
  parr("Su limitación es estructural: la calidad y la rapidez de la respuesta dependen de que existan personas disponibles en todo momento, lo que hace que el modelo escale con dificultad y no funcione sin conexión."),
  h2("7.2", "Los límites de la visión artificial con imágenes reales"),
  parr("Gurari et al. (2018) publicaron el conjunto de datos VizWiz Grand Challenge, construido con más de 31 000 preguntas visuales tomadas por usuarios ciegos reales en situaciones cotidianas y no con fotografías de laboratorio. El hallazgo más relevante para esta propuesta es que aproximadamente el 28 % de esas preguntas resultó imposible de responder, principalmente por deficiencias de la propia fotografía: encuadre incompleto, desenfoque o iluminación insuficiente. El dato revela una paradoja que ninguna mejora del modelo de visión resuelve por sí sola: quien no puede ver tampoco puede verificar que la fotografía haya salido bien. El problema, por lo tanto, no está únicamente en el algoritmo, sino en el momento de la captura."),
  h2("7.3", "Inteligencia artificial generativa y usuarios ciegos"),
  parr("Adnin y Das (2024) realizaron un estudio con diecinueve personas ciegas o con baja visión que ya empleaban herramientas de inteligencia artificial generativa para describir imágenes, redactar y buscar información. Los participantes las valoraron positivamente, pero reportaron cuatro clases de problemas: barreras de accesibilidad en las propias interfaces —botones sin etiquetar, ausencia de navegación por teclado y falta de aviso cuando la respuesta termina de generarse—, imprecisiones y alucinaciones en las descripciones, modelos mentales equivocados sobre el funcionamiento de los sistemas y respuestas con sesgos capacitistas."),
  h2("7.4", "Síntesis y brecha identificada"),
  parr("La revisión precedente permite identificar tres brechas que la propuesta busca cubrir de manera explícita, tal como se sintetiza en la Tabla 3."),
  ...tablaCaption(3, "Brechas identificadas en el estado del arte y respuesta de la propuesta"),
  tabla([2200, 3500, 3660], [
    ["Antecedente", "Brecha que persiste", "Respuesta de VÍA"],
    ["Bigham et al. (2010)", "Depende de voluntarios disponibles de manera permanente; no escala ni opera sin conexión.", "La asistencia humana se conserva como respaldo excepcional, no como mecanismo principal; el modo sin conexión cubre las funciones básicas."],
    ["Gurari et al. (2018)", "El 28 % de las fotografías tomadas por usuarios ciegos resulta ininterpretable por problemas de captura.", "El módulo de cámara guía activamente el encuadre y la iluminación por voz antes de disparar, en lugar de evaluar la imagen después."],
    ["Adnin y Das (2024)", "Las propias interfaces de inteligencia artificial no son accesibles y sus respuestas contienen sesgos capacitistas.", "La interfaz se diseña conforme a WCAG 2.2 desde el inicio y las descripciones se formulan en lenguaje neutro y descriptivo."],
  ]),
  notaTabla("Cada módulo de la propuesta responde a una limitación documentada en la literatura revisada."),
];

// ====================== 8. METODOLOGÍA DCU ======================
const s8 = [
  h1(8, "Metodología: Diseño Centrado en el Usuario"),
  parr("El desarrollo del proyecto siguió las cinco etapas del Diseño Centrado en el Usuario revisadas en el curso. La Tabla 4 sintetiza lo realizado en cada una y la evidencia verificable dentro de este informe y del propio proyecto."),
  ...tablaCaption(4, "Etapas del Diseño Centrado en el Usuario aplicadas al desarrollo de VÍA"),
  tabla([2000, 4800, 2560], [
    ["Etapa", "Qué se realizó", "Evidencia"],
    ["Empatizar e investigar", "Revisión de la literatura sobre accesibilidad para personas ciegas (Bigham et al., 2010; Gurari et al., 2018; Adnin y Das, 2024) y de las cifras de la problemática.", "Secciones 3 y 7"],
    ["Definir", "Formulación del problema, de los objetivos y de 22 requisitos funcionales y 11 no funcionales, cada uno trazable a una fase del plan de trabajo.", "Sección 5 y documento de requisitos del proyecto"],
    ["Idear y diseñar", "Arquitectura funcional de cuatro capas y sistema de diseño con colores verificados mediante la fórmula de contraste relativo de la W3C y medidas táctiles mínimas de 48 × 48 píxeles independientes de densidad.", "Secciones 9.1 y 9.2 y documento de sistema de diseño"],
    ["Prototipar", "Prototipo de alta fidelidad de seis pantallas, elaborado a resolución real de dispositivo móvil.", "Sección 9.3 y Anexo A"],
    ["Evaluar", "Evaluación heurística según Nielsen (1994) sobre el prototipo y protocolo de evaluación con usuarios mediante la escala SUS.", "Secciones 10 y 11"],
  ]),
  notaTabla("La etapa de evaluación se documenta en dos niveles: una evaluación heurística ya ejecutada por el equipo (sección 10) y un protocolo de evaluación con usuarios reales, formulado y pendiente de ejecución (sección 11)."),
];

// ====================== 9. DESARROLLO DE LA PROPUESTA ======================
const s9 = [
  h1(9, "Desarrollo de la propuesta"),
  h2("9.1", "Arquitectura funcional"),
  parr("La aplicación se estructura en cuatro capas sucesivas. El usuario interactúa únicamente con la primera y percibe el resultado de la cuarta; las dos intermedias operan de manera automática y permanecen invisibles para él. La Figura 1 representa esta arquitectura."),
  ...figuraCaption(1, "Arquitectura funcional de la aplicación VÍA"),
  imagenCentrada(img(E1 + "image1.png", "png", 590, 191, "Diagrama de la arquitectura funcional de VÍA en cuatro capas: entrada multimodal, motor de procesamiento, adaptación al perfil y salida accesible")),
  notaTabla("La capa de entrada admite voz, gestos, cámara y archivos; el motor de procesamiento analiza y reescribe el contenido; la capa de adaptación aplica el perfil configurado por el usuario y la capa de salida entrega el resultado por el canal correspondiente. Elaboración propia."),
  parr("La capa de entrada admite cuatro vías: comandos de voz, gestos táctiles sobre áreas de al menos 44 píxeles, captura por cámara y apertura de una dirección web o un archivo compartido desde otra aplicación. El motor de procesamiento reúne un analizador que evalúa el contenido contra los criterios WCAG 2.2, un módulo de visión por computador que ejecuta el reconocimiento de texto y la descripción de imágenes, y un simplificador semántico que reconstruye la jerarquía de encabezados. La capa de adaptación aplica el perfil del usuario y la capa de salida entrega el resultado por síntesis de voz, interfaz de alto contraste, línea braille o retroalimentación háptica."),

  h2("9.2", "Decisiones de diseño de la interfaz"),
  parr("El diseño de la interfaz se derivó de criterios normativos y no de preferencias estéticas. La combinación de negro y amarillo alcanza una relación de contraste de 15.8:1, muy por encima del mínimo de 7:1 del nivel AAA de las WCAG. La tipografía admite escalado hasta el 400 % sin pérdida de contenido, conforme al criterio 1.4.4, y todas las áreas interactivas superan los 44 píxeles de lado. Por último, el foco de lectura se anuncia en voz alta con su posición relativa —«encabezado 1 de 6», «campo 1 de 3»—, lo que permite construir un mapa mental de la página sin verla."),

  h2("9.3", "Prototipo de la interfaz"),
  parr("Se elaboró un prototipo de alta fidelidad de seis pantallas, reproducidas en el Anexo A. P-01 corresponde a la configuración inicial del perfil, que puede responderse íntegramente por voz. P-02 es la pantalla de inicio, con el micrófono activo y transcripción de lo que escucha. P-03 muestra el lector adaptativo con una página ya reconstruida. P-04 corresponde al módulo Ojo IA, donde la cámara confirma por voz que el encuadre y la iluminación son adecuados antes de capturar. P-05 reúne los ajustes de accesibilidad y P-06 muestra una sesión de asistencia con un voluntario."),

  h2("9.4", "Resultado esperado sobre el contenido"),
  parr("La Figura 2 ilustra el efecto de la aplicación sobre una página de trámites en línea representativa de las que se encuentran habitualmente en la administración pública."),
  ...figuraCaption(2, "Comparación de una misma página antes y después del procesamiento"),
  imagenCentrada(img(E1 + "image2.png", "png", 590, 342, "Comparación entre una página web original con cuatro fallos de accesibilidad y la misma página reconstruida por VÍA")),
  notaTabla("A la izquierda, la página original con cuatro fallos de accesibilidad señalados. A la derecha, la misma página reconstruida por la aplicación conforme a los cuatro principios de las WCAG 2.2. Elaboración propia."),

  h2("9.5", "Consideraciones técnicas para la implementación"),
  parr("Para la fase de construcción se prevé un framework multiplataforma que permita compartir la lógica entre Android e iOS, apoyado en los motores de síntesis y reconocimiento de voz nativos de cada sistema para garantizar el funcionamiento sin conexión. El reconocimiento óptico de caracteres se resolvería con una biblioteca embebida en el dispositivo, reservando las llamadas a la nube para la descripción de imágenes complejas. Esta distribución reduce la latencia percibida, determinante en una interfaz conversacional, y protege la privacidad del usuario, dado que buena parte de los documentos procesados contienen datos personales. Las herramientas seleccionadas para ello se detallan en la sección 9.6."),

  h2("9.6", "Herramientas y tecnologías seleccionadas"),
  parr("La Tabla 5 detalla cada herramienta seleccionada para la construcción de la aplicación y el propósito específico que cumple. Se distingue entre las herramientas de desarrollo, empleadas para construir y probar el proyecto, y las bibliotecas de software (dependencias) que se incorporan al código y se ejecutan dentro de la aplicación."),
  ...tablaCaption(5, "Herramientas y tecnologías seleccionadas para el desarrollo de VÍA"),
  tabla([2400, 2100, 4860], [
    ["Herramienta", "Tipo", "Para qué se utiliza"],
    ["Flutter (SDK)", "Framework de desarrollo", "Marco de trabajo de Google que permite escribir una sola base de código y compilarla tanto para Android como para iOS."],
    ["Dart", "Lenguaje de programación", "Lenguaje en el que se escribe el código fuente de la aplicación; es el lenguaje nativo de Flutter."],
    ["Android Studio", "Entorno de desarrollo", "Proveedor del SDK de Android y del emulador de teléfono necesarios para compilar, instalar y probar la aplicación."],
    ["Visual Studio Code", "Editor de código", "Edición y revisión del código fuente del proyecto."],
    ["provider", "Dependencia: manejo de estado", "Permite que un cambio de ajuste (por ejemplo, el esquema de color) se refleje al instante en toda la aplicación, sin reiniciarla."],
    ["flutter_tts", "Dependencia: síntesis de voz", "Convierte texto en voz hablada, usando el motor de voz nativo del sistema operativo (texto a voz)."],
    ["speech_to_text", "Dependencia: reconocimiento de voz", "Convierte lo que el usuario dice en texto, usando el reconocedor de voz nativo del sistema operativo (voz a texto). Es la tecnología que sustenta los comandos de voz (véase la sección 9.6.1)."],
    ["camera", "Dependencia: acceso a hardware", "Da acceso a la cámara del dispositivo para el módulo Ojo IA (captura de documentos y fotografías)."],
    ["google_mlkit_text_recognition", "Dependencia: visión por computador", "Reconocimiento óptico de caracteres (OCR): extrae el texto de una fotografía, ejecutándose íntegramente en el dispositivo y sin conexión a internet."],
    ["permission_handler", "Dependencia: permisos del sistema", "Solicita y verifica los permisos de cámara y micrófono de forma unificada entre Android e iOS."],
    ["shared_preferences", "Dependencia: almacenamiento local", "Guarda en el propio dispositivo los ajustes de accesibilidad del usuario (perfil, esquema de color, velocidad de voz) para que persistan entre una sesión y otra."],
    ["http", "Dependencia: red", "Realiza la descarga del contenido HTML de una página web para el lector adaptativo."],
    ["html", "Dependencia: procesamiento de texto", "Analiza el HTML descargado para extraer encabezados, párrafos e imágenes y reconstruir el contenido en secciones navegables."],
  ]),
  notaTabla("Todas las dependencias se obtienen del repositorio oficial de paquetes de Dart y Flutter (pub.dev)."),

  h3("9.6.1", "Tecnología prevista para el comando de voz"),
  parr([normal("Los comandos de voz se basan en el paquete "), normal("speech_to_text", { font: "Consolas", size: 22 }), normal(" de Flutter. Este paquete no contiene un modelo propio de reconocimiento de voz: delega esa tarea en el reconocedor que el sistema operativo del teléfono ya incorpora (en Android, el servicio de reconocimiento de voz de Google integrado en el sistema), por lo que no se requiere contratar ni entrenar ninguna interfaz de inteligencia artificial externa para esta función.")]),
  parr("El proceso tiene cuatro pasos. Primero, el usuario pronuncia una frase, por ejemplo «ojo IA». Segundo, el reconocedor del sistema convierte el audio en texto. Tercero, el paquete entrega ese texto a la aplicación. Cuarto, un diccionario de comandos propio del proyecto compara el texto con una lista de frases conocidas y ejecuta la acción asociada. Dado que los reconocedores de voz transcriben a veces de forma imprecisa las siglas —«IA» puede llegar como «i a» o «ya»—, el diccionario contempla variantes fonéticas de cada comando y realiza además una comparación que ignora los espacios. La respuesta hablada de la aplicación se genera con el paquete complementario flutter_tts, que utiliza el motor de síntesis de voz nativo del dispositivo."),

  h2("9.7", "Personalización del esquema de color"),
  parr("El diseño contempla que el usuario pueda cambiar el esquema de color de toda la interfaz en tiempo real, sin reiniciar la aplicación. Se proponen tres esquemas: alto contraste oscuro (el definido en el diseño original, con una relación de contraste de 15.8:1), alto contraste claro (17.7:1) y una paleta segura para personas con daltonismo que evita depender de la distinción entre rojo y verde —la que falla en la protanopía y la deuteranopía, los dos tipos más frecuentes— sustituyéndola por una combinación de azul y naranja. Los tres esquemas se verificaron matemáticamente con la fórmula de contraste relativo de la W3C, siguiendo el mismo criterio normativo aplicado en el resto del diseño."),
];

// ====================== 10. EVALUACIÓN HEURÍSTICA ======================
const s10 = [
  h1(10, "Evaluación heurística de usabilidad"),
  h2("10.1", "Metodología"),
  parr("Se realizó una evaluación heurística siguiendo el método propuesto por Nielsen (1994), en el cual uno o más evaluadores recorren una interfaz y juzgan su cumplimiento frente a un conjunto reducido de principios de usabilidad ampliamente validados. A diferencia de una prueba con usuarios, la evaluación heurística no requiere participantes externos y resulta adecuada como primer filtro antes de someter el prototipo a usuarios reales, paso que se formula en la sección 11. El equipo recorrió las seis pantallas del prototipo de alta fidelidad (Anexo A) evaluando cada una contra los diez principios de Nielsen."),
  h2("10.2", "Resultados por heurística"),
  ...tablaCaption(6, "Cumplimiento de las diez heurísticas de usabilidad de Nielsen (1994) en el prototipo de VÍA"),
  tabla([2800, 6560], [
    ["Heurística", "Cumplimiento observado en VÍA"],
    ["1. Visibilidad del estado del sistema", "Toda acción se confirma por voz, vibración y anuncio al lector de pantalla a la vez. La pantalla de inicio muestra «ESCUCHANDO…» mientras el micrófono está activo."],
    ["2. Coincidencia entre el sistema y el mundo real", "Los mensajes de voz presentan primero el dato y después el adorno (por ejemplo, «87.40 soles, total a pagar»), sin jerga técnica ni referencias a íconos."],
    ["3. Control y libertad del usuario", "Comandos de voz «repetir», «parar» y «más rápido» o «más lento» disponibles en cualquier pantalla; el lector permite retroceder, pausar y avanzar en cualquier momento."],
    ["4. Consistencia y estándares", "Un único sistema de diseño aplicado a las seis pantallas: las mismas medidas táctiles mínimas, el mismo radio de tarjeta y el mismo patrón de anuncio por voz."],
    ["5. Prevención de errores", "El módulo de cámara evalúa la iluminación real antes de capturar y avisa por voz si es insuficiente, en lugar de permitir una fotografía inutilizable."],
    ["6. Reconocimiento antes que recuerdo", "Los comandos de voz disponibles se anuncian explícitamente en cada pantalla («puedes decir: leer documento, abrir cámara o ajustes») en vez de exigir que el usuario los memorice de antemano."],
    ["7. Flexibilidad y eficiencia de uso", "Cada acción cuenta con un equivalente táctil y uno de voz, de modo que un usuario con resto visual puede tocar y uno sin visión puede hablar."],
    ["8. Diseño estético y minimalista", "Una sola acción principal por pantalla, señalada en amarillo; ningún otro elemento compite por la atención."],
    ["9. Ayuda para reconocer y resolver errores", "Un comando de voz no reconocido se responde con «No entendí. Puedes decir: leer documento, abrir cámara o ajustes», nunca con un error técnico."],
    ["10. Ayuda y documentación", "La pantalla de ayuda humana conecta al usuario con un voluntario cuando la inteligencia artificial no resuelve la consulta (funcionalidad simulada, según lo previsto para esta etapa del proyecto)."],
  ]),
  notaTabla("Evaluación realizada por el equipo de desarrollo sobre el prototipo de alta fidelidad de seis pantallas."),
  h2("10.3", "Hallazgos y oportunidades de mejora"),
  parr("Una evaluación heurística que no identifica ninguna oportunidad de mejora no resulta rigurosa. A continuación se documentan tres hallazgos reales, con la heurística afectada y su severidad, clasificada según la escala habitual de 0 (sin problema) a 4 (catástrofe de usabilidad)."),
  parr([negrita("Hallazgo 1 (heurística 10; severidad 1, cosmética). "), normal("La pantalla inicial de configuración del perfil no enseña todavía los comandos de voz disponibles, que el usuario recién conoce al llegar a la pantalla de inicio. Mejora propuesta: incorporar un comando «ayuda» que enumere los comandos disponibles desde cualquier pantalla.")]),
  parr([negrita("Hallazgo 2 (heurística 1; severidad 1, cosmética). "), normal("Durante procesos de varios segundos —el reconocimiento óptico de una fotografía o la descarga de una página web— la interfaz muestra un texto estático («Leyendo…») sin una señal de progreso audible intermedia. Mejora propuesta: un aviso sonoro breve cada tres segundos durante esperas prolongadas.")]),
  parr([negrita("Hallazgo 3 (heurística 5; limitación de alcance documentada). "), normal("El diseño del módulo de cámara contempla guiar por voz la iluminación y el encuadre. La iluminación puede medirse con una señal sencilla y efectiva, la luminancia de la imagen; en cambio, detectar si el documento aparece cortado o demasiado lejos exige reconocer sus bordes mediante una biblioteca de visión por computador más pesada, que queda fuera del alcance de esta etapa y se deja como trabajo futuro.")]),
];

// ====================== 11. PROTOCOLO CON USUARIOS ======================
const s11 = [
  h1(11, "Plan y protocolo de evaluación con usuarios"),
  h2("11.1", "Plan de evaluación"),
  parr("La validación se llevará a cabo mediante pruebas de usabilidad con usuarios con discapacidad visual, organizadas en torno a tareas representativas como consultar el estado de un trámite, leer un recibo impreso o completar un formulario. Se propone medir tres indicadores: la tasa de éxito en la ejecución de tareas, con una meta igual o superior al 85 %; el tiempo de lectura de una página compleja, con una reducción esperada del 40 % frente a un lector de pantalla convencional; y la satisfacción percibida mediante la escala de usabilidad del sistema (SUS), con una meta igual o superior a 80 puntos sobre 100."),
  parr("Conforme al cuarto objetivo específico, se formula a continuación el protocolo que se ejecutará con tres a cinco participantes antes de la presentación final. Los participantes podrán ser personas con discapacidad visual o personas sin ella que realicen la prueba con los ojos cubiertos, procedimiento habitual para una primera aproximación cuando no se dispone todavía de acceso a la población objetivo."),
  h2("11.2", "Tareas a ejecutar"),
  parr("Se solicitará a cada participante, sin asistencia del equipo, que: (a) seleccione un perfil de accesibilidad en la pantalla inicial; (b) pronuncie el comando «leer documento» y escuche el resultado completo; (c) pause y reanude la lectura por voz; (d) modifique la velocidad de la voz desde los ajustes; (e) enfoque con la cámara un recibo impreso y escuche su contenido mediante el módulo Ojo IA; y (f) pronuncie el comando «ayuda humana» y llegue hasta la pantalla correspondiente. Se registrará el tiempo y la cantidad de intentos de cada tarea."),
  h2("11.3", "Instrumento: escala de usabilidad del sistema"),
  parr("Al finalizar las tareas, cada participante responderá el instrumento SUS (Brooke, 1996), compuesto por diez afirmaciones calificadas en una escala de uno a cinco puntos, reproducido en la Tabla 7."),
  ...tablaCaption(7, "Instrumento de evaluación de usabilidad del sistema (SUS)"),
  tabla([700, 7660, 1000], [
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
  ]),
  notaTabla("Adaptado de Brooke (1996). Los ítems impares se puntúan como (puntaje − 1) y los pares como (5 − puntaje); la suma de los diez valores se multiplica por 2.5 para obtener un puntaje entre 0 y 100."),
  h2("11.4", "Criterio de interpretación"),
  parr("Se adopta como meta un puntaje SUS igual o superior a 80 puntos, y como umbral mínimo de aceptabilidad 68 puntos, el valor que Brooke (1996) y la literatura posterior sobre SUS identifican como el promedio de referencia por encima del cual un sistema se considera de usabilidad aceptable."),
];

// ====================== 13. REFERENCIAS ======================
const refs = [
  h1(12, "Referencias"),
  refHanging([normal("Adnin, R., y Das, M. (2024). "), normal('"I look at it as the king of knowledge": How blind people use and understand generative AI tools. En '), cita("Proceedings of the 26th International ACM SIGACCESS Conference on Computers and Accessibility"), normal(" (pp. 1-17). Association for Computing Machinery. https://doi.org/10.1145/3663548.3675631")]),
  refHanging([normal("Bigham, J. P., Jayant, C., Ji, H., Little, G., Miller, A., Miller, R. C., Miller, R., Tatarowicz, A., White, B., White, S., y Yeh, T. (2010). VizWiz: Nearly real-time answers to visual questions. En "), cita("Proceedings of the 23rd Annual ACM Symposium on User Interface Software and Technology"), normal(" (pp. 333-342). Association for Computing Machinery. https://doi.org/10.1145/1866029.1866080")]),
  refHanging([normal('Brooke, J. (1996). SUS: A "quick and dirty" usability scale. En P. W. Jordan, B. Thomas, B. A. Weerdmeester y A. L. McClelland (Eds.), '), cita("Usability Evaluation in Industry"), normal(" (pp. 189-194). Taylor & Francis.")]),
  refHanging([normal("Gurari, D., Li, Q., Stangl, A. J., Guo, A., Lin, C., Grauman, K., Luo, J., y Bigham, J. P. (2018). VizWiz Grand Challenge: Answering visual questions from blind people. En "), cita("2018 IEEE/CVF Conference on Computer Vision and Pattern Recognition"), normal(" (pp. 3608-3617). IEEE. https://doi.org/10.1109/CVPR.2018.00380")]),
  refHanging([normal("Instituto Nacional de Estadística e Informática. (2018). "), cita("Perú: Perfil sociodemográfico de la población con discapacidad, 2017"), normal(". INEI.")]),
  refHanging([normal("Nielsen, J. (1994). Heuristic evaluation. En J. Nielsen y R. L. Mack (Eds.), "), cita("Usability Inspection Methods"), normal(" (pp. 25-62). John Wiley & Sons.")]),
  refHanging([normal("Norman, D. A. (2013). "), cita("The design of everyday things"), normal(" (ed. rev. y ampl.). Basic Books.")]),
  refHanging([normal("Organización Mundial de la Salud. (2026, 10 de febrero). "), cita("Ceguera y discapacidad visual"), normal(" [Nota descriptiva]. https://www.who.int/es/news-room/fact-sheets/detail/blindness-and-visual-impairment")]),
  refHanging([normal("Shneiderman, B. (2000). Universal usability. "), cita("Communications of the ACM, 43"), normal("(5), 84-91. https://doi.org/10.1145/332833.332843")]),
  refHanging([normal("Story, M. F., Mueller, J. L., y Mace, R. L. (1998). "), cita("The universal design file: Designing for people of all ages and abilities"), normal(". Center for Universal Design, North Carolina State University.")]),
  refHanging([normal("WebAIM. (2026). "), cita("The WebAIM Million: The 2026 report on the accessibility of the top 1,000,000 home pages"), normal(". Utah State University. https://webaim.org/projects/million/")]),
  refHanging([normal("World Wide Web Consortium. (2023). "), cita("Web Content Accessibility Guidelines (WCAG) 2.2"), normal(". W3C. https://www.w3.org/TR/WCAG22/")]),
];

// ====================== ANEXO A: PROTOTIPO DE DISEÑO ======================
const W3 = [3120, 3120, 3120];
const pantalla = (n, leyenda, alt) => celdaImagen(3120, img(E1 + `image${n}.png`, "png", 150, 325, alt), leyenda);
const anexoA = [
  h1Sin("Anexo A. Prototipo de la interfaz"),
  parr("Las seis pantallas que se presentan a continuación corresponden al prototipo de alta fidelidad elaborado a resolución real de dispositivo móvil (390 × 844 puntos). Todas cumplen una relación de contraste de 15.8:1 y áreas interactivas de al menos 44 píxeles."),
  tablaImagenes(W3, [
    filaImagenes([
      pantalla(3, "P-01. Perfil de accesibilidad", "Pantalla P-01, perfil de accesibilidad"),
      pantalla(4, "P-02. Inicio con escucha activa", "Pantalla P-02, inicio con escucha activa"),
      pantalla(5, "P-03. Lector adaptativo", "Pantalla P-03, lector adaptativo"),
    ]),
    filaImagenes([
      pantalla(6, "P-04. Ojo IA con guía de captura", "Pantalla P-04, Ojo IA con guía de captura"),
      pantalla(7, "P-05. Ajustes de accesibilidad", "Pantalla P-05, ajustes de accesibilidad"),
      pantalla(8, "P-06. Asistencia humana", "Pantalla P-06, asistencia humana"),
    ]),
  ]),
  notaTabla("Elaboración propia. Prototipo de alta fidelidad correspondiente a la primera entrega."),
];

const doc = new Document({
  creator: "Equipo VÍA",
  title: "VÍA: diseño, prototipado y evaluación inicial — Segunda entrega",
  styles: {
    default: { document: { run: { font: "Times New Roman", size: 24 }, paragraph: { spacing: { line: 480, lineRule: "auto" } } } },
  },
  numbering: {
    config: [{
      reference: "objetivos",
      levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
    }],
  },
  features: { updateFields: true },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440, header: 708, footer: 708 } } },
    headers: {
      default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "VÍA — Segunda entrega", size: 18, color: "595959" })] })] }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ size: 18, color: "595959", children: [PageNumber.CURRENT] })] })],
      }),
    },
    children: [
      ...caratula, salto(),
      ...indice, salto(),
      ...resumen, salto(),
      ...s1, ...s2, ...s3, ...s4, ...s5, ...s6, ...s7, ...s8, ...s9, ...s10, ...s11, salto(),
      ...refs, salto(),
      ...anexoA,
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("C:\\Users\\Sebastian Poma N\\Documents\\Ciclo8\\HombreYMquina\\via-app\\via-app\\docs\\entregables\\VIA_Segunda_Entrega_Informe.docx", buf);
  console.log("Informe DOCX generado OK");
});
