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


module.exports = { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, AlignmentType, ImageRun, PageBreak, TableOfContents, Header, Footer, PageNumber, LevelFormat, VerticalAlign, fs,
  AZUL_H1, GRIS_NOTA, BORDE_TABLA, BORDE_CELDA_INTERNA, parr, cita, normal, negrita, h1, h1Sin, h2, h3, rotulo, tablaCaption, figuraCaption, notaTabla, celda, tabla, codigo, salto, centrado, espacio, refHanging, objetivo, img, imagenCentrada, celdaImagen, filaImagenes, tablaImagenes, BUILD, E1, WEB };
