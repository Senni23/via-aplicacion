// Simulación de usuarios para la tercera entrega.
// IMPORTANTE: estos datos NO provienen de personas reales. Son una simulación
// reproducible (semilla fija) permitida por la consigna cuando no se puede
// hacer trabajo de campo. Los parámetros se fijaron ANTES de generar los
// datos; los resultados se reportan tal como salen, sin retocarlos.
const fs = require("fs");
const path = require("path");

const SEMILLA = 20261104;
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(SEMILLA);
function normal() {
  const u = Math.max(rnd(), 1e-12), v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function poisson(l) {
  const L = Math.exp(-l); let k = 0, p = 1;
  do { k++; p *= rnd(); } while (p > L);
  return k - 1;
}
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

// ---------- participantes simulados ----------
const PERFILES = {
  CT: "Ceguera total",
  BV: "Baja visión",
  AM: "Adulto mayor",
  CB: "Conocimientos tecnológicos básicos / dificultad cognitiva leve",
};
const participantes = [
  ["P01", "CT", 34], ["P02", "CT", 41], ["P03", "CT", 52],
  ["P04", "BV", 29], ["P05", "BV", 47], ["P06", "BV", 58],
  ["P07", "AM", 67], ["P08", "AM", 71], ["P09", "AM", 74],
  ["P10", "CB", 26], ["P11", "CB", 38], ["P12", "CB", 45],
].map(([id, perfil, edad]) => ({ id, perfil, edad }));

// ---------- instrumento Likert (10 afirmaciones) ----------
const ITEMS = [
  { n: 1, corto: "Configurar el perfil", texto: "Configurar mi perfil de accesibilidad al iniciar la aplicación fue fácil.", principio: "Operable", indicador: "Facilidad de uso", obj: "O3",
    mu: { CT: 4.0, BV: 4.4, AM: 4.0, CB: 4.2 } },
  { n: 2, corto: "Uso solo con voz", texto: "Pude usar la aplicación únicamente con comandos de voz.", principio: "Operable", indicador: "Facilidad de uso", obj: "O3",
    mu: { CT: 4.1, BV: 4.0, AM: 3.6, CB: 3.9 } },
  { n: 3, corto: "Reconoce mi voz", texto: "La aplicación reconoció correctamente lo que le dije.", principio: "Robusto", indicador: "Errores", obj: "O3",
    mu: { CT: 3.8, BV: 3.8, AM: 3.3, CB: 3.8 } },
  { n: 4, corto: "Voz clara y veloz", texto: "Las instrucciones habladas son claras y la velocidad de la voz es adecuada.", principio: "Comprensible", indicador: "Facilidad de uso", obj: "O3",
    mu: { CT: 4.4, BV: 4.3, AM: 4.5, CB: 4.4 } },
  { n: 5, corto: "Lector de páginas", texto: "El lector leyó correctamente el contenido de páginas web y documentos.", principio: "Perceptible", indicador: "Facilidad de uso", obj: "O3",
    mu: { CT: 4.1, BV: 4.0, AM: 3.9, CB: 3.9 } },
  { n: 6, corto: "Texto y contraste", texto: "El tamaño del texto y el contraste de colores facilitan la lectura.", principio: "Perceptible", indicador: "Facilidad de uso", obj: "O3",
    mu: { CT: 4.2, BV: 4.8, AM: 4.6, CB: 4.4 } },
  { n: 7, corto: "Cámara Ojo IA", texto: "La cámara (Ojo IA) me guió bien y reconoció el texto del documento.", principio: "Perceptible", indicador: "Errores", obj: "O3",
    mu: { CT: 3.2, BV: 3.8, AM: 3.5, CB: 3.8 } },
  { n: 8, corto: "Modo simplificado", texto: "El modo simplificado hace la aplicación más fácil de usar.", principio: "Comprensible", indicador: "Facilidad de uso", obj: "O3",
    mu: { CT: 4.0, BV: 4.0, AM: 4.5, CB: 4.8 } },
  { n: 9, corto: "Ayuda ante errores", texto: "Cuando me equivoqué, la aplicación me ayudó a corregirlo.", principio: "Comprensible", indicador: "Errores", obj: "O3",
    mu: { CT: 4.1, BV: 4.1, AM: 4.0, CB: 4.2 } },
  { n: 10, corto: "Autonomía y uso diario", texto: "VÍA me permite acceder de forma autónoma a la información digital y la usaría a diario.", principio: "General", indicador: "Satisfacción", obj: "OG",
    mu: { CT: 4.1, BV: 4.2, AM: 3.9, CB: 4.1 } },
];
const SD_RESP = 0.6; // dispersión de cada respuesta
const SD_PART = 0.35; // "benevolencia" propia de cada participante

for (const p of participantes) p.efecto = normal() * SD_PART;
for (const p of participantes) {
  p.resp = ITEMS.map((it) => clamp(Math.round(it.mu[p.perfil] + p.efecto + normal() * SD_RESP), 1, 5));
}

// ---------- escenarios de prueba ----------
const ESC = [
  { id: "E1", nombre: "Escuchar un documento con lectura automática",
    base: { CT: 45, BV: 38, AM: 52, CB: 55 }, err: { CT: 0.3, BV: 0.2, AM: 0.4, CB: 0.4 }, exito: { CT: 0.98, BV: 0.98, AM: 0.95, CB: 0.95 } },
  { id: "E2", nombre: "Dar una orden por voz y llegar a la pantalla correcta",
    base: { CT: 24, BV: 22, AM: 34, CB: 30 }, err: { CT: 0.5, BV: 0.5, AM: 0.9, CB: 0.6 }, exito: { CT: 0.92, BV: 0.92, AM: 0.8, CB: 0.88 } },
  { id: "E3", nombre: "Activar opciones de accesibilidad (modo simplificado y tamaño de letra)",
    base: { CT: 70, BV: 44, AM: 66, CB: 52 }, err: { CT: 0.7, BV: 0.4, AM: 0.8, CB: 0.4 }, exito: { CT: 0.88, BV: 0.95, AM: 0.85, CB: 0.92 } },
  { id: "E4", nombre: "Leer un recibo impreso con la cámara (Ojo IA)",
    base: { CT: 110, BV: 70, AM: 95, CB: 88 }, err: { CT: 1.1, BV: 0.7, AM: 0.9, CB: 0.8 }, exito: { CT: 0.75, BV: 0.9, AM: 0.8, CB: 0.85 } },
];
for (const p of participantes) {
  p.tareas = ESC.map((e) => ({
    esc: e.id,
    tiempo: Math.round(e.base[p.perfil] * Math.exp(normal() * 0.22)),
    errores: poisson(e.err[p.perfil]),
    exito: rnd() < e.exito[p.perfil] ? 1 : 0,
  }));
}

// ---------- estadística ----------
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };
const mediana = (a) => { const b = [...a].sort((x, y) => x - y); const m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
const r = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;

const itemsStats = ITEMS.map((it, i) => {
  const v = participantes.map((p) => p.resp[i]);
  const dist = [1, 2, 3, 4, 5].map((k) => v.filter((x) => x === k).length);
  const porPerfil = {};
  for (const k of Object.keys(PERFILES)) porPerfil[k] = r(mean(participantes.filter((p) => p.perfil === k).map((p) => p.resp[i])));
  return { n: it.n, corto: it.corto, texto: it.texto, principio: it.principio, indicador: it.indicador,
    media: r(mean(v)), de: r(sd(v)), mediana: mediana(v), dist, acuerdo: r(((dist[3] + dist[4]) / v.length) * 100, 1),
    desacuerdo: r(((dist[0] + dist[1]) / v.length) * 100, 1), porPerfil };
});

function alfaCronbach() {
  const k = ITEMS.length;
  const cols = ITEMS.map((_, i) => participantes.map((p) => p.resp[i]));
  const varItems = cols.map((c) => sd(c) ** 2);
  const totales = participantes.map((p) => p.resp.reduce((s, x) => s + x, 0));
  return (k / (k - 1)) * (1 - varItems.reduce((s, x) => s + x, 0) / sd(totales) ** 2);
}

const grupos = {};
for (const it of itemsStats) {
  (grupos[it.indicador] = grupos[it.indicador] || []).push(it.media);
}
const indicadores = Object.fromEntries(Object.entries(grupos).map(([k, v]) => [k, r(mean(v))]));
const porPrincipio = {};
for (const it of itemsStats) (porPrincipio[it.principio] = porPrincipio[it.principio] || []).push(it.media);
const principios = Object.fromEntries(Object.entries(porPrincipio).map(([k, v]) => [k, r(mean(v))]));

const escStats = ESC.map((e, j) => {
  const t = participantes.map((p) => p.tareas[j]);
  const porPerfil = {};
  for (const k of Object.keys(PERFILES)) {
    const tt = participantes.filter((p) => p.perfil === k).map((p) => p.tareas[j]);
    porPerfil[k] = { tiempo: r(mean(tt.map((x) => x.tiempo)), 0), errores: r(mean(tt.map((x) => x.errores))), exito: r(mean(tt.map((x) => x.exito)) * 100, 0) };
  }
  return { id: e.id, nombre: e.nombre, tiempo: r(mean(t.map((x) => x.tiempo)), 1), deTiempo: r(sd(t.map((x) => x.tiempo)), 1),
    errores: r(mean(t.map((x) => x.errores))), exito: r(mean(t.map((x) => x.exito)) * 100, 1), porPerfil };
});
const todas = participantes.flatMap((p) => p.tareas);
const global = {
  exito: r(mean(todas.map((x) => x.exito)) * 100, 1),
  errores: r(mean(todas.map((x) => x.errores))),
  tiempo: r(mean(todas.map((x) => x.tiempo)), 1),
  likertGlobal: r(mean(itemsStats.map((i) => i.media))),
  alfa: r(alfaCronbach(), 2),
  n: participantes.length,
  acuerdoGlobal: r(mean(itemsStats.map((i) => i.acuerdo)), 1),
};
const porPerfilGlobal = {};
for (const k of Object.keys(PERFILES)) {
  const ps = participantes.filter((p) => p.perfil === k);
  porPerfilGlobal[k] = r(mean(ps.map((p) => mean(p.resp))));
}

const salida = { aviso: "DATOS SIMULADOS - no provienen de personas reales", semilla: SEMILLA, perfiles: PERFILES, participantes, items: ITEMS.map(({ mu, ...x }) => x), escenarios: ESC.map((e) => ({ id: e.id, nombre: e.nombre })), itemsStats, escStats, global, indicadores, principios, porPerfilGlobal };
const dir = __dirname;
fs.writeFileSync(path.join(dir, "datos_simulados.json"), JSON.stringify(salida, null, 2));

// CSV de respuestas
const cab = ["Participante", "Perfil", "Edad", ...ITEMS.map((i) => `P${i.n}`), ...ESC.flatMap((e) => [`${e.id}_tiempo_s`, `${e.id}_errores`, `${e.id}_exito`])];
const filas = participantes.map((p) => [p.id, p.perfil, p.edad, ...p.resp, ...p.tareas.flatMap((t) => [t.tiempo, t.errores, t.exito])]);
fs.writeFileSync(path.join(dir, "datos_simulados.csv"), [cab, ...filas].map((f) => f.join(",")).join("\n"));

console.log("=== ITEMS ===");
for (const i of itemsStats) console.log(`P${i.n} ${i.corto.padEnd(24)} media ${i.media} DE ${i.de} acuerdo ${i.acuerdo}%`);
console.log("=== GLOBAL ===", JSON.stringify(global));
console.log("=== INDICADORES ===", JSON.stringify(indicadores), JSON.stringify(principios));
console.log("=== POR PERFIL ===", JSON.stringify(porPerfilGlobal));
console.log("=== ESCENARIOS ===");
for (const e of escStats) console.log(`${e.id} tiempo ${e.tiempo}s (DE ${e.deTiempo}) errores ${e.errores} exito ${e.exito}%`);
