const pptxgen = require("pptxgenjs");

const BG = "0B0F14";
const SURF = "151A21";
const SURF2 = "1F2630";
const BORDE = "39424F";
const TXT = "FFFFFF";
const SOFT = "B9C2CE";
const ACC = "FFD400";
const INFO = "4DD0FF";
const OK = "5BE39A";
const ERR = "FF8080";

const FONT_H = "Cambria";
const FONT_B = "Calibri";

function nuevaPres() {
  const p = new pptxgen();
  p.defineLayout({ name: "VIA", width: 13.333, height: 7.5 });
  p.layout = "VIA";
  return p;
}

function fondo(slide, color = BG) {
  slide.background = { color };
}

function kicker(slide, texto, opts = {}) {
  slide.addText(texto.toUpperCase(), {
    x: 0.6, y: opts.y ?? 0.5, w: 10, h: 0.35, isTextBox: true, margin: 0,
    fontFace: FONT_B, fontSize: 12.5, bold: true, color: ACC, charSpacing: 2,
  });
}

function titulo(slide, texto, opts = {}) {
  slide.addText(texto, {
    x: 0.6, y: opts.y ?? 0.85, w: opts.w ?? 11.9, h: opts.h ?? 0.9, isTextBox: true, margin: 0,
    fontFace: FONT_H, fontSize: opts.size ?? 32, bold: true, color: TXT,
  });
}

function pie(slide) {
  const n = pres.slides.length;
  slide.addText(`VÍA · ${n}`, {
    x: 11.9, y: 7.12, w: 1.2, h: 0.3, isTextBox: true, margin: 0,
    fontFace: FONT_B, fontSize: 9, color: SOFT, align: "right",
  });
}

function tarjeta(slide, x, y, w, h, opts = {}) {
  slide.addShape("roundRect", {
    x, y, w, h, rectRadius: 0.1,
    fill: { color: opts.fill ?? SURF },
    line: { color: opts.line ?? BORDE, width: 1 },
  });
}

const pres = nuevaPres();

// ============ 1. PORTADA ============
{
  const s = pres.addSlide();
  fondo(s);
  s.addShape("roundRect", { x: 0.9, y: 1.5, w: 1.1, h: 1.1, rectRadius: 0.12, fill: { color: ACC }, line: { type: "none" } });
  s.addText("V", { x: 0.9, y: 1.5, w: 1.1, h: 1.1, isTextBox: true, margin: 0, align: "center", valign: "middle", fontFace: FONT_H, bold: true, fontSize: 40, color: BG });
  s.addText("VÍA", { x: 2.25, y: 1.55, w: 6, h: 0.6, isTextBox: true, margin: 0, fontFace: FONT_H, bold: true, fontSize: 30, color: TXT });
  s.addText("Voz, Imagen y Accesibilidad", { x: 2.25, y: 2.1, w: 6, h: 0.4, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 14, color: SOFT });

  s.addText("Diseño, prototipado y evaluación inicial\nde una aplicación inclusiva", {
    x: 0.9, y: 3.15, w: 10.5, h: 1.5, isTextBox: true, margin: 0,
    fontFace: FONT_H, fontSize: 40, bold: true, color: TXT, lineSpacingMultiple: 1.08,
  });
  s.addText("Segunda entrega — avance del proyecto", {
    x: 0.9, y: 4.65, w: 10, h: 0.5, isTextBox: true, margin: 0, fontFace: FONT_B, italic: true, fontSize: 16, color: INFO,
  });

  s.addText([
    { text: "Curso: ", options: { bold: true, color: SOFT } },
    { text: "Interacción entre Hombre y Máquina\n", options: { color: TXT } },
    { text: "Integrantes: ", options: { bold: true, color: SOFT } },
    { text: "Enrique Sebastian Poma Nizama — U23200217 · José Leonardo Rodríguez\n", options: { color: TXT } },
    { text: "Docente: ", options: { bold: true, color: SOFT } },
    { text: "David William Cota Sencara", options: { color: TXT } },
  ], { x: 0.9, y: 5.75, w: 11.5, h: 1.3, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 13, lineSpacingMultiple: 1.3 });
}

// ============ 2. EL PROBLEMA EN NÚMEROS ============
{
  const s = pres.addSlide();
  fondo(s);
  kicker(s, "El problema");
  titulo(s, "La información digital sigue siendo inaccesible");

  const stats = [
    ["2 200 M", "de personas en el mundo viven con alguna deficiencia visual (OMS)", ACC],
    ["95.9 %", "de las páginas web más visitadas falla al menos una norma de accesibilidad (WebAIM)", INFO],
    ["61 %", "de las personas con discapacidad en el Perú declara una limitación para ver (INEI)", OK],
  ];
  stats.forEach(([num, label, color], i) => {
    const x = 0.6 + i * 4.12;
    tarjeta(s, x, 2.1, 3.85, 3.4);
    s.addText(num, { x: x + 0.3, y: 2.45, w: 3.25, h: 1.1, isTextBox: true, margin: 0, fontFace: FONT_H, bold: true, fontSize: 48, color });
    s.addText(label, { x: x + 0.3, y: 3.55, w: 3.25, h: 1.7, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 15, color: SOFT, lineSpacingMultiple: 1.25 });
  });

  s.addText("VÍA no corrige la web ajena: corrige cómo esa web llega al usuario.", {
    x: 0.6, y: 5.85, w: 11.4, h: 0.6, isTextBox: true, margin: 0, fontFace: FONT_H, italic: true, fontSize: 18, color: TXT, align: "center",
  });
  pie(s);
}

// ============ 3. QUÉ ES VÍA ============
{
  const s = pres.addSlide();
  fondo(s);
  kicker(s, "La propuesta");
  titulo(s, "Una capa de accesibilidad sobre cualquier contenido");

  s.addText(
    "VÍA es una aplicación móvil que recibe una página web, un documento o una fotografía, y devuelve la misma información en un formato que una persona con discapacidad visual sí puede percibir: voz, texto ampliado de alto contraste, o próximamente, línea braille.\n\nToda la app se piensa y se opera por voz, de principio a fin.",
    { x: 0.6, y: 2.1, w: 5.6, h: 3.6, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 16.5, color: SOFT, lineSpacingMultiple: 1.4 }
  );

  const mods = [
    ["🔊", "Lector adaptativo", "Reconstruye páginas web con jerarquía y alto contraste"],
    ["📷", "Ojo IA", "Cámara con guía por voz + lectura de texto (OCR)"],
    ["🎙️", "Navegación por voz", "Toda la app se opera hablando, en español"],
    ["🎨", "Perfiles de accesibilidad", "Ceguera, baja visión o daltonismo, configurado una vez"],
  ];
  mods.forEach(([icono, t, d], i) => {
    const col = i % 2, fila = Math.floor(i / 2);
    const x = 6.55 + col * 3.1;
    const y = 2.1 + fila * 1.85;
    tarjeta(s, x, y, 2.9, 1.65, { fill: SURF2 });
    s.addText(icono, { x: x + 0.2, y: y + 0.15, w: 0.8, h: 0.6, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 26 });
    s.addText(t, { x: x + 0.2, y: y + 0.75, w: 2.55, h: 0.4, isTextBox: true, margin: 0, fontFace: FONT_B, bold: true, fontSize: 13, color: TXT });
    s.addText(d, { x: x + 0.2, y: y + 1.15, w: 2.55, h: 0.5, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 10.5, color: SOFT, lineSpacingMultiple: 1.15 });
  });
  pie(s);
}

// ============ 4. DECISIÓN DE ALCANCE ============
{
  const s = pres.addSlide();
  fondo(s);
  kicker(s, "Decisión de diseño");
  titulo(s, "Profundidad, no amplitud");

  s.addText(
    "La consigna pide cubrir 5 poblaciones: visual, auditiva, motora, cognitiva y adultos mayores. Decidimos mantener el alcance en discapacidad visual, como ya definía la primera entrega.",
    { x: 0.6, y: 2.0, w: 11.8, h: 1.1, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 17, color: TXT, lineSpacingMultiple: 1.3 }
  );

  tarjeta(s, 0.6, 3.35, 5.7, 3.1, { fill: SURF, line: ERR });
  s.addText("Diseñar para 5 a la vez", { x: 0.95, y: 3.6, w: 5, h: 0.4, isTextBox: true, margin: 0, fontFace: FONT_B, bold: true, fontSize: 15, color: ERR });
  s.addText("Cinco soluciones superficiales, sin investigación específica de cada grupo, en el tiempo de un curso.", { x: 0.95, y: 4.05, w: 5, h: 2.2, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 13.5, color: SOFT, lineSpacingMultiple: 1.3 });

  tarjeta(s, 6.9, 3.35, 5.8, 3.1, { fill: SURF, line: OK });
  s.addText("Profundizar en una", { x: 7.25, y: 3.6, w: 5.2, h: 0.4, isTextBox: true, margin: 0, fontFace: FONT_B, bold: true, fontSize: 15, color: OK });
  s.addText("Una solución investigada, con colores verificados matemáticamente y un plan de prueba con usuarios reales.", { x: 7.25, y: 4.05, w: 5.2, h: 2.2, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 13.5, color: SOFT, lineSpacingMultiple: 1.3 });

  s.addText("Respaldo teórico: Shneiderman (2000) — interfaces multicapa sobre perfiles concretos, no un diseño único para un usuario \u201cpromedio\u201d inexistente.", {
    x: 0.6, y: 6.7, w: 11.8, h: 0.5, isTextBox: true, margin: 0, fontFace: FONT_B, italic: true, fontSize: 12, color: SOFT,
  });
  pie(s);
}

// ============ 5. OBJETIVOS ============
{
  const s = pres.addSlide();
  fondo(s);
  kicker(s, "Objetivos");
  titulo(s, "Qué buscamos lograr");

  tarjeta(s, 0.6, 2.0, 5.2, 4.6, { fill: SURF, line: ACC });
  s.addText("Objetivo general", { x: 0.95, y: 2.25, w: 4.5, h: 0.4, isTextBox: true, margin: 0, fontFace: FONT_B, bold: true, fontSize: 15, color: ACC });
  s.addText("Proponer el diseño de una aplicación móvil que facilite el acceso autónomo a la información digital a las personas con discapacidad visual en el Perú, combinando síntesis de voz, visión por computador y adaptación automática de contenidos conforme a las pautas WCAG 2.2.", {
    x: 0.95, y: 2.75, w: 4.5, h: 3.6, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 15, color: TXT, lineSpacingMultiple: 1.35,
  });

  s.addText("Objetivos específicos", { x: 6.2, y: 2.0, w: 6.4, h: 0.4, isTextBox: true, margin: 0, fontFace: FONT_B, bold: true, fontSize: 15, color: INFO });
  const esp = [
    "Identificar las barreras de accesibilidad digital que enfrentan las personas con discapacidad visual (revisión documental y entrevistas).",
    "Definir los requisitos funcionales y no funcionales a partir del diseño universal y de WCAG 2.2.",
    "Diseñar la arquitectura funcional y el prototipo de alta fidelidad, priorizando la voz y el alto contraste.",
    "Evaluar la usabilidad del prototipo con usuarios: pruebas de tareas y escala SUS.",
  ];
  esp.forEach((t, i) => {
    const y = 2.55 + i * 1.05;
    s.addShape("ellipse", { x: 6.2, y: y + 0.05, w: 0.55, h: 0.55, fill: { color: SURF2 }, line: { color: INFO, width: 1.5 } });
    s.addText(String(i + 1), { x: 6.2, y: y + 0.05, w: 0.55, h: 0.55, isTextBox: true, margin: 0, align: "center", valign: "middle", fontFace: FONT_H, bold: true, fontSize: 16, color: INFO });
    s.addText(t, { x: 6.95, y, w: 5.75, h: 0.95, isTextBox: true, margin: 0, valign: "middle", fontFace: FONT_B, fontSize: 13, color: SOFT, lineSpacingMultiple: 1.2 });
  });
  pie(s);
}

// ============ 6. MARCO TEÓRICO ============
{
  const s = pres.addSlide();
  fondo(s);
  kicker(s, "Marco teórico");
  titulo(s, "Cuatro bases que sustentan el diseño");

  const bases = [
    ["Diseño universal", "Story, Mueller y Mace (1998)", "Siete principios para que un producto sirva a la mayor cantidad de personas sin adaptaciones posteriores.", "VÍA entrega el mismo contenido íntegro por un canal distinto, y en modos redundantes: voz, contraste y vibración.", ACC],
    ["Diseño centrado en el usuario", "Norman (2013)", "La usabilidad depende de las affordances, los significantes y la retroalimentación.", "Sin pantalla visible, cada acción se anuncia antes y se confirma después por voz y vibración.", INFO],
    ["Usabilidad universal", "Shneiderman (2000)", "Interfaces multicapa que sirven a la diversidad de usuarios, en vez de un usuario «promedio» inexistente.", "Perfiles de accesibilidad y niveles de detalle: titulares, resumen o texto completo.", OK],
    ["WCAG 2.2", "W3C (2023)", "Contenido perceptible, operable, comprensible y robusto: el estándar internacional.", "Es el criterio del analizador y también la norma que la propia interfaz debe cumplir.", SOFT],
  ];
  bases.forEach(([t, autor, teoria, enVia, c], i) => {
    const x = 0.6 + i * 3.08;
    tarjeta(s, x, 2.0, 2.85, 4.7, { fill: SURF });
    s.addText(t, { x: x + 0.2, y: 2.2, w: 2.45, h: 0.7, isTextBox: true, margin: 0, fontFace: FONT_B, bold: true, fontSize: 15, color: c, valign: "top" });
    s.addText(autor, { x: x + 0.2, y: 2.95, w: 2.45, h: 0.35, isTextBox: true, margin: 0, fontFace: FONT_B, italic: true, fontSize: 11, color: SOFT });
    s.addText(teoria, { x: x + 0.2, y: 3.35, w: 2.45, h: 1.35, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 12, color: TXT, lineSpacingMultiple: 1.2, valign: "top" });
    s.addText("En VÍA", { x: x + 0.2, y: 4.8, w: 2.45, h: 0.3, isTextBox: true, margin: 0, fontFace: FONT_B, bold: true, fontSize: 11, color: c });
    s.addText(enVia, { x: x + 0.2, y: 5.12, w: 2.45, h: 1.45, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 11.5, color: SOFT, lineSpacingMultiple: 1.2, valign: "top" });
  });
  pie(s);
}

// ============ 7. ESTADO DEL ARTE ============
{
  const s = pres.addSlide();
  fondo(s);
  kicker(s, "Estado del arte");
  titulo(s, "Qué existe y qué brecha deja");

  const cab = (t) => ({ text: t, options: { bold: true, color: BG, fill: { color: ACC }, fontFace: FONT_B, fontSize: 13 } });
  const cel = (t, bold = false, color = SOFT) => ({ text: t, options: { bold, color, fill: { color: SURF }, fontFace: FONT_B, fontSize: 12 } });
  s.addTable([
    [cab("Antecedente"), cab("Brecha que persiste"), cab("Respuesta de VÍA")],
    [cel("Bigham et al. (2010)\nVizWiz", true, TXT), cel("Depende de voluntarios disponibles de manera permanente; no escala ni opera sin conexión."), cel("La asistencia humana queda como respaldo excepcional; el modo sin conexión cubre las funciones básicas.")],
    [cel("Gurari et al. (2018)\nVizWiz Grand Challenge", true, TXT), cel("El 28 % de las fotografías tomadas por usuarios ciegos resulta ininterpretable por problemas de captura."), cel("La cámara guía por voz el encuadre y la iluminación antes de disparar, no después.")],
    [cel("Adnin y Das (2024)\nIA generativa y usuarios ciegos", true, TXT), cel("Las propias interfaces de IA no son accesibles y sus respuestas contienen sesgos capacitistas."), cel("Interfaz diseñada conforme a WCAG 2.2 desde el inicio; descripciones en lenguaje neutro.")],
  ], { x: 0.6, y: 2.0, w: 12.1, colW: [3.0, 4.6, 4.5], border: { type: "solid", color: BORDE, pt: 1 }, margin: [0.12, 0.15, 0.12, 0.15], valign: "middle" });

  s.addText("Cada módulo de VÍA responde a una limitación documentada en la literatura revisada.", {
    x: 0.6, y: 6.15, w: 12.1, h: 0.5, isTextBox: true, margin: 0, fontFace: FONT_H, italic: true, fontSize: 16, color: TXT, align: "center",
  });
  pie(s);
}

// ============ 8. METODOLOGÍA DCU ============
{
  const s = pres.addSlide();
  fondo(s);
  kicker(s, "Metodología");
  titulo(s, "Las cinco etapas del Diseño Centrado en el Usuario");

  const etapas = [
    ["1", "Empatizar", "Revisión de literatura sobre accesibilidad para personas ciegas"],
    ["2", "Definir", "22 requisitos funcionales y 11 no funcionales"],
    ["3", "Idear", "Sistema de diseño con contraste verificado matemáticamente"],
    ["4", "Prototipar", "Prototipo de alta fidelidad de seis pantallas"],
    ["5", "Evaluar", "Heurísticas de Nielsen + protocolo SUS"],
  ];
  etapas.forEach(([n, t, d], i) => {
    const x = 0.6 + i * 2.43;
    s.addShape("ellipse", { x: x + 0.75, y: 2.3, w: 0.9, h: 0.9, fill: { color: i === 4 ? ACC : SURF2 }, line: { color: ACC, width: 2 } });
    s.addText(n, { x: x + 0.75, y: 2.3, w: 0.9, h: 0.9, isTextBox: true, margin: 0, align: "center", valign: "middle", fontFace: FONT_H, bold: true, fontSize: 24, color: i === 4 ? BG : ACC });
    if (i < 4) s.addShape("line", { x: x + 1.65, y: 2.75, w: 0.78, h: 0, line: { color: BORDE, width: 2 } });
    s.addText(t, { x, y: 3.45, w: 2.4, h: 0.4, isTextBox: true, margin: 0, align: "center", fontFace: FONT_B, bold: true, fontSize: 15, color: TXT });
    s.addText(d, { x: x + 0.08, y: 3.9, w: 2.25, h: 1.6, isTextBox: true, margin: 0, align: "center", fontFace: FONT_B, fontSize: 11.5, color: SOFT, lineSpacingMultiple: 1.25 });
  });

  tarjeta(s, 0.6, 5.85, 12.1, 1.0, { fill: SURF });
  s.addText("De las cinco, la evaluación tiene DOS niveles: una heurística ya ejecutada por el equipo, y un protocolo con usuarios reales (escala SUS) formulado y pendiente de ejecutarse.", {
    x: 0.95, y: 6.0, w: 11.4, h: 0.7, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 13, color: SOFT, valign: "middle", lineSpacingMultiple: 1.25,
  });
  pie(s);
}

// ============ 9. ARQUITECTURA FUNCIONAL ============
{
  const s = pres.addSlide();
  fondo(s);
  kicker(s, "Cómo funciona");
  titulo(s, "Arquitectura funcional: cuatro capas");

  const capas = [
    ["CAPA 1", "Entrada multimodal", ["Voz en español peruano", "Gestos (áreas ≥ 44 px)", "Cámara", "URL o archivo"], ACC],
    ["CAPA 2", "Motor de procesamiento", ["Analizador WCAG 2.2", "Visión por computador (OCR)", "Simplificador semántico"], INFO],
    ["CAPA 3", "Adaptación al perfil", ["Ceguera total", "Baja visión", "Daltonismo", "Ayuda humana de respaldo"], OK],
    ["CAPA 4", "Salida accesible", ["Voz sintetizada (0.5× a 3×)", "Alto contraste (15.8:1)", "Línea braille por Bluetooth", "Retroalimentación háptica"], SOFT],
  ];
  capas.forEach(([n, t, items, c], i) => {
    const x = 0.6 + i * 3.08;
    s.addShape("roundRect", { x, y: 2.0, w: 2.85, h: 3.95, rectRadius: 0.1, fill: { color: SURF }, line: { color: c, width: 1.75 } });
    s.addText(n, { x: x + 0.22, y: 2.18, w: 2.4, h: 0.3, isTextBox: true, margin: 0, fontFace: FONT_B, bold: true, fontSize: 11, color: c, charSpacing: 2 });
    s.addText(t, { x: x + 0.22, y: 2.5, w: 2.45, h: 0.75, isTextBox: true, margin: 0, fontFace: FONT_H, bold: true, fontSize: 16, color: TXT, valign: "top" });
    items.forEach((it, k) => {
      s.addText(it, { x: x + 0.22, y: 3.4 + k * 0.62, w: 2.45, h: 0.5, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 12.5, color: SOFT, valign: "middle" });
    });
  });

  s.addText("El usuario interactúa con la capa 1 y percibe el resultado de la capa 4; las dos intermedias operan de forma invisible para él.", {
    x: 0.6, y: 6.25, w: 12.1, h: 0.6, isTextBox: true, margin: 0, fontFace: FONT_B, italic: true, fontSize: 13.5, color: SOFT, align: "center",
  });
  pie(s);
}

// ============ 10. HERRAMIENTAS ============
{
  const s = pres.addSlide();
  fondo(s);
  kicker(s, "Stack tecnológico");
  titulo(s, "Herramientas y para qué se usa cada una");

  const col1 = [
    ["Flutter + Dart", "Framework y lenguaje — una sola base de código para Android e iOS"],
    ["provider", "Comparte el estado (ajustes) entre toda la app, sin pasarlo pantalla por pantalla"],
    ["flutter_tts", "Síntesis de voz (texto → voz), con el motor nativo del sistema"],
    ["speech_to_text", "Reconocimiento de voz (voz → texto), con el reconocedor nativo de Android"],
  ];
  const col2 = [
    ["camera + google_mlkit", "Acceso a la cámara y reconocimiento óptico de texto (OCR), en el dispositivo"],
    ["http + html", "Descarga y analiza páginas web para el lector adaptativo"],
    ["shared_preferences", "Guarda los ajustes del usuario en el propio celular"],
    ["Android Studio / VS Code", "Entorno de desarrollo, SDK de Android y edición de código"],
  ];
  [col1, col2].forEach((col, ci) => {
    col.forEach(([t, d], i) => {
      const x = 0.6 + ci * 6.15;
      const y = 2.05 + i * 1.18;
      s.addText(t, { x, y, w: 5.8, h: 0.4, isTextBox: true, margin: 0, fontFace: "Consolas", bold: true, fontSize: 14.5, color: ACC });
      s.addText(d, { x, y: y + 0.38, w: 5.8, h: 0.7, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 12.5, color: SOFT, lineSpacingMultiple: 1.2 });
    });
  });
  pie(s);
}

// ============ 8. CÓMO FUNCIONA EL COMANDO DE VOZ ============
{
  const s = pres.addSlide();
  fondo(s);
  kicker(s, "Respuesta técnica");
  titulo(s, "¿Qué tecnología usamos para el comando de voz?");

  const pasos = [
    ["🗣️", "El usuario habla", "\u201cOjo IA\u201d, \u201cleer documento\u201d, etc."],
    ["📱", "El sistema operativo escucha", "El reconocedor de voz nativo de Android (el mismo que usa Google en todo el teléfono) convierte el audio en texto"],
    ["📝", "VÍA recibe texto", "El paquete speech_to_text entrega ese texto a la app"],
    ["✅", "VÍA interpreta el comando", "Compara el texto contra una lista de frases conocidas y ejecuta la acción"],
  ];
  pasos.forEach(([icono, t, d], i) => {
    const x = 0.6 + i * 3.08;
    tarjeta(s, x, 2.0, 2.85, 2.6, { fill: SURF2 });
    s.addText(icono, { x, y: 2.15, w: 2.85, h: 0.7, isTextBox: true, margin: 0, align: "center", fontFace: FONT_B, fontSize: 32 });
    s.addText(t, { x: x + 0.15, y: 2.9, w: 2.55, h: 0.55, isTextBox: true, margin: 0, align: "center", fontFace: FONT_B, bold: true, fontSize: 13, color: TXT });
    s.addText(d, { x: x + 0.15, y: 3.5, w: 2.55, h: 1.0, isTextBox: true, margin: 0, align: "center", fontFace: FONT_B, fontSize: 10.5, color: SOFT, lineSpacingMultiple: 1.25 });
    if (i < 3) s.addText("→", { x: x + 2.78, y: 2.75, w: 0.6, h: 0.6, isTextBox: true, margin: 0, fontFace: FONT_B, bold: true, fontSize: 24, color: ACC });
  });

  tarjeta(s, 0.6, 4.95, 12.1, 1.75, { fill: SURF, line: ACC });
  s.addText("En otras palabras", { x: 0.95, y: 5.1, w: 11.4, h: 0.35, isTextBox: true, margin: 0, fontFace: FONT_B, bold: true, fontSize: 13.5, color: ACC });
  s.addText(
    "VÍA no entrena ni aloja su propio modelo de inteligencia artificial para reconocer voz. Usa el paquete speech_to_text de Flutter, que delega esa tarea al reconocedor de voz que ya trae instalado el sistema operativo del celular (en Android, el servicio de reconocimiento de voz de Google). Para que la app hable, se usa el paquete complementario flutter_tts, que también usa el motor de voz nativo del equipo.",
    { x: 0.95, y: 5.48, w: 11.4, h: 1.15, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 12.5, color: SOFT, lineSpacingMultiple: 1.3 }
  );
  pie(s);
}

// ============ 9. EVALUACIÓN HEURÍSTICA ============
{
  const s = pres.addSlide();
  fondo(s);
  kicker(s, "Evaluación");
  titulo(s, "Diez heurísticas de Nielsen, aplicadas al diseño");

  tarjeta(s, 0.6, 1.95, 3.6, 4.4, { fill: SURF, line: OK });
  s.addText("10 / 10", { x: 0.6, y: 2.3, w: 3.6, h: 1.0, isTextBox: true, margin: 0, align: "center", fontFace: FONT_H, bold: true, fontSize: 44, color: OK });
  s.addText("heurísticas cumplidas en el recorrido del prototipo de alta fidelidad", { x: 0.95, y: 3.3, w: 2.9, h: 0.9, isTextBox: true, margin: 0, align: "center", fontFace: FONT_B, fontSize: 13, color: SOFT });
  s.addText("Ej.: cada acción se confirma por voz + vibración + lector de pantalla a la vez.", { x: 0.95, y: 4.5, w: 2.9, h: 1.6, isTextBox: true, margin: 0, align: "center", fontFace: FONT_B, italic: true, fontSize: 11.5, color: SOFT, lineSpacingMultiple: 1.3 });

  tarjeta(s, 4.45, 1.95, 8.25, 4.4, { fill: SURF, line: ACC });
  s.addText("3 hallazgos de mejora, documentados con severidad", { x: 4.8, y: 2.15, w: 7.6, h: 0.4, isTextBox: true, margin: 0, fontFace: FONT_B, bold: true, fontSize: 15, color: ACC });
  const hallazgos = [
    "Comandos no descubribles al inicio: falta un comando \u201cayuda\u201d que los liste",
    "Silencio durante procesos largos (OCR, descarga web) sin progreso audible intermedio",
    "Guía de encuadre: la luz es fácil de medir, pero detectar los bordes del documento requiere una biblioteca más pesada (trabajo futuro)",
  ];
  hallazgos.forEach((h, i) => {
    const y = 2.75 + i * 1.1;
    s.addShape("ellipse", { x: 4.8, y: y + 0.07, w: 0.18, h: 0.18, fill: { color: ACC }, line: { type: "none" } });
    s.addText(h, { x: 5.15, y: y - 0.05, w: 7.3, h: 1.0, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 12.5, color: SOFT, lineSpacingMultiple: 1.25 });
  });
  pie(s);
}

// ============ 10. PROTOCOLO SUS ============
{
  const s = pres.addSlide();
  fondo(s);
  kicker(s, "Siguiente paso");
  titulo(s, "Protocolo de evaluación con usuarios");

  s.addText("Formulado y listo para ejecutarse con 3 a 5 personas, antes de la presentación de lanzamiento.", {
    x: 0.6, y: 1.85, w: 11.8, h: 0.5, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 15, color: SOFT,
  });

  tarjeta(s, 0.6, 2.55, 5.7, 3.9, { fill: SURF });
  s.addText("5 tareas a cronometrar", { x: 0.95, y: 2.75, w: 5, h: 0.4, isTextBox: true, margin: 0, fontFace: FONT_B, bold: true, fontSize: 15, color: TXT });
  const tareas = ["Elegir perfil de accesibilidad sin ayuda", "Decir \u201cleer documento\u201d y escuchar el resultado", "Pausar y reanudar la lectura por voz", "Cambiar la velocidad de voz en Ajustes", "Decir \u201cayuda humana\u201d y llegar a P-06"];
  tareas.forEach((t, i) => {
    s.addText(`${i + 1}.`, { x: 0.95, y: 3.3 + i * 0.5, w: 0.4, h: 0.4, isTextBox: true, margin: 0, fontFace: FONT_B, bold: true, fontSize: 13, color: ACC });
    s.addText(t, { x: 1.4, y: 3.3 + i * 0.5, w: 4.7, h: 0.4, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 12.5, color: SOFT });
  });

  tarjeta(s, 6.65, 2.55, 6.05, 3.9, { fill: SURF, line: INFO });
  s.addText("Escala SUS (Brooke, 1996)", { x: 7.0, y: 2.75, w: 5.4, h: 0.4, isTextBox: true, margin: 0, fontFace: FONT_B, bold: true, fontSize: 15, color: INFO });
  s.addText("10 preguntas, puntuadas de 1 a 5, sobre qué tan usable percibe el participante que es la app.", { x: 7.0, y: 3.2, w: 5.4, h: 0.8, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 12.5, color: SOFT, lineSpacingMultiple: 1.3 });
  s.addText("80", { x: 7.0, y: 4.2, w: 2.2, h: 1.0, isTextBox: true, margin: 0, fontFace: FONT_H, bold: true, fontSize: 44, color: OK });
  s.addText("puntos sobre 100: la meta del proyecto (el mínimo de usabilidad aceptable es 68)", { x: 9.2, y: 4.35, w: 3.2, h: 1.1, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 12, color: SOFT, valign: "middle", lineSpacingMultiple: 1.25 });
  pie(s);
}

// ============ 13. REFERENCIAS ============
{
  const s = pres.addSlide();
  fondo(s);
  kicker(s, "Fuentes");
  titulo(s, "Referencias principales");

  const refs1 = [
    "Adnin, R., y Das, M. (2024). How blind people use and understand generative AI tools. ACM SIGACCESS ASSETS.",
    "Bigham, J. P., et al. (2010). VizWiz: Nearly real-time answers to visual questions. ACM UIST.",
    "Brooke, J. (1996). SUS: A “quick and dirty” usability scale. Taylor & Francis.",
    "Gurari, D., et al. (2018). VizWiz Grand Challenge: Answering visual questions from blind people. IEEE CVPR.",
    "INEI. (2018). Perú: Perfil sociodemográfico de la población con discapacidad, 2017.",
    "Nielsen, J. (1994). Heuristic evaluation. En Usability Inspection Methods. Wiley.",
  ];
  const refs2 = [
    "Norman, D. A. (2013). The design of everyday things. Basic Books.",
    "Organización Mundial de la Salud. (2026). Ceguera y discapacidad visual.",
    "Shneiderman, B. (2000). Universal usability. Communications of the ACM, 43(5).",
    "Story, M. F., Mueller, J. L., y Mace, R. L. (1998). The universal design file. NC State University.",
    "WebAIM. (2026). The WebAIM Million: 2026 report on the accessibility of the top 1,000,000 home pages.",
    "World Wide Web Consortium. (2023). Web Content Accessibility Guidelines (WCAG) 2.2.",
  ];
  [refs1, refs2].forEach((col, ci) => {
    col.forEach((r, i) => {
      s.addText(r, { x: 0.6 + ci * 6.15, y: 2.0 + i * 0.78, w: 5.85, h: 0.7, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 12, color: SOFT, lineSpacingMultiple: 1.15, valign: "top" });
    });
  });
  pie(s);
}

// ============ 12. GRACIAS ============
{
  const s = pres.addSlide();
  fondo(s);
  s.addShape("roundRect", { x: 5.6, y: 2.0, w: 1.1, h: 1.1, rectRadius: 0.12, fill: { color: ACC }, line: { type: "none" } });
  s.addText("V", { x: 5.6, y: 2.0, w: 1.1, h: 1.1, isTextBox: true, margin: 0, align: "center", valign: "middle", fontFace: FONT_H, bold: true, fontSize: 40, color: BG });
  s.addText("Gracias", { x: 0.6, y: 3.4, w: 12.1, h: 1.1, isTextBox: true, margin: 0, align: "center", fontFace: FONT_H, bold: true, fontSize: 44, color: TXT });
  s.addText("¿Preguntas?", { x: 0.6, y: 4.5, w: 12.1, h: 0.6, isTextBox: true, margin: 0, align: "center", fontFace: FONT_B, italic: true, fontSize: 18, color: INFO });
}

pres.writeFile({ fileName: "C:\\Users\\Sebastian Poma N\\Documents\\Ciclo8\\HombreYMquina\\via-app\\via-app\\docs\\entregables\\VIA_Segunda_Entrega.pptx" })
  .then(() => console.log("PPTX generado OK"));
