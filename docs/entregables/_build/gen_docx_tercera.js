const H = require("./helpers_docx.js");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType,
  BorderStyle, AlignmentType, TableOfContents, Header, Footer, PageNumber, LevelFormat, VerticalAlign, fs,
  AZUL_H1, GRIS_NOTA, BORDE_TABLA, BORDE_CELDA_INTERNA,
  parr, cita, normal, negrita, h1, h1Sin, h2, h3, tablaCaption, figuraCaption, notaTabla, tabla, salto, centrado, espacio,
  refHanging, objetivo, img, imagenCentrada, celdaImagen, filaImagenes, tablaImagenes, BUILD, E1, WEB,
} = H;
const path = require("path");

const TERC = BUILD + "tercera\\";
const RAIZ = path.resolve(__dirname, "..", "..", "..");
const d = JSON.parse(fs.readFileSync(path.join(__dirname, "tercera", "datos_simulados.json"), "utf8"));
const aud = JSON.parse(fs.readFileSync(path.join(__dirname, "tercera", "evidencias", "auditoria_onpe.json"), "utf8"));
const f1 = (x) => Number(x).toFixed(1);
const f2 = (x) => Number(x).toFixed(2);

// ---------- numeración verificada de tablas y figuras ----------
let tablaActual = 0, figuraActual = 0;
const NT = {};
["brechas", "delim", "modulos", "progresion", "dcu", "codigo", "funciones", "herramientas", "mejoras", "contraste", "pour", "onpe",
  "participantes", "escenarios", "instrumento", "resultados", "indicadores", "perfil", "tareas", "metas", "datos", "parametros"]
  .forEach((k, i) => (NT[k] = i + 1));
const NF = { arq: 1, antes: 2, inicio: 3, ajustes: 4, medias: 5, distrib: 6, tiempos: 7, prototipo: 8 };
function cap(k, titulo) {
  tablaActual++;
  if (NT[k] !== tablaActual) throw new Error(`Orden de tablas: se esperaba ${k}=${NT[k]} pero va ${tablaActual}`);
  return tablaCaption(tablaActual, titulo);
}
function fig(k, titulo) {
  figuraActual++;
  if (NF[k] !== figuraActual) throw new Error(`Orden de figuras: se esperaba ${k}=${NF[k]} pero va ${figuraActual}`);
  return figuraCaption(figuraActual, titulo);
}

// ---------- utilidades locales ----------
function tablaC(anchos, filas, tam = 19, centrarDesde = 99) {
  const total = anchos.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA }, columnWidths: anchos, borders: BORDE_TABLA,
    rows: filas.map((fila, i) => new TableRow({
      cantSplit: true, tableHeader: i === 0,
      children: fila.map((t, j) => new TableCell({
        width: { size: anchos[j], type: WidthType.DXA }, borders: BORDE_CELDA_INTERNA, verticalAlign: VerticalAlign.CENTER,
        margins: { top: 70, bottom: 70, left: 90, right: 90 },
        shading: i === 0 ? { type: ShadingType.CLEAR, fill: "D9E2F3" } : undefined,
        children: [new Paragraph({
          alignment: j >= centrarDesde ? AlignmentType.CENTER : AlignmentType.LEFT, spacing: { line: 259, lineRule: "auto" },
          children: [new TextRun({ text: String(t), bold: i === 0, size: tam })],
        })],
      })),
    })),
  });
}
function aviso(titulo, texto) {
  const borde = { style: BorderStyle.SINGLE, size: 8, color: "C75B12" };
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED, spacing: { before: 160, after: 240, line: 300, lineRule: "auto" },
    shading: { type: ShadingType.CLEAR, fill: "FFF4E8" }, border: { top: borde, bottom: borde, left: borde, right: borde },
    children: [new TextRun({ text: titulo + " ", bold: true, size: 23 }), new TextRun({ text: texto, size: 23 })],
  });
}
function celdaFig(ancho, run, leyenda) { return celdaImagen(ancho, run, leyenda); }
const nombreEsc = (id) => d.escenarios.find((e) => e.id === id).nombre;

// ---------- métricas reales del código ----------
function contarDart(dir) {
  let archivos = 0, lineas = 0;
  (function rec(p) {
    for (const e of fs.readdirSync(p, { withFileTypes: true })) {
      const q = path.join(p, e.name);
      if (e.isDirectory()) rec(q);
      else if (e.name.endsWith(".dart")) { archivos++; lineas += fs.readFileSync(q, "utf8").split("\n").length; }
    }
  })(dir);
  return { archivos, lineas };
}
const codApp = contarDart(path.join(RAIZ, "lib"));
const codTest = contarDart(path.join(RAIZ, "test"));
const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const G = d.global;
const IT = d.itemsStats;
const bajos = IT.filter((i) => i.acuerdo < 70);
const escBajoExito = d.escStats.filter((e) => e.exito < 85);

// =============================== CARÁTULA ===============================
const cp = (texto, extra = {}) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160, line: 276, lineRule: "auto" }, children: [new TextRun({ text: texto, size: 24, ...extra })] });
const caratula = [
  cp("UNIVERSIDAD TECNOLÓGICA DEL PERÚ", { bold: true }),
  cp("Facultad de Ingeniería"),
  espacio(1000),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 600, line: 360, lineRule: "auto" },
    children: [new TextRun({ text: "VÍA: validación, mejoras e implementación funcional de una aplicación móvil inclusiva para personas con discapacidad visual", bold: true, size: 32 })],
  }),
  cp("Tercera entrega", { italics: true, size: 26 }),
  espacio(700),
  cp("Curso: Interacción entre Hombre y Máquina"),
  cp("Proyecto final de ciclo"),
  espacio(500),
  cp("Integrantes", { bold: true }),
  cp("Enrique Sebastian Poma Nizama — U23200217"),
  cp("José Leonardo Rodríguez —"),
  espacio(500),
  cp("Docente: David William Cota Sencara"),
  cp("Lima, Perú — 2026"),
];

const indice = [
  new Paragraph({ spacing: { before: 360, after: 180 }, children: [new TextRun({ text: "Índice", bold: true, size: 32, color: AZUL_H1 })] }),
  new TableOfContents("Índice", { hyperlink: true, headingStyleRange: "1-3" }),
];

// =============================== PRESENTACIÓN ===============================
const presentacion = [
  h1Sin("Presentación"),
  parr("La información indispensable para la vida cotidiana —trámites del Estado, servicios bancarios, recibos y noticias— se distribuye hoy a través de sitios y documentos digitales diseñados bajo el supuesto de que quien los consulta puede ver. Ese supuesto excluye a más de dos millones de peruanos con discapacidad visual. VÍA (Voz, Imagen y Accesibilidad) es una aplicación móvil que opera como capa de accesibilidad entre el contenido digital y el usuario: en lugar de esperar la corrección de millones de sitios ajenos, reconstruye la presentación del contenido en el propio dispositivo y la entrega por voz, por texto ampliado de alto contraste o, en el futuro, por línea braille."),
  parr("El proyecto se desarrolla en tres entregas progresivas. La primera analizó el problema, la investigación previa y los requisitos. La segunda abordó el diseño, el prototipado y la evaluación heurística. La presente tercera entrega documenta la implementación funcional de la aplicación, las mejoras derivadas de las evaluaciones anteriores, la verificación de criterios de accesibilidad y el análisis de una encuesta de usabilidad en escala de Likert."),
  new Paragraph({ spacing: { before: 200, after: 120 }, keepNext: true, children: [new TextRun({ text: "Objetivo de la tercera entrega", bold: true, size: 26, color: AZUL_H1 })] }),
  parr("Implementar una versión funcional de la aplicación inclusiva a partir del prototipo desarrollado en la segunda entrega, incorporando las mejoras obtenidas durante la evaluación heurística y las pruebas con usuarios, y verificando el cumplimiento de criterios de accesibilidad, usabilidad y experiencia de usuario."),
  new Paragraph({ spacing: { before: 120, after: 120 }, keepNext: true, children: [new TextRun({ text: "Objetivos específicos", bold: true, size: 26, color: AZUL_H1 })] }),
  objetivo([normal("Implementar las funcionalidades principales definidas en el prototipo.")]),
  objetivo([normal("Corregir los problemas de usabilidad detectados durante la evaluación inicial.")]),
  objetivo([normal("Realizar pruebas con usuarios representativos.")]),
  objetivo([normal("Validar el cumplimiento de criterios de accesibilidad.")]),
  objetivo([normal("Documentar los resultados obtenidos y las mejoras aplicadas.")]),
  aviso("Aviso metodológico sobre los datos de usuarios.",
    `Las pruebas con usuarios y la encuesta de este informe se realizaron mediante simulación de usuarios, alternativa que la consigna permite cuando no es posible el trabajo de campo. Las respuestas de los ${G.n} participantes, sus tiempos y sus errores son datos simulados, generados con un procedimiento reproducible descrito en la sección 4.9 y en el Anexo C; no provienen de personas reales. Por esa razón se rotulan como simulados en todas las tablas y figuras, y las conclusiones que de ellos se derivan son indicativas, no una validación empírica. En cambio, las verificaciones técnicas de accesibilidad (contraste, áreas táctiles, etiquetas para lectores de pantalla), la auditoría de una página pública real y las mejoras de código sí son resultados reales y reproducibles.`),
  parr("El documento sigue la estructura solicitada: marco teórico, estado del arte, alcance, desarrollo de la investigación como actualización del informe, análisis de resultados de la encuesta, conclusiones, recomendaciones y anexos."),
];

// =============================== 1. MARCO TEÓRICO ===============================
const s1 = [
  h1(1, "Marco teórico"),
  h2("1.1", "El diseño universal"),
  parr([normal("El marco conceptual más amplio de esta propuesta procede del diseño universal, formulado por Story, Mueller y Mace (1998) en "), cita("The universal design file"), normal(". Los autores plantean que los productos y entornos deben ser utilizables por el mayor número posible de personas sin necesidad de adaptación ni diseño especializado posterior, y sistematizan esa idea en siete principios: uso equitativo, flexibilidad de uso, uso simple e intuitivo, información perceptible, tolerancia al error, bajo esfuerzo físico y dimensiones apropiadas de aproximación y uso.")]),
  parr("Dos de esos principios estructuran el diseño de VÍA. El de uso equitativo exige que todos los usuarios reciban la misma información y no una versión empobrecida, por lo que la aplicación no ofrece un resumen simplificado a quien no puede ver, sino el mismo contenido íntegro por un canal distinto. El de información perceptible sostiene que la información esencial debe presentarse en modos redundantes: de ahí que cada elemento se comunique por voz, por contraste visual y por retroalimentación háptica."),
  h2("1.2", "El diseño centrado en el usuario"),
  parr([normal("Norman (2013) sostiene en "), cita("The design of everyday things"), normal(" que la usabilidad de un objeto depende de tres elementos: las affordances o posibilidades de acción que el objeto ofrece, los significantes que comunican dónde y cómo actuar, y la retroalimentación que confirma el resultado de cada acción. Cuando el diseño falla en alguno de ellos, el usuario construye un modelo mental equivocado del sistema y termina culpándose a sí mismo por errores que son de diseño. En una interfaz sin salida visual, el significante que indica que un botón puede pulsarse debe trasladarse íntegramente a los canales sonoro y táctil: por eso cada acción se anuncia antes de ejecutarse y se confirma después mediante voz y vibración.")]),
  h2("1.3", "La usabilidad universal"),
  parr("Shneiderman (2000) amplía la noción de usabilidad con el concepto de usabilidad universal: la capacidad de un sistema de servir a la diversidad de usuarios, a la variedad tecnológica de los dispositivos y a la brecha de conocimiento entre quienes dominan una tecnología y quienes se aproximan a ella por primera vez. Frente al diseño orientado a un usuario «promedio» inexistente, propone interfaces multicapa que permitan a cada persona operar en el nivel de complejidad adecuado. La propuesta adopta esta idea mediante los perfiles de accesibilidad y, en esta entrega, mediante el modo simplificado, que ofrece una capa de menor complejidad a quienes tienen dificultades cognitivas leves o poca experiencia tecnológica."),
  h2("1.4", "Referencia normativa: WCAG 2.2 y sus cuatro principios"),
  parr("Las Pautas de Accesibilidad para el Contenido Web en su versión 2.2 (World Wide Web Consortium, 2023) constituyen el estándar internacional de referencia y organizan sus criterios en cuatro principios, conocidos por sus siglas en inglés como POUR: el contenido debe ser perceptible, operable, comprensible y robusto. En esta entrega se emplean como lista de verificación de la accesibilidad de la propia aplicación (sección 4.7): resultaría contradictorio que una herramienta de accesibilidad no fuera accesible. Para el modo simplificado se toma además como orientación la guía del W3C sobre contenido usable para personas con discapacidades cognitivas y de aprendizaje (World Wide Web Consortium, 2021), que recomienda reducir la cantidad de opciones, usar lenguaje claro y mantener patrones consistentes."),
  h2("1.5", "Evaluación de usabilidad: heurística y escala de Likert"),
  parr("La evaluación heurística de Nielsen (1994) consiste en que evaluadores recorran una interfaz y juzguen su cumplimiento frente a diez principios de usabilidad; sirve como primer filtro antes de someter el sistema a usuarios. La percepción de los usuarios se mide aquí con una escala de Likert (1932): un conjunto de afirmaciones frente a las cuales la persona indica su grado de acuerdo, en esta entrega de 1 (totalmente en desacuerdo) a 5 (totalmente de acuerdo). Para valorar si las diez afirmaciones miden de manera consistente una misma actitud se calcula el coeficiente alfa de Cronbach (1951), donde valores de 0.70 o más suelen considerarse aceptables."),
];

// =============================== 2. ESTADO DEL ARTE ===============================
const s2 = [
  h1(2, "Estado del arte"),
  h2("2.1", "Asistencia visual remota mediante colaboración humana"),
  parr("Bigham et al. (2010) presentaron VizWiz, el primer sistema capaz de responder preguntas visuales formuladas por personas ciegas en un tiempo cercano al real. El funcionamiento era directo: el usuario fotografiaba un objeto con su teléfono, grababa una pregunta en voz y el sistema distribuía la imagen entre trabajadores remotos que respondían en segundos. El trabajo, distinguido con el premio al mejor artículo en el congreso UIST de ese año, demostró que la asistencia visual bajo demanda era técnicamente viable. Su limitación es estructural: la calidad y la rapidez de la respuesta dependen de que existan personas disponibles en todo momento, lo que hace que el modelo escale con dificultad y no funcione sin conexión."),
  h2("2.2", "Los límites de la visión artificial con imágenes reales"),
  parr("Gurari et al. (2018) publicaron el conjunto de datos VizWiz Grand Challenge, construido con más de 31 000 preguntas visuales tomadas por usuarios ciegos reales en situaciones cotidianas. El hallazgo más relevante es que aproximadamente el 28 % de esas preguntas resultó imposible de responder, principalmente por deficiencias de la propia fotografía: encuadre incompleto, desenfoque o iluminación insuficiente. El dato revela una paradoja que ninguna mejora del modelo de visión resuelve por sí sola: quien no puede ver tampoco puede verificar que la fotografía haya salido bien. El problema no está únicamente en el algoritmo, sino en el momento de la captura."),
  h2("2.3", "Inteligencia artificial generativa y usuarios ciegos"),
  parr("Adnin y Das (2024) realizaron un estudio con diecinueve personas ciegas o con baja visión que ya empleaban herramientas de inteligencia artificial generativa. Los participantes las valoraron positivamente, pero reportaron cuatro clases de problemas: barreras de accesibilidad en las propias interfaces —botones sin etiquetar, ausencia de navegación por teclado y falta de aviso cuando la respuesta termina de generarse—, imprecisiones y alucinaciones, modelos mentales equivocados sobre el funcionamiento de los sistemas y respuestas con sesgos capacitistas."),
  h2("2.4", "Síntesis y brecha identificada"),
  parr(`La revisión precedente permite identificar tres brechas que la propuesta busca cubrir de manera explícita (Tabla ${NT.brechas}).`),
  ...cap("brechas", "Brechas identificadas en el estado del arte y respuesta de la propuesta"),
  tabla([2200, 3500, 3660], [
    ["Antecedente", "Brecha que persiste", "Respuesta de VÍA"],
    ["Bigham et al. (2010)", "Depende de voluntarios disponibles de manera permanente; no escala ni opera sin conexión.", "La asistencia humana se conserva como respaldo excepcional; el reconocimiento de texto y la voz funcionan en el propio dispositivo."],
    ["Gurari et al. (2018)", "El 28 % de las fotografías tomadas por usuarios ciegos resulta ininterpretable por problemas de captura.", "El módulo de cámara guía por voz la iluminación antes de disparar, en lugar de evaluar la imagen después."],
    ["Adnin y Das (2024)", "Las propias interfaces de inteligencia artificial no son accesibles y sus respuestas contienen sesgos capacitistas.", "La interfaz se verifica contra WCAG 2.2 con pruebas automáticas y las descripciones se formulan en lenguaje neutro."],
  ]),
  notaTabla("Cada módulo de la propuesta responde a una limitación documentada en la literatura revisada."),
];

// =============================== 3. ALCANCE ===============================
const s3 = [
  h1(3, "Alcance"),
  parr("El alcance corresponde al de una aplicación funcional de nivel prototipo, probada en un teléfono Android y en navegador, no al de un producto en producción. La delimitación se establece en los siguientes términos."),
  ...cap("delim", "Delimitación del alcance de la propuesta"),
  tabla([4680, 4680], [
    ["La propuesta comprende", "La propuesta excluye"],
    ["Una aplicación móvil nativa para Android e iOS, con interfaz íntegramente en español.", "La corrección del código fuente de sitios web de terceros: la aplicación adapta la presentación del lado del usuario."],
    ["La lectura y reconstrucción accesible de páginas web y de documentos de ejemplo.", "Cualquier forma de diagnóstico, tratamiento o servicio de salud visual."],
    ["El reconocimiento óptico de caracteres mediante visión por computador, ejecutado en el dispositivo.", "La navegación física o el desplazamiento en la vía pública, propios de soluciones de orientación y movilidad."],
    ["El control por voz, con retroalimentación háptica y confirmación hablada.", "Los subtítulos automáticos y la traducción a lengua de señas, dirigidos a la discapacidad auditiva."],
    ["Tres perfiles de accesibilidad y un modo simplificado para dificultades cognitivas leves.", "El contenido audiovisual protegido por gestión de derechos digitales."],
    ["Una pantalla de ayuda humana simulada y un plan de pruebas con usuarios.", "El desarrollo e implantación de un backend en un entorno productivo."],
  ]),
  notaTabla("La delimitación distingue entre las funciones que la propuesta implementa y aquellas que quedan fuera de su ámbito de intervención."),
  h2("3.1", "Delimitación poblacional y geográfica"),
  parr("La propuesta se dirige a personas con discapacidad visual residentes en el Perú que dispongan de un teléfono inteligente con conexión intermitente a internet. Como beneficiarios secundarios se consideran los adultos mayores y las personas con poca experiencia tecnológica o dificultades cognitivas leves, a quienes sirve el modo simplificado incorporado en esta entrega."),
  h2("3.2", "Decisión de alcance frente a la consigna"),
  parr("La consigna del curso propone módulos pensados para varias poblaciones: discapacidad visual, auditiva, motora, cognitiva y adultos mayores. El equipo mantuvo el foco en la discapacidad visual por las razones expuestas en la segunda entrega, sustentadas en Story et al. (1998) y Shneiderman (2000): diseñar simultáneamente para cinco poblaciones sin investigación específica de cada una produce soluciones superficiales. Como el módulo de accesibilidad de la consigna incluye un modo simplificado para personas con dificultades cognitivas, ese componente sí se implementó en esta entrega, porque es compatible con el diseño por capas y beneficia también a adultos mayores. La Tabla " + NT.modulos + " relaciona cada módulo solicitado con lo efectivamente construido."),
  ...cap("modulos", "Correspondencia entre los módulos solicitados por la consigna y VÍA"),
  tabla([2100, 4560, 2700], [
    ["Módulo de la consigna", "Funcionalidad en VÍA", "Estado"],
    ["Lectura accesible", "Síntesis de voz en español; velocidad regulable de 0.5× a 3×; pausa, reanudación, avance y retroceso por secciones; lector de páginas web con jerarquía de encabezados.", "Implementado"],
    ["Conversión de voz a texto", "Reconocimiento de comandos de voz con el reconocedor nativo del teléfono; transcripción visible de lo escuchado; confirmación hablada y háptica de cada acción.", "Implementado"],
    ["Accesibilidad", "Tres esquemas de color (incluida paleta segura para daltonismo); texto escalable hasta 400 %; etiquetas para lectores de pantalla verificadas con pruebas automáticas; modo simplificado.", "Implementado"],
    ["Multimedia", "Subtítulos automáticos y controles de reproducción de video: no implementados por quedar fuera del alcance visual. Como equivalente para el público de VÍA se ofrece la lectura de texto en imágenes con la cámara y el marcado de imágenes sin texto alternativo.", "No implementado (fuera de alcance); equivalente parcial"],
  ]),
  notaTabla("La columna «Estado» indica con honestidad lo construido: el módulo multimedia de la consigna no se desarrolló."),
];

// =============================== 4. DESARROLLO ===============================
const s4 = [
  h1(4, "Desarrollo de la investigación (actualización del informe)"),
  h2("4.1", "Progresión del proyecto"),
  parr(`La Tabla ${NT.progresion} resume el avance entre entregas. Respecto de la segunda entrega, el código creció hasta ${codApp.archivos} archivos y ${miles(codApp.lineas)} líneas en la aplicación, más ${codTest.archivos} archivos y ${miles(codTest.lineas)} líneas de pruebas automáticas.`),
  ...cap("progresion", "Progresión del proyecto a lo largo de las tres entregas"),
  tabla([1700, 3800, 3860], [
    ["Entrega", "Alcance", "Resultado principal"],
    ["Primera", "Análisis del problema, investigación previa, objetivos y requisitos.", "Propuesta VÍA, estado del arte y prototipo de alta fidelidad de seis pantallas."],
    ["Segunda", "Diseño, prototipado y evaluación heurística.", "Metodología DCU, herramientas seleccionadas, evaluación con las diez heurísticas de Nielsen y tres hallazgos."],
    ["Tercera", "Implementación funcional, mejoras, pruebas de accesibilidad y encuesta de usabilidad.", "Aplicación funcional con modo simplificado, 20 pruebas automáticas, auditoría de un sitio público y análisis de la encuesta."],
  ]),
  notaTabla("Elaboración propia."),

  h2("4.2", "Metodología: Diseño Centrado en el Usuario"),
  parr(`El desarrollo siguió las cinco etapas del Diseño Centrado en el Usuario revisadas en el curso (Tabla ${NT.dcu}).`),
  ...cap("dcu", "Etapas del Diseño Centrado en el Usuario aplicadas al desarrollo de VÍA"),
  tabla([1900, 4900, 2560], [
    ["Etapa", "Qué se realizó", "Evidencia"],
    ["Empatizar e investigar", "Revisión de la literatura sobre accesibilidad para personas ciegas y de las cifras de la problemática.", "Secciones 2 y 4.8"],
    ["Definir", "Formulación del problema, objetivos y 22 requisitos funcionales y 11 no funcionales.", "Presentación y documento de requisitos"],
    ["Idear y diseñar", "Arquitectura de cuatro capas y sistema de diseño con colores verificados mediante la fórmula de contraste de la W3C y áreas táctiles de 48 dp.", "Secciones 4.3 y 4.7"],
    ["Prototipar", "Del prototipo de alta fidelidad (Anexo F) a una aplicación funcional en Flutter, instalada y probada en un teléfono Android.", "Secciones 4.3 a 4.6 y Anexo E"],
    ["Evaluar", "Evaluación heurística, pruebas técnicas de accesibilidad, auditoría de un sitio real y encuesta de usabilidad.", "Secciones 4.6 a 4.9 y 5"],
  ]),
  notaTabla("Elaboración propia."),

  h2("4.3", "Arquitectura y organización del código"),
  parr("La aplicación se estructura en cuatro capas funcionales (Figura 1): el usuario interactúa con la primera y percibe el resultado de la cuarta; las dos intermedias operan de forma invisible para él."),
  ...fig("arq", "Arquitectura funcional de la aplicación VÍA"),
  imagenCentrada(img(E1 + "image1.png", "png", 590, 191, "Diagrama de la arquitectura funcional de VÍA en cuatro capas")),
  notaTabla("Elaboración propia."),
  parr("El efecto buscado sobre una página real se ilustra en la Figura 2: a la izquierda, una página de trámites con cuatro fallos de accesibilidad señalados; a la derecha, la misma página reconstruida conforme a los cuatro principios de las WCAG 2.2."),
  ...fig("antes", "Comparación de una misma página antes y después del procesamiento"),
  imagenCentrada(img(E1 + "image2.png", "png", 590, 342, "Comparación entre una página web original con cuatro fallos de accesibilidad y la misma página reconstruida por VÍA")),
  notaTabla("Elaboración propia. Ilustración de diseño de la primera entrega."),
  parr(`El código replica esa arquitectura en cuatro carpetas con una única responsabilidad cada una (Tabla ${NT.codigo}). La regla de organización es que ningún componente de interfaz llama directamente a un paquete externo: cada paquete queda envuelto en un único archivo de servicio, de modo que sustituirlo implica modificar un solo lugar.`),
  ...cap("codigo", "Organización del código fuente de VÍA por capas"),
  tabla([1400, 5360, 2600], [
    ["Carpeta", "Responsabilidad", "Archivo representativo"],
    ["core/", "Tema visual y esquemas de color, estado global de ajustes, anunciador (voz + vibración + lector de pantalla) y diccionario de comandos de voz.", "anunciador.dart"],
    ["data/", "Modelos de datos y servicios que envuelven los paquetes externos: voz, reconocimiento de voz, OCR, lector web y almacenamiento local.", "tts_service.dart"],
    ["features/", "Una carpeta por pantalla (inicio, lector, Ojo IA, ajustes, ayuda, historial, onboarding): la vista dibuja y el controlador decide.", "ojo_ia_controller.dart"],
    ["shared/", "Componentes reutilizados: botón accesible, tarjeta accesible, chip y barra de navegación.", "boton_accesible.dart"],
  ]),
  notaTabla(`Total: ${codApp.archivos} archivos y ${miles(codApp.lineas)} líneas de código en lib/; ${codTest.archivos} archivos y ${miles(codTest.lineas)} líneas en test/.`),

  h2("4.4", "Funcionalidades implementadas"),
  parr(`La Tabla ${NT.funciones} lista las funcionalidades implementadas, agrupadas por los módulos de la consigna, con el archivo donde reside cada una.`),
  ...cap("funciones", "Funcionalidades implementadas por módulo"),
  tabla([1900, 5100, 2360], [
    ["Módulo", "Funcionalidad", "Archivo principal"],
    ["Lectura accesible", "Lectura automática por voz; control de velocidad 0.5× a 3×; pausa y reanudación; avance por secciones; lector de páginas web; historial de lecturas.", "lector_controller.dart; lector_web_service.dart; tts_service.dart"],
    ["Voz a texto", "Escucha continua con reintentos limitados; transcripción visible; 20 comandos de voz con variantes fonéticas; confirmación hablada y háptica.", "stt_service.dart; comandos_voz.dart; home_controller.dart"],
    ["Accesibilidad", "Tres esquemas de color; texto de 100 % a 400 %; etiquetas semánticas para lectores de pantalla; reducir animaciones; tres perfiles.", "colores.dart; main.dart; perfil_provider.dart"],
    ["Modo simplificado", "Menos opciones en Ajustes, textos más cortos en Inicio y Navegar, letra de al menos 130 %; se activa en Ajustes o diciendo «modo simple».", "ajustes_screen.dart; inicio_tab.dart; main.dart"],
    ["Cámara (Ojo IA)", "Guía de iluminación por voz; captura; reconocimiento de texto en el dispositivo; lectura en voz alta y guardado en el historial.", "ojo_ia_controller.dart; ocr_service.dart"],
    ["Persistencia", "Los ajustes y el historial se conservan al cerrar la aplicación.", "preferencias_service.dart"],
  ]),
  notaTabla("Elaboración propia a partir del código fuente del proyecto."),

  h2("4.5", "Herramientas y tecnologías utilizadas"),
  parr(`La Tabla ${NT.herramientas} detalla las herramientas empleadas y su propósito. Se distingue entre herramientas de desarrollo y bibliotecas de software (dependencias) que se ejecutan dentro de la aplicación.`),
  ...cap("herramientas", "Herramientas y tecnologías utilizadas en el desarrollo de VÍA"),
  tabla([2500, 2000, 4860], [
    ["Herramienta", "Tipo", "Para qué se utiliza"],
    ["Flutter (SDK) y Dart", "Framework y lenguaje", "Una sola base de código para Android e iOS; Dart es el lenguaje en el que está escrita toda la aplicación."],
    ["Android Studio", "Entorno de desarrollo", "Proveedor del SDK de Android y del emulador para compilar, instalar y probar la aplicación."],
    ["Visual Studio Code", "Editor de código", "Edición y revisión del código fuente."],
    ["Git y GitHub", "Control de versiones", "Historial de cambios y publicación del código en el repositorio del proyecto."],
    ["provider", "Dependencia: estado", "Refleja al instante en toda la aplicación un cambio de ajuste, sin reiniciarla."],
    ["flutter_tts", "Dependencia: voz", "Convierte texto en voz con el motor nativo del sistema operativo."],
    ["speech_to_text", "Dependencia: reconocimiento de voz", "Convierte lo que dice el usuario en texto con el reconocedor nativo del sistema; sustenta los comandos de voz."],
    ["camera", "Dependencia: hardware", "Acceso a la cámara para el módulo Ojo IA."],
    ["google_mlkit_text_recognition", "Dependencia: visión", "Reconocimiento óptico de caracteres (OCR) ejecutado íntegramente en el dispositivo."],
    ["permission_handler", "Dependencia: permisos", "Solicita y verifica los permisos de cámara y micrófono."],
    ["shared_preferences", "Dependencia: almacenamiento", "Guarda en el dispositivo los ajustes del usuario."],
    ["http y html", "Dependencias: red y texto", "Descargan una página web y extraen sus encabezados, párrafos e imágenes."],
    ["flutter_test", "Pruebas automáticas", "Ejecuta las 20 pruebas, incluidas las guías de accesibilidad de Flutter."],
  ]),
  notaTabla("Las dependencias se obtienen del repositorio oficial de paquetes de Dart y Flutter (pub.dev)."),
  h3("4.5.1", "Tecnología empleada para el comando de voz"),
  parr([normal("Los comandos de voz se basan en el paquete "), normal("speech_to_text", { font: "Consolas", size: 22 }), normal(" de Flutter. Este paquete no contiene un modelo propio de reconocimiento de voz: delega esa tarea en el reconocedor que el sistema operativo del teléfono ya incorpora (en Android, el servicio de reconocimiento de voz de Google integrado en el sistema), por lo que no se contrató ni entrenó ninguna interfaz de inteligencia artificial externa para esta función.")]),
  parr("El proceso tiene cuatro pasos: el usuario pronuncia una frase, por ejemplo «ojo IA»; el reconocedor del sistema convierte el audio en texto; el paquete entrega ese texto a la aplicación; y un diccionario de comandos propio compara el texto con una lista de frases conocidas y ejecuta la acción asociada. Como los reconocedores transcriben a veces de forma imprecisa las siglas —«IA» puede llegar como «i a» o «ya»—, el diccionario incluye variantes fonéticas de cada comando y compara además ignorando los espacios. La respuesta hablada se genera con el paquete complementario flutter_tts, que usa el motor de síntesis nativo del dispositivo."),

  h2("4.6", "Mejoras aplicadas"),
  parr(`Las mejoras provienen de cuatro fuentes: la evaluación heurística de la segunda entrega, las pruebas realizadas sobre el dispositivo, las pruebas automáticas de accesibilidad y la incorporación del módulo cognitivo. La Tabla ${NT.mejoras} las enumera, indicando su origen.`),
  ...cap("mejoras", "Mejoras aplicadas a la aplicación y su origen"),
  tablaC([500, 2700, 4660, 1500], [
    ["N.°", "Problema detectado y origen", "Mejora aplicada", "Fuente"],
    ["1", "Los comandos de voz disponibles no se podían descubrir (heurística 10, severidad 1).", "Comando «ayuda» que enumera los comandos desde cualquier pantalla.", "Heurística"],
    ["2", "Silencio durante esperas largas, como el reconocimiento de una foto o la descarga de una página (heurística 1, severidad 1).", "Aviso hablado cada 4 segundos mientras la aplicación trabaja («Sigo leyendo la foto, un momento»).", "Heurística"],
    ["3", "La barra de navegación inferior ocupaba casi toda la pantalla y tapaba el contenido.", "Se limitó su alto al contenido real (un solo atributo de diseño).", "Pruebas de uso"],
    ["4", "El micrófono reintentaba escuchar sin fin y producía un sonido repetitivo de abrir y cerrar.", "Máximo de 3 reintentos con espera creciente y botón para reintentar tocando el orbe.", "Pruebas de uso"],
    ["5", "El lector de páginas web leía los títulos de Wikipedia pero no sus párrafos.", "Se reconstruye el contenido recorriendo el documento en orden, sin depender de la estructura de hermanos del HTML.", "Pruebas de uso"],
    ["6", "Anunciar la dirección web completa resultaba tedioso.", "Se anuncia solo el dominio.", "Pruebas de uso"],
    ["7", "La sigla «IA» se transcribía mal y el comando «ojo IA» no se reconocía.", "Variantes fonéticas y comparación que ignora los espacios.", "Pruebas de uso"],
    ["8", "Los interruptores de Ajustes no tenían etiqueta: un lector de pantalla diría solo «interruptor».", "Etiqueta fusionada con el interruptor; defecto hallado por las pruebas automáticas.", "Prueba automática"],
    ["9", "Los textos de contraste decían 15.8:1 pero la medición contra el fondo real es 13.4:1.", "Se corrigieron los textos y comentarios con los valores medidos (siguen superando 7:1).", "Prueba automática"],
    ["10", "La consigna incluye un módulo para dificultades cognitivas leves que VÍA no cubría.", "Modo simplificado: menos opciones, textos cortos y letra de al menos 130 %.", "Consigna"],
  ], 18),
  notaTabla("Las mejoras 1 y 2 responden a los hallazgos de la evaluación heurística de la segunda entrega; el tercer hallazgo (detección de los bordes del documento en la cámara) permanece como trabajo futuro. Los botones grandes, el alto contraste y la ayuda por voz sugeridos como ejemplos en la consigna ya estaban presentes desde el diseño y se verificaron en la sección 4.7."),
  parr("Las Figuras 3 y 4 muestran el efecto del modo simplificado en la aplicación en ejecución. En Inicio los accesos pasan a tener descripciones más cortas («Escucha una página de internet») y el encabezado se reformula como pregunta; en Ajustes desaparecen las secciones avanzadas de color, visualización e historial."),
  ...fig("inicio", "Pantalla de Inicio sin modo simplificado (izquierda) y con modo simplificado (derecha)"),
  tablaImagenes([4680, 4680], [filaImagenes([
    celdaFig(4680, img(TERC + "evidencias\\inicio_normal.jpg", "jpg", 290, 218, "Pantalla de Inicio sin modo simplificado"), "Normal"),
    celdaFig(4680, img(TERC + "evidencias\\inicio_simplificado.jpg", "jpg", 290, 218, "Pantalla de Inicio con modo simplificado"), "Modo simplificado"),
  ])]),
  notaTabla("Capturas de la aplicación en ejecución en navegador. Elaboración propia."),
  ...fig("ajustes", "Pantalla de Ajustes sin modo simplificado (izquierda) y con modo simplificado (derecha)"),
  tablaImagenes([4680, 4680], [filaImagenes([
    celdaFig(4680, img(TERC + "evidencias\\ajustes_normal.jpg", "jpg", 290, 218, "Pantalla de Ajustes sin modo simplificado"), "Normal"),
    celdaFig(4680, img(TERC + "evidencias\\ajustes_simplificado.jpg", "jpg", 290, 218, "Pantalla de Ajustes con modo simplificado"), "Modo simplificado"),
  ])]),
  notaTabla("Capturas de la aplicación en ejecución en navegador. Elaboración propia."),

  h2("4.7", "Evaluación de accesibilidad"),
  parr("La verificación de accesibilidad se realizó con pruebas automáticas reproducibles (archivo test/accesibilidad_test.dart), que se ejecutan con el comando flutter test. Son 20 pruebas, todas aprobadas a la fecha de este informe, y el análisis estático del código no reporta problemas."),
  h3("4.7.1", "Contraste de color"),
  parr(`Se calculó la relación de contraste de cada color de texto frente al fondo de la aplicación con la fórmula de luminancia relativa de la W3C. El nivel AAA de las WCAG exige 7:1 como mínimo; la Tabla ${NT.contraste} muestra que los tres esquemas lo superan en todos los roles.`),
  ...cap("contraste", "Relación de contraste medida por esquema de color y rol"),
  (() => {
    const c = {}; fs.readFileSync(path.join(__dirname, "tercera", "evidencias", "contrastes.txt"), "utf8").trim().split("\n").forEach((l) => { const [, esq, rol, v] = l.trim().split(" "); (c[rol] = c[rol] || {})[esq] = v; });
    const roles = [["texto", "Texto principal"], ["textoSuave", "Texto secundario"], ["accion", "Acción principal"], ["info", "Información"], ["exito", "Éxito"], ["error", "Error"]];
    return tablaC([3000, 2120, 2120, 2120], [["Rol del color", "Alto contraste oscuro", "Alto contraste claro", "Daltonismo (azul y naranja)"],
      ...roles.map(([k, n]) => [n, c[k].altoContrasteOscuro + ":1", c[k].altoContrasteClaro + ":1", c[k].daltonicoAzulNaranja + ":1"])], 20, 1);
  })(),
  notaTabla("Medición con la prueba test/accesibilidad_test.dart. Todos los valores superan el mínimo de 7:1 del nivel AAA."),
  h3("4.7.2", "Áreas táctiles y etiquetas para lectores de pantalla"),
  parr("Con las guías de accesibilidad del propio Flutter se comprobó que todos los elementos pulsables miden al menos 48 × 48 dp y que tienen una etiqueta que un lector de pantalla pueda anunciar. Esta prueba detectó un defecto real: los interruptores de Ajustes carecían de etiqueta (mejora 8 de la Tabla " + NT.mejoras + "). Tras corregirlo, las pruebas se aprobaron para los tres esquemas de color y para la pantalla de Ajustes en modo simplificado."),
  h3("4.7.3", "Principios de accesibilidad cumplidos"),
  parr(`La Tabla ${NT.pour} organiza la evidencia según los cuatro principios de las WCAG 2.2.`),
  ...cap("pour", "Principios de accesibilidad de las WCAG 2.2 y evidencia de cumplimiento"),
  tablaC([1500, 3000, 4860], [
    ["Principio", "Criterio WCAG 2.2", "Evidencia en VÍA"],
    ["Perceptible", "1.4.3 y 1.4.6 Contraste (mínimo y mejorado)", "Todos los textos superan 7:1 en los tres esquemas (Tabla " + NT.contraste + ")."],
    ["Perceptible", "1.4.4 Cambio de tamaño del texto", "Texto escalable de 100 % a 400 %, combinado con el tamaño del sistema; el modo simplificado asegura al menos 130 %."],
    ["Perceptible", "1.4.1 Uso del color; 1.1.1 Contenido no textual", "Paleta azul y naranja para daltonismo; las imágenes sin texto alternativo se marcan y nunca se inventa su descripción."],
    ["Operable", "2.5.8 Tamaño del objetivo (mínimo)", "Áreas táctiles de al menos 48 dp, verificadas con la guía androidTapTargetGuideline."],
    ["Operable", "2.1 Accesible por teclado / alternativas de entrada", "Toda la aplicación se opera por voz y también por toque; cada acción tiene ambos equivalentes."],
    ["Comprensible", "3.1.1 Idioma de la página", "Interfaz y voz en español (es-PE)."],
    ["Comprensible", "3.2.3 Navegación consistente; 3.3.3 Sugerencias ante errores", "Barra inferior fija de cuatro pestañas; un comando no reconocido se responde con las opciones disponibles, nunca con un error técnico."],
    ["Robusto", "4.1.2 Nombre, función y valor", "Etiquetas semánticas verificadas con la guía labeledTapTargetGuideline tras la corrección de los interruptores."],
    ["Robusto", "4.1.3 Mensajes de estado", "Cada acción se anuncia por voz y al lector de pantalla del sistema mediante el anunciador."],
  ], 18),
  notaTabla("La verificación con el lector de pantalla TalkBack en un teléfono real queda como recomendación para la siguiente etapa; las pruebas automáticas no la reemplazan."),

  h2("4.8", "Verificación con una página pública real: el portal de la ONPE"),
  parr(`La consigna cita como referencia el portal web de la Oficina Nacional de Procesos Electorales (ONPE). El 4 de noviembre de 2026 se auditó su página de inicio con una herramienta propia (tool/auditoria_web.dart) que cuenta los fallos de accesibilidad más frecuentes según WebAIM (2026) y luego reconstruye la página con el lector web de VÍA, exactamente como lo haría la aplicación. La Tabla ${NT.onpe} presenta los resultados, que son mediciones reales.`),
  ...cap("onpe", "Auditoría automática de la página de inicio de la ONPE y lectura con VÍA (4 de noviembre de 2026)"),
  tablaC([5200, 4160], [
    ["Indicador", "Resultado"],
    ["Imágenes en la página / sin atributo de texto alternativo", `${aud.imagenes} / ${aud.imagenesSinAlt}`],
    ["Imágenes con texto alternativo vacío", String(aud.imagenesAltVacio)],
    ["Enlaces en total / enlaces vacíos (sin texto ni etiqueta)", `${aud.enlaces} / ${aud.enlacesVacios} (${f1((aud.enlacesVacios / aud.enlaces) * 100)} %)`],
    ["Campos de formulario / sin etiqueta", `${aud.camposDeFormulario} / ${aud.camposSinEtiqueta}`],
    ["Encabezados HTML", String(aud.encabezados)],
    ["Declara el idioma de la página", aud.declaraIdioma ? "Sí" : "No"],
    ["Secciones reconstruidas por el lector de VÍA", String(aud.lectorVia.secciones)],
    ["Párrafos leídos / caracteres de texto legible", `${aud.lectorVia.parrafos} / ${miles(aud.lectorVia.caracteresLeibles)}`],
  ], 20),
  notaTabla("Auditoría estática del HTML descargado: no evalúa contraste ni contenido que se genere con JavaScript. Elaboración propia."),
  parr(`Los resultados muestran un portal razonablemente cuidado en dos aspectos —todas sus imágenes declaran texto alternativo y declara el idioma—, con ${aud.enlacesVacios} enlaces vacíos que un lector de pantalla anunciaría solo como «enlace». Para VÍA el hallazgo más útil es otro: de ${miles(Math.round(aud.bytes / 1000))} kB de HTML y ${aud.encabezados} encabezados, el lector extrajo solo ${aud.lectorVia.secciones} secciones y ${aud.lectorVia.parrafos} párrafos, porque el portal es sobre todo una colección de enlaces de navegación y no texto corrido. Es una limitación real del lector actual, que prioriza párrafos, y origina la recomendación 4 de la sección 7.`),

  h2("4.9", "Pruebas con usuarios: diseño del estudio simulado"),
  aviso("Recordatorio.", "Esta sección describe un estudio de usuarios simulado. Los datos que produce no son de personas reales."),
  h3("4.9.1", "Participantes"),
  parr(`Se simularon ${G.n} participantes distribuidos en cuatro perfiles representativos (Tabla ${NT.participantes}). No se incluyeron participantes con discapacidad auditiva porque la interacción de VÍA es por voz y la discapacidad auditiva está fuera del alcance definido en la sección 3.2.`),
  ...cap("participantes", "Perfiles de los participantes simulados"),
  tablaC([3900, 1100, 1900, 2460], [
    ["Perfil", "n", "Identificadores", "Edades"],
    ...Object.entries(d.perfiles).map(([k, nombre]) => {
      const ps = d.participantes.filter((p) => p.perfil === k);
      return [nombre, ps.length, ps.map((p) => p.id).join(", "), ps.map((p) => p.edad).join(", ")];
    }),
  ], 19, 1),
  notaTabla("Participantes simulados. El perfil «conocimientos tecnológicos básicos / dificultad cognitiva leve» usa el modo simplificado."),
  h3("4.9.2", "Escenarios de prueba"),
  parr(`Se definieron cuatro escenarios (Tabla ${NT.escenarios}), adaptados de los propuestos en la consigna al alcance real de VÍA.`),
  ...cap("escenarios", "Escenarios de prueba"),
  tablaC([700, 4200, 4460], [
    ["Id.", "Escenario ejecutado", "Relación con la consigna"],
    ["E1", nombreEsc("E1"), "Equivale al escenario 1: escuchar un documento mediante lectura automática."],
    ["E2", nombreEsc("E2"), "Adapta el escenario 2: VÍA no tiene buscador; se mide el uso de comandos de voz para llegar a una pantalla."],
    ["E3", nombreEsc("E3"), "Equivale al escenario 3: activar opciones de accesibilidad."],
    ["E4", nombreEsc("E4"), "Sustituye al escenario 4 (contenido multimedia con subtítulos), que está fuera del alcance visual."],
  ], 19),
  notaTabla("Elaboración propia."),
  h3("4.9.3", "Indicadores y metas"),
  parr("Se evaluaron los cuatro indicadores de la consigna: facilidad de uso (afirmaciones 1, 2, 4, 5, 6 y 8), nivel de satisfacción (afirmación 10), número de errores (afirmaciones 3, 7 y 9, más los errores contados en cada tarea) y tiempo de ejecución de las tareas. Las metas se fijaron antes de generar los datos: media global de la encuesta de 4.0 o más; al menos 70 % de acuerdo en cada afirmación; tasa de éxito de las tareas de 85 % o más (meta de la primera entrega); y como máximo un error medio por tarea."),
  h3("4.9.4", "Instrumento: encuesta en escala de Likert"),
  parr(`El instrumento consta de diez afirmaciones valoradas de 1 (totalmente en desacuerdo) a 5 (totalmente de acuerdo), derivadas de la guía de preguntas de observación elaborada por el equipo (Anexo B) y agrupadas por los principios de las WCAG (Tabla ${NT.instrumento}).`),
  ...cap("instrumento", "Instrumento de encuesta en escala de Likert de diez afirmaciones"),
  tablaC([600, 5260, 1750, 1750], [
    ["N.°", "Afirmación", "Principio", "Indicador"],
    ...d.items.map((i) => [i.n, i.texto, i.principio, i.indicador]),
  ], 19),
  notaTabla("Escala: 1 = totalmente en desacuerdo; 2 = en desacuerdo; 3 = ni de acuerdo ni en desacuerdo; 4 = de acuerdo; 5 = totalmente de acuerdo."),
  h3("4.9.5", "Procedimiento de simulación"),
  parr(`Para cada perfil y cada afirmación se fijó, antes de generar nada, una media esperada razonada a partir de las limitaciones conocidas del sistema (por ejemplo, una valoración menor de la cámara para personas ciegas, que no pueden verificar el encuadre, y mayor del modo simplificado para el perfil cognitivo; Anexo C). Cada respuesta se generó como esa media más un efecto propio de cada participante y un ruido aleatorio, redondeada a una puntuación entera de 1 a 5. Los tiempos siguen una distribución lognormal alrededor de un tiempo base por perfil y escenario, los errores una distribución de Poisson y el éxito una probabilidad por perfil. Se usó un generador con semilla fija (${d.semilla}), por lo que el procedimiento es reproducible con el archivo docs/entregables/_build/tercera/simulacion.js del repositorio. Los resultados se reportan tal como salieron, sin ajustes posteriores.`),
];

// =============================== 5. RESULTADOS ===============================
const s5 = [
  h1(5, "Análisis de resultados de la encuesta"),
  aviso("Datos simulados.", `Todas las cifras de esta sección provienen de la simulación de ${G.n} participantes descrita en la sección 4.9 y no de personas reales.`),
  h2("5.1", "Resultados por afirmación"),
  parr(`La media global de las diez afirmaciones fue ${f2(G.likertGlobal)} sobre 5 y el porcentaje medio de acuerdo (respuestas 4 y 5) fue ${f1(G.acuerdoGlobal)} %. La Tabla ${NT.resultados} detalla cada afirmación y la Figura 5 las compara con la meta de 4.0.`),
  ...cap("resultados", "Resultados por afirmación (datos simulados, n = " + G.n + ")"),
  tablaC([600, 3300, 1100, 1000, 1160, 1100, 1100], [
    ["N.°", "Afirmación (resumen)", "Media", "D. E.", "Mediana", "% de acuerdo", "% de desacuerdo"],
    ...IT.map((i) => [i.n, i.corto, f2(i.media), f2(i.de), i.mediana, f1(i.acuerdo), f1(i.desacuerdo)]),
  ], 19, 2),
  notaTabla("D. E. = desviación estándar. Acuerdo = respuestas 4 y 5; desacuerdo = respuestas 1 y 2. Datos simulados."),
  ...fig("medias", "Media por afirmación frente a la meta de 4.0 (datos simulados)"),
  imagenCentrada(img(TERC + "g1_medias.png", "png", 590, 275, "Gráfico de barras con la media de cada una de las diez afirmaciones")),
  notaTabla("Se resaltan en naranja las afirmaciones con menos de 70 % de acuerdo. Datos simulados. Elaboración propia."),
  ...fig("distrib", "Distribución de las respuestas por afirmación (datos simulados)"),
  imagenCentrada(img(TERC + "g2_distribucion.png", "png", 590, 300, "Barras apiladas con el porcentaje de respuestas de 1 a 5 en cada afirmación")),
  notaTabla("Datos simulados. Elaboración propia."),
  parr(`Siete de las diez afirmaciones superan el 70 % de acuerdo. Las valoradas más alto son la claridad de la voz (P4, ${f2(IT[3].media)}) y la autonomía y el uso diario (P10, ${f2(IT[9].media)}). Las tres que quedan por debajo del umbral son las que coinciden con limitaciones ya conocidas del sistema: el reconocimiento de la voz (P3, ${f2(IT[2].media)}; ${f1(IT[2].acuerdo)} % de acuerdo), la cámara Ojo IA (P7, ${f2(IT[6].media)}; ${f1(IT[6].acuerdo)} %) y el uso exclusivo con comandos de voz (P2, ${f2(IT[1].media)}; ${f1(IT[1].acuerdo)} %).`),
  h2("5.2", "Resultados por indicador y principio"),
  ...cap("indicadores", "Media por indicador de la consigna y por principio de las WCAG (datos simulados)"),
  tablaC([4300, 2530, 2530], [
    ["Agrupación", "Media", "Afirmaciones"],
    ...["Facilidad de uso", "Errores", "Satisfacción"].map((k) => [`Indicador: ${k}`, f2(d.indicadores[k]), IT.filter((i) => i.indicador === k).map((i) => "P" + i.n).join(", ")]),
    ...["Perceptible", "Operable", "Comprensible", "Robusto"].map((k) => [`Principio: ${k}`, f2(d.principios[k]), IT.filter((i) => i.principio === k).map((i) => "P" + i.n).join(", ")]),
  ], 20, 1),
  notaTabla("La afirmación 10, de carácter general, se agrupa en el indicador de satisfacción. Datos simulados."),
  parr(`El indicador de satisfacción (${f2(d.indicadores["Satisfacción"])}) y el de facilidad de uso (${f2(d.indicadores["Facilidad de uso"])}) superan la meta; el indicador asociado a errores (${f2(d.indicadores["Errores"])}) es el más bajo. Por principio, el más débil es el robusto (${f2(d.principios["Robusto"])}), que en este instrumento corresponde únicamente al reconocimiento de la voz.`),
  h2("5.3", "Resultados por perfil de usuario"),
  ...cap("perfil", "Media por afirmación y perfil (datos simulados)"),
  tablaC([3500, 1465, 1465, 1465, 1465], [
    ["Afirmación", "Ceguera total", "Baja visión", "Adulto mayor", "Tec. básica / cognitiva"],
    ...IT.map((i) => [`P${i.n}. ${i.corto}`, f2(i.porPerfil.CT), f2(i.porPerfil.BV), f2(i.porPerfil.AM), f2(i.porPerfil.CB)]),
    ["Media del perfil", f2(d.porPerfilGlobal.CT), f2(d.porPerfilGlobal.BV), f2(d.porPerfilGlobal.AM), f2(d.porPerfilGlobal.CB)],
  ], 19, 1),
  notaTabla("Cada perfil tiene tres participantes simulados, por lo que las diferencias entre perfiles son orientativas y no admiten inferencia estadística. Datos simulados."),
  parr(`Las diferencias que sí tienen sentido interpretar son las que la simulación tenía por hipótesis y que coinciden con el diseño: la cámara es la función peor valorada por las personas ciegas (${f2(IT[6].porPerfil.CT)}), que no pueden comprobar el encuadre, y el modo simplificado es la mejor valorada por el perfil de tecnología básica o dificultad cognitiva (${f2(IT[7].porPerfil.CB)}) y por los adultos mayores (${f2(IT[7].porPerfil.AM)}). El reconocimiento de la voz es lo más bajo entre los adultos mayores (${f2(IT[2].porPerfil.AM)}).`),
  h2("5.4", "Tiempo, errores y éxito en las tareas"),
  ...cap("tareas", "Tiempo, errores y tasa de éxito por escenario (datos simulados, n = " + G.n + ")"),
  tablaC([700, 3660, 1250, 1250, 1250, 1250], [
    ["Id.", "Escenario", "Tiempo medio (s)", "D. E. (s)", "Errores medios", "Éxito (%)"],
    ...d.escStats.map((e) => [e.id, e.nombre, f1(e.tiempo), f1(e.deTiempo), f2(e.errores), f1(e.exito)]),
    ["", "Todas las tareas", f1(G.tiempo), "", f2(G.errores), f1(G.exito)],
  ], 19, 2),
  notaTabla("Éxito = tarea completada sin ayuda del evaluador. Datos simulados."),
  ...fig("tiempos", "Tiempo medio por escenario y perfil (datos simulados)"),
  imagenCentrada(img(TERC + "g3_tiempos.png", "png", 590, 279, "Gráfico de barras agrupadas con el tiempo medio de cada escenario por perfil de usuario")),
  notaTabla("Datos simulados. Elaboración propia."),
  parr(`La tasa de éxito global fue ${f1(G.exito)} % y el promedio fue de ${f2(G.errores)} errores por tarea. El escenario más exigente es el de leer un recibo con la cámara (E4): es el más lento (${f1(d.escStats[3].tiempo)} s en promedio) y el de más errores (${f2(d.escStats[3].errores)}), con tiempos especialmente largos para las personas ciegas. El escenario de activar opciones de accesibilidad (E3) tuvo la menor tasa de éxito (${f1(d.escStats[2].exito)} %), lo que sugiere que los deslizadores de tamaño de texto y de velocidad son difíciles de manejar con un lector de pantalla, y motiva la recomendación 3.`),
  h2("5.5", "Confiabilidad del instrumento"),
  parr(`El coeficiente alfa de Cronbach de las diez afirmaciones fue de ${f2(G.alfa)}, ligeramente por debajo del 0.70 que suele considerarse aceptable. Es un resultado esperable: el instrumento mide aspectos heterogéneos (voz, cámara, lectura, modo simplificado) con solo doce participantes, y por eso las afirmaciones no deben sumarse en un único puntaje sino analizarse por separado, como se hizo en este capítulo.`),
  h2("5.6", "Cumplimiento de las metas"),
  ...cap("metas", "Cumplimiento de las metas fijadas para la evaluación (datos simulados)"),
  tablaC([3700, 1900, 1700, 2060], [
    ["Meta", "Resultado", "Cumple", "Observación"],
    ["Media global de la encuesta de 4.0 o más", f2(G.likertGlobal), G.likertGlobal >= 4 ? "Sí" : "No", "Por poco margen"],
    ["Al menos 70 % de acuerdo en cada afirmación", `${IT.length - bajos.length} de ${IT.length}`, bajos.length === 0 ? "Sí" : "Parcial", "No lo logran " + bajos.map((i) => "P" + i.n).join(", ")],
    ["Tasa de éxito de las tareas de 85 % o más", f1(G.exito) + " %", G.exito >= 85 ? "Sí" : "No", escBajoExito.length ? "Debajo en " + escBajoExito.map((e) => e.id).join(", ") : "En todas"],
    ["Como máximo 1 error medio por tarea", f2(G.errores), G.errores <= 1 ? "Sí" : "No", d.escStats.filter((e) => e.errores > 1).map((e) => e.id + " = " + f2(e.errores)).join("; ") || "En todas"],
    ["Reducir 40 % el tiempo de lectura frente a un lector de pantalla", "No medido", "—", "Exige una prueba comparativa real"],
  ], 19, 1),
  notaTabla("Las metas se fijaron antes de generar los datos simulados."),
  h2("5.7", "Interpretación y limitaciones"),
  parr("Con las salvedades de que los datos son simulados y de que cada perfil tiene solo tres participantes, la lectura que dejan es consistente con el diseño: la aplicación resulta clara y valorada en lectura, contraste, modo simplificado y autonomía, y sus puntos débiles son el reconocimiento de voz, la cámara para quienes no pueden verificar el encuadre y el control de ajustes con deslizadores. Estas conclusiones son hipótesis a confirmar con personas reales; el procedimiento de simulación solo reproduce supuestos que el equipo ya tenía, de manera que no puede descubrir problemas nuevos. Por eso la recomendación principal de este informe es realizar el trabajo de campo con usuarios reales."),
];

// =============================== 6. CONCLUSIONES ===============================
const s6 = [
  h1(6, "Conclusiones"),
  parr("Las conclusiones se formulan en relación con el objetivo de la tercera entrega y con cada uno de sus objetivos específicos."),
  parr([negrita("Objetivo general. "), normal(`VÍA pasó de un prototipo de diseño a una aplicación funcional de ${codApp.archivos} archivos y ${miles(codApp.lineas)} líneas de código, probada en un teléfono Android y en navegador, que integra síntesis y reconocimiento de voz, lectura de páginas web, lectura de texto con la cámara, personalización de color y tamaño de letra y un modo simplificado. La verificación técnica de accesibilidad es sólida, mientras que la validación con personas reales sigue pendiente.`)]),
  parr([negrita("Objetivo específico 1 (implementar las funcionalidades principales). "), normal("Se implementaron los módulos de lectura accesible, voz a texto y accesibilidad de la consigna, además de la cámara con reconocimiento de texto. El módulo multimedia (subtítulos automáticos y controles de reproducción de video) no se implementó porque pertenece a la discapacidad auditiva, fuera del alcance decidido y justificado en la sección 3.2.")]),
  parr([negrita("Objetivo específico 2 (corregir problemas de usabilidad). "), normal("Se aplicaron diez mejoras (Tabla " + NT.mejoras + "): dos responden a los hallazgos de la evaluación heurística, cinco a problemas observados al probar en el dispositivo, dos a defectos revelados por las pruebas automáticas y una a la consigna. Queda pendiente el tercer hallazgo heurístico, la detección de los bordes del documento en la cámara.")]),
  parr([negrita("Objetivo específico 3 (pruebas con usuarios representativos). "), normal(`Se realizó mediante simulación de ${G.n} usuarios de cuatro perfiles. En ella la media global de la encuesta fue ${f2(G.likertGlobal)} sobre 5, la tasa de éxito de las tareas ${f1(G.exito)} % y los errores medios ${f2(G.errores)} por tarea, con tres afirmaciones por debajo del 70 % de acuerdo: reconocimiento de la voz, cámara y uso exclusivo por voz. Estos resultados son indicativos y no sustituyen la prueba con personas reales.`)]),
  parr([negrita("Objetivo específico 4 (validar criterios de accesibilidad). "), normal("Los tres esquemas de color superan el contraste de 7:1 del nivel AAA en todos los roles, los elementos pulsables miden al menos 48 dp y cuentan con etiqueta para lectores de pantalla tras corregir un defecto real hallado por las pruebas. Se cumplen los cuatro principios de las WCAG 2.2 con la evidencia de la Tabla " + NT.pour + ". Falta verificar el comportamiento con TalkBack en un teléfono físico.")]),
  parr([negrita("Objetivo específico 5 (documentar resultados y mejoras). "), normal("El informe documenta las mejoras con su origen, los resultados reales y los simulados claramente rotulados, y el código se publica en un repositorio abierto, con pruebas automáticas que permiten reproducir las verificaciones.")]),
  parr([negrita("Sobre el sitio de referencia. "), normal(`La auditoría del portal de la ONPE mostró un sitio con buena práctica en texto alternativo pero con ${aud.enlacesVacios} enlaces vacíos y una estructura de navegación que el lector actual de VÍA aprovecha poco, lo que define una línea de mejora concreta.`)]),
];

// =============================== 7. RECOMENDACIONES ===============================
const s7 = [
  h1(7, "Recomendaciones"),
  parr([negrita("1. Realizar el trabajo de campo con usuarios reales. "), normal("Aplicar la encuesta de Likert y las cuatro tareas a entre cinco y ocho personas con discapacidad visual y a adultos mayores, y comparar los resultados con esta simulación. Es la acción de mayor prioridad, porque la simulación no puede descubrir problemas desconocidos.")]),
  parr([negrita("2. Mejorar la robustez del reconocimiento de voz. "), normal("Es la afirmación peor valorada (P3). Se recomienda repetir en voz alta lo entendido y pedir confirmación en comandos de efecto importante, ampliar las frases aceptadas y ofrecer siempre una alternativa táctil visible, además de probar el sistema con ruido ambiental real.")]),
  parr([negrita("3. Facilitar el cambio de ajustes por voz. "), normal("Añadir comandos como «letra más grande» y «letra más pequeña», y sustituir o complementar los deslizadores por botones de aumento y disminución, más fáciles de operar con un lector de pantalla (escenario E3).")]),
  parr([negrita("4. Leer las listas de enlaces como menús. "), normal("El portal de la ONPE mostró que una página basada en navegación se reduce a muy poco texto. El lector debería anunciar los grupos de enlaces («menú con 12 opciones») y permitir recorrerlos.")]),
  parr([negrita("5. Mejorar la guía de la cámara. "), normal("Detectar los bordes del documento y la distancia con una biblioteca de escaneo de documentos para decir «acércate» o «el documento está cortado», lo que atiende al tercer hallazgo heurístico y a la valoración más baja de las personas ciegas en la cámara.")]),
  parr([negrita("6. Verificar con TalkBack en un teléfono físico. "), normal("Completar las pruebas automáticas con un recorrido de las pantallas con el lector de pantalla activado, registrando el orden de foco y los anuncios.")]),
  parr([negrita("7. Ampliar la encuesta. "), normal("Complementar el Likert con la escala SUS planteada en la segunda entrega y con las preguntas abiertas de la guía de observación (Anexo B), que permiten recoger dificultades que una escala no captura.")]),
  parr([negrita("8. Evaluar nuevas funciones. "), normal("Dictado de la dirección web por voz, compatibilidad con línea braille por Bluetooth y, si se amplía el alcance, subtítulos automáticos para personas con discapacidad auditiva.")]),
];

// =============================== REFERENCIAS ===============================
const refs = [
  h1Sin("Referencias"),
  refHanging([normal("Adnin, R., y Das, M. (2024). \"I look at it as the king of knowledge\": How blind people use and understand generative AI tools. En "), cita("Proceedings of the 26th International ACM SIGACCESS Conference on Computers and Accessibility"), normal(" (pp. 1-17). Association for Computing Machinery. https://doi.org/10.1145/3663548.3675631")]),
  refHanging([normal("Bigham, J. P., Jayant, C., Ji, H., Little, G., Miller, A., Miller, R. C., Miller, R., Tatarowicz, A., White, B., White, S., y Yeh, T. (2010). VizWiz: Nearly real-time answers to visual questions. En "), cita("Proceedings of the 23rd Annual ACM Symposium on User Interface Software and Technology"), normal(" (pp. 333-342). Association for Computing Machinery. https://doi.org/10.1145/1866029.1866080")]),
  refHanging([normal("Cronbach, L. J. (1951). Coefficient alpha and the internal structure of tests. "), cita("Psychometrika, 16"), normal("(3), 297-334. https://doi.org/10.1007/BF02310555")]),
  refHanging([normal("Gurari, D., Li, Q., Stangl, A. J., Guo, A., Lin, C., Grauman, K., Luo, J., y Bigham, J. P. (2018). VizWiz Grand Challenge: Answering visual questions from blind people. En "), cita("2018 IEEE/CVF Conference on Computer Vision and Pattern Recognition"), normal(" (pp. 3608-3617). IEEE. https://doi.org/10.1109/CVPR.2018.00380")]),
  refHanging([normal("Likert, R. (1932). A technique for the measurement of attitudes. "), cita("Archives of Psychology, 22"), normal("(140), 1-55.")]),
  refHanging([normal("Nielsen, J. (1994). Heuristic evaluation. En J. Nielsen y R. L. Mack (Eds.), "), cita("Usability Inspection Methods"), normal(" (pp. 25-62). John Wiley & Sons.")]),
  refHanging([normal("Norman, D. A. (2013). "), cita("The design of everyday things"), normal(" (ed. rev. y ampl.). Basic Books.")]),
  refHanging([normal("Oficina Nacional de Procesos Electorales. (2026). "), cita("Portal institucional"), normal(" [Sitio web, consultado el 4 de noviembre de 2026]. https://www.onpe.gob.pe")]),
  refHanging([normal("Shneiderman, B. (2000). Universal usability. "), cita("Communications of the ACM, 43"), normal("(5), 84-91. https://doi.org/10.1145/332833.332843")]),
  refHanging([normal("Story, M. F., Mueller, J. L., y Mace, R. L. (1998). "), cita("The universal design file: Designing for people of all ages and abilities"), normal(". Center for Universal Design, North Carolina State University.")]),
  refHanging([normal("WebAIM. (2026). "), cita("The WebAIM Million: The 2026 report on the accessibility of the top 1,000,000 home pages"), normal(". Utah State University. https://webaim.org/projects/million/")]),
  refHanging([normal("World Wide Web Consortium. (2021). "), cita("Making content usable for people with cognitive and learning disabilities"), normal(" [Nota del grupo de trabajo]. W3C. https://www.w3.org/TR/coga-usable/")]),
  refHanging([normal("World Wide Web Consortium. (2023). "), cita("Web Content Accessibility Guidelines (WCAG) 2.2"), normal(". W3C. https://www.w3.org/TR/WCAG22/")]),
];

// =============================== ANEXOS ===============================
const guia = [
  ["A. Experiencia inicial y configuración", ["¿Te resultó fácil configurar tu perfil de accesibilidad al ingresar a la aplicación?", "¿Pudiste seleccionar tu tipo de necesidad visual sin dificultad?", "¿Te pareció sencillo iniciar la aplicación utilizando únicamente comandos de voz?", "¿Consideras que las instrucciones de voz son claras y fáciles de entender?"]],
  ["B. Navegación por voz", ["¿La aplicación reconoce correctamente las órdenes que le das mediante tu voz?", "¿Te resulta cómodo navegar por la aplicación sin utilizar las manos?", "¿Tuviste alguna dificultad al utilizar los comandos de voz?", "¿Consideras que la velocidad de lectura de la voz es adecuada?"]],
  ["C. Lector adaptativo", ["¿El lector de voz pudo leer correctamente el contenido de las páginas web?", "¿Consideras que la información leída es clara y comprensible?", "¿El tamaño del texto y el contraste facilitan la lectura?", "¿Te gustaría que la aplicación pudiera leer más tipos de documentos?"]],
  ["D. Cámara con inteligencia artificial (Ojo IA)", ["¿Te resultó fácil utilizar la cámara mediante las indicaciones de voz?", "¿La aplicación pudo reconocer correctamente el texto de las fotografías o documentos?", "¿Consideras útil que la aplicación te indique si existe suficiente iluminación o si la cámara está bien enfocada?", "¿Qué dificultades encontraste al utilizar esta función?"]],
  ["E. Satisfacción y mejora", ["¿Consideras que VÍA facilita tu acceso a la información digital?", "¿Utilizarías esta aplicación en tus actividades diarias?", "¿Qué función te pareció más útil?", "¿Qué mejorarías o agregarías a la aplicación?"]],
];
let numPreg = 0;
const anexoA = [
  h1Sin("Anexo A. Encuesta en escala de Likert (versión para aplicar)"),
  parr("Instrucciones para el participante: «Indica qué tan de acuerdo estás con cada afirmación, de 1 (totalmente en desacuerdo) a 5 (totalmente de acuerdo). No hay respuestas correctas o incorrectas». Este es el instrumento que se aplicaría a personas reales; el estudio de este informe lo simula."),
  tablaC([600, 5360, 700, 700, 700, 650, 650], [
    ["N.°", "Afirmación", "1", "2", "3", "4", "5"],
    ...d.items.map((i) => [i.n, i.texto, "☐", "☐", "☐", "☐", "☐"]),
  ], 19, 2),
  notaTabla("1 = totalmente en desacuerdo; 2 = en desacuerdo; 3 = ni de acuerdo ni en desacuerdo; 4 = de acuerdo; 5 = totalmente de acuerdo."),
];
const anexoB = [
  h1Sin("Anexo B. Guía de preguntas de observación durante el uso"),
  parr("Guía elaborada por el equipo para realizar durante el uso de la aplicación. De ella se derivaron las diez afirmaciones de la escala de Likert; las preguntas abiertas se recomiendan para recoger la información cualitativa."),
  ...guia.flatMap(([titulo, preguntas]) => [
    new Paragraph({ keepNext: true, spacing: { before: 160, after: 60 }, children: [new TextRun({ text: titulo, bold: true, size: 24 })] }),
    ...preguntas.map((p) => new Paragraph({ spacing: { after: 40, line: 276, lineRule: "auto" }, indent: { left: 360 }, children: [new TextRun({ text: `${++numPreg}. ${p}`, size: 22 })] })),
  ]),
];
const anexoC = [
  h1Sin("Anexo C. Datos de la simulación y parámetros"),
  aviso("Datos simulados.", "Las tablas de este anexo no contienen respuestas de personas reales."),
  parr(`La Tabla ${NT.datos} reproduce las respuestas simuladas de cada participante (P01 a P12). Los perfiles son CT = ceguera total, BV = baja visión, AM = adulto mayor y CB = conocimientos tecnológicos básicos o dificultad cognitiva leve.`),
  ...cap("datos", "Respuestas simuladas por participante (escala de 1 a 5)"),
  tablaC([900, 800, ...Array(10).fill(766)], [
    ["Part.", "Perfil", ...d.items.map((i) => "P" + i.n)],
    ...d.participantes.map((p) => [p.id, p.perfil, ...p.resp]),
  ], 18, 1),
  notaTabla(`Datos simulados con semilla ${d.semilla}. El archivo datos_simulados.csv incluye además los tiempos, errores y éxito de cada tarea.`),
  parr(`La Tabla ${NT.parametros} muestra las medias esperadas que se fijaron antes de generar los datos, por afirmación y perfil, junto con su justificación.`),
  new Paragraph({ children: [] }),
];
// tabla de parámetros: se lee desde el script (medias esperadas)
const mu = (() => {
  const src = fs.readFileSync(path.join(__dirname, "tercera", "simulacion.js"), "utf8");
  const filas = [];
  const re = /\{ n: (\d+), corto: "([^"]+)".*?mu: \{ CT: ([\d.]+), BV: ([\d.]+), AM: ([\d.]+), CB: ([\d.]+) \} \}/gs;
  let m; while ((m = re.exec(src))) filas.push([`P${m[1]}. ${m[2]}`, m[3], m[4], m[5], m[6]]);
  return filas;
})();
anexoC.pop();
anexoC.push(
  ...cap("parametros", "Medias esperadas fijadas antes de la simulación (supuestos del equipo)"),
  tablaC([3800, 1390, 1390, 1390, 1390], [["Afirmación", "CT", "BV", "AM", "CB"], ...mu], 19, 1),
  notaTabla("Desviación de cada respuesta: 0.6; efecto propio de cada participante: 0.35. Estos supuestos reflejan las limitaciones conocidas del sistema (por ejemplo, menor valoración de la cámara para personas ciegas)."),
);
const anexoD = [
  h1Sin("Anexo D. Evidencias técnicas reproducibles"),
  parr("Las verificaciones reales de esta entrega se reproducen con los siguientes comandos, ejecutados desde la carpeta del proyecto:"),
  new Paragraph({ spacing: { before: 80, after: 80, line: 276, lineRule: "auto" }, shading: { type: ShadingType.CLEAR, fill: "F2F2F2" }, children: [
    new TextRun({ text: "flutter analyze", font: "Consolas", size: 20 }), new TextRun({ text: "    → No issues found", size: 20, break: 0 }),
    new TextRun({ text: "flutter test", font: "Consolas", size: 20, break: 1 }), new TextRun({ text: "    → 20 pruebas aprobadas, 0 fallidas", size: 20 }),
    new TextRun({ text: "dart run tool/auditoria_web.dart https://www.onpe.gob.pe", font: "Consolas", size: 20, break: 1 }), new TextRun({ text: "    → resultados de la Tabla " + NT.onpe, size: 20 }),
  ] }),
  parr("Las 20 pruebas cubren: contraste de los tres esquemas de color (3 pruebas), áreas táctiles y etiquetas semánticas en los tres esquemas (3), comportamiento del modo simplificado en Ajustes (3), persistencia del ajuste en JSON y compatibilidad con versiones antiguas (2), reconocimiento de comandos de voz, incluidas las variantes de «IA» y el nuevo comando «modo simple» (3), y las pruebas de lógica de la primera versión (6)."),
];
const anexoE = [
  h1Sin("Anexo E. Código fuente de la aplicación"),
  parr("El código completo de la aplicación se publica en un repositorio de GitHub:"),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "https://github.com/Senni23/via-aplicacion", bold: true, size: 24 })] }),
  parr(`El repositorio contiene la aplicación (carpeta lib/, ${codApp.archivos} archivos y ${miles(codApp.lineas)} líneas), las pruebas automáticas (carpeta test/), la herramienta de auditoría web (carpeta tool/), la documentación de diseño (carpeta docs/) y los entregables en Word y PDF. Para ejecutarla se requiere el SDK de Flutter: flutter pub get para instalar las dependencias y flutter run para iniciarla en un teléfono Android o en un navegador.`),
];
const W3 = [3120, 3120, 3120];
const pant = (n, ley, alt) => celdaImagen(3120, img(E1 + `image${n}.png`, "png", 150, 325, alt), ley);
const anexoF = [
  h1Sin("Anexo F. Prototipo de diseño de la primera entrega"),
  parr("Las seis pantallas del prototipo de alta fidelidad que sirvió de base para la implementación (390 × 844 puntos)."),
  ...fig("prototipo", "Prototipo de alta fidelidad: pantallas P-01 a P-06"),
  tablaImagenes(W3, [
    filaImagenes([pant(3, "P-01. Perfil de accesibilidad", "Pantalla P-01"), pant(4, "P-02. Inicio con escucha activa", "Pantalla P-02"), pant(5, "P-03. Lector adaptativo", "Pantalla P-03")]),
    filaImagenes([pant(6, "P-04. Ojo IA con guía de captura", "Pantalla P-04"), pant(7, "P-05. Ajustes de accesibilidad", "Pantalla P-05"), pant(8, "P-06. Asistencia humana", "Pantalla P-06")]),
  ]),
  notaTabla("Elaboración propia."),
];

const doc = new Document({
  creator: "Equipo VÍA",
  title: "VÍA: validación, mejoras e implementación funcional — Tercera entrega",
  styles: {
    default: { document: { run: { font: "Times New Roman", size: 24 }, paragraph: { spacing: { line: 480, lineRule: "auto" } } } },
    paragraphStyles: [
      { id: "TOC1", name: "toc 1", basedOn: "Normal", next: "Normal", paragraph: { spacing: { line: 276, lineRule: "auto", before: 100, after: 40 } }, run: { bold: true, size: 22 } },
      { id: "TOC2", name: "toc 2", basedOn: "Normal", next: "Normal", paragraph: { spacing: { line: 276, lineRule: "auto", after: 30 }, indent: { left: 240 } }, run: { size: 21 } },
      { id: "TOC3", name: "toc 3", basedOn: "Normal", next: "Normal", paragraph: { spacing: { line: 276, lineRule: "auto", after: 30 }, indent: { left: 480 } }, run: { size: 20 } },
    ],
  },
  numbering: { config: [{ reference: "objetivos", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
  features: { updateFields: true },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440, header: 708, footer: 708 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "VÍA — Tercera entrega", size: 18, color: "595959" })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ size: 18, color: "595959", children: [PageNumber.CURRENT] })] })] }) },
    children: [
      ...caratula, salto(), ...indice, salto(), ...presentacion, salto(),
      ...s1, ...s2, ...s3, ...s4, ...s5, ...s6, ...s7, salto(), ...refs, salto(),
      ...anexoA, salto(), ...anexoB, salto(), ...anexoC, salto(), ...anexoD, ...anexoE, salto(), ...anexoF,
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const salida = path.join(RAIZ, "docs", "entregables", "VIA_Tercera_Entrega_Informe.docx");
  fs.writeFileSync(salida, buf);
  console.log("OK", salida, `tablas=${tablaActual} figuras=${figuraActual}`);
});
