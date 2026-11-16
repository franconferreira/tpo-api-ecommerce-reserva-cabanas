import { TERRENO, CONSTRUCCIONES, CARTEL, LAGO, dentroLaguna, distLaguna } from './plano'

// Relieve del terreno: colinas suaves, el bosque del borde que sube, la laguna hundida
// y zonas planas donde van las construcciones, el fogón y la entrada.

// ¿Cuánto se mete un punto en el bosque? Distancia (en m) por fuera del claro central, que es un rectángulo
// de esquinas redondeadas con el borde ondulado: positivo = bosque, negativo = claro
export function bosque(x, z) {
  const T = TERRENO
  const cx = (T.xMin + T.xMax) / 2
  const cz = (T.zMin + T.zMax) / 2
  const r = 22
  const qx = Math.abs(x - cx) - ((T.xMax - T.xMin) / 2 - T.bosque - r)
  const qz = Math.abs(z - cz) - ((T.zMax - T.zMin) / 2 - T.bosque - r)
  const d = Math.hypot(Math.max(qx, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qz), 0) - r
  const ondas = 5 * Math.sin(x * 0.07 + 0.5) + 4 * Math.cos(z * 0.09 + 1) + 2.5 * Math.sin((x + z) * 0.16)
  return d + ondas
}

// Colinas suaves (suma de ondas) y el bosque del borde que sube
function base(x, z) {
  const h = 1.8 * Math.sin(x * 0.045 + 1.3) * Math.cos(z * 0.05 + 0.4) + 0.7 * Math.sin(x * 0.11 + z * 0.08) + 0.35 * Math.cos(x * 0.2 - z * 0.17)
  return h + Math.min(9, Math.max(0, bosque(x, z)) * 0.45)
}

export const suave = (t) => {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}

// Zonas planas: r = radio totalmente plano; después se mezcla con las colinas en 12 m
const RADIO_PLANO = { cabana: 7.5, galpon: 17, casa: 14 }
const PLANOS = [
  ...CONSTRUCCIONES.map((c) => ({ x: c.x, z: c.z, r: RADIO_PLANO[c.tipo] })),
  { x: CARTEL.x, z: CARTEL.z - 3, r: 9 } // cartel y portal
].map((p) => ({ ...p, h: base(p.x, p.z) }))

const ORILLA = LAGO.nivel + 0.15 // la orilla queda apenas sobre el agua

export function altura(x, z) {
  let h = base(x, z)
  for (const p of PLANOS) {
    const t = suave((Math.hypot(x - p.x, z - p.z) - p.r) / 12)
    h = p.h + (h - p.h) * t
  }
  const d = distLaguna(x, z)
  // adentro el fondo baja enseguida, así ningún pedazo del fondo asoma por encima del agua cerca de la orilla
  if (dentroLaguna(x, z)) return LAGO.nivel - 0.9 - Math.min(2.5, d * 0.6)
  if (d < 9) h = ORILLA + (h - ORILLA) * suave(d / 9)
  return h
}

// La malla del suelo: una grilla de triángulos cada PASO metros, con margen alrededor del terreno
const PASO = 2.5
const MARGEN = 100
export const MALLA = {
  paso: PASO,
  x0: TERRENO.xMin - MARGEN,
  z0: TERRENO.zMin - MARGEN,
  nx: Math.round((TERRENO.xMax - TERRENO.xMin + MARGEN * 2) / PASO),
  nz: Math.round((TERRENO.zMax - TERRENO.zMin + MARGEN * 2) / PASO)
}

// Altura exacta sobre la malla (no sobre la curva): así los caminos, árboles y la persona apoyan justo en el suelo dibujado.
// Cada celda tiene dos triángulos, igual que PlaneGeometry: (a, b, d) y (b, c, d)
export function alturaSuelo(x, z) {
  const gx = (x - MALLA.x0) / PASO
  const gz = (z - MALLA.z0) / PASO
  const ix = Math.floor(gx)
  const iz = Math.floor(gz)
  const u = gx - ix
  const v = gz - iz
  const x0 = MALLA.x0 + ix * PASO
  const z0 = MALLA.z0 + iz * PASO
  const ha = altura(x0, z0)
  const hb = altura(x0, z0 + PASO)
  const hc = altura(x0 + PASO, z0 + PASO)
  const hd = altura(x0 + PASO, z0)
  if (u + v <= 1) return ha + (hd - ha) * u + (hb - ha) * v
  return hc + (hb - hc) * (1 - u) + (hd - hc) * (1 - v)
}
