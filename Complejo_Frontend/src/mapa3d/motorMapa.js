import * as THREE from 'three'
import { crearMapa, puedeEstar, aplicarHora, alturaPiso, moverArboles, VIENTO, rafagaEn, sobrePiedra, bosqueCerca } from './escenaMapa'
import { crearSonido } from './sonido'
import { crearCielo, FASE_DIA, FASE_NOCHE } from './cielo'
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
// "construcción" especial: el cartel con el póster de la entrada
export const CARTEL_ELEGIBLE = { id: 'cartel', tipo: 'cartel', nombre: 'Cartel' }

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
  sol.position.set(55, 95, -85) // del mismo lado que el sol dibujado en el cielo (noreste)
  sol.target.position.set(6, 0, -20)
  sol.castShadow = true
  sol.shadow.mapSize.set(4096, 4096)
  Object.assign(sol.shadow.camera, { left: -110, right: 110, top: 110, bottom: -110, near: 1, far: 320 })
  sol.shadow.bias = -0.0005
  escena.add(hemi, sol, sol.target)
  const extras = { hemi, sol, lucesPunto: [] }
  const cielo = crearCielo(escena)

  // Hora del día: el cielo gira siempre para el mismo lado (fase en grados). Al cambiar el tema el sol sigue su
  // camino hasta ponerse por el oeste mientras sale la luna por el este (o al revés), pasando por el atardecer.
  // La luz del sol sigue al sol (o a la luna) del cielo.
  const hora = { actual: FASE_DIA, objetivo: FASE_DIA, primera: true }
  function ponerHora(fase) {
    const h = cielo.setFase(fase)
    aplicarHora(mapa, h, extras)
    const d = cielo.direccionLuz()
    d.y = Math.max(d.y, 0.35) // aunque el sol esté bajo, la luz no viene de abajo del suelo
    d.normalize()
    sol.position.copy(sol.target.position).addScaledVector(d, 130)
  }
  ponerHora(FASE_DIA)
  if (opciones.aerea) escena.fog = null

  // Vista aérea (tecla F en el sitio): la cámara sube a una vista de todo el complejo y vuelve igual de suave
  const vista = { mezcla: opciones.aerea ? 1 : 0, objetivo: opciones.aerea ? 1 : 0 }
  // cerca: el complejo no es grande y los tres lugares para aparecer entran justo en la vista
  const posAerea = new THREE.Vector3(0, 72, 38)
  const quatAerea = (() => {
    const c = new THREE.PerspectiveCamera()
    c.position.copy(posAerea)
    c.lookAt(0, 0, -20)
    return c.quaternion.clone()
  })()
  const posFP = new THREE.Vector3()
  const quatFP = new THREE.Quaternion()
  const eulerFP = new THREE.Euler(0, 0, 0, 'YXZ')

  // Persona: arranca frente al cartel, mirando el póster (norte)
  const camara = new THREE.PerspectiveCamera(65, ancho() / alto(), 0.1, 400)
  camara.rotation.order = 'YXZ'
  // la persona arranca 4 m delante del póster, mirándolo (el póster mira hacia `normal`)
  const normal = [Math.sin(CARTEL.giro), Math.cos(CARTEL.giro)]
  const jugador = { x: CARTEL.x + normal[0] * 4, z: CARTEL.z + normal[1] * 4, giro: CARTEL.giro, inclinacion: 0, ...opciones.camara }

  // Sonido (empieza con el primer clic o tecla, como exige el navegador)
  const sonido = crearSonido()
  let tiempoPaso = 0 // segundos desde el último paso
  let bosque = 0
  let cuadros = 0

  // Teclado y mouse. Se mira moviendo el mouse con el puntero bloqueado (Pointer Lock): un clic en el mapa
  // lo bloquea y Escape lo libera (eso lo hace el navegador). En pausa (menú o inspección) no se camina ni se mira.
  const teclas = {}
  let cerca = null
  let pausado = false
  const lienzo = renderer.domElement
  const bloqueado = () => document.pointerLockElement === lienzo
  const escribiendo = (e) => ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)
  const alBajar = (e) => {
    sonido.iniciar()
    if (escribiendo(e) || pausado || transicion || vista.objetivo) return
    // cualquier tecla (menos Escape) cuenta como gesto: se toma el mouse para que al girar no se vaya de la ventana
    if (!bloqueado() && e.code !== 'Escape') bloquear()
    teclas[e.code] = true
    if (e.code.startsWith('Arrow')) e.preventDefault() // que las flechas no muevan la página
    if (e.code === 'KeyE' && cerca && opciones.alElegir) opciones.alElegir(cerca)
  }
  const alSubir = (e) => { teclas[e.code] = false }
  // Al entrar se mira con el mouse aunque todavía no esté tomado (el primer clic o tecla lo toma). Después de que
  // el mouse se soltó una vez (Escape), sin tomarlo no se gira: si no, el cursor se iría de la ventana al girar.
  let tuvoBloqueo = false
  const alMover = (e) => {
    if (pausado || transicion || vista.objetivo) return
    if (tuvoBloqueo && !bloqueado()) return
    jugador.giro -= e.movementX * 0.0025
    jugador.inclinacion = Math.max(-1.2, Math.min(1.2, jugador.inclinacion - e.movementY * 0.0025))
  }
  const bloquear = () => {
    try {
      const promesa = lienzo.requestPointerLock()
      if (promesa && promesa.catch) promesa.catch(() => {}) // el navegador puede negarlo si no hubo un clic reciente
    } catch {
      // sin bloqueo: se sigue mirando con el mouse y el próximo clic lo toma
    }
  }
  const alCambiarBloqueo = () => {
    if (bloqueado()) tuvoBloqueo = true
    if (opciones.alCambiarBloqueo) opciones.alCambiarBloqueo(bloqueado())
  }

  // Clic: sin bloqueo, bloquea el mouse; con bloqueo, elige la construcción que está en el centro de la pantalla
  const rayo = new THREE.Raycaster()
  rayo.far = 45
  const centro = new THREE.Vector2(0, 0)
  const alHacerClic = () => {
    sonido.iniciar()
    if (pausado || transicion || vista.objetivo) return
    if (!bloqueado()) {
      bloquear()
      return
    }
    if (!opciones.alElegir) return
    rayo.setFromCamera(centro, camara)
    // el póster del cartel de la entrada lleva de vuelta a la página que muestra
    if (rayo.intersectObject(mapa.poster).length) {
      opciones.alElegir(CARTEL_ELEGIBLE)
      return
    }
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
  addEventListener('mousemove', alMover)
  addEventListener('resize', alCambiarTamano)
  document.addEventListener('pointerlockchange', alCambiarBloqueo)
  lienzo.addEventListener('click', alHacerClic)

  // Transición: la cámara arranca pegada al póster (que cubre justo la pantalla) y retrocede hasta la persona.
  // alMover(rect, avance) da en cada cuadro el rectángulo del póster en pantalla (px), para acompañarlo con la página
  let transicion = null
  let vuelta = null
  let fundidoPoster = null // póster nuevo apareciendo encima del anterior
  function terminarFundidoPoster() {
    const { encima, textura } = fundidoPoster
    if (mapa.poster.material.map) mapa.poster.material.map.dispose()
    mapa.poster.material.map = textura
    mapa.poster.material.needsUpdate = true
    mapa.poster.remove(encima)
    encima.material.dispose()
    fundidoPoster = null
  }
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
    camara.rotation.set(0, CARTEL.giro, 0)
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
    // vuelta a la página: la cámara se acerca al póster hasta que lo cubre justo (la página reaparece encima)
    // Primero la persona se para de frente al cartel (sin la página encima); después la cámara se acerca derecho
    // al póster y la página aparece siguiéndolo (así el póster se ve siempre de frente, sin deformarse)
    if (vuelta) {
      const suaveVuelta = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2)
      const t = ahora - vuelta.inicio
      if (t < vuelta.duracionA) {
        const a = suaveVuelta(t / vuelta.duracionA)
        camara.position.lerpVectors(vuelta.desdePos, vuelta.frentePos, a)
        camara.quaternion.slerpQuaternions(vuelta.desdeQuat, vuelta.hastaQuat, a)
        renderer.render(escena, camara)
        pedido = requestAnimationFrame(cuadro)
        return
      }
      const lineal = Math.min(1, (t - vuelta.duracionA) / 1500)
      const avance = suaveVuelta(lineal)
      camara.position.lerpVectors(vuelta.frentePos, vuelta.hastaPos, avance)
      camara.quaternion.copy(vuelta.hastaQuat)
      camara.updateMatrixWorld()
      vuelta.alMover(rectPoster(), avance)
      if (lineal >= 1 && !vuelta.terminada) {
        vuelta.terminada = true
        vuelta.alTerminar()
      }
      renderer.render(escena, camara)
      pedido = requestAnimationFrame(cuadro)
      return
    }
    if (transicion) {
      moverTransicion(ahora)
      moverArboles(mapa, ahora / 1000, camara.position)
      cielo.mover(ahora / 1000, camara.position, VIENTO)
      renderer.render(escena, camara)
      pedido = requestAnimationFrame(cuadro)
      return
    }
    // cambio de hora en curso: el cielo arranca despacio, acelera y frena al llegar (medio giro en unos 2 segundos)
    if (!hora.primera && hora.actual !== hora.objetivo) {
      const p = Math.min(1, (ahora - hora.inicio) / hora.duracion)
      const suave = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2
      hora.actual = p >= 1 ? hora.objetivo : hora.desde + (hora.objetivo - hora.desde) * suave
      ponerHora(hora.actual)
    }
    // paso entre la primera persona y la vista aérea (1 segundo)
    if (vista.mezcla !== vista.objetivo) {
      vista.mezcla = vista.objetivo > vista.mezcla ? Math.min(1, vista.mezcla + dt) : Math.max(0, vista.mezcla - dt)
      if (vista.mezcla === vista.objetivo && opciones.alVistaAerea) opciones.alVistaAerea(vista.objetivo === 1)
    }
    const adelante = vista.objetivo ? 0 : (teclas.KeyW || teclas.ArrowUp ? 1 : 0) - (teclas.KeyS || teclas.ArrowDown ? 1 : 0)
    const costado = vista.objetivo ? 0 : (teclas.KeyD || teclas.ArrowRight ? 1 : 0) - (teclas.KeyA || teclas.ArrowLeft ? 1 : 0)
    if (adelante || costado) {
      const vel = (teclas.ShiftLeft || teclas.ShiftRight ? 8 : 4) * dt
      const sx = -Math.sin(jugador.giro)
      const sz = -Math.cos(jugador.giro)
      const dx = (sx * adelante - sz * costado) * vel
      const dz = (sz * adelante + sx * costado) * vel
      const antesX = jugador.x
      const antesZ = jugador.z
      if (puedeEstar(mapa, jugador.x + dx, jugador.z)) jugador.x += dx
      if (puedeEstar(mapa, jugador.x, jugador.z + dz)) jugador.z += dz
      // ritmo de una persona: unos 2 pasos por segundo caminando y casi 3 corriendo (solo si de verdad se movió)
      const seMovio = Math.hypot(jugador.x - antesX, jugador.z - antesZ) > 0.001
      tiempoPaso += dt
      const cadencia = teclas.ShiftLeft || teclas.ShiftRight ? 0.36 : 0.52
      if (seMovio && tiempoPaso >= cadencia) {
        tiempoPaso = 0
        sonido.paso(sobrePiedra(jugador.x, jugador.z) ? 'piedra' : 'pasto')
      }
    } else {
      tiempoPaso = 0.4 // al empezar a caminar, el primer paso suena enseguida
    }
    // viento y hojas según la ráfaga y el bosque cercano (los árboles cercanos se cuentan de vez en cuando)
    cuadros++
    if (cuadros % 15 === 0) bosque = bosqueCerca(mapa, jugador.x, jugador.z)
    sonido.actualizar(ahora / 1000, rafagaEn(ahora / 1000, jugador.x, jugador.z), vista.objetivo ? 0.3 : bosque, extras.h || 0)
    // en la vista aérea la niebla se aleja, para que se vea todo el complejo con claridad
    if (escena.fog && extras.h !== undefined) {
      const e = vista.mezcla
      escena.fog.near = 60 + (25 - 60) * extras.h + e * 250
      escena.fog.far = 190 + (110 - 190) * extras.h + e * 350
    }
    posFP.set(jugador.x, alturaPiso(jugador.x, jugador.z) + ALTURA_OJOS, jugador.z)
    if (vista.mezcla > 0) {
      const e = vista.mezcla * vista.mezcla * (3 - 2 * vista.mezcla)
      eulerFP.set(jugador.inclinacion, jugador.giro, 0)
      quatFP.setFromEuler(eulerFP)
      camara.position.lerpVectors(posFP, posAerea, e)
      camara.quaternion.slerpQuaternions(quatFP, quatAerea, e)
    } else {
      camara.position.copy(posFP)
      camara.rotation.set(jugador.inclinacion, jugador.giro, 0)
      // aviso al llegar al frente de una construcción (solo cuando cambia)
      const c = mapa.construcciones.find((k) => Math.hypot(k.llegada[0] - jugador.x, k.llegada[1] - jugador.z) < 6)
      // frente al cartel de la entrada también aparece el aviso (para volver a la página con E)
      const enCartel = Math.hypot(CARTEL.x + normal[0] * 3 - jugador.x, CARTEL.z + normal[1] * 3 - jugador.z) < 3.5
      const nuevo = c ? c.datos : enCartel ? CARTEL_ELEGIBLE : null
      if (nuevo !== cerca) {
        cerca = nuevo
        if (opciones.alAcercarse) opciones.alAcercarse(cerca)
      }
    }
    // póster nuevo apareciendo (1,6 s, al ritmo del cambio de día a noche)
    if (fundidoPoster) {
      const p = Math.min(1, (ahora - fundidoPoster.inicio) / 1600)
      fundidoPoster.encima.material.opacity = p * p * (3 - 2 * p)
      if (p >= 1) terminarFundidoPoster()
    }
    moverArboles(mapa, ahora / 1000, camara.position)
    cielo.mover(ahora / 1000, camara.position, VIENTO)
    renderer.render(escena, camara)
    pedido = requestAnimationFrame(cuadro)
  }
  pedido = requestAnimationFrame(cuadro)

  const proyectado = new THREE.Vector3()
  return {
    bloquear,
    setSilencio: (valor) => sonido.setSilencio(valor),
    // vista aérea: el mouse queda libre; al volver, la cámara baja a la persona
    setAerea(valor) {
      vista.objetivo = valor ? 1 : 0
      if (valor && bloqueado()) document.exitPointerLock()
    },
    // aparecer en otro lugar del mapa (desde la vista aérea), mirando hacia `mira`
    irA(x, z, mira) {
      jugador.x = x
      jugador.z = z
      jugador.giro = Math.atan2(-(mira[0] - x), -(mira[1] - z))
      jugador.inclinacion = 0
      vista.objetivo = 0
    },
    // posición en pantalla (px) de un punto del mapa, para poner botones encima
    proyectar(x, y, z) {
      proyectado.set(x, y, z).project(camara)
      return { x: ((proyectado.x + 1) / 2) * ancho(), y: ((1 - proyectado.y) / 2) * alto(), visible: proyectado.z < 1 }
    },
    liberar() {
      if (bloqueado()) document.exitPointerLock()
    },
    // en pausa no se camina ni se mira (menú de Escape o inspeccionando un lugar)
    setPausa(valor) {
      pausado = valor
      for (const k of Object.keys(teclas)) teclas[k] = false
    },
    // textura del póster (un canvas dibujado parecido a la página). Con `fundido`, la nueva aparece de a poco encima
    // de la anterior (al cambiar entre día y noche), en una copia del póster apenas delante
    setPoster(lienzo, fundido = false) {
      const textura = new THREE.CanvasTexture(lienzo)
      textura.colorSpace = THREE.SRGBColorSpace
      if (fundido && mapa.poster.material.map) {
        if (fundidoPoster) terminarFundidoPoster()
        const encima = new THREE.Mesh(mapa.poster.geometry, new THREE.MeshBasicMaterial({ map: textura, transparent: true, opacity: 0 }))
        encima.position.z = 0.004
        mapa.poster.add(encima)
        fundidoPoster = { encima, textura, inicio: performance.now() }
        return
      }
      if (mapa.poster.material.map) mapa.poster.material.map.dispose()
      mapa.poster.material.map = textura
      mapa.poster.material.color.set('#ffffff')
      mapa.poster.material.needsUpdate = true
    },
    empezarTransicion({ alMover, alTerminar }) {
      const centro = mapa.poster.getWorldPosition(new THREE.Vector3())
      const distancia = mapa.poster.geometry.parameters.height / 2 / Math.tan(THREE.MathUtils.degToRad(camara.fov / 2))
      transicion = {
        inicio: performance.now(),
        desde: new THREE.Vector3(centro.x + normal[0] * distancia, centro.y, centro.z + normal[1] * distancia),
        hasta: new THREE.Vector3(jugador.x, alturaPiso(jugador.x, jugador.z) + ALTURA_OJOS, jugador.z),
        alMover,
        alTerminar
      }
      jugador.giro = CARTEL.giro
      jugador.inclinacion = 0
    },
    // al revés que la transición de entrada: de donde esté la persona hasta quedar pegada al póster
    empezarVuelta({ alMover, alTerminar }) {
      const centro = mapa.poster.getWorldPosition(new THREE.Vector3())
      const distancia = mapa.poster.geometry.parameters.height / 2 / Math.tan(THREE.MathUtils.degToRad(camara.fov / 2))
      // lugar de frente al cartel, a la altura del centro del póster
      const frentePos = new THREE.Vector3(centro.x + normal[0] * 4, centro.y, centro.z + normal[1] * 4)
      const lejos = camara.position.distanceTo(frentePos)
      vuelta = {
        inicio: performance.now(),
        desdePos: camara.position.clone(),
        desdeQuat: camara.quaternion.clone(),
        frentePos,
        duracionA: Math.min(1400, 350 + lejos * 120),
        hastaPos: new THREE.Vector3(centro.x + normal[0] * distancia, centro.y, centro.z + normal[1] * distancia),
        hastaQuat: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, CARTEL.giro, 0, 'YXZ')),
        alMover,
        alTerminar
      }
      if (bloqueado()) document.exitPointerLock()
    },
    setNoche(noche) {
      const destino = noche ? FASE_NOCHE : FASE_DIA
      // la primera vez (al entrar) se pone directo, sin el paso por el atardecer
      if (hora.primera) {
        hora.primera = false
        hora.actual = destino
        hora.objetivo = destino
        ponerHora(destino)
        if (opciones.aerea) escena.fog = null
        return
      }
      // la próxima vez que el cielo llegue a esa posición, siguiendo hacia adelante
      let objetivo = destino
      while (objetivo < hora.actual) objetivo += 360
      hora.objetivo = objetivo
      hora.desde = hora.actual
      hora.inicio = performance.now()
      hora.duracion = Math.max(600, ((objetivo - hora.actual) / 180) * 2200) // 2,2 s por medio giro
      if (opciones.aerea) escena.fog = null
    },
    destruir() {
      cancelAnimationFrame(pedido)
      sonido.cerrar()
      removeEventListener('keydown', alBajar)
      removeEventListener('keyup', alSubir)
      document.removeEventListener('pointerlockchange', alCambiarBloqueo)
      if (bloqueado()) document.exitPointerLock()
      removeEventListener('mousemove', alMover)
      removeEventListener('resize', alCambiarTamano)
      escena.traverse((o) => { if (o.geometry) o.geometry.dispose() })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }
}
