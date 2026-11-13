import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { apiFetch } from '../utils/api'
import {
  CABANAS_DEFAULT,
  cargarDistribucionMapa,
  crearTerreno,
  crearSenderos,
  crearLago,
  crearFogata,
  crearBosque,
  crearModeloCabana,
  crearModeloCasaPrincipal
} from '../utils/mapa3dHelper'
import './Mapa3DView.css'

// Efectos de sonido retro con Web Audio API
function playRetroSound(tipo) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    const now = ctx.currentTime
    if (tipo === 'click') {
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1)
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.linearRampToValueAtTime(0.001, now + 0.12)
      osc.start(now)
      osc.stop(now + 0.12)
    } else if (tipo === 'step') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(120 + Math.random() * 30, now)
      gain.gain.setValueAtTime(0.02, now)
      gain.gain.linearRampToValueAtTime(0.001, now + 0.05)
      osc.start(now)
      osc.stop(now + 0.05)
    }
  } catch {
    // Audio bloqueado por política del navegador
  }
}

function Mapa3DView({ onAbrirDetalle }) {
  const mountRef = useRef(null)

  // Estados UI
  const [cabanas, setCabanas] = useState(CABANAS_DEFAULT)
  const [cabanaMirada, setCabanaMirada] = useState(null)
  const [pixelMode, setPixelMode] = useState(true)
  const [isNoche, setIsNoche] = useState(false)
  const [sonidoActivo, setSonidoActivo] = useState(true)
  const [isPointerLocked, setIsPointerLocked] = useState(false)

  // Referencias para el bucle Three.js
  const stateRef = useRef({
    pixelMode: true,
    isNoche: false,
    sonidoActivo: true,
    isPointerLocked: false,
    keys: { w: false, a: false, s: false, d: false, shift: false },
    yaw: 1.12, // Mirando hacia la Casa Principal desde el camino
    pitch: 0,
    isDragging: false,
    prevMousePos: { x: 0, y: 0 },
    cameraPos: new THREE.Vector3(-32, 1.75, -34), // Inicio en camino de acceso NO
    cabanaMeshes: [],
    smokeParticles: [],
    nightLights: [],
    stepTimer: 0,
    scene: null,
    camera: null,
    renderer: null,
    sunLight: null,
    ambientLight: null,
    waterMesh: null
  })

  // Sincronizar estados con refs
  useEffect(() => {
    stateRef.current.pixelMode = pixelMode
    window.dispatchEvent(new Event('resize'))
  }, [pixelMode])

  useEffect(() => {
    stateRef.current.sonidoActivo = sonidoActivo
  }, [sonidoActivo])

  useEffect(() => {
    stateRef.current.isNoche = isNoche
    const { scene, sunLight, ambientLight, nightLights } = stateRef.current
    if (!scene || !sunLight || !ambientLight) return

    if (isNoche) {
      scene.background.setHex(0x0a1017)
      scene.fog.color.setHex(0x0a1017)
      scene.fog.density = 0.012
      sunLight.intensity = 0.15
      sunLight.color.setHex(0x4b6584)
      ambientLight.intensity = 0.25
      ambientLight.color.setHex(0x2f3542)
      nightLights.forEach((l) => (l.visible = true))
    } else {
      scene.background.setHex(0x8cb0b8)
      scene.fog.color.setHex(0x8cb0b8)
      scene.fog.density = 0.008
      sunLight.intensity = 1.2
      sunLight.color.setHex(0xfffaed)
      ambientLight.intensity = 0.7
      ambientLight.color.setHex(0xffeed6)
      nightLights.forEach((l) => (l.visible = false))
    }
  }, [isNoche])

  // Cargar cabañas desde backend si existen
  useEffect(() => {
    apiFetch('/api/espacios', { auth: false })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const combinadas = data.map((item, idx) => {
            const def = CABANAS_DEFAULT[idx % CABANAS_DEFAULT.length]
            return {
              ...def,
              id: item.id,
              nombre: item.nombre,
              tipo: item.tipo,
              precioBase: item.precioBase,
              descripcion: item.descripcion || def.descripcion,
              imagenes: item.imagenes && item.imagenes.length ? item.imagenes : def.imagenes
            }
          })
          setCabanas(combinadas)
        }
      })
      .catch(() => {
        // Mantiene CABANAS_DEFAULT
      })
  }, [])

  // Abrir el modal global de detalles de espacio
  const handleAbrirDetalle = (espacio) => {
    if (document.pointerLockElement) {
      document.exitPointerLock()
    }
    if (stateRef.current.sonidoActivo) playRetroSound('click')
    if (onAbrirDetalle) {
      onAbrirDetalle(espacio)
    }
  }

  // Inicialización de la escena 3D en Primera Persona (FPS)
  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    // 1. Escena & Niebla
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x8cb0b8)
    scene.fog = new THREE.FogExp2(0x8cb0b8, 0.008)
    stateRef.current.scene = scene

    // 2. Cámara en Primera Persona (Ojos a 1.75m de altura)
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 200)
    camera.rotation.order = 'YXZ'
    camera.position.copy(stateRef.current.cameraPos)
    camera.rotation.y = stateRef.current.yaw
    stateRef.current.camera = camera

    // 3. Renderer con estética retro
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.BasicShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)
    stateRef.current.renderer = renderer

    // 4. Luces
    const ambientLight = new THREE.AmbientLight(0xffeed6, 0.7)
    scene.add(ambientLight)
    stateRef.current.ambientLight = ambientLight

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.2)
    sunLight.position.set(40, 60, 25)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 1024
    sunLight.shadow.mapSize.height = 1024
    sunLight.shadow.camera.near = 10
    sunLight.shadow.camera.far = 140
    sunLight.shadow.camera.left = -58
    sunLight.shadow.camera.right = 58
    sunLight.shadow.camera.top = 48
    sunLight.shadow.camera.bottom = -48
    scene.add(sunLight)
    stateRef.current.sunLight = sunLight

    const nightLights = []
    const smokeParticles = []

    // 5. Construcción del Mundo con Terreno Satelital Real
    crearTerreno(scene)
    crearSenderos(scene)
    const { water } = crearLago(scene)
    stateRef.current.waterMesh = water
    crearFogata(scene, nightLights)
    crearBosque(scene)

    const cabanaMeshes = []

    // 6. Modelo Físico Real de la Gran Casa Principal (en el pin rojo -11, -24)
    const espacioCasa = cabanas.find((c) => c.tipo === 'SALON_COMIDA_CASA_PRINCIPAL') ||
                        cabanas.find((c) => c.tipo === 'HABITACION_CASA_PRINCIPAL') ||
                        {
                          id: 12,
                          nombre: 'Casa Principal (Habitaciones Privadas & Salón Comunal)',
                          tipo: 'HABITACION_CASA_PRINCIPAL',
                          precioBase: 65,
                          descripcion: 'La histórica casona rústica de dos plantas en medio de la arboleda con galería de madera, que aloja las 6 habitaciones privadas y el Salón Común de Comida.',
                          imagenes: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800']
                        }

    const { houseGroup, hitBox: houseHitBox } = crearModeloCasaPrincipal(espacioCasa, nightLights, smokeParticles)
    scene.add(houseGroup)
    cabanaMeshes.push(houseHitBox)

    // 7. Cargar Cabañas según Layout configurado por Admin (en localStorage)
    const layout = cargarDistribucionMapa()

    cabanas.forEach((c) => {
      const config = layout[c.id]
      if (!config || config.visible === false) return

      const esCabana = c.tipo === 'CABANA' || (!c.tipo && c.id <= 4)
      if (esCabana) {
        const { cabanaGroup, hitBox } = crearModeloCabana(c, config, nightLights, smokeParticles)
        scene.add(cabanaGroup)
        cabanaMeshes.push(hitBox)
      }
    })

    stateRef.current.cabanaMeshes = cabanaMeshes
    stateRef.current.smokeParticles = smokeParticles
    stateRef.current.nightLights = nightLights

    // 8. Raycaster central para interactuar en Primera Persona
    const raycaster = new THREE.Raycaster()
    const screenCenter = new THREE.Vector2(0, 0)

    // 9. Control de Vista con Mouse (Pointer Lock y Drag)
    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === renderer.domElement
      setIsPointerLocked(locked)
      stateRef.current.isPointerLocked = locked
    }

    document.addEventListener('pointerlockchange', handlePointerLockChange)

    const handleMouseMove = (e) => {
      const sens = 0.0022
      if (stateRef.current.isPointerLocked) {
        stateRef.current.yaw -= e.movementX * sens
        stateRef.current.pitch -= e.movementY * sens
      } else if (stateRef.current.isDragging) {
        const deltaX = e.clientX - stateRef.current.prevMousePos.x
        const deltaY = e.clientY - stateRef.current.prevMousePos.y
        stateRef.current.yaw -= deltaX * sens
        stateRef.current.pitch -= deltaY * sens
        stateRef.current.prevMousePos = { x: e.clientX, y: e.clientY }
      } else {
        return
      }

      stateRef.current.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, stateRef.current.pitch))
      camera.rotation.y = stateRef.current.yaw
      camera.rotation.x = stateRef.current.pitch
    }

    const handleMouseDown = (e) => {
      if (e.target.closest('.mapa3d-topbar, .mapa3d-bottombar')) return

      raycaster.setFromCamera(screenCenter, camera)
      const hits = raycaster.intersectObjects(stateRef.current.cabanaMeshes)
      if (hits.length > 0 && hits[0].distance < 24) {
        const cabana = hits[0].object.userData.cabanaData
        if (cabana) {
          handleAbrirDetalle(cabana)
          return
        }
      }

      stateRef.current.isDragging = true
      stateRef.current.prevMousePos = { x: e.clientX, y: e.clientY }

      if (!stateRef.current.isPointerLocked && e.button === 0) {
        renderer.domElement.requestPointerLock()
      }
    }

    const handleMouseUp = () => {
      stateRef.current.isDragging = false
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    renderer.domElement.addEventListener('mousedown', handleMouseDown)

    // 10. Teclas WASD para Movimiento en Primera Persona
    const onKeyDown = (e) => {
      const k = e.key.toLowerCase()
      if (k === 'w' || k === 'arrowup') stateRef.current.keys.w = true
      if (k === 's' || k === 'arrowdown') stateRef.current.keys.s = true
      if (k === 'a' || k === 'arrowleft') stateRef.current.keys.a = true
      if (k === 'd' || k === 'arrowright') stateRef.current.keys.d = true
      if (k === 'shift') stateRef.current.keys.shift = true

      if (k === 'e' || k === ' ') {
        raycaster.setFromCamera(screenCenter, camera)
        const hits = raycaster.intersectObjects(stateRef.current.cabanaMeshes)
        if (hits.length > 0 && hits[0].distance < 24) {
          const cabana = hits[0].object.userData.cabanaData
          if (cabana) {
            handleAbrirDetalle(cabana)
          }
        }
      }
    }

    const onKeyUp = (e) => {
      const k = e.key.toLowerCase()
      if (k === 'w' || k === 'arrowup') stateRef.current.keys.w = false
      if (k === 's' || k === 'arrowdown') stateRef.current.keys.s = false
      if (k === 'a' || k === 'arrowleft') stateRef.current.keys.a = false
      if (k === 'd' || k === 'arrowright') stateRef.current.keys.d = false
      if (k === 'shift') stateRef.current.keys.shift = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    // 11. Redimensionado
    const handleResize = () => {
      if (!container || !renderer || !camera) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()

      const scale = stateRef.current.pixelMode ? 0.42 : window.devicePixelRatio || 1
      renderer.setSize(w * scale, h * scale, false)
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    // 12. Loop Principal de Animación
    let animationFrameId
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const delta = clock.getDelta()
      const time = clock.getElapsedTime()

      // Ondas suaves del agua
      if (water) {
        water.position.y = 0.05 + Math.sin(time * 2.2) * 0.02
      }

      // Animación de partículas de humo
      smokeParticles.forEach((p) => {
        const y = ((time * 0.9 + p.offsetY) % 2.8) + p.baseY
        p.mesh.position.y = y
        p.mesh.scale.setScalar(0.7 + (y - p.baseY) * 0.35)
      })

      // Movimiento FPS con WASD
      const { keys, yaw } = stateRef.current
      const forwardX = -Math.sin(yaw)
      const forwardZ = -Math.cos(yaw)
      const rightX = Math.cos(yaw)
      const rightZ = -Math.sin(yaw)

      let moveX = 0
      let moveZ = 0

      if (keys.w) {
        moveX += forwardX
        moveZ += forwardZ
      }
      if (keys.s) {
        moveX -= forwardX
        moveZ -= forwardZ
      }
      if (keys.a) {
        moveX -= rightX
        moveZ -= rightZ
      }
      if (keys.d) {
        moveX += rightX
        moveZ += rightZ
      }

      const isMoving = moveX !== 0 || moveZ !== 0
      if (isMoving) {
        const len = Math.hypot(moveX, moveZ)
        const speed = (keys.shift ? 13.0 : 8.0) * delta
        const normX = (moveX / len) * speed
        const normZ = (moveZ / len) * speed

        camera.position.x += normX
        camera.position.z += normZ

        // Limitar dentro del predio satelital (110m x 90m)
        camera.position.x = Math.max(-50, Math.min(50, camera.position.x))
        camera.position.z = Math.max(-40, Math.min(40, camera.position.z))

        // Balanceo suave de cabeza al caminar (Head-bobbing FPS)
        camera.position.y = 1.75 + Math.sin(time * 11) * 0.06

        stateRef.current.stepTimer += delta
        if (stateRef.current.stepTimer > (keys.shift ? 0.22 : 0.32)) {
          stateRef.current.stepTimer = 0
          if (stateRef.current.sonidoActivo) playRetroSound('step')
        }
      } else {
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.75, 0.1)
      }

      // Raycast central (Crosshair)
      raycaster.setFromCamera(screenCenter, camera)
      const lookHits = raycaster.intersectObjects(stateRef.current.cabanaMeshes)
      if (lookHits.length > 0 && lookHits[0].distance < 24) {
        setCabanaMirada(lookHits[0].object.userData.cabanaData)
      } else {
        setCabanaMirada(null)
      }

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('mousedown', handleMouseDown)
      if (renderer) renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [cabanas])

  // Viajar rápidamente a una cabaña
  const handleTeleportToCabana = (c) => {
    if (stateRef.current.sonidoActivo) playRetroSound('click')
    const layout = cargarDistribucionMapa()
    const conf = layout[c.id] || { x: 0, z: 0, rotacionY: 0 }
    const { camera } = stateRef.current
    if (camera) {
      const dist = 8
      const rad = (conf.rotacionY * Math.PI) / 180
      camera.position.x = conf.x + Math.sin(rad) * dist
      camera.position.z = conf.z + Math.cos(rad) * dist
      camera.position.y = 1.75

      const targetYaw = Math.atan2(conf.x - camera.position.x, conf.z - camera.position.z)
      stateRef.current.yaw = targetYaw
      stateRef.current.pitch = 0
      camera.rotation.y = targetYaw
      camera.rotation.x = 0
    }
  }

  // Viajar a la Casa Principal
  const handleTeleportToCasa = () => {
    if (stateRef.current.sonidoActivo) playRetroSound('click')
    const { camera } = stateRef.current
    if (camera) {
      camera.position.set(-11 + 6, 1.75, -24 + 11)
      const targetYaw = Math.atan2(-11 - camera.position.x, -24 - camera.position.z)
      stateRef.current.yaw = targetYaw
      stateRef.current.pitch = 0
      camera.rotation.y = targetYaw
      camera.rotation.x = 0
    }
  }

  return (
    <div className="mapa3d-page">
      {/* Contenedor del Canvas 3D */}
      <div ref={mountRef} className="mapa3d-canvas-container">
        {/* Retícula / Punto de mira central en Primera Persona */}
        <div className={`mapa3d-crosshair ${cabanaMirada ? 'active' : ''}`} />
      </div>

      {/* Barra Superior con Controles */}
      <div className="mapa3d-topbar">
        <div className="mapa3d-brand-badge">
          <span>Whispering Pines</span>
          <h2>🌲 Recorrido 3D en 1ª Persona</h2>
        </div>

        <div className="mapa3d-toolbar-actions">
          <button
            type="button"
            className={`mapa3d-btn ${isPointerLocked ? 'active' : ''}`}
            onClick={() => {
              if (mountRef.current?.querySelector('canvas')) {
                mountRef.current.querySelector('canvas').requestPointerLock()
              }
            }}
            title="Activar vista completa con el mouse"
          >
            🖱️ {isPointerLocked ? 'Vista Mouse Activa (ESC salir)' : 'Fijar Mouse'}
          </button>

          <button
            type="button"
            className={`mapa3d-btn ${pixelMode ? 'active' : ''}`}
            onClick={() => setPixelMode(!pixelMode)}
            title="Alternar estilo Pixel Art Retro"
          >
            🕹️ {pixelMode ? 'Pixel Retro' : 'HD'}
          </button>

          <button
            type="button"
            className="mapa3d-btn-icon"
            onClick={() => setIsNoche(!isNoche)}
            title={isNoche ? 'Cambiar a Día' : 'Cambiar a Noche'}
          >
            {isNoche ? '☀️' : '🌙'}
          </button>

          <button
            type="button"
            className="mapa3d-btn-icon"
            onClick={() => setSonidoActivo(!sonidoActivo)}
            title={sonidoActivo ? 'Silenciar Efectos' : 'Activar Sonido Retro'}
          >
            {sonidoActivo ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      {/* Cartel flotante de interacción al mirar una cabaña o la casa */}
      {cabanaMirada && (
        <div className="mapa3d-look-prompt" onClick={() => handleAbrirDetalle(cabanaMirada)}>
          <span className="prompt-key">E</span> o <span className="prompt-key">Clic</span>
          <span>Ver <strong>{cabanaMirada.nombre.split('/')[0].trim()}</strong></span>
        </div>
      )}

      {/* Pista de Controles en pantalla */}
      <div className="mapa3d-controls-hint">
        <div className="hint-row">
          <span className="mapa3d-key">W</span>
          <span className="mapa3d-key">A</span>
          <span className="mapa3d-key">S</span>
          <span className="mapa3d-key">D</span>
          <span>Caminar</span>
        </div>
        <div className="hint-row">
          <span className="mapa3d-key">Shift</span>
          <span>Correr</span>
        </div>
        <div className="hint-row">
          <span>🖱️ Mover mouse para mirar alrededor</span>
        </div>
      </div>

      {/* Selector rápido inferior */}
      <div className="mapa3d-bottombar">
        <div className="mapa3d-cabins-chips">
          <button
            type="button"
            className="mapa3d-chip"
            onClick={handleTeleportToCasa}
          >
            🏛️ Casa Principal
          </button>

          {cabanas
            .filter((c) => {
              const conf = cargarDistribucionMapa()[c.id]
              const esCabana = c.tipo === 'CABANA' || (!c.tipo && c.id <= 4)
              return conf && conf.visible !== false && esCabana
            })
            .map((c) => (
              <button
                key={c.id}
                type="button"
                className="mapa3d-chip"
                onClick={() => handleTeleportToCabana(c)}
              >
                🏡 {c.nombre.split('/')[0].trim()}
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}

export default Mapa3DView
