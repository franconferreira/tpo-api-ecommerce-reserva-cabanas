// Plano del complejo (disenos/REGLAS_MAPA_3D.md, sección 5). Solo datos: lo usan el plano 2D y el mapa 3D.
// Coordenadas en metros: X hacia el este, Z hacia el sur (norte = -Z).
// Cada construcción mira con su frente (eje +Z del modelo) hacia el punto `mira`.

export const TERRENO = { xMin: -75, xMax: 88, zMin: -98, zMax: 58, bosque: 12 } // bosque = franja densa del perímetro

// Primero el cartel (afuera) y detrás el portal de entrada
export const CARTEL = { x: 0, z: 53, ancho: 4, alto: 2.5 } // mira hacia el sur, a quien llega
export const ENTRADA = { x: 0, z: 46, anchoPortal: 5 }

export const CONSTRUCCIONES = [
  { id: 'casa', tipo: 'casa', nombre: 'Casa principal', x: 0, z: -22, mira: [0, 10] },
  // Galpón al oeste, con el frente (pérgola) hacia el sur
  { id: 'galpon', tipo: 'galpon', nombre: 'Galpón de fiestas Las Acacias', x: -45, z: -14, mira: [-45, 40] },
  // Cabañas al este, alrededor de un cruce; el porche mira hacia el sendero que llega
  { id: 'cedro', tipo: 'cabana', variante: 'cedro', nombre: 'Cabaña del Cedro', x: 32, z: -45, mira: [47, -37] },
  { id: 'pinos', tipo: 'cabana', variante: 'pinos', nombre: 'Refugio Los Pinos', x: 55, z: -50, mira: [47, -37] },
  { id: 'roble', tipo: 'cabana', variante: 'roble', nombre: 'Cabaña El Roble', x: 44, z: -24, mira: [47, -37] },
  { id: 'arroyo', tipo: 'cabana', variante: 'arroyo', nombre: 'Chalet del Arroyo', x: 70, z: -26, mira: [47, -37] }
]

// Laguna grande al norte, con forma irregular (lóbulo chico al oeste, grande al este) y sin arroyo.
// `puntos` es el contorno a mano; `contorno` es el mismo suavizado (lo usan el plano 2D y el 3D)
const PUNTOS_LAGUNA = [[-36, -72], [-34, -77], [-30, -79], [-24, -80], [-15, -80], [-11, -79], [-5, -79], [-3, -81], [3, -83], [9, -85], [16, -85], [18, -83], [20, -78], [23, -70], [24, -65], [24, -59], [21, -55], [17, -53], [8, -54], [3, -56], [-1, -59], [-6, -63], [-11, -64], [-16, -63], [-21, -62], [-30, -62], [-34, -64], [-36, -66]]
export const LAGO = {
  contorno: suavizar(PUNTOS_LAGUNA, 4),
  nivel: -0.5, // altura del agua
  muelle: { x: 10, z: -53, largo: 8 } // arranca en la orilla sur y entra hacia el norte
}

// Arboledas densas (elipses) que aíslan las cabañas de la casa
export const ARBOLEDAS = [
  { x: 21, z: -32, radioX: 5, radioZ: 15 },
  { x: 38, z: -12, radioX: 12, radioZ: 4 },
  { x: 60, z: -38, radioX: 4, radioZ: 6 },
  // abajo a la derecha (sureste), para que el campo no quede vacío
  { x: 56, z: 18, radioX: 12, radioZ: 8 },
  { x: 34, z: 34, radioX: 8, radioZ: 5 },
  { x: 70, z: -2, radioX: 6, radioZ: 9 },
  { x: 22, z: 12, radioX: 5, radioZ: 4 }
]
// Bosque de las cabañas: zona con árboles bastante juntos entre las cabañas y alrededor
export const BOSQUE_CABANAS = { xMin: 24, xMax: 80, zMin: -66, zMax: -14, paso: 3.6, claro: 7, lejosLaguna: 16 } // claro = radio libre alrededor de cada cabaña

// Camino principal (3 m) y senderos (1,5 m): `puntos` es el recorrido hasta el frente de la construcción `hasta`
export const CAMINO = { ancho: 3, puntos: [[0, 58], [0, 44], [2, 30], [-1, 14], [0, 0], [0, -11]] }
export const SENDEROS = [
  { puntos: [[0, 4], [20, -2], [28, -18], [47, -37]], hasta: null }, // hacia el cruce de las cabañas, entre las arboledas
  { puntos: [[47, -37]], hasta: 'cedro' },
  { puntos: [[47, -37]], hasta: 'pinos' },
  { puntos: [[47, -37]], hasta: 'roble' },
  { puntos: [[47, -37]], hasta: 'arroyo' },
  { puntos: [[-1, 8], [-30, 6]], hasta: 'galpon' }
]
export const ANCHO_SENDERO = 1.5
export const FOGON = { x: -12, z: -4, radio: 3 }
export const SEPARACION_FAROLES = 12

// Huella de cada tipo en coordenadas del modelo (frente hacia +Z), como lista de rectángulos [x0, z0, x1, z1]
export const HUELLAS = {
  cabana: [[-3.25, -3, 3.25, 3], [-3.25, 3, 3.25, 5.2], [-0.6, 5.2, 0.6, 6.7]],
  galpon: [[-6, -11, 6, 11], [-6, 11, 6, 15], [-3, -16, 3, -11]],
  casa: [[-11.5, -10.25, 11.5, -3.25], [-11.5, -3.25, -6, 10.25], [6, -3.25, 11.5, 10.25]]
}
// Distancia del centro al punto donde llega el sendero (frente de la construcción)
export const LLEGADA = { cabana: 7.5, galpon: 16, casa: 11 }

// Ángulo (alrededor de Y) para que el frente del modelo mire hacia `mira`
export function rotacion(c) {
  return Math.atan2(c.mira[0] - c.x, c.mira[1] - c.z)
}

// Pasa un punto de las coordenadas del modelo al terreno
export function aTerreno(c, lx, lz) {
  const r = rotacion(c)
  return [c.x + lx * Math.cos(r) + lz * Math.sin(r), c.z - lx * Math.sin(r) + lz * Math.cos(r)]
}

// Curva suave (Catmull-Rom cerrada) que pasa por los puntos, con `pasos` puntos por tramo
function suavizar(pts, pasos) {
  const salida = []
  const n = pts.length
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [pts[(i - 1 + n) % n], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]]
    for (let k = 0; k < pasos; k++) {
      const t = k / pasos
      const t2 = t * t
      const t3 = t2 * t
      salida.push([0, 1].map((e) => 0.5 * (2 * p1[e] + (-p0[e] + p2[e]) * t + (2 * p0[e] - 5 * p1[e] + 4 * p2[e] - p3[e]) * t2 + (-p0[e] + 3 * p1[e] - 3 * p2[e] + p3[e]) * t3)))
    }
  }
  return salida
}

// ¿El punto está dentro de la laguna? (prueba del rayo contra el contorno)
export function dentroLaguna(x, z) {
  const c = LAGO.contorno
  let dentro = false
  for (let i = 0, j = c.length - 1; i < c.length; j = i++) {
    const [xi, zi] = c[i]
    const [xj, zj] = c[j]
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) dentro = !dentro
  }
  return dentro
}

// Distancia del punto al borde de la laguna
export function distLaguna(x, z) {
  const c = LAGO.contorno
  let min = Infinity
  for (let i = 0, j = c.length - 1; i < c.length; j = i++) {
    const [ax, az] = c[j]
    const dx = c[i][0] - ax
    const dz = c[i][1] - az
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)))
    min = Math.min(min, Math.hypot(x - ax - t * dx, z - az - t * dz))
  }
  return min
}
