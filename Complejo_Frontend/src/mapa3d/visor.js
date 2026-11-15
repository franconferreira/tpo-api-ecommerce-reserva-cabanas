import * as THREE from 'three'
import { personaReferencia } from './piezas'
import { crearCabana, VARIANTES } from './modelos/cabana'
import { crearGalpon } from './modelos/galpon'
import { crearCasaPrincipal } from './modelos/casaPrincipal'

// Visor de trabajo: un modelo con 4 cámaras fijas, grilla de 1 m y el personaje de 1,75 m.
const MODELOS = { cabana: crearCabana, galpon: crearGalpon, casa: crearCasaPrincipal }

const params = new URLSearchParams(location.search)
const nombreModelo = params.get('modelo') || 'cabana'
const contenedor = document.getElementById('visor')

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(1)
renderer.setSize(innerWidth, innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setScissorTest(true)
contenedor.appendChild(renderer.domElement)

const escena = new THREE.Scene()
escena.background = new THREE.Color('#6f9a92')
escena.add(new THREE.HemisphereLight('#fff4e0', '#4a5a40', 1.6))
const sol = new THREE.DirectionalLight('#fff1d6', 2.2)
sol.position.set(12, 20, 14)
sol.castShadow = true
sol.shadow.mapSize.set(2048, 2048)
Object.assign(sol.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 80 })
escena.add(sol)

// Suelo y grilla: líneas cada 1 m y líneas fuertes cada 5 m
const suelo = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshLambertMaterial({ color: '#7fae8a' }))
suelo.rotation.x = -Math.PI / 2
suelo.receiveShadow = true
escena.add(suelo)
const grilla = new THREE.GridHelper(40, 40, '#3d5c46', '#5f8a6c')
grilla.position.y = 0.005
escena.add(grilla)
const grilla5 = new THREE.GridHelper(40, 8, '#28402f', '#28402f')
grilla5.position.y = 0.01
escena.add(grilla5)

// ?variante=pinos elige la variante; ?todas=1 pone las 4 variantes en fila (cada 13 m)
let modelo
if (params.get('todas') && nombreModelo === 'cabana') {
  modelo = new THREE.Group()
  Object.keys(VARIANTES).forEach((v, i) => {
    const m = crearCabana({ variante: v })
    m.position.x = i * 13
    modelo.add(m)
  })
  modelo.userData = { nombre: 'Las 4 cabañas', etapa: 'colores', avisos: [] }
} else {
  modelo = MODELOS[nombreModelo]({ variante: params.get('variante') || undefined })
}

// ?noche=1: cielo oscuro, luz de luna, ventanas encendidas y faroles prendidos
if (params.get('noche')) {
  escena.background = new THREE.Color('#0d1a24')
  escena.children.forEach((o) => {
    if (o.isHemisphereLight) { o.intensity = 0.45; o.color.set('#8aa2c8'); o.groundColor.set('#1a2418') }
    if (o.isDirectionalLight) { o.intensity = 0.5; o.color.set('#9fb4d8') }
  })
  const vidrioNoche = new THREE.MeshLambertMaterial({ color: '#ffd27a', emissive: '#ffb347', emissiveIntensity: 0.9 })
  modelo.updateMatrixWorld(true)
  const luces = []
  modelo.traverse((o) => {
    if (o.userData.esVidrio) o.material = vidrioNoche
    if (o.userData.esBombita) o.material.emissiveIntensity = 1.4
    if (o.userData.esLuz) {
      o.material.emissiveIntensity = 1.6
      luces.push(o.getWorldPosition(new THREE.Vector3()))
    }
  })
  for (const p of luces) {
    const luz = new THREE.PointLight('#ffcf7a', 8, 9, 1.6)
    luz.position.copy(p)
    escena.add(luz)
  }
}
escena.add(modelo)
const caja = new THREE.Box3().setFromObject(modelo)
const tam = caja.getSize(new THREE.Vector3())
const centro = caja.getCenter(new THREE.Vector3())
escena.add(personaReferencia(caja.max.x + 1.2, caja.max.z - 1))

// Cámaras ortográficas (miden sin deformación) y una en perspectiva
const margen = 1.5
function ortho(ancho, alto) {
  const c = new THREE.OrthographicCamera(-ancho / 2, ancho / 2, alto / 2, -alto / 2, 0.1, 200)
  return c
}
const lado = Math.max(tam.x, tam.y, tam.z) + margen * 2 + 2
const camFrente = ortho(lado, lado)
camFrente.position.set(centro.x + 1, tam.y / 2, 60)
camFrente.lookAt(centro.x + 1, tam.y / 2, 0)
const camCostado = ortho(lado, lado)
camCostado.position.set(60, tam.y / 2, centro.z)
camCostado.lookAt(0, tam.y / 2, centro.z)
const camArriba = ortho(lado, lado)
camArriba.position.set(centro.x + 1, 60, centro.z)
camArriba.up.set(0, 0, -1)
camArriba.lookAt(centro.x + 1, 0, centro.z)
const camTres = new THREE.PerspectiveCamera(35, 1, 0.1, 300)
camTres.position.set(centro.x + lado * 0.95, lado * 0.75, centro.z + lado * 1.15)
camTres.lookAt(centro.x, tam.y * 0.4, centro.z)

// Tres cuartos desde atrás (para revisar el fondo y el otro costado)
const camTrasera = new THREE.PerspectiveCamera(35, 1, 0.1, 300)
camTrasera.position.set(centro.x - lado * 0.95, lado * 0.75, centro.z - lado * 1.15)
camTrasera.lookAt(centro.x, tam.y * 0.4, centro.z)

// ?cuarta=trasera reemplaza la vista desde arriba por la de atrás
const cuarta = params.get('cuarta') === 'trasera'
  ? { cam: camTrasera, nombre: 'Tres cuartos (atrás)' }
  : { cam: camArriba, nombre: 'Desde arriba' }
const vistas = [
  { cam: camFrente, nombre: 'Frente' },
  { cam: camCostado, nombre: 'Costado (derecho)' },
  { cam: camTres, nombre: 'Tres cuartos' },
  cuarta
]

// Etiquetas
for (const [i, v] of vistas.entries()) {
  const e = document.createElement('div')
  e.className = 'etiqueta'
  e.textContent = v.nombre
  e.style.left = (i % 2) * 50 + 0.5 + 'vw'
  e.style.top = Math.floor(i / 2) * 50 + 1 + 'vh'
  contenedor.appendChild(e)
}
const t = document.createElement('div')
t.id = 'titulo'
const m = modelo.userData.medidas || {}
t.textContent = `${modelo.userData.nombre} · etapa: ${modelo.userData.etapa} · ` + Object.entries(m).map(([k, v]) => `${k} ${v}`).join(' · ') + ' · grilla 1 m (fuerte cada 5 m) · persona 1,75 m'
contenedor.appendChild(t)
// Incumplimientos de las reglas de aberturas (los detecta la pieza paredConAberturas)
const avisos = modelo.userData.avisos || []
const a = document.createElement('div')
a.className = 'etiqueta'
a.style.left = '50%'
a.style.bottom = '8px'
a.style.transform = 'translateX(-50%)'
a.style.background = avisos.length ? '#8a1f1fdd' : '#1f5a2fdd'
a.textContent = avisos.length ? 'Reglas: ' + avisos.join(' · ') : 'Reglas de aberturas: sin incumplimientos'
contenedor.appendChild(a)

// ?sola=0..3 muestra una sola vista a pantalla completa (para revisar detalles de cerca)
const sola = params.get('sola')
// ?cam=x,y,z&mira=x,y,z coloca la cámara de tres cuartos en un punto a elección (para revisar un detalle)
if (params.get('cam')) {
  const [cx, cy, cz] = params.get('cam').split(',').map(Number)
  const [mx, my, mz] = (params.get('mira') || '0,2,0').split(',').map(Number)
  camTres.position.set(cx, cy, cz)
  camTres.lookAt(mx, my, mz)
}
function render() {
  if (sola !== null) {
    const v = vistas[Number(sola)]
    renderer.setViewport(0, 0, innerWidth, innerHeight)
    renderer.setScissor(0, 0, innerWidth, innerHeight)
    if (v.cam.isPerspectiveCamera) {
      v.cam.aspect = innerWidth / innerHeight
      v.cam.fov = 24
    }
    v.cam.updateProjectionMatrix()
    renderer.render(escena, v.cam)
    return
  }
  const w = innerWidth / 2
  const h = innerHeight / 2
  vistas.forEach((v, i) => {
    const x = (i % 2) * w
    const y = (1 - Math.floor(i / 2)) * h
    renderer.setViewport(x, y, w, h)
    renderer.setScissor(x, y, w, h)
    const aspecto = w / h
    if (v.cam.isOrthographicCamera) {
      v.cam.left = -lado * aspecto / 2
      v.cam.right = lado * aspecto / 2
      v.cam.updateProjectionMatrix()
    } else {
      v.cam.aspect = aspecto
      v.cam.updateProjectionMatrix()
    }
    renderer.render(escena, v.cam)
  })
}
render()
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); render() })

// ?debug=techo: lista las piezas que asoman por encima de la cara superior del techo (solo para revisar)
if (params.get('debug') === 'techo' && modelo.userData.techo) {
  const { yMuro, anchoMedio, tan, espesorVertical, zDesde, zHasta } = modelo.userData.techo
  const salida = []
  modelo.updateMatrixWorld(true)
  modelo.traverse((o) => {
    if (!o.isMesh || o.userData.esTecho) return
    const b = new THREE.Box3().setFromObject(o)
    if (b.max.z < zDesde || b.min.z > zHasta) return
    const xLejos = Math.max(Math.abs(b.min.x), Math.abs(b.max.x))
    const topeTecho = yMuro + (anchoMedio - xLejos) * tan + espesorVertical
    if (b.max.y > topeTecho + 0.02 && xLejos > 1) salida.push(`[x ${b.min.x.toFixed(2)}..${b.max.x.toFixed(2)} y ${b.min.y.toFixed(2)}..${b.max.y.toFixed(2)} z ${b.min.z.toFixed(2)}..${b.max.z.toFixed(2)}]`)
  })
  a.textContent = 'Asoman por el techo: ' + (salida.join(' ') || 'nada')
}
