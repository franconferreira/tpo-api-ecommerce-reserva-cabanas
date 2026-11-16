import {
  TERRENO, ENTRADA, CARTEL, CONSTRUCCIONES, LAGO, ARBOLEDAS, BOSQUE_CABANAS, CAMINO, SENDEROS, ANCHO_SENDERO,
  HUELLAS, LLEGADA, aTerreno
} from './plano'

// Dibuja el plano en SVG (1 m = ESCALA px) y revisa las distancias de la ficha
const ESCALA = 5.5
const M = 30 // margen en px
const T = TERRENO
const W = (T.xMax - T.xMin) * ESCALA + M * 2
const H = (T.zMax - T.zMin) * ESCALA + M * 2
const px = (x) => M + (x - T.xMin) * ESCALA
const pz = (z) => M + (z - T.zMin) * ESCALA
const linea = (pts) => pts.map(([x, z], i) => `${i ? 'L' : 'M'}${px(x).toFixed(1)},${pz(z).toFixed(1)}`).join(' ')

const COLORES = { cabana: '#c47a3c', galpon: '#9c4a32', casa: '#8d8a82' }
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="system-ui" font-size="12">`
svg += `<rect width="${W}" height="${H}" fill="#1b1a17"/>`
// terreno y franja de bosque
svg += `<rect x="${px(T.xMin)}" y="${pz(T.zMin)}" width="${(T.xMax - T.xMin) * ESCALA}" height="${(T.zMax - T.zMin) * ESCALA}" fill="#2f5a3a"/>`
const b = T.bosque
svg += `<rect x="${px(T.xMin + b)}" y="${pz(T.zMin + b)}" width="${(T.xMax - T.xMin - b * 2) * ESCALA}" height="${(T.zMax - T.zMin - b * 2) * ESCALA}" fill="#6e9a4a" rx="30"/>`
// grilla cada 10 m
for (let x = Math.ceil(T.xMin / 10) * 10; x <= T.xMax; x += 10) svg += `<line x1="${px(x)}" y1="${pz(T.zMin)}" x2="${px(x)}" y2="${pz(T.zMax)}" stroke="#00000022"/>`
for (let z = Math.ceil(T.zMin / 10) * 10; z <= T.zMax; z += 10) svg += `<line x1="${px(T.xMin)}" y1="${pz(z)}" x2="${px(T.xMax)}" y2="${pz(z)}" stroke="#00000022"/>`
// arboledas densas (árboles como puntos)
for (const a of ARBOLEDAS) {
  svg += `<ellipse cx="${px(a.x)}" cy="${pz(a.z)}" rx="${a.radioX * ESCALA}" ry="${a.radioZ * ESCALA}" fill="#2f5a3a" opacity="0.85"/>`
  for (let i = 0; i < a.radioX * a.radioZ / 3; i++) {
    const ang = i * 2.4
    const r = Math.sqrt((i + 0.5) / (a.radioX * a.radioZ / 3))
    svg += `<circle cx="${px(a.x + Math.cos(ang) * r * a.radioX * 0.9)}" cy="${pz(a.z + Math.sin(ang) * r * a.radioZ * 0.9)}" r="${1.4 * ESCALA}" fill="#3f7048"/>`
  }
}
svg += `<rect x="${px(BOSQUE_CABANAS.xMin)}" y="${pz(BOSQUE_CABANAS.zMin)}" width="${(BOSQUE_CABANAS.xMax - BOSQUE_CABANAS.xMin) * ESCALA}" height="${(BOSQUE_CABANAS.zMax - BOSQUE_CABANAS.zMin) * ESCALA}" fill="#2f5a3a" opacity="0.35" rx="20"/>`
svg += `<path d="${linea(LAGO.contorno)} Z" fill="#4a8fb0"/>`
svg += `<rect x="${px(LAGO.muelle.x - 0.9)}" y="${pz(LAGO.muelle.z - LAGO.muelle.largo)}" width="${1.8 * ESCALA}" height="${LAGO.muelle.largo * ESCALA}" fill="#a8743f"/>`
// caminos y senderos
const porId = Object.fromEntries(CONSTRUCCIONES.map((c) => [c.id, c]))
svg += `<path d="${linea(CAMINO.puntos)}" stroke="#b89a6a" stroke-width="${CAMINO.ancho * ESCALA}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
for (const s of SENDEROS) {
  const pts = [...s.puntos]
  if (s.hasta) {
    const c = porId[s.hasta]
    pts.push(aTerreno(c, 0, LLEGADA[c.tipo]))
  }
  svg += `<path d="${linea(pts)}" stroke="#cfb88a" stroke-width="${ANCHO_SENDERO * ESCALA}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
}
// fogón, portal y cartel
svg += `<rect x="${px(ENTRADA.x - ENTRADA.anchoPortal / 2 - 0.5)}" y="${pz(ENTRADA.z - 0.5)}" width="${ESCALA}" height="${ESCALA}" fill="#7a4a2a"/><rect x="${px(ENTRADA.x + ENTRADA.anchoPortal / 2 - 0.5)}" y="${pz(ENTRADA.z - 0.5)}" width="${ESCALA}" height="${ESCALA}" fill="#7a4a2a"/>`
svg += `<text x="${px(ENTRADA.x) + 24}" y="${pz(ENTRADA.z) + 4}" fill="#1b1a17">Portal de entrada</text>`
svg += `<rect x="${px(CARTEL.x - CARTEL.ancho / 2)}" y="${pz(CARTEL.z) - 3}" width="${CARTEL.ancho * ESCALA}" height="6" fill="#f2e6cc" stroke="#7a4a2a"/>`
svg += `<text x="${px(CARTEL.x) + 20}" y="${pz(CARTEL.z) + 4}" fill="#1b1a17">Cartel con póster (inicio)</text>`
// construcciones
for (const c of CONSTRUCCIONES) {
  for (const [x0, z0, x1, z1] of HUELLAS[c.tipo]) {
    const pts = [aTerreno(c, x0, z0), aTerreno(c, x1, z0), aTerreno(c, x1, z1), aTerreno(c, x0, z1)]
    svg += `<path d="${linea(pts)} Z" fill="${COLORES[c.tipo]}" stroke="#1b1a17" stroke-width="1"/>`
  }
  const frente = aTerreno(c, 0, LLEGADA[c.tipo] - 1)
  svg += `<circle cx="${px(frente[0])}" cy="${pz(frente[1])}" r="3" fill="#fff"/>`
  svg += `<text x="${px(c.x)}" y="${pz(c.z) + (c.tipo === 'casa' ? -10 : 0)}" fill="#fff" stroke="#1b1a17" stroke-width="3" paint-order="stroke" text-anchor="middle">${c.nombre}</text>`
}
// norte y escala
svg += `<text x="${W - 40}" y="22" fill="#e9dfc4" font-size="16">N ↑</text>`
svg += `<rect x="${M}" y="${H - 18}" width="${20 * ESCALA}" height="5" fill="#e9dfc4"/><text x="${M + 20 * ESCALA + 6}" y="${H - 12}" fill="#e9dfc4">20 m</text>`
svg += '</svg>'
document.getElementById('plano').innerHTML = svg

// Revisión de distancias: cabañas a 20 m como mínimo entre sí, galpón a ≈ 35 m de la casa
const avisos = []
const cabanas = CONSTRUCCIONES.filter((c) => c.tipo === 'cabana')
for (let i = 0; i < cabanas.length; i++) for (let j = i + 1; j < cabanas.length; j++) {
  const d = Math.hypot(cabanas[i].x - cabanas[j].x, cabanas[i].z - cabanas[j].z)
  if (d < 20) avisos.push(`${cabanas[i].nombre} y ${cabanas[j].nombre} a ${d.toFixed(1)} m (mínimo 20)`)
}
const dGalpon = Math.hypot(porId.galpon.x - porId.casa.x, porId.galpon.z - porId.casa.z)
const caja = document.getElementById('avisos')
caja.style.background = avisos.length ? '#8a1f1fdd' : '#1f5a2fdd'
caja.textContent = (avisos.length ? avisos.join(' · ') : 'Distancias entre cabañas: todas ≥ 20 m') + ` · galpón a ${dGalpon.toFixed(0)} m de la casa (centro a centro)`
