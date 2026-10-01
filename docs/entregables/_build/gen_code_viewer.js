const fs = require("fs");
const path = require("path");

const LIB = "C:\\Users\\Sebastian Poma N\\Documents\\Ciclo8\\HombreYMquina\\via-app\\via-app\\lib";

function listDart(dir) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(listDart(full));
    else if (entry.name.endsWith(".dart")) out.push(full);
  }
  return out;
}

function capa(relPathConSlash) {
  const parts = relPathConSlash.split("/");
  if (parts.length === 1) return "raíz";
  return parts[0]; // core | data | features | shared
}

function extraerProposito(contenido) {
  const lineas = contenido.split("\n");
  let i = 0;
  // saltar imports y líneas en blanco iniciales
  while (i < lineas.length && (lineas[i].trim() === "" || lineas[i].trim().startsWith("import "))) i++;
  const bloque = [];
  while (i < lineas.length && lineas[i].trim().startsWith("///")) {
    bloque.push(lineas[i].trim().replace(/^\/\/\/\s?/, ""));
    i++;
  }
  return bloque.join(" ").trim();
}

const archivos = listDart(LIB).map((full) => {
  const rel = path.relative(LIB, full).replace(/\\/g, "/");
  const contenido = fs.readFileSync(full, "utf8");
  return {
    ruta: "lib/" + rel,
    id: rel.replace(/[\\/.]/g, "_"),
    capa: capa(rel),
    nombre: path.basename(rel),
    lineas: contenido.split("\n").length,
    proposito: extraerProposito(contenido),
    contenido,
  };
}).sort((a, b) => a.ruta.localeCompare(b.ruta));

const totalLineas = archivos.reduce((t, a) => t + a.lineas, 0);

fs.writeFileSync(
  path.join(__dirname, "archivos.json"),
  JSON.stringify({ archivos, totalArchivos: archivos.length, totalLineas }, null, 0)
);

console.log(`OK: ${archivos.length} archivos, ${totalLineas} líneas`);
