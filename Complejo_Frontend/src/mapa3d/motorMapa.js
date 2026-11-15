import * as THREE from 'three'
import { crearMapa, puedeEstar, aplicarHora, alturaPiso, moverArboles } from './escenaMapa'
import { CARTEL } from './plano'

// Motor del mapa: arma la escena en `contenedor` y maneja la primera persona (teclado + arrastrar el mouse),
// los choques, el día/noche y los avisos de construcción cercana o elegida.
// Lo usan la página del sitio (Mapa3DView) y la página de prueba (visor-mapa.html).
//
// opciones:
//   alElegir(datos)    clic sobre una construcción (o tecla E estando en su frente)
//   alAcercarse(datos) al llegar al frente de una construcción (null al alejarse)
//   camara             { x, z, giro, inclinacion } para arrancar en otro lugar (ángulos en radianes)
//   aerea              vista fija desde arriba (para revisar)
const ALTURA_OJOS = 1.65

export function iniciarMapa(contenedor, opciones = {}) {
  const ancho = () => contenedor.clientWidth || innerWidth
  const alto = () => contenedor.clientHeight || innerHeight

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
  renderer.setSize(ancho(), alto())
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  contenedor.appendChild(renderer.domElement)

  // el póster con la proporción de la pantalla (alto fijo de 2,5 m)
  const mapa = crearMapa({ anchoPoster: Math.max(1.2, Math.min(6, (2.5 * ancho()) / alto())) })
  const { escena } = mapa
  const hemi = new THREE.HemisphereLight('#fff4e0', '#4a5a40', 1.5)
  const sol = new THREE.DirectionalLight('#fff1d6', 2.2)
  sol.position.set(60, 90, 50)
  sol.target.position.set(6, 0, -20)
  sol.castShadow = true
  sol.shadow.mapSize.set(4096, 4096)
  Object.assign(sol.shadow.camera, { left: -110, right: 110, top: 110, bottom: -110, near: 1, far: 320 })
  sol.shadow.bias = -0.0005
  escena.add(hemi, sol, sol.target)
  const extras = { hemi, sol, lucesPunto: [] }
  aplicarHora(mapa, false, extras)
  if (opciones.aerea) escena.fog = null

  // Persona: arranca frente al cartel, mirando el póster (norte)
  const camara = new THREE.PerspectiveCamera(65, ancho() / alto(), 0.1, 400)
  camara.rotation.order = 'YXZ'
  const jugador = { x: CARTEL.x, z: CARTEL.z + 4, giro: 0, inclinacion: 0, ...opciones.camara }

  // Teclado (sin moverse si se está escribiendo en un campo) y mouse
  const teclas = {}
  let cerca = null
  const escribiendo = (e) => ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)
  const alBajar = (e) => {
    if (escribiendo(e)) return
    teclas[e.code] = true
    if (e.code.startsWith('Arrow')) e.preventDefault() // que las flechas no muevan la página
    if (e.code === 'KeyE' && cerca && opciones.alElegir) opciones.alElegir(cerca)
  }
  const alSubir = (e) => { teclas[e.code] = false }
  let arrastrando = false
  let movido = 0
  const alApretar = () => { arrastrando = true; movido = 0 }
  const alSoltar = () => { arrastrando = false }
  const alMover = (e) => {
    if (!arrastrando) return
    movido += Math.abs(e.movementX) + Math.abs(e.movementY)
    jugador.giro -= e.movementX * 0.004
    jugador.inclinacion = Math.max(-1.2, Math.min(1.2, jugador.inclinacion - e.movementY * 0.004))
  }

  // Clic (sin arrastrar) sobre una construcción
  const rayo = new THREE.Raycaster()
  rayo.far = 45
  const alHacerClic = (e) => {
    if (movido > 5 || !opciones.alElegir) return
    const caja = renderer.domElement.getBoundingClientRect()
    const p = new THREE.Vector2(((e.clientX - caja.left) / caja.width) * 2 - 1, -((e.clientY - caja.top) / caja.height) * 2 + 1)
    rayo.setFromCamera(p, camara)
    for (const toque of rayo.intersectObjects(mapa.construcciones.map((c) => c.modelo), true)) {
      let o = toque.object
      while (o && !o.userData.construccion) o = o.parent
      if (o) {
        opciones.alElegir(o.userData.construccion)
        return
      }
    }
  }

  const alCambiarTamano = () => {
    camara.aspect = ancho() / alto()
    camara.updateProjectionMatrix()
    renderer.setSize(ancho(), alto())
  }

  addEventListener('keydown', alBajar)
  addEventListener('keyup', alSubir)
  addEventListener('mouseup', alSoltar)
  addEventListener('mousemove', alMover)
  addEventListener('resize', alCambiarTamano)
  renderer.domElement.addEventListener('mousedown', alApretar)
  renderer.domElement.addEventListener('click', alHacerClic)

  // Transición: la cámara arranca pegada al póster (que cubre justo la pantalla) y retrocede hasta la persona.
  // alMover(rect, avance) da en cada cuadro el rectángulo del póster en pantalla (px), para acompañarlo con la página
  let transicion = null
  const ESPERA = 300
  const DURACION = 2800
  const vec = new THREE.Vector3()
  function rectPoster() {
    const p = mapa.poster
    const { width, height } = p.geometry.parameters
    const esquinas = [[-width / 2, height / 2], [width / 2, -height / 2]].map(([x, y]) => {
      vec.set(x, y, 0)
      p.localToWorld(vec)
      vec.project(camara)
      return [((vec.x + 1) / 2) * ancho(), ((1 - vec.y) / 2) * alto()]
    })
    return { x: esquinas[0][0], y: esquinas[0][1], ancho: esquinas[1][0] - esquinas[0][0], alto: esquinas[1][1] - esquinas[0][1] }
  }
  function moverTransicion(ahora) {
    const t = transicion
    const lineal = Math.max(0, Math.min(1, (ahora - t.inicio - ESPERA) / DURACION))
    const avance = lineal < 0.5 ? 2 * lineal * lineal : 1 - (-2 * lineal + 2) ** 2 / 2 // suave al arrancar y al frenar
    camara.position.lerpVectors(t.desde, t.hasta, avance)
    camara.rotation.set(0, 0, 0)
    camara.updateMatrixWorld()
    t.alMover(rectPoster(), avance)
    if (lineal >= 1) {
      transicion = null
      t.alTerminar()
    }
  }

  let antes = performance.now()
  let pedido = 0
  function cuadro(ahora) {
    const dt = Math.min(0.05, (ahora - antes) / 1000)
    antes = ahora
    // caminar hacia donde se mira (solo el giro), probando cada eje por separado para deslizar contra las paredes
    if (transicion) {
      moverTransicion(ahora)
      moverArboles(mapa, ahora / 1000)
      renderer.render(escena, camara)
      pedido = requestAnimationFrame(cuadro)
      return
    }
    const adelante = (teclas.KeyW || teclas.ArrowUp ? 1 : 0) - (teclas.KeyS || teclas.ArrowDown ? 1 : 0)
    const costado = (teclas.KeyD || teclas.ArrowRight ? 1 : 0) - (teclas.KeyA || teclas.ArrowLeft ? 1 : 0)
    if (adelante || costado) {
      const vel = (teclas.ShiftLeft || teclas.ShiftRight ? 8 : 4) * dt
      const sx = -Math.sin(jugador.giro)
      const sz = -Math.cos(jugador.giro)
      const dx = (sx * adelante - sz * costado) * vel
      const dz = (sz * adelante + sx * costado) * vel
      if (puedeEstar(mapa, jugador.x + dx, jugador.z)) jugador.x += dx
      if (puedeEstar(mapa, jugador.x, jugador.z + dz)) jugador.z += dz
    }
    if (opciones.aerea) {
      camara.position.set(20, 150, 95)
      camara.lookAt(6, 0, -25)
    } else {
      camara.position.set(jugador.x, alturaPiso(jugador.x, jugador.z) + ALTURA_OJOS, jugador.z)
      camara.rotation.set(jugador.inclinacion, jugador.giro, 0)
      // aviso al llegar al frente de una construcción (solo cuando cambia)
      const c = mapa.construcciones.find((k) => Math.hypot(k.llegada[0] - jugador.x, k.llegada[1] - jugador.z) < 6)
      const nuevo = c ? c.datos : null
      if (nuevo !== cerca) {
        cerca = nuevo
        if (opciones.alAcercarse) opciones.alAcercarse(cerca)
      }
    }
    moverArboles(mapa, ahora / 1000)
    renderer.render(escena, camara)
    pedido = requestAnimationFrame(cuadro)
  }
  pedido = requestAnimationFrame(cuadro)

  return {
    // textura del póster (un canvas dibujado parecido a la página)
    setPoster(lienzo) {
      const textura = new THREE.CanvasTexture(lienzo)
      textura.colorSpace = THREE.SRGBColorSpace
      mapa.poster.material.map = textura
      mapa.poster.material.color.set('#ffffff')
      mapa.poster.material.needsUpdate = true
    },
    empezarTransicion({ alMover, alTerminar }) {
      const centro = mapa.poster.getWorldPosition(new THREE.Vector3())
      const distancia = mapa.poster.geometry.parameters.height / 2 / Math.tan(THREE.MathUtils.degToRad(camara.fov / 2))
      transicion = {
        inicio: performance.now(),
        desde: new THREE.Vector3(centro.x, centro.y, centro.z + distancia),
        hasta: new THREE.Vector3(jugador.x, alturaPiso(jugador.x, jugador.z) + ALTURA_OJOS, jugador.z),
        alMover,
        alTerminar
      }
      jugador.giro = 0
      jugador.inclinacion = 0
    },
    setNoche(noche) {
      aplicarHora(mapa, noche, extras)
      if (opciones.aerea) escena.fog = null
    },
    destruir() {
      cancelAnimationFrame(pedido)
      removeEventListener('keydown', alBajar)
      removeEventListener('keyup', alSubir)
      removeEventListener('mouseup', alSoltar)
      removeEventListener('mousemove', alMover)
      removeEventListener('resize', alCambiarTamano)
      escena.traverse((o) => { if (o.geometry) o.geometry.dispose() })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }
}
