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

function pie(slide, n) {
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
    { text: "Integrantes: ", options: { bold: true, color: SOFT, breakLine: false } },
    { text: "Enrique Sebastian Poma Nizama — U23200217", options: { color: TXT } },
  ], { x: 0.9, y: 6.3, w: 10.5, h: 0.8, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 13, lineSpacingMultiple: 1.3 });
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
  pie(s, 2);
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
  pie(s, 3);
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
  pie(s, 4);
}

// ============ 5. METODOLOGÍA DCU ============
{
  const s = pres.addSlide();
  fondo(s);
  kicker(s, "Metodología");
  titulo(s, "Las cinco etapas del Diseño Centrado en el Usuario");

  const etapas = [
    ["1", "Empatizar", "Revisión de literatura sobre accesibilidad para personas ciegas"],
    ["2", "Definir", "22 requisitos funcionales y 11 no funcionales"],
    ["3", "Idear", "Sistema de diseño con contraste verificado matemáticamente"],
    ["4", "Prototipar", "De maqueta a prototipo navegable en Flutter"],
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
  pie(s, 5);
}

// ============ 6. ARQUITECTURA ============
{
  const s = pres.addSlide();
  fondo(s);
  kicker(s, "Cómo se organizó el trabajo");
  titulo(s, "Cuatro capas, cada una con un único trabajo");

  const capas = [
    ["core/", "Tema visual, accesibilidad (voz + vibración + anuncio), comandos de voz", ACC],
    ["data/", "Modelos y servicios — cada paquete externo vive envuelto en un único archivo", INFO],
    ["features/", "Una carpeta por pantalla: la vista dibuja, el controlador decide", OK],
    ["shared/", "Botones y tarjetas reutilizados en varias pantallas", SOFT],
  ];
  capas.forEach(([t, d, c], i) => {
    const y = 2.0 + i * 1.12;
    tarjeta(s, 0.6, y, 12.1, 0.95, { fill: SURF });
    s.addShape("rect", { x: 0.6, y, w: 0.1, h: 0.95, fill: { color: c }, line: { type: "none" } });
    s.addText(t, { x: 1.0, y: y + 0.08, w: 2.1, h: 0.8, isTextBox: true, margin: 0, valign: "middle", fontFace: "Consolas", bold: true, fontSize: 18, color: c });
    s.addText(d, { x: 3.2, y: y + 0.08, w: 9.2, h: 0.8, isTextBox: true, margin: 0, valign: "middle", fontFace: FONT_B, fontSize: 14, color: TXT });
  });

  s.addText("Regla que no se negocia: ningún widget llama a un paquete externo directamente.", {
    x: 0.6, y: 6.6, w: 12.1, h: 0.5, isTextBox: true, margin: 0, fontFace: FONT_B, italic: true, fontSize: 13, color: SOFT, align: "center",
  });
  pie(s, 6);
}

// ============ 7. HERRAMIENTAS ============
{
  const s = pres.addSlide();
  fondo(s);
  kicker(s, "Stack tecnológico");
  titulo(s, "Herramientas y para qué se usó cada una");

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
  pie(s, 7);
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
  pie(s, 8);
}

// ============ 9. EVALUACIÓN HEURÍSTICA ============
{
  const s = pres.addSlide();
  fondo(s);
  kicker(s, "Evaluación");
  titulo(s, "Diez heurísticas de Nielsen, aplicadas al diseño");

  tarjeta(s, 0.6, 1.95, 3.6, 4.4, { fill: SURF, line: OK });
  s.addText("10 / 10", { x: 0.6, y: 2.3, w: 3.6, h: 1.0, isTextBox: true, margin: 0, align: "center", fontFace: FONT_H, bold: true, fontSize: 44, color: OK });
  s.addText("heurísticas cumplidas en el recorrido del prototipo", { x: 0.95, y: 3.3, w: 2.9, h: 0.9, isTextBox: true, margin: 0, align: "center", fontFace: FONT_B, fontSize: 13, color: SOFT });
  s.addText("Ej.: cada acción se confirma por voz + vibración + lector de pantalla a la vez.", { x: 0.95, y: 4.5, w: 2.9, h: 1.6, isTextBox: true, margin: 0, align: "center", fontFace: FONT_B, italic: true, fontSize: 11.5, color: SOFT, lineSpacingMultiple: 1.3 });

  tarjeta(s, 4.45, 1.95, 8.25, 4.4, { fill: SURF, line: ACC });
  s.addText("3 hallazgos de mejora, documentados con severidad", { x: 4.8, y: 2.15, w: 7.6, h: 0.4, isTextBox: true, margin: 0, fontFace: FONT_B, bold: true, fontSize: 15, color: ACC });
  const hallazgos = [
    "Comandos no descubribles al inicio — falta un comando \u201cayuda\u201d que los liste (ya corregido)",
    "Silencio durante procesos largos (OCR, descarga web) sin progreso audible intermedio",
    "Guía de encuadre de cámara mide solo luz, no bordes del documento — limitación documentada",
  ];
  hallazgos.forEach((h, i) => {
    const y = 2.75 + i * 1.1;
    s.addShape("ellipse", { x: 4.8, y: y + 0.07, w: 0.18, h: 0.18, fill: { color: ACC }, line: { type: "none" } });
    s.addText(h, { x: 5.15, y: y - 0.05, w: 7.3, h: 1.0, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 12.5, color: SOFT, lineSpacingMultiple: 1.25 });
  });
  pie(s, 9);
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
  s.addText("68", { x: 7.0, y: 4.2, w: 2.2, h: 1.0, isTextBox: true, margin: 0, fontFace: FONT_H, bold: true, fontSize: 44, color: OK });
  s.addText("puntos sobre 100 — el umbral de \u201cusabilidad aceptable\u201d que se usará como meta", { x: 9.2, y: 4.35, w: 3.2, h: 1.1, isTextBox: true, margin: 0, fontFace: FONT_B, fontSize: 12, color: SOFT, valign: "middle", lineSpacingMultiple: 1.25 });
  pie(s, 10);
}

// ============ 11. CONCLUSIONES ============
{
  const s = pres.addSlide();
  fondo(s);
  kicker(s, "Cierre");
  titulo(s, "Conclusiones");

  const concl = [
    ["Primera", "El diseño pasó de maqueta a prototipo navegable, con decisiones de interacción respaldadas en voz, vibración y alto contraste a la vez."],
    ["Segunda", "El alcance acotado a discapacidad visual permitió profundidad real, respaldada por el marco teórico del curso."],
    ["Tercera", "La evaluación heurística encontró cumplimiento sólido y tres mejoras honestas — no fue un ejercicio confirmatorio."],
    ["Cuarta", "El protocolo SUS con usuarios reales es el paso inmediato pendiente, antes del lanzamiento final."],
  ];
  concl.forEach(([n, t], i) => {
    const y = 2.0 + i * 1.22;
    s.addText(n, { x: 0.6, y, w: 2.0, h: 1.0, isTextBox: true, margin: 0, fontFace: FONT_H, bold: true, fontSize: 17, color: ACC });
    s.addText(t, { x: 2.7, y, w: 9.9, h: 1.0, isTextBox: true, margin: 0, valign: "middle", fontFace: FONT_B, fontSize: 14.5, color: TXT, lineSpacingMultiple: 1.3 });
  });
  pie(s, 11);
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
