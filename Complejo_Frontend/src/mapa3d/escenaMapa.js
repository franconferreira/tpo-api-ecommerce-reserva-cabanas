import * as THREE from 'three'
import { caja, material } from './piezas'
import { PALETA, farol, tronco } from './detalles'
import { crearCabana } from './modelos/cabana'
import { crearGalpon } from './modelos/galpon'
import { crearCasaPrincipal } from './modelos/casaPrincipal'
import {
  TERRENO, CARTEL, ENTRADA, CONSTRUCCIONES, LAGO, ARBOLEDAS, BOSQUE_CABANAS, CAMINO, SENDEROS, ANCHO_SENDERO,
  SEPARACION_FAROLES, LLEGADA, HUELLAS, rotacion, aTerreno, dentroLaguna, distLaguna
} from './plano'
import { altura, alturaSuelo, MALLA, bosque, suave } from './relieve'
import { juntar, fusionarEstaticos } from './fusion'

// Arma el mapa completo a partir de plano.js (disenos/REGLAS_MAPA_3D.md, sección 5).
// Devuelve la escena, las construcciones (para nombres y clics) y lo necesario para los choques.

const COLORES = {
  suelo: '#6e9a4a',
  sueloBosque: '#4f7a3c',
  cordon: '#9c8a76',
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
// Curva suave (Catmull-Rom) que pasa por los puntos: así los caminos doblan en curva y no en ángulo
function curva(puntos) {
  if (puntos.length < 3) return puntos
  const n = puntos.length
  const salida = []
  for (let i = 0; i < n - 1; i++) {
    const [p0, p1, p2, p3] = [puntos[Math.max(0, i - 1)], puntos[i], puntos[i + 1], puntos[Math.min(n - 1, i + 2)]]
    const pasos = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 1.5))
    for (let k = 0; k < pasos; k++) {
      const t = k / pasos
      const t2 = t * t
      const t3 = t2 * t
      salida.push([0, 1].map((e) => 0.5 * (2 * p1[e] + (-p0[e] + p2[e]) * t + (2 * p0[e] - 5 * p1[e] + 4 * p2[e] - p3[e]) * t2 + (-p0[e] + 3 * p1[e] - 3 * p2[e] + p3[e]) * t3)))
    }
  }
  salida.push(puntos[n - 1])
  return salida
}

const RECORRIDOS = [
  { puntos: curva(CAMINO.puntos), ancho: CAMINO.ancho, sobre: 0.05 },
  ...SENDEROS.map((s) => ({
    puntos: curva(s.hasta ? [...s.puntos, aTerreno(porId[s.hasta], 0, LLEGADA[porId[s.hasta].tipo])] : s.puntos),
    ancho: ANCHO_SENDERO,
    sobre: 0.045
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
  if (enLosa(x, z, margen)) return false
  if (Math.abs(x - ENTRADA.x) < 9 && z > ENTRADA.z - 3) return false
  if (Math.abs(z - CERCA.z) < 1.2) return false // la línea de la cerca queda libre
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
  tallo: new THREE.BoxGeometry(1, 1, 1).toNonIndexed(),
  hoja: new THREE.ConeGeometry(1, 1, 3).translate(0, 0.5, 0).toNonIndexed() // hoja de pasto con la base en el suelo
}
const COLORES_PASTO = ['#4b7434', '#55803a', '#5f8c40', '#456b30'] // un poco más oscuros que el suelo
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
  piezas.push({ geo: GEO_PLANTA.tallo, color: VERDE_TALLO, x, y: y + alto / 2, z, sx: 0.03, sy: alto, sz: 0.03, suelo: y })
  const r = 0.08 + azar() * 0.04
  piezas.push({ geo: GEO_PLANTA.flor, color, x, y: y + alto, z, sx: r * 1.4, sy: r * 0.8, sz: r * 1.4, giro: azar(), suelo: y })
  // mata de hojas al pie (en la mitad de las flores), para que se lean como cantero
  if (azar() < 0.5) piezas.push({ geo: GEO_PLANTA.mata, color: COLORES_ARBUSTO[1], x, y: y + 0.05, z, sx: 0.18, sy: 0.12, sz: 0.18, giro: azar() * 3, suelo: y })
}

// Un arbusto: 2 o 3 bolas bajas de follaje
function arbusto(piezas, x, z) {
  const y = alturaSuelo(x, z)
  const color = COLORES_ARBUSTO[Math.floor(azar() * COLORES_ARBUSTO.length)]
  const n = 2 + Math.floor(azar() * 2)
  for (let i = 0; i < n; i++) {
    const r = 0.45 + azar() * 0.35
    piezas.push({ geo: GEO_PLANTA.mata, color, x: x + (azar() - 0.5) * 0.9, y: y + r * 0.55, z: z + (azar() - 0.5) * 0.9, sx: r, sy: r * 0.8, sz: r, giro: azar() * 3, suelo: y, flex: 0.08 })
  }
}

// Mata de pasto: varias hojas finas que se abren hacia afuera
function mataPasto(piezas, x, z) {
  const y = alturaSuelo(x, z)
  const hojas = 7 + Math.floor(azar() * 4)
  for (let i = 0; i < hojas; i++) {
    const alto = 0.3 + azar() * 0.3
    piezas.push({
      geo: GEO_PLANTA.hoja, color: COLORES_PASTO[Math.floor(azar() * COLORES_PASTO.length)],
      x: x + (azar() - 0.5) * 0.3, y, z: z + (azar() - 0.5) * 0.3,
      sx: 0.035, sy: alto, sz: 0.035, inclina: (azar() - 0.5) * 0.7, giro: azar() * Math.PI * 2, suelo: y, flex: 1.4
    })
  }
}

// Las plantas se juntan por zonas de 24 m: así el viento solo mueve las zonas cercanas a la cámara
const ZONA = 24
function mallasPorZona(piezas) {
  const zonas = new Map()
  for (const p of piezas) {
    const clave = `${Math.floor(p.x / ZONA)},${Math.floor(p.z / ZONA)}`
    if (!zonas.has(clave)) zonas.set(clave, [])
    zonas.get(clave).push(p)
  }
  const mallas = []
  for (const [clave, lista] of zonas) {
    const [i, j] = clave.split(',').map(Number)
    const m = fusionar(lista, true)
    const peso = m.geometry.userData.peso
    // solo se recorren los vértices que se mueven (los de la base quedan fijos)
    const moviles = []
    for (let k = 0; k < peso.length; k++) if (peso[k] > 0) moviles.push(k)
    m.userData.viento = {
      base: Float32Array.from(m.geometry.attributes.position.array),
      peso,
      moviles: Uint32Array.from(moviles),
      x: (i + 0.5) * ZONA,
      z: (j + 0.5) * ZONA
    }
    mallas.push(m)
  }
  return mallas
}

function plantas(T, anchoT, fondoT) {
  const g = new THREE.Group()
  const flores = []
  const matas = []
  const b = T.bosque

  // Flores a los dos lados del camino principal, en tramos del mismo color (como canteros)
  const pts = RECORRIDOS[0].puntos
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
        if (z > TERRENO.zMax - 1 || sobreCamino(x, z, 0.1) || Math.hypot(x - CARTEL.x, z - CARTEL.z) < 3.5) continue
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
      if (!dentroLaguna(x, z) && !sobreCamino(x, z, 1.3)) arbusto(matas, x, z)
    }
  }

  // Matas de pasto por todo el terreno (fuera de los caminos, la laguna y las construcciones)
  const pastos = []
  for (let i = 0; i < 1300; i++) {
    const x = T.xMin + b + azar() * (anchoT - b * 2)
    const z = T.zMin + b + azar() * (fondoT - b * 2)
    if (libre(x, z, 0.6)) mataPasto(pastos, x, z)
  }

  for (const m of mallasPorZona([...flores, ...matas, ...pastos])) g.add(m)
  return g
}

// ---- Caminos de piedra: todos con la misma textura, que se apoya según la posición en el mundo
// (así no se notan las uniones entre tramos), con un cordón más oscuro a los costados ----

// Patio de la casa principal (entre las galerías), relleno con camino hasta donde termina el camino principal
const casaPatio = CONSTRUCCIONES.find((c) => c.tipo === 'casa')
const PATIO = { x0: casaPatio.x - 4, x1: casaPatio.x + 4, z0: casaPatio.z - 1.25, z1: casaPatio.z + 11 }
// Explanada del galpón: rectángulo redondeado que cubre la pérgola y sigue hacia el sur (el galpón no está girado)
const galpon = CONSTRUCCIONES.find((c) => c.tipo === 'galpon')
const EXPLANADA = { cx: galpon.x, cz: galpon.z + 15.6, ancho: 13, fondo: 8.8, radio: 2.5 }
const enExplanada = (x, z, m = 0) => {
  const e = EXPLANADA
  const dx = Math.max(Math.abs(x - e.cx) - (e.ancho / 2 - e.radio), 0)
  const dz = Math.max(Math.abs(z - e.cz) - (e.fondo / 2 - e.radio), 0)
  return Math.hypot(dx, dz) < e.radio + m
}
const enPatio = (x, z, m = 0) => x > PATIO.x0 - m && x < PATIO.x1 + m && z > PATIO.z0 - m && z < PATIO.z1 + m
const enLosa = (x, z, m = 0) => enPatio(x, z, m) || enExplanada(x, z, m)

const TAMANO_TEXTURA = 3 // metros que abarca una repetición de la textura

// Piedras irregulares de tonos claros con junta (dibujadas en un canvas, que se repite sin cortes)
function texturaPiedras() {
  const lado = 512
  const lienzo = document.createElement('canvas')
  lienzo.width = lado
  lienzo.height = lado
  const ctx = lienzo.getContext('2d')
  ctx.fillStyle = '#efe7da'
  ctx.fillRect(0, 0, lado, lado)
  const tonos = ['#d9ccbb', '#cbbba8', '#e3d8ca', '#bfae9b', '#d2c3b1']
  const celdas = 6
  const celda = lado / celdas
  for (let i = 0; i < celdas; i++) {
    for (let j = 0; j < celdas; j++) {
      const cx = (i + 0.5 + (azar() - 0.5) * 0.3) * celda
      const cy = (j + 0.5 + (azar() - 0.5) * 0.3) * celda
      const puntas = 6 + Math.floor(azar() * 3)
      const radios = Array.from({ length: puntas }, () => celda * (0.36 + azar() * 0.1))
      const giro = azar() * Math.PI
      ctx.fillStyle = tonos[Math.floor(azar() * tonos.length)]
      // se dibuja también corrida un lado, para que la piedra que se sale del borde aparezca del otro
      for (const ox of [-lado, 0, lado]) {
        for (const oy of [-lado, 0, lado]) {
          ctx.beginPath()
          for (let k = 0; k <= puntas; k++) {
            const ang = giro + (k % puntas) * ((Math.PI * 2) / puntas)
            const r = radios[k % puntas]
            const px = cx + ox + Math.cos(ang) * r
            const py = cy + oy + Math.sin(ang) * r
            if (k === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.closePath()
          ctx.lineJoin = 'round'
          ctx.lineWidth = celda * 0.12 // bordes redondeados
          ctx.strokeStyle = ctx.fillStyle
          ctx.fill()
          ctx.stroke()
        }
      }
    }
  }
  const textura = new THREE.CanvasTexture(lienzo)
  textura.wrapS = THREE.RepeatWrapping
  textura.wrapT = THREE.RepeatWrapping
  textura.colorSpace = THREE.SRGBColorSpace
  textura.anisotropy = 8
  return textura
}

// Muestras cada ~1 m a lo largo de un recorrido
function muestrear(puntos) {
  const muestras = []
  for (let i = 0; i < puntos.length - 1; i++) {
    const [ax, az] = puntos[i]
    const [bx, bz] = puntos[i + 1]
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az)))
    for (let k = 0; k < n; k++) muestras.push([ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n])
  }
  muestras.push(puntos[puntos.length - 1])
  return muestras
}

// Cinta que sigue el suelo a lo largo de las muestras
function cinta(muestras, ancho, sobre) {
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
      indices.push(v - 2, v, v - 1, v - 1, v, v + 1) // caras hacia arriba
    }
  })
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

// Unión redonda que también sigue el suelo (un abanico de triángulos)
function disco(x, z, radio, sobre) {
  const pos = []
  const lados = 14
  const centro = [x, alturaSuelo(x, z) + sobre, z]
  for (let k = 0; k < lados; k++) {
    const a0 = (k / lados) * Math.PI * 2
    const a1 = ((k + 1) / lados) * Math.PI * 2
    const p = (a) => [x + Math.cos(a) * radio, alturaSuelo(x + Math.cos(a) * radio, z + Math.sin(a) * radio) + sobre, z + Math.sin(a) * radio]
    pos.push(...centro, ...p(a1), ...p(a0))
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.computeVertexNormals()
  return geo
}

// Losa rectangular que sigue el suelo (el patio de la casa)
function losa({ x0, z0, x1, z1 }, sobre) {
  const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, Math.ceil(x1 - x0), Math.ceil(z1 - z0))
  geo.rotateX(-Math.PI / 2)
  geo.translate((x0 + x1) / 2, 0, (z0 + z1) / 2)
  const p = geo.attributes.position
  for (let i = 0; i < p.count; i++) p.setY(i, alturaSuelo(p.getX(i), p.getZ(i)) + sobre)
  geo.computeVertexNormals()
  return geo
}

// Explanada con bordes redondeados: anillos desde el centro hasta el contorno, siguiendo el suelo
function explanada(sobre) {
  const e = EXPLANADA
  const contorno = []
  const esquinas = [[1, 1], [-1, 1], [-1, -1], [1, -1]]
  esquinas.forEach(([sx, sz], k) => {
    const cx = e.cx + sx * (e.ancho / 2 - e.radio)
    const cz = e.cz + sz * (e.fondo / 2 - e.radio)
    for (let i = 0; i <= 5; i++) {
      const a = (k * Math.PI) / 2 + (i / 5) * (Math.PI / 2)
      contorno.push([cx + Math.cos(a) * e.radio, cz + Math.sin(a) * e.radio])
    }
  })
  const anillos = [0, 0.25, 0.5, 0.75, 1]
  const punto = ([x, z], f) => {
    const px = e.cx + (x - e.cx) * f
    const pz = e.cz + (z - e.cz) * f
    return [px, alturaSuelo(px, pz) + sobre, pz]
  }
  const pos = []
  for (let j = 0; j < anillos.length - 1; j++) {
    for (let k = 0; k < contorno.length; k++) {
      const a = contorno[k]
      const b = contorno[(k + 1) % contorno.length]
      const a0 = punto(a, anillos[j])
      const b0 = punto(b, anillos[j])
      const a1 = punto(a, anillos[j + 1])
      const b1 = punto(b, anillos[j + 1])
      pos.push(...a0, ...b1, ...a1, ...a0, ...b0, ...b1)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.computeVertexNormals()
  return geo
}

// ¿El punto cae sobre algún camino (o el patio, o la explanada)?
function sobreCamino(x, z, margen = 0) {
  if (enLosa(x, z, margen)) return true
  return RECORRIDOS.some((r) => r.puntos.some((p, i) => i < r.puntos.length - 1 && distSegmento(x, z, p, r.puntos[i + 1]) < r.ancho / 2 + margen))
}

// Cordón a un costado: tramos que no pisan otro camino (en los cruces se corta)
function cordones(r, piezas) {
  const muestras = muestrear(r.puntos)
  const otros = RECORRIDOS.filter((o) => o !== r)
  const pisaOtro = (x, z) => enLosa(x, z) || otros.some((o) => o.puntos.some((p, i) => i < o.puntos.length - 1 && distSegmento(x, z, p, o.puntos[i + 1]) < o.ancho / 2 + 0.05))
  for (const lado of [-1, 1]) {
    let tramo = []
    const cerrar = () => {
      if (tramo.length > 1) piezas.push({ geo: cinta(tramo, 0.18, r.sobre + 0.012), color: COLORES.cordon })
      tramo = []
    }
    muestras.forEach(([x, z], i) => {
      const [px0, pz0] = muestras[Math.max(0, i - 1)]
      const [px1, pz1] = muestras[Math.min(muestras.length - 1, i + 1)]
      const largo = Math.hypot(px1 - px0, pz1 - pz0) || 1
      const off = (r.ancho / 2 - 0.09) * lado
      const cx = x + (-(pz1 - pz0) / largo) * off
      const cz = z + ((px1 - px0) / largo) * off
      if (pisaOtro(cx, cz)) cerrar()
      else tramo.push([cx, cz])
    })
    cerrar()
  }
}

// Todos los caminos en una sola malla con textura de piedras (la textura se ubica por x, z del mundo)
function caminos() {
  const g = new THREE.Group()
  const piezas = []
  for (const r of RECORRIDOS) {
    piezas.push({ geo: cinta(muestrear(r.puntos), r.ancho, r.sobre) })
    // uniones redondas en las puntas (las curvas ya no tienen esquinas)
    for (const [x, z] of [r.puntos[0], r.puntos[r.puntos.length - 1]]) piezas.push({ geo: disco(x, z, r.ancho / 2, r.sobre - 0.004) })
  }
  piezas.push({ geo: losa(PATIO, 0.04) }, { geo: explanada(0.04) })
  const geo = juntar(piezas.map((p) => ({ ...p, color: '#ffffff' })))
  const pos = geo.attributes.position
  const uv = []
  for (let i = 0; i < pos.count; i++) uv.push(pos.getX(i) / TAMANO_TEXTURA, pos.getZ(i) / TAMANO_TEXTURA)
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  const malla = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: texturaPiedras() }))
  malla.receiveShadow = true
  malla.userData.noFusionar = true
  g.add(malla)
  // cordones
  const bordes = []
  for (const r of RECORRIDOS) cordones(r, bordes)
  g.add(fusionarPiezas(bordes))
  return g
}

function fusionarPiezas(piezas) {
  const m = new THREE.Mesh(juntar(piezas), MAT_COLORES)
  m.receiveShadow = true
  return m
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
      if (Math.hypot(x - CARTEL.x, z - CARTEL.z) < 4) cerca = true
      if (sobreCamino(x, z, 0.4)) cerca = true // que no quede encima de otro camino
      if (z > TERRENO.zMax - 2) cerca = true
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
  // el agua se estira 1,2 m más allá del contorno: el borde queda debajo de la orilla y no se ven huecos
  const cx = LAGO.contorno.reduce((s, p) => s + p[0], 0) / LAGO.contorno.length
  const cz = LAGO.contorno.reduce((s, p) => s + p[1], 0) / LAGO.contorno.length
  const forma = new THREE.Shape(LAGO.contorno.map(([x, z]) => {
    const r = Math.hypot(x - cx, z - cz) || 1
    return new THREE.Vector2(x + ((x - cx) / r) * 1.2, -(z + ((z - cz) / r) * 1.2))
  }))
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

// Letrero de madera con letras talladas claras (la misma letra de los títulos del sitio)
function letrero(texto) {
  const lienzo = document.createElement('canvas')
  lienzo.width = 1024
  lienzo.height = 205
  const ctx = lienzo.getContext('2d')
  const dibujar = () => {
    ctx.fillStyle = PALETA.tabla
    ctx.fillRect(0, 0, lienzo.width, lienzo.height)
    ctx.strokeStyle = PALETA.viga
    ctx.lineWidth = 14
    ctx.strokeRect(10, 10, lienzo.width - 20, lienzo.height - 20)
    ctx.fillStyle = '#f2e6cc'
    ctx.font = '86px "Cinzel Decorative", serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(texto, lienzo.width / 2, lienzo.height / 2 + 4)
  }
  dibujar()
  const textura = new THREE.CanvasTexture(lienzo)
  textura.colorSpace = THREE.SRGBColorSpace
  // si la letra todavía no cargó, se vuelve a dibujar cuando esté
  if (document.fonts) {
    document.fonts.load('86px "Cinzel Decorative"').then(() => {
      dibujar()
      textura.needsUpdate = true
    }).catch(() => {})
  }
  return new THREE.MeshLambertMaterial({ map: textura })
}

// ---- Cerca de la entrada: a los dos lados del portal hasta los bordes del terreno, apoyada en el suelo ----
// Cada poste va a la altura del suelo en su lugar y los travesaños van inclinados de poste a poste.
const CERCA = { z: ENTRADA.z, paso: 2, hueco: ENTRADA.anchoPortal / 2 + 0.3 }
function cercaEntrada() {
  const g = new THREE.Group()
  for (const lado of [-1, 1]) {
    const desde = lado * CERCA.hueco
    const hasta = lado > 0 ? TERRENO.xMax : TERRENO.xMin
    const postes = []
    for (let x = desde; lado > 0 ? x <= hasta : x >= hasta; x += lado * CERCA.paso) postes.push([x, alturaSuelo(x, CERCA.z)])
    postes.forEach(([x, y], i) => {
      g.add(caja(0.12, 1.05, 0.12, PALETA.viga, x, y - 0.05, CERCA.z))
      if (i === 0) return
      const [x0, y0] = postes[i - 1]
      for (const alto of [0.4, 0.75]) {
        const largo = Math.hypot(x - x0, y - y0)
        const travesano = caja(largo, 0.1, 0.06, PALETA.viga, 0, -0.05, 0)
        travesano.position.set((x + x0) / 2, (y + y0) / 2 + alto, CERCA.z + 0.06)
        travesano.rotation.z = Math.atan2(y - y0, x - x0)
        g.add(travesano)
      }
    })
  }
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
  // tabla colgada con el nombre del complejo (de los dos lados)
  g.add(caja(2.6, 0.55, 0.08, PALETA.tabla, 0, 2.9, 0))
  const nombre = letrero('Whispering Pines')
  for (const lado of [1, -1]) {
    const cara = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 0.5), nombre)
    cara.position.set(0, 3.175, lado * 0.045)
    if (lado < 0) cara.rotation.y = Math.PI
    cara.userData.noFusionar = true
    g.add(cara)
  }
  g.add(caja(0.03, 0.2, 0.03, PALETA.hierro, -1, 3.45, 0))
  g.add(caja(0.03, 0.2, 0.03, PALETA.hierro, 1, 3.45, 0))
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
  g.rotation.y = CARTEL.giro
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
    escena.add(farolesDe(r, luces))
  }
  escena.add(caminos(), laguna(), portal(), cercaEntrada(), cartel(opciones.anchoPoster))

  // Construcciones
  const construcciones = []
  const humos = [] // chimeneas con humo animado
  for (const c of CONSTRUCCIONES) {
    const crear = { cabana: crearCabana, galpon: crearGalpon, casa: crearCasaPrincipal }[c.tipo]
    const m = crear({ variante: c.variante })
    m.position.set(c.x, alturaSuelo(c.x, c.z), c.z)
    m.rotation.y = rotacion(c)
    // los faroles propios del modelo que caen sobre un camino (de otra construcción) se sacan
    m.updateMatrixWorld(true)
    const faroles = []
    m.traverse((o) => { if (o.userData.esFarol) faroles.push(o) })
    for (const f of faroles) {
      const p = f.getWorldPosition(new THREE.Vector3())
      if (sobreCamino(p.x, p.z, 0.6)) f.parent.remove(f)
    }
    // el pasto propio del modelo se saca: el del mapa se mueve con el viento y no pisa los caminos
    const pastoModelo = []
    m.traverse((o) => { if (o.userData.esPasto) pastoModelo.push(o) })
    for (const p of pastoModelo) p.parent.remove(p)
    // el humo de la chimenea se saca del modelo y se arma suelto en el mundo, para animarlo con el viento
    const conHumo = []
    m.traverse((o) => { if (o.userData.esHumo) conHumo.push(o) })
    for (const h of conHumo) {
      let base = null
      for (const bola of h.children) {
        const p = bola.getWorldPosition(new THREE.Vector3())
        if (!base || p.y < base.y) base = p
      }
      h.parent.remove(h)
      if (base) humos.push(chimenea(escena, base))
    }
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
    vivos.push({ g: m, fase: azar() * Math.PI * 2, amplitud: (tipo === 'pino' ? 0.045 : 0.07) * (0.8 + azar() * 0.4) })
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
  // Arbustos y flores, cada grupo en una sola malla (son muchos y chiquitos)
  escena.add(plantas(T, anchoT, fondoT))

  if (lejanos.length) {
    const bosqueLejano = new THREE.Mesh(juntar(lejanos), MAT_COLORES)
    bosqueLejano.receiveShadow = true
    escena.add(bosqueLejano)
  }

  // Plantas con viento (zonas de pasto, flores y arbustos) y faroles que se hamacan
  const conViento = []
  escena.traverse((o) => { if (o.userData.viento) conViento.push(o) })
  const lamparas = []
  escena.updateMatrixWorld(true)
  escena.traverse((o) => {
    if (!o.userData.esLampara) return
    // el viento pasado a las coordenadas del farol (cada uno está girado distinto)
    const giro = o.parent.getWorldQuaternion(new THREE.Quaternion()).invert()
    const local = new THREE.Vector3(VIENTO[0], 0, VIENTO[1]).applyQuaternion(giro)
    const p = o.getWorldPosition(new THREE.Vector3())
    lamparas.push({ g: o, lx: local.x, lz: local.z, avance: p.x * VIENTO[0] + p.z * VIENTO[1], fase: azar() * Math.PI * 2 })
  })

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
  for (const h of humos) for (const b of h.bolas) b.matrixAutoUpdate = true // y el humo
  for (const l of lamparas) l.g.matrixAutoUpdate = true // y los faroles

  let poster = null
  escena.traverse((o) => { if (o.userData.esPoster) poster = o })

  return { escena, construcciones, arboles, luces, vivos, poster, humos, conViento, lamparas }
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
    const m = c.tipo === 'cabana' ? 0.35 : 0.6
    for (const [x0, z0, x1, z1] of CHOQUES[c.tipo]) if (lx > x0 - m && lx < x1 + m && lz > z0 - m && lz < z1 + m) return false
  }
  // la cerca de la entrada: solo se pasa por el portal
  if (Math.abs(z - CERCA.z) < 0.35 && Math.abs(x - ENTRADA.x) > CERCA.hueco - 0.3) return false
  // el cartel (girado): se pasa el punto a sus coordenadas
  const cx = x - CARTEL.x
  const cz = z - CARTEL.z
  const lxc = cx * Math.cos(CARTEL.giro) - cz * Math.sin(CARTEL.giro)
  const lzc = cx * Math.sin(CARTEL.giro) + cz * Math.cos(CARTEL.giro)
  if (Math.abs(lzc) < 0.4 && Math.abs(lxc) < CARTEL.ancho / 2 + 1) return false
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
  cabana: [[-3.25, -3, 3.25, 5.2], [-0.7, 5.2, 0.7, 6.7]], // casa con porche y la escalera
  galpon: [[-6, -11, 6, 11], [-3, -16, 3, -11]],
  casa: [[-11.5, -10.25, 11.5, -3.25], [-11.5, -3.25, -6, 10.25], [6, -3.25, 11.5, 10.25]]
}

// Hora del día: h = 0 es pleno día, 1 es noche cerrada y en el medio pasa por el atardecer (colores cálidos).
// Se llama en cada cuadro mientras dura el cambio, así el paso es gradual.
const lerp = (a, b, t) => a + (b - a) * t
const COLOR = (c) => new THREE.Color(c)
const TONOS = {
  cielo: [COLOR('#a9c8c0'), COLOR('#e7a07a'), COLOR('#0d1a24')],
  hemi: [COLOR('#fff4e0'), COLOR('#ffcfa0'), COLOR('#8aa2c8')],
  suelo: [COLOR('#4a5a40'), COLOR('#5a4a38'), COLOR('#1a2418')],
  sol: [COLOR('#fff1d6'), COLOR('#ff9c5a'), COLOR('#9fb4d8')]
}
// día -> atardecer -> noche
function tono(lista, h, salida) {
  if (h < 0.5) return salida.copy(lista[0]).lerp(lista[1], h * 2)
  return salida.copy(lista[1]).lerp(lista[2], (h - 0.5) * 2)
}

export function aplicarHora(mapa, h, extras) {
  const { escena } = mapa
  extras.h = h
  if (!extras.listo) {
    // la primera vez: fondo, niebla, un solo material para todos los vidrios y las luces de los faroles (apagadas)
    escena.background = new THREE.Color()
    escena.fog = new THREE.Fog('#000000', 60, 190)
    extras.vidrio = null
    extras.bombitas = []
    extras.focos = []
    escena.traverse((o) => {
      if (o.userData.esVidrio) {
        if (!extras.vidrio) {
          extras.vidrio = new THREE.MeshLambertMaterial({ color: o.material.color.clone(), emissive: '#ffb347', emissiveIntensity: 0 })
          extras.colorVidrio = o.material.color.clone()
        }
        o.material = extras.vidrio
      }
      if (o.userData.esBombita) extras.bombitas.push(o.material)
      if (o.userData.esLuz) extras.focos.push(o.material)
    })
    extras.lucesPunto = mapa.luces.map((p) => {
      const luz = new THREE.PointLight('#ffcf7a', 0, 13, 1.6)
      luz.position.copy(p)
      escena.add(luz)
      return luz
    })
    extras.listo = true
  }
  tono(TONOS.cielo, h, escena.background)
  if (escena.fog) {
    escena.fog.color.copy(escena.background)
    escena.fog.near = lerp(60, 25, h)
    escena.fog.far = lerp(190, 110, h)
  }
  extras.hemi.intensity = lerp(1.5, 0.45, h)
  tono(TONOS.hemi, h, extras.hemi.color)
  tono(TONOS.suelo, h, extras.hemi.groundColor)
  extras.sol.intensity = h < 0.5 ? lerp(2.2, 1.1, h * 2) : lerp(1.1, 0.45, (h - 0.5) * 2)
  tono(TONOS.sol, h, extras.sol.color)
  // las luces se van prendiendo durante el atardecer
  const prendidas = suave((h - 0.3) / 0.4)
  if (extras.vidrio) {
    extras.vidrio.emissiveIntensity = 0.9 * prendidas
    extras.vidrio.color.copy(extras.colorVidrio).lerp(COLOR('#ffd27a'), prendidas)
  }
  for (const m of extras.bombitas) m.emissiveIntensity = 0.3 + 1.1 * prendidas
  for (const m of extras.focos) m.emissiveIntensity = 0.6 + 1.0 * prendidas
  for (const l of extras.lucesPunto) l.intensity = 10 * prendidas
}

// Viento (no es física de verdad): siempre sopla para el mismo lado (del oeste-suroeste hacia el este-noreste).
// Los árboles se inclinan hacia ahí desde la base, con ráfagas que avanzan en esa dirección,
// y el humo de las chimeneas se corre para el mismo lado mientras sube.
export const VIENTO = [0.94, -0.34]

const GEO_HUMO = new THREE.IcosahedronGeometry(0.4, 0)

// Bocanadas de humo que salen de una chimenea (cada una con su material, para desvanecerse por separado)
function chimenea(escena, base) {
  const bolas = []
  for (let i = 0; i < 8; i++) {
    const b = new THREE.Mesh(GEO_HUMO, new THREE.MeshLambertMaterial({ color: PALETA.humo, transparent: true, depthWrite: false, flatShading: true }))
    b.userData.noFusionar = true
    escena.add(b)
    bolas.push(b)
  }
  return { x: base.x, y: base.y, z: base.z, bolas }
}

// Ráfaga en un punto: más fuerte o más débil según avanza por el terreno en la dirección del viento
const rafaga = (t, avance) => 0.55 + 0.45 * Math.sin(t * 0.7 - avance * 0.05)

// Para el sonido: la ráfaga en un punto (0 a 1), si el punto cae sobre piedra y cuántos árboles hay cerca (0 a 1)
export const rafagaEn = (t, x, z) => (rafaga(t, x * VIENTO[0] + z * VIENTO[1]) - 0.1) / 0.9
export const sobrePiedra = (x, z) => sobreCamino(x, z, -0.1)
export function bosqueCerca(mapa, x, z) {
  let n = 0
  for (const [ax, az] of mapa.arboles) if (Math.abs(ax - x) < 18 && Math.abs(az - z) < 18) n++
  return Math.min(1, n / 25)
}

export function moverArboles(mapa, t, camara) {
  const [vx, vz] = VIENTO
  for (const { g, fase, amplitud } of mapa.vivos) {
    const avance = g.position.x * vx + g.position.z * vz
    const vaiven = 0.5 + 0.5 * Math.sin(t * 1.9 + fase)
    const inclinacion = amplitud * rafaga(t, avance) * (0.5 + vaiven)
    // con el orden de giro 'XZY', girar en Z inclina la copa hacia X y girar en X la inclina hacia Z
    g.rotation.z = -inclinacion * vx
    g.rotation.x = inclinacion * vz
  }
  // humo: cada bocanada sube, crece, se corre con el viento y se desvanece; después vuelve a empezar
  for (const h of mapa.humos) {
    h.bolas.forEach((b, i) => {
      const f = (t * 0.14 + i / h.bolas.length) % 1
      const corrida = f * f * 3.6
      b.position.set(h.x + vx * corrida, h.y + f * 4.5, h.z + vz * corrida)
      b.scale.setScalar(0.45 + f * 1.7)
      b.material.opacity = 0.8 * Math.min(1, f * 6) * (1 - f)
    })
  }
  // faroles: la parte que cuelga se hamaca hacia donde sopla (el farol queda abajo del eje)
  for (const l of mapa.lamparas) {
    const ang = 0.12 * rafaga(t, l.avance) * (0.6 + 0.4 * Math.sin(t * 2.2 + l.fase))
    l.g.rotation.z = ang * l.lx
    l.g.rotation.x = -ang * l.lz
  }
  // plantas: se corre cada vértice según su peso (más arriba, más se mueve). Solo las zonas cerca de la cámara,
  // y cada zona cada dos cuadros (alternadas), para no cargar de más
  mapa.cuadro = (mapa.cuadro || 0) + 1
  mapa.conViento.forEach((m, n) => {
    const v = m.userData.viento
    if ((n + mapa.cuadro) % 2 || (camara && Math.hypot(v.x - camara.x, v.z - camara.z) > 40)) return
    const atributo = m.geometry.attributes.position
    const pos = atributo.array
    const fuerza = rafaga(t, v.x * vx + v.z * vz) // la ráfaga casi no cambia dentro de una zona
    for (const i of v.moviles) {
      const k = i * 3
      const x = v.base[k]
      const z = v.base[k + 2]
      const d = v.peso[i] * fuerza * (0.6 + 0.4 * Math.sin(t * 2.6 + x * 1.3 + z * 0.7))
      pos[k] = x + vx * d
      pos[k + 2] = z + vz * d
    }
    atributo.needsUpdate = true
  })
}
