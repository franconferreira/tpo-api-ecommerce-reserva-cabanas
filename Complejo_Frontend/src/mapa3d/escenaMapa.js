import * as THREE from 'three'
import { caja, material } from './piezas'
import { PALETA, farol, tronco, pasto, cerco } from './detalles'
import { crearCabana } from './modelos/cabana'
import { crearGalpon } from './modelos/galpon'
import { crearCasaPrincipal } from './modelos/casaPrincipal'
import {
  TERRENO, CARTEL, ENTRADA, CONSTRUCCIONES, LAGO, ARBOLEDAS, BOSQUE_CABANAS, CAMINO, SENDEROS, ANCHO_SENDERO,
  FOGON, SEPARACION_FAROLES, LLEGADA, HUELLAS, rotacion, aTerreno, dentroLaguna, distLaguna
} from './plano'
import { altura, alturaSuelo, MALLA, bosque, suave } from './relieve'
import { juntar, fusionarEstaticos } from './fusion'

// Arma el mapa completo a partir de plano.js (disenos/REGLAS_MAPA_3D.md, sección 5).
// Devuelve la escena, las construcciones (para nombres y clics) y lo necesario para los choques.

const COLORES = {
  suelo: '#6e9a4a',
  sueloBosque: '#4f7a3c',
  camino: '#b89a6a',
  sendero: '#cfb88a',
  agua: '#4a8fb0',
  orilla: '#cfc29a',
  pinoOscuro: '#2f5a3a',
  pinoClaro: '#3f7048',
  copa: '#5f8f3e',
  troncoArbol: '#6b4a2e',
  roca: '#8d8a82',
  poster: '#f2e6cc',
  fuego: '#e8742a',
  llama: '#ffd27a'
}

// Sorteo con semilla: el bosque sale igual en cada carga
let semilla = 7
function azar() {
  semilla = (semilla * 16807) % 2147483647
  return (semilla - 1) / 2147483646
}

// Recorridos de caminos y senderos como listas de puntos (con el punto de llegada a cada construcción)
const porId = Object.fromEntries(CONSTRUCCIONES.map((c) => [c.id, c]))
const RECORRIDOS = [
  { puntos: CAMINO.puntos, ancho: CAMINO.ancho, color: COLORES.camino, sobre: 0.1 },
  ...SENDEROS.map((s) => ({
    puntos: s.hasta ? [...s.puntos, aTerreno(porId[s.hasta], 0, LLEGADA[porId[s.hasta].tipo])] : s.puntos,
    ancho: ANCHO_SENDERO,
    color: COLORES.sendero,
    sobre: 0.08 // debajo del camino, para que las uniones no se vean encima
  }))
]

// Distancia de un punto a un segmento
function distSegmento(x, z, [ax, az], [bx, bz]) {
  const dx = bx - ax
  const dz = bz - az
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)))
  return Math.hypot(x - ax - t * dx, z - az - t * dz)
}

// Radio libre alrededor de cada construcción (para no poner árboles ni faroles encima)
const RADIO_LIBRE = { cabana: 9, galpon: 19, casa: 16 }

// ¿Se puede poner algo (árbol, roca) en (x, z)?
// claroCabana: radio libre más chico alrededor de las cabañas (para el bosque que las rodea)
function libre(x, z, margen = 2, claroCabana = null) {
  for (const c of CONSTRUCCIONES) {
    const radio = c.tipo === 'cabana' && claroCabana ? claroCabana : RADIO_LIBRE[c.tipo] + margen - 2
    if (Math.hypot(x - c.x, z - c.z) < radio) return false
  }
  if (dentroLaguna(x, z) || distLaguna(x, z) < 3) return false
  for (const r of RECORRIDOS) {
    for (let i = 0; i < r.puntos.length - 1; i++) if (distSegmento(x, z, r.puntos[i], r.puntos[i + 1]) < r.ancho / 2 + margen) return false
  }
  if (Math.hypot(x - FOGON.x, z - FOGON.z) < FOGON.radio + 7) return false
  if (Math.abs(x - CARTEL.x) < 7 && z > ENTRADA.z - 3) return false
  return true
}

// ---- Árboles (geometrías compartidas) ----
const GEO = {
  troncoPino: new THREE.CylinderGeometry(0.15, 0.22, 1.4, 5),
  conoBajo: new THREE.ConeGeometry(1.5, 2.8, 6),
  conoAlto: new THREE.ConeGeometry(1.05, 2.2, 6),
  troncoCopa: new THREE.CylinderGeometry(0.18, 0.26, 2.4, 5),
  copa: new THREE.IcosahedronGeometry(1.7, 0),
  roca: new THREE.DodecahedronGeometry(0.5, 0)
}

function malla(geo, color, x, y, z, s = 1, sombra = true) {
  const m = new THREE.Mesh(geo, material(color))
  m.position.set(x, y, z)
  m.scale.setScalar(s)
  m.castShadow = sombra
  m.receiveShadow = true
  return m
}

// Cada árbol es una sola malla (tronco y follaje juntos, con color por vértice): tres modelos compartidos
const GEO_ARBOL = {
  pinoOscuro: juntar([
    { geo: GEO.troncoPino, color: COLORES.troncoArbol, y: 0.7 },
    { geo: GEO.conoBajo, color: COLORES.pinoOscuro, y: 2.6 },
    { geo: GEO.conoAlto, color: COLORES.pinoOscuro, y: 4.1 }
  ]),
  pinoClaro: juntar([
    { geo: GEO.troncoPino, color: COLORES.troncoArbol, y: 0.7 },
    { geo: GEO.conoBajo, color: COLORES.pinoClaro, y: 2.6 },
    { geo: GEO.conoAlto, color: COLORES.pinoClaro, y: 4.1 }
  ]),
  copa: juntar([
    { geo: GEO.troncoCopa, color: COLORES.troncoArbol, y: 1.2 },
    { geo: GEO.copa, color: COLORES.copa, y: 3.4 }
  ])
}
const MAT_COLORES = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })

function modeloArbol(tipo) {
  if (tipo === 'copa') return 'copa'
  return azar() < 0.5 ? 'pinoOscuro' : 'pinoClaro'
}

function arbol(modelo, x, z, s, sombra) {
  const m = new THREE.Mesh(GEO_ARBOL[modelo], MAT_COLORES)
  m.position.set(x, alturaSuelo(x, z) - 0.1, z)
  m.scale.setScalar(s)
  m.rotation.y = azar() * Math.PI
  m.castShadow = sombra
  m.receiveShadow = true
  return m
}

// Volumen invisible que se usa para elegir una construcción con el mouse (las mallas reales quedan juntadas)
const MAT_SELECCION = new THREE.MeshBasicMaterial({ visible: false })
const ALTO_SELECCION = { cabana: 8.5, galpon: 9, casa: 7 }

// ---- Arbustos y flores ----
// Piezas base sin índices (para poder juntarlas) y colores
const GEO_PLANTA = {
  mata: new THREE.IcosahedronGeometry(1, 0),
  flor: new THREE.OctahedronGeometry(1, 0),
  tallo: new THREE.BoxGeometry(1, 1, 1).toNonIndexed()
}
const COLORES_ARBUSTO = ['#4f7a3c', '#5c8a3e', '#3f6a35', '#6b9446']
const COLORES_FLOR = ['#e8c547', '#f2f0e6', '#d9534f', '#b07cc6', '#f08fb0']
const VERDE_TALLO = '#4f7a3c'

// Junta muchas piezas chicas en una sola malla con colores por vértice: { geo, color, x, y, z, sx, sy, sz, giro }
function fusionar(piezas, sombra) {
  const m = new THREE.Mesh(juntar(piezas), MAT_COLORES)
  m.castShadow = sombra
  m.receiveShadow = true
  return m
}

// Una flor: tallo fino y una cabecita de color
function flor(piezas, x, z, color) {
  const y = alturaSuelo(x, z)
  const alto = 0.25 + azar() * 0.22
  piezas.push({ geo: GEO_PLANTA.tallo, color: VERDE_TALLO, x, y: y + alto / 2, z, sx: 0.03, sy: alto, sz: 0.03 })
  const r = 0.08 + azar() * 0.04
  piezas.push({ geo: GEO_PLANTA.flor, color, x, y: y + alto, z, sx: r * 1.4, sy: r * 0.8, sz: r * 1.4, giro: azar() })
  // mata de hojas al pie (en la mitad de las flores), para que se lean como cantero
  if (azar() < 0.5) piezas.push({ geo: GEO_PLANTA.mata, color: COLORES_ARBUSTO[1], x, y: y + 0.05, z, sx: 0.18, sy: 0.12, sz: 0.18, giro: azar() * 3 })
}

// Un arbusto: 2 o 3 bolas bajas de follaje
function arbusto(piezas, x, z) {
  const y = alturaSuelo(x, z)
  const color = COLORES_ARBUSTO[Math.floor(azar() * COLORES_ARBUSTO.length)]
  const n = 2 + Math.floor(azar() * 2)
  for (let i = 0; i < n; i++) {
    const r = 0.45 + azar() * 0.35
    piezas.push({ geo: GEO_PLANTA.mata, color, x: x + (azar() - 0.5) * 0.9, y: y + r * 0.55, z: z + (azar() - 0.5) * 0.9, sx: r, sy: r * 0.8, sz: r, giro: azar() * 3 })
  }
}

function plantas(T, anchoT, fondoT) {
  const g = new THREE.Group()
  const flores = []
  const matas = []
  const b = T.bosque
  const senderos = RECORRIDOS.slice(1)
  const sobreSendero = (x, z) => senderos.some((r) => r.puntos.some((p, i) => i < r.puntos.length - 1 && distSegmento(x, z, p, r.puntos[i + 1]) < r.ancho / 2 + 0.3))

  // Flores a los dos lados del camino principal, en tramos del mismo color (como canteros)
  const pts = CAMINO.puntos
  let recorrido = 0
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i]
    const [bx, bz] = pts[i + 1]
    const largo = Math.hypot(bx - ax, bz - az)
    const dx = (bx - ax) / largo
    const dz = (bz - az) / largo
    for (let d = 0; d < largo; d += 0.4) {
      for (const lado of [-1, 1]) {
        if (azar() > 0.85) continue
        const sep = CAMINO.ancho / 2 + 0.35 + azar() * 1.3
        const x = ax + dx * d - dz * lado * sep + (azar() - 0.5) * 0.3
        const z = az + dz * d + dx * lado * sep + (azar() - 0.5) * 0.3
        if (sobreSendero(x, z) || Math.abs(z - CARTEL.z) < 1) continue
        const tramo = Math.floor((recorrido + d) / 8 + (lado > 0 ? 2 : 0))
        const color = azar() < 0.15 ? COLORES_FLOR[Math.floor(azar() * COLORES_FLOR.length)] : COLORES_FLOR[tramo % COLORES_FLOR.length]
        flor(flores, x, z, color)
      }
    }
    recorrido += largo
  }

  // Manchones de flores sueltos en el campo
  for (let i = 0; i < 70; i++) {
    const cx = T.xMin + b + azar() * (anchoT - b * 2)
    const cz = T.zMin + b + azar() * (fondoT - b * 2)
    if (!libre(cx, cz, 1) || bosque(cx, cz) > -2) continue
    const color = COLORES_FLOR[Math.floor(azar() * COLORES_FLOR.length)]
    const n = 6 + Math.floor(azar() * 8)
    for (let k = 0; k < n; k++) flor(flores, cx + (azar() - 0.5) * 2.4, cz + (azar() - 0.5) * 2.4, color)
  }

  // Arbustos: muchos en el borde del bosque, algunos sueltos en el campo y al lado de las construcciones
  for (let i = 0; i < 1400; i++) {
    const x = T.xMin + azar() * anchoT
    const z = T.zMin + azar() * fondoT
    const f = bosque(x, z)
    const prob = f > -10 && f < 4 ? 0.45 : f <= -10 ? 0.06 : 0
    if (azar() > prob || !libre(x, z, 1.2)) continue
    arbusto(matas, x, z)
  }
  for (const c of CONSTRUCCIONES) {
    for (let k = 0; k < 6; k++) {
      const a = azar() * Math.PI * 2
      const r = RADIO_LIBRE[c.tipo] - 1.5 + azar() * 2
      const x = c.x + Math.cos(a) * r
      const z = c.z + Math.sin(a) * r
      if (!dentroLaguna(x, z) && !sobreSendero(x, z)) arbusto(matas, x, z)
    }
  }

  g.add(fusionar(flores, false), fusionar(matas, true))
  return g
}

// ---- Caminos: cintas que siguen el relieve (una muestra por metro) con uniones redondas ----
function recorrido({ puntos, ancho, color, sobre }) {
  const g = new THREE.Group()
  // muestras cada ~1 m a lo largo del recorrido
  const muestras = []
  for (let i = 0; i < puntos.length - 1; i++) {
    const [ax, az] = puntos[i]
    const [bx, bz] = puntos[i + 1]
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az)))
    for (let k = 0; k < n; k++) muestras.push([ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n])
  }
  muestras.push(puntos[puntos.length - 1])
  const pos = []
  const indices = []
  muestras.forEach(([x, z], i) => {
    const [px0, pz0] = muestras[Math.max(0, i - 1)]
    const [px1, pz1] = muestras[Math.min(muestras.length - 1, i + 1)]
    const largo = Math.hypot(px1 - px0, pz1 - pz0) || 1
    const nx = (-(pz1 - pz0) / largo) * (ancho / 2)
    const nz = ((px1 - px0) / largo) * (ancho / 2)
    pos.push(x + nx, alturaSuelo(x + nx, z + nz) + sobre, z + nz, x - nx, alturaSuelo(x - nx, z - nz) + sobre, z - nz)
    if (i > 0) {
      const v = i * 2
      indices.push(v - 2, v, v - 1, v - 1, v, v + 1)
    }
  })
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  const cinta = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }))
  cinta.receiveShadow = true
  g.add(cinta)
  for (const [x, z] of puntos) {
    const union = new THREE.Mesh(new THREE.CircleGeometry(ancho / 2, 12), material(color))
    union.rotation.x = -Math.PI / 2
    union.position.set(x, alturaSuelo(x, z) + sobre - 0.01, z)
    union.receiveShadow = true
    g.add(union)
  }
  return g
}

// Faroles a un costado del recorrido, cada SEPARACION_FAROLES metros, alternando el lado
function farolesDe(r, luces) {
  const g = new THREE.Group()
  let falta = SEPARACION_FAROLES / 2
  let lado = 1
  for (let i = 0; i < r.puntos.length - 1; i++) {
    const [ax, az] = r.puntos[i]
    const [bx, bz] = r.puntos[i + 1]
    const largo = Math.hypot(bx - ax, bz - az)
    const dx = (bx - ax) / largo
    const dz = (bz - az) / largo
    let d = falta
    while (d <= largo) {
      const nx = -dz * lado
      const nz = dx * lado
      const sep = r.ancho / 2 + 0.7
      const x = ax + dx * d + nx * sep
      const z = az + dz * d + nz * sep
      let cerca = false
      for (const c of CONSTRUCCIONES) if (Math.hypot(x - c.x, z - c.z) < RADIO_LIBRE[c.tipo] - 2) cerca = true
      if (!cerca) {
        const f = farol(x, z)
        f.position.y = alturaSuelo(x, z)
        f.rotation.y = Math.atan2(nz, -nx) // el brazo (eje +X del farol) apunta al camino
        g.add(f)
        luces.push(new THREE.Vector3(x - nx * 0.5, f.position.y + 1.7, z - nz * 0.5))
      }
      lado = -lado
      d += SEPARACION_FAROLES
    }
    falta = d - largo
  }
  return g
}

// ---- Laguna: agua plana con la forma del contorno (el relieve hace la orilla), rocas y muelle ----
function laguna() {
  const g = new THREE.Group()
  const forma = new THREE.Shape(LAGO.contorno.map(([x, z]) => new THREE.Vector2(x, -z)))
  const geo = new THREE.ShapeGeometry(forma)
  geo.rotateX(-Math.PI / 2) // (x, y) del dibujo pasa a (x, 0, -y)
  const agua = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: COLORES.agua }))
  agua.position.y = LAGO.nivel
  agua.userData.esAgua = true
  g.add(agua)
  // rocas en la orilla, un poco afuera del contorno
  const c = LAGO.contorno
  for (let i = 0; i < c.length; i += 3) {
    if (azar() < 0.35) continue
    const [x0, z0] = c[i]
    const [x1, z1] = c[(i + 1) % c.length]
    const largo = Math.hypot(x1 - x0, z1 - z0) || 1
    const x = x0 + ((z1 - z0) / largo) * 1.2 // la normal hacia afuera (el contorno va en sentido horario visto desde arriba)
    const z = z0 - ((x1 - x0) / largo) * 1.2
    if (Math.hypot(x - LAGO.muelle.x, z - LAGO.muelle.z) < 4) continue
    const r = malla(GEO.roca, i % 2 ? COLORES.roca : PALETA.piedraOscura, x, alturaSuelo(x, z), z, 0.6 + azar() * 0.9)
    r.rotation.set(azar(), azar(), azar())
    g.add(r)
  }
  // muelle: arranca en la orilla sur y entra hacia el norte, sobre postes
  const { x, z, largo } = LAGO.muelle
  const yMuelle = LAGO.nivel + 0.45
  g.add(caja(1.8, 0.12, largo, PALETA.tabla, x, yMuelle - 0.12, z - largo / 2))
  for (let i = 0; i <= largo; i += 2) for (const lx of [-0.8, 0.8]) g.add(caja(0.15, 2.1, 0.15, PALETA.viga, x + lx, yMuelle - 2.22, z - i))
  return g
}

// ---- Fogón: anillo de piedras, leña con fuego y troncos para sentarse ----
function fogon(luces) {
  const g = new THREE.Group()
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2
    const p = caja(0.4, 0.28, 0.3, i % 2 ? PALETA.piedra : PALETA.piedraOscura, Math.cos(a) * 0.95, 0, Math.sin(a) * 0.95)
    p.rotation.y = -a
    g.add(p)
  }
  for (let i = 0; i < 3; i++) {
    const t = tronco(1.1, 0.14, 0, 0.12, 0)
    t.rotation.y = (i * Math.PI) / 3
    g.add(t)
  }
  const fuego = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.0, 6), new THREE.MeshLambertMaterial({ color: COLORES.fuego, emissive: COLORES.fuego, emissiveIntensity: 0.8, flatShading: true }))
  fuego.position.y = 0.6
  const llama = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.7, 5), new THREE.MeshLambertMaterial({ color: COLORES.llama, emissive: COLORES.llama, emissiveIntensity: 0.9, flatShading: true }))
  llama.position.y = 0.55
  fuego.userData.esFuego = true
  llama.userData.esFuego = true
  g.add(fuego, llama)
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5
    const asiento = new THREE.Group()
    asiento.add(tronco(1.8, 0.4, 0, 0.2, 0))
    asiento.position.set(Math.cos(a) * 2.4, 0, Math.sin(a) * 2.4)
    asiento.rotation.y = -a + Math.PI / 2
    g.add(asiento)
  }
  g.position.set(FOGON.x, alturaSuelo(FOGON.x, FOGON.z), FOGON.z)
  luces.push(new THREE.Vector3(FOGON.x, g.position.y + 1, FOGON.z))
  return g
}

// ---- Portal de troncos y cartel con el póster ----
function portal() {
  const g = new THREE.Group()
  const a = ENTRADA.anchoPortal / 2
  for (const x of [-a, a]) {
    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 4.4, 8), material(PALETA.tronco))
    poste.position.set(x, 2.2, 0)
    poste.castShadow = true
    g.add(poste)
  }
  g.add(tronco(ENTRADA.anchoPortal + 1.2, 0.34, 0, 4.1, 0))
  g.add(tronco(ENTRADA.anchoPortal - 0.4, 0.22, 0, 3.55, 0))
  // tabla colgada con el nombre (sin texto por ahora)
  g.add(caja(2.6, 0.55, 0.08, PALETA.tabla, 0, 2.9, 0))
  g.add(caja(0.03, 0.2, 0.03, PALETA.hierro, -1, 3.45, 0))
  g.add(caja(0.03, 0.2, 0.03, PALETA.hierro, 1, 3.45, 0))
  // cerco a los dos lados del portal
  for (const s of [-1, 1]) g.add(cerco(s * (a + 0.3), 0, s * 14, 0))
  g.position.set(ENTRADA.x, alturaSuelo(ENTRADA.x, ENTRADA.z), ENTRADA.z)
  return g
}

// ancho del póster: se ajusta a la proporción de la pantalla, así al arrancar el póster la cubre justo
function cartel(ancho = CARTEL.ancho) {
  const g = new THREE.Group()
  const { alto } = CARTEL
  const yBase = 0.6
  for (const x of [-ancho / 2 - 0.1, ancho / 2 + 0.1]) g.add(caja(0.18, yBase + alto + 0.25, 0.18, PALETA.viga, x, 0, 0))
  g.add(caja(ancho + 0.2, alto + 0.2, 0.1, PALETA.viga, 0, yBase - 0.1, -0.06))
  g.add(caja(ancho + 0.6, 0.12, 0.35, PALETA.viga, 0, yBase + alto + 0.15, 0)) // techito
  // el póster mira al sur (hacia quien llega). Sin sombreado (como iluminado), para que se vea igual que la página
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), new THREE.MeshBasicMaterial({ color: COLORES.poster }))
  poster.position.set(0, yBase + alto / 2, 0.005)
  poster.userData.esPoster = true
  g.add(poster)
  g.position.set(CARTEL.x, alturaSuelo(CARTEL.x, CARTEL.z), CARTEL.z)
  return g
}

export function crearMapa(opciones = {}) {
  semilla = 7
  const escena = new THREE.Scene()
  const luces = [] // puntos que se encienden de noche (faroles y fogón)

  // Suelo con relieve: una sola malla (cada 2,5 m) que se pierde en la niebla, con colores por zona
  const T = TERRENO
  const anchoT = T.xMax - T.xMin
  const fondoT = T.zMax - T.zMin
  const anchoSuelo = MALLA.nx * MALLA.paso
  const fondoSuelo = MALLA.nz * MALLA.paso
  const geoSuelo = new THREE.PlaneGeometry(anchoSuelo, fondoSuelo, MALLA.nx, MALLA.nz)
  geoSuelo.rotateX(-Math.PI / 2)
  const cx = MALLA.x0 + anchoSuelo / 2
  const cz = MALLA.z0 + fondoSuelo / 2
  const p = geoSuelo.attributes.position
  const colores = []
  const cPasto = new THREE.Color(COLORES.suelo)
  const cBosque = new THREE.Color(COLORES.sueloBosque)
  const cOrilla = new THREE.Color(COLORES.orilla)
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + cx
    const z = p.getZ(i) + cz
    const h = altura(x, z)
    p.setY(i, h)
    let col = cPasto.clone().lerp(cBosque, suave((bosque(x, z) + 2) / 8))
    col.offsetHSL(0, 0, (Math.min(h, 3) - 1) * 0.012) // las lomas un poco más claras (sin aclarar las del borde)
    if (h < LAGO.nivel + 0.6 && distLaguna(x, z) < 3) col = cOrilla.clone()
    colores.push(col.r, col.g, col.b)
  }
  geoSuelo.setAttribute('color', new THREE.Float32BufferAttribute(colores, 3))
  geoSuelo.computeVertexNormals()
  const suelo = new THREE.Mesh(geoSuelo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }))
  suelo.position.set(cx, 0, cz)
  suelo.receiveShadow = true
  escena.add(suelo)

  // Caminos, faroles, laguna, fogón, portal y cartel
  for (const r of RECORRIDOS) {
    escena.add(recorrido(r))
    escena.add(farolesDe(r, luces))
  }
  escena.add(laguna(), fogon(luces), portal(), cartel(opciones.anchoPoster))

  // Construcciones
  const construcciones = []
  for (const c of CONSTRUCCIONES) {
    const crear = { cabana: crearCabana, galpon: crearGalpon, casa: crearCasaPrincipal }[c.tipo]
    const m = crear({ variante: c.variante })
    m.position.set(c.x, alturaSuelo(c.x, c.z), c.z)
    m.rotation.y = rotacion(c)
    escena.add(m)
    const seleccion = new THREE.Group()
    seleccion.position.copy(m.position)
    seleccion.rotation.y = m.rotation.y
    for (const [x0, z0, x1, z1] of HUELLAS[c.tipo]) {
      const caja = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, ALTO_SELECCION[c.tipo], z1 - z0), MAT_SELECCION)
      caja.position.set((x0 + x1) / 2, ALTO_SELECCION[c.tipo] / 2, (z0 + z1) / 2)
      caja.userData.noFusionar = true
      seleccion.add(caja)
    }
    seleccion.userData.construccion = c
    escena.add(seleccion)
    construcciones.push({ datos: c, modelo: seleccion, llegada: aTerreno(c, 0, LLEGADA[c.tipo]) })
  }

  // Árboles: franja de bosque del perímetro (y un poco más afuera), arboledas y algunos sueltos
  const arboles = [] // [x, z, radio del tronco] para los choques
  const vivos = [] // árboles que se mueven con el viento
  const lejanos = [] // los del fondo del bosque: no se llega hasta ahí, van todos juntos en una malla y quietos
  const plantar = (x, z, tipo, s, sombra, lejos = false) => {
    const modelo = modeloArbol(tipo)
    arboles.push([x, z, 0.35 * s])
    if (lejos) {
      lejanos.push({ geo: GEO_ARBOL[modelo], x, y: alturaSuelo(x, z) - 0.1, z, sx: s, sy: s, sz: s, giro: azar() * Math.PI })
      return
    }
    const m = arbol(modelo, x, z, s, sombra)
    // el giro propio va primero y la inclinación después, así todos se inclinan para el mismo lado
    m.rotation.order = 'XZY'
    escena.add(m)
    vivos.push({ g: m, fase: azar() * Math.PI * 2, amplitud: (tipo === 'pino' ? 0.018 : 0.028) * (0.8 + azar() * 0.4) })
  }
  const b = T.bosque
  for (let x = T.xMin - 18; x <= T.xMax + 18; x += 4.5) {
    for (let z = T.zMin - 18; z <= T.zMax + 18; z += 4.5) {
      const px = x + (azar() - 0.5) * 3.5
      const pz = z + (azar() - 0.5) * 3.5
      // el borde de afuera del bosque también es desparejo
      if (bosque(px, pz) > 24 + 5 * Math.sin(px * 0.09) + 4 * Math.cos(pz * 0.08)) continue
      // probabilidad según cuánto se mete en el bosque (el borde queda desparejo, con árboles sueltos adelante)
      let prob = suave((bosque(px, pz) + 4) / 10)
      // manchones de árboles en el campo, donde una onda lenta pasa cierto valor
      const manchon = Math.sin(px * 0.045 + 2) * Math.cos(pz * 0.055 - 1) + 0.45 * Math.sin(px * 0.12 - pz * 0.1)
      if (manchon > 0.85 && distLaguna(px, pz) > 12) prob = Math.max(prob, 0.6)
      if (azar() > prob || !libre(px, pz, 2.5)) continue
      const profundo = bosque(px, pz) > 8
      plantar(px, pz, azar() < (profundo ? 0.85 : 0.6) ? 'pino' : 'copa', 0.85 + azar() * 0.65, !profundo, profundo)
    }
  }
  for (const a of ARBOLEDAS) {
    const n = Math.round((a.radioX * a.radioZ) / 3.2)
    for (let i = 0; i < n; i++) {
      const ang = i * 2.4
      const r = Math.sqrt((i + 0.5) / n)
      const px = a.x + Math.cos(ang) * r * a.radioX * 0.9 + (azar() - 0.5)
      const pz = a.z + Math.sin(ang) * r * a.radioZ * 0.9 + (azar() - 0.5)
      if (libre(px, pz, 1)) plantar(px, pz, azar() < 0.6 ? 'pino' : 'copa', 0.85 + azar() * 0.5, true)
    }
  }
  // bosque alrededor de las cabañas: árboles juntos, dejando un claro chico en cada una
  const BC = BOSQUE_CABANAS
  for (let x = BC.xMin; x <= BC.xMax; x += BC.paso) {
    for (let z = BC.zMin; z <= BC.zMax; z += BC.paso) {
      const px = x + (azar() - 0.5) * 2.4
      const pz = z + (azar() - 0.5) * 2.4
      if (distLaguna(px, pz) > BC.lejosLaguna && libre(px, pz, 2, BC.claro)) plantar(px, pz, azar() < 0.7 ? 'pino' : 'copa', 0.85 + azar() * 0.55, true)
    }
  }
  for (let i = 0; i < 60; i++) {
    const px = T.xMin + b + azar() * (anchoT - b * 2)
    const pz = T.zMin + b + azar() * (fondoT - b * 2)
    if (libre(px, pz, 4)) plantar(px, pz, azar() < 0.5 ? 'pino' : 'copa', 0.8 + azar() * 0.5, true)
  }
  // Matas de pasto al costado de los caminos
  for (let i = 0; i < 160; i++) {
    const px = T.xMin + b + azar() * (anchoT - b * 2)
    const pz = T.zMin + b + azar() * (fondoT - b * 2)
    if (libre(px, pz, 0.3)) {
      const mata = pasto(px, pz)
      mata.position.y = alturaSuelo(px, pz)
      escena.add(mata)
    }
  }

  // Arbustos y flores, cada grupo en una sola malla (son muchos y chiquitos)
  escena.add(plantas(T, anchoT, fondoT))

  if (lejanos.length) {
    const bosqueLejano = new THREE.Mesh(juntar(lejanos), MAT_COLORES)
    bosqueLejano.receiveShadow = true
    escena.add(bosqueLejano)
  }

  // Todo lo quieto se junta en una malla por material; quedan sueltas las piezas que cambian de noche,
  // las que se mueven (árboles), las que ya tienen color por vértice y las de elegir con el mouse
  fusionarEstaticos(escena, (o) => {
    const u = o.userData
    return u.noFusionar || u.esVidrio || u.esLuz || u.esBombita || u.esFuego || u.esPoster || u.esAgua || o.material.vertexColors
  })

  // Todo es estático: se calcula la matriz una vez
  escena.traverse((o) => {
    o.updateMatrix()
    o.matrixAutoUpdate = false
  })
  for (const v of vivos) v.g.matrixAutoUpdate = true // menos los árboles, que se mueven

  let poster = null
  escena.traverse((o) => { if (o.userData.esPoster) poster = o })

  return { escena, construcciones, arboles, luces, vivos, poster }
}

// Choques: devuelve true si una persona (radio 0.35 m) puede estar en (x, z)
export function puedeEstar(mapa, x, z) {
  const T = TERRENO
  if (x < T.xMin + 1 || x > T.xMax - 1 || z < T.zMin + 1 || z > T.zMax - 1) return false
  if (dentroLaguna(x, z) && !sobreMuelle(x, z)) return false
  for (const [ax, az, r] of mapa.arboles) if (Math.abs(x - ax) < 1 && Math.abs(z - az) < 1 && Math.hypot(x - ax, z - az) < r + 0.35) return false
  for (const { datos: c } of mapa.construcciones) {
    if (Math.hypot(x - c.x, z - c.z) > RADIO_LIBRE[c.tipo] + 1) continue
    const r = rotacion(c)
    const dx = x - c.x
    const dz = z - c.z
    const lx = dx * Math.cos(r) - dz * Math.sin(r)
    const lz = dx * Math.sin(r) + dz * Math.cos(r)
    for (const [x0, z0, x1, z1] of CHOQUES[c.tipo]) if (lx > x0 - 0.6 && lx < x1 + 0.6 && lz > z0 - 0.6 && lz < z1 + 0.6) return false
  }
  if (Math.abs(z - CARTEL.z) < 0.4 && Math.abs(x - CARTEL.x) < CARTEL.ancho / 2 + 0.4) return false
  return true
}

function sobreMuelle(x, z) {
  const m = LAGO.muelle
  return Math.abs(x - m.x) < 0.7 && z < m.z + 1 && z > m.z - m.largo + 0.3
}

// Altura del piso donde está parada la persona (el muelle o el terreno)
export function alturaPiso(x, z) {
  return sobreMuelle(x, z) ? Math.max(LAGO.nivel + 0.45, alturaSuelo(x, z)) : alturaSuelo(x, z)
}

// Rectángulos que no se pueden atravesar, en coordenadas del modelo (la pérgola del galpón y el patio de la casa quedan abiertos)
const CHOQUES = {
  cabana: [[-3.25, -3, 3.25, 6.7]],
  galpon: [[-6, -11, 6, 11], [-3, -16, 3, -11]],
  casa: [[-11.5, -10.25, 11.5, -3.25], [-11.5, -3.25, -6, 10.25], [6, -3.25, 11.5, 10.25]]
}

// Día o noche (sigue el tema del sitio): cielo, niebla, luces y ventanas encendidas
export function aplicarHora(mapa, noche, extras) {
  const { escena } = mapa
  escena.background = new THREE.Color(noche ? '#0d1a24' : '#a9c8c0')
  escena.fog = new THREE.Fog(noche ? '#0d1a24' : '#a9c8c0', noche ? 25 : 60, noche ? 110 : 190)
  extras.hemi.intensity = noche ? 0.45 : 1.5
  extras.hemi.color.set(noche ? '#8aa2c8' : '#fff4e0')
  extras.hemi.groundColor.set(noche ? '#1a2418' : '#4a5a40')
  extras.sol.intensity = noche ? 0.45 : 2.2
  extras.sol.color.set(noche ? '#9fb4d8' : '#fff1d6')
  const vidrioNoche = new THREE.MeshLambertMaterial({ color: '#ffd27a', emissive: '#ffb347', emissiveIntensity: 0.9 })
  escena.traverse((o) => {
    if (o.userData.esVidrio) {
      if (!o.userData.materialDia) o.userData.materialDia = o.material
      o.material = noche ? vidrioNoche : o.userData.materialDia
    }
    if (o.userData.esBombita) o.material.emissiveIntensity = noche ? 1.4 : 0.3
    if (o.userData.esLuz) o.material.emissiveIntensity = noche ? 1.6 : 0.6
  })
  for (const l of extras.lucesPunto) escena.remove(l)
  extras.lucesPunto = []
  if (noche) {
    for (const p of mapa.luces) {
      const luz = new THREE.PointLight('#ffcf7a', 10, 13, 1.6)
      luz.position.copy(p)
      escena.add(luz)
      extras.lucesPunto.push(luz)
    }
  }
}

// Viento (no es física de verdad): cada árbol se inclina un poco desde la base, con ráfagas que
// recorren el terreno de oeste a este y un vaivén propio de cada árbol
export function moverArboles(mapa, t) {
  for (const { g, fase, amplitud } of mapa.vivos) {
    const rafaga = 0.6 + 0.4 * Math.sin(t * 0.6 - g.position.x * 0.04)
    const vaiven = Math.sin(t * 1.8 + fase) * 0.5 + 0.5
    g.rotation.z = -amplitud * rafaga * (0.4 + vaiven)
    g.rotation.x = amplitud * 0.3 * Math.sin(t * 1.3 + fase * 1.7)
  }
}
