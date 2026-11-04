// Genera los gráficos del análisis (HTML con SVG) a partir de datos_simulados.json.
const fs = require("fs");
const path = require("path");
const d = JSON.parse(fs.readFileSync(path.join(__dirname, "datos_simulados.json"), "utf8"));

const FONT = "Segoe UI, Arial, sans-serif";
const AZUL = "#1F5FA6", AZUL2 = "#7FB2E5", NARANJA = "#C75B12", GRIS = "#8A8F98", TXT = "#1A1A1A", RAYA = "#D5D9DF";

function pagina(w, h, cuerpo) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#fff}</style></head><body>` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="${FONT}">` +
    `<rect width="${w}" height="${h}" fill="#fff"/>${cuerpo}</svg></body></html>`;
}
const t = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 14}" fill="${o.fill || TXT}" text-anchor="${o.anchor || "start"}" font-weight="${o.bold ? 700 : 400}">${s}</text>`;

// ---------- Gráfico 1: media por afirmación ----------
{
  const W = 1200, H = 560, izq = 250, der = 290, arriba = 64, abajo = 60;
  const ancho = W - izq - der, alto = H - arriba - abajo, n = d.itemsStats.length, paso = alto / n, barra = paso * 0.58;
  const x = (v) => izq + ((v - 1) / 4) * ancho;
  let s = "";
  for (let v = 1; v <= 5; v++) {
    s += `<line x1="${x(v)}" y1="${arriba}" x2="${x(v)}" y2="${arriba + alto}" stroke="${RAYA}"/>` + t(x(v), arriba + alto + 22, v, { anchor: "middle", size: 13 });
  }
  s += t(izq + ancho + 24, arriba - 12, "Media · % de acuerdo", { size: 13, bold: true });
  d.itemsStats.forEach((it, i) => {
    const y = arriba + i * paso + (paso - barra) / 2;
    const bajo = it.acuerdo < 70;
    s += t(izq - 12, y + barra / 2 + 5, `P${it.n}. ${it.corto}`, { anchor: "end", size: 14 });
    s += `<rect x="${x(1)}" y="${y}" width="${x(it.media) - x(1)}" height="${barra}" fill="${bajo ? NARANJA : AZUL}" rx="3"/>`;
    s += t(izq + ancho + 24, y + barra / 2 + 5, `${it.media.toFixed(2)}  ·  ${it.acuerdo}%`, { size: 14, bold: bajo, fill: bajo ? NARANJA : TXT });
  });
  s += `<line x1="${x(4)}" y1="${arriba - 6}" x2="${x(4)}" y2="${arriba + alto}" stroke="${TXT}" stroke-width="2" stroke-dasharray="6 4"/>` + t(x(4), arriba - 12, "Meta: 4.0", { anchor: "middle", size: 13, bold: true });
  s += t(izq + ancho / 2, H - 14, "Media de respuestas (1 = totalmente en desacuerdo, 5 = totalmente de acuerdo)", { anchor: "middle", size: 14 });
  s += `<rect x="${izq}" y="14" width="14" height="14" fill="${AZUL}" rx="2"/>` + t(izq + 20, 26, "≥ 70 % de acuerdo", { size: 13 });
  s += `<rect x="${izq + 170}" y="14" width="14" height="14" fill="${NARANJA}" rx="2"/>` + t(izq + 190, 26, "< 70 % (prioridad)", { size: 13 });
  fs.writeFileSync(path.join(__dirname, "g1_medias.html"), pagina(W, H, s));
}

// ---------- Gráfico 2: distribución de respuestas ----------
{
  const W = 1100, H = 560, izq = 250, der = 40, arriba = 56, abajo = 30;
  const ancho = W - izq - der, alto = H - arriba - abajo, n = d.itemsStats.length, paso = alto / n, barra = paso * 0.62;
  const col = ["#B5470B", "#E59A5B", "#C9CDD3", "#7FB2E5", "#1F5FA6"];
  const txtcol = ["#fff", TXT, TXT, TXT, "#fff"];
  const nombres = ["Totalmente en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Totalmente de acuerdo"];
  let s = "";
  nombres.forEach((nm, k) => {
    const lx = izq + k * 150;
    s += `<rect x="${lx}" y="10" width="14" height="14" fill="${col[k]}" rx="2"/>` + t(lx + 20, 22, nm.replace("Totalmente", "Total."), { size: 12 });
  });
  d.itemsStats.forEach((it, i) => {
    const y = arriba + i * paso + (paso - barra) / 2;
    s += t(izq - 12, y + barra / 2 + 5, `P${it.n}. ${it.corto}`, { anchor: "end", size: 14 });
    let acc = 0;
    it.dist.forEach((c, k) => {
      const w = (c / d.global.n) * ancho;
      if (c > 0) {
        s += `<rect x="${izq + acc}" y="${y}" width="${w}" height="${barra}" fill="${col[k]}"/>`;
        if (w > 26) s += t(izq + acc + w / 2, y + barra / 2 + 5, Math.round((c / d.global.n) * 100) + "%", { anchor: "middle", size: 12, fill: txtcol[k], bold: true });
      }
      acc += w;
    });
  });
  fs.writeFileSync(path.join(__dirname, "g2_distribucion.html"), pagina(W, H, s));
}

// ---------- Gráfico 3: tiempo por escenario y perfil ----------
{
  const W = 1100, H = 520, izq = 70, der = 30, arriba = 50, abajo = 80;
  const ancho = W - izq - der, alto = H - arriba - abajo;
  const perfiles = Object.keys(d.perfiles);
  const colores = { CT: "#1F5FA6", BV: "#E59A5B", AM: "#4C9A6A", CB: "#8A6FC2" };
  const nombres = { CT: "Ceguera total", BV: "Baja visión", AM: "Adulto mayor", CB: "Tec. básica / cognitiva leve" };
  const maxT = 130;
  const y = (v) => arriba + alto - (v / maxT) * alto;
  let s = "";
  for (let v = 0; v <= maxT; v += 20) {
    s += `<line x1="${izq}" y1="${y(v)}" x2="${izq + ancho}" y2="${y(v)}" stroke="${RAYA}"/>` + t(izq - 10, y(v) + 4, v, { anchor: "end", size: 12 });
  }
  const grupo = ancho / d.escStats.length;
  d.escStats.forEach((e, gi) => {
    const gx = izq + gi * grupo, bw = (grupo * 0.78) / perfiles.length;
    perfiles.forEach((p, pi) => {
      const v = e.porPerfil[p].tiempo, bx = gx + grupo * 0.11 + pi * bw;
      s += `<rect x="${bx}" y="${y(v)}" width="${bw - 4}" height="${y(0) - y(v)}" fill="${colores[p]}" rx="2"/>` + t(bx + (bw - 4) / 2, y(v) - 6, v, { anchor: "middle", size: 12 });
    });
    s += t(gx + grupo / 2, y(0) + 24, e.id, { anchor: "middle", size: 14, bold: true });
  });
  perfiles.forEach((p, pi) => {
    const lx = izq + pi * 255;
    s += `<rect x="${lx}" y="${H - 28}" width="14" height="14" fill="${colores[p]}" rx="2"/>` + t(lx + 20, H - 16, nombres[p], { size: 13 });
  });
  s += t(18, arriba + alto / 2, "Tiempo medio (segundos)", { size: 13, anchor: "middle" }).replace("<text ", `<text transform="rotate(-90 18 ${arriba + alto / 2})" `);
  fs.writeFileSync(path.join(__dirname, "g3_tiempos.html"), pagina(W, H, s));
}
console.log("HTML de gráficos generados");
