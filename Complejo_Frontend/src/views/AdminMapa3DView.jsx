import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEspacios } from '../Redux/espaciosSlice'
import { imagenPrincipal } from '../utils/constantes'
import {
  CABANAS_DEFAULT,
  LAYOUT_POR_DEFECTO,
  cargarDistribucionMapa,
  guardarDistribucionMapa,
  crearTerreno,
  crearSenderos,
  crearLago,
  crearFogata,
  crearBosque,
  crearModeloCabana,
  crearModeloCasaPrincipal
} from '../utils/mapa3dHelper'
import PageHeader from '../components/layout/PageHeader'
import './AdminView.css'
import './AdminMapa3DView.css'

function AdminMapa3DView() {
  const mountRef = useRef(null)
  const dispatch = useDispatch()
  const espaciosBackend = useSelector((state) => state.espacios.items)

  // Estados
  const [espacios, setEspacios] = useState(CABANAS_DEFAULT)
  const [layout, setLayout] = useState(cargarDistribucionMapa)
  const [seleccionadoId, setSeleccionadoId] = useState(null)
  const [guardadoToast, setGuardadoToast] = useState(false)

  // Referencias para Three.js
  const stateRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    groundPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    raycaster: new THREE.Raycaster(),
    cabanaGroups: {}, // id -> Group
    hitBoxes: [],
    selectionRing: null,
    selectionArrow: null,
    isDraggingCabin: false,
    draggedId: null,
    layout: {}
  })

  // Sincronizar ref de layout
  useEffect(() => {
    stateRef.current.layout = layout
  }, [layout])

  // Cargar lista de espacios desde el backend
  // (los espacios vienen del store; si el back no responde quedan las CABANAS_DEFAULT)
  useEffect(() => {
    dispatch(fetchEspacios())
  }, [dispatch])

  // Cuando llegan los espacios del back, se combinan con los datos 3D por defecto
  useEffect(() => {
    if (espaciosBackend.length > 0) {
      const combinadas = espaciosBackend.map((item, idx) => {
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
      setEspacios(combinadas)
    }
  }, [espaciosBackend])

  // Inicialización de la escena 3D Top-Down / Isométrica
  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    // 1. Escena
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x739ba6)
    scene.fog = new THREE.FogExp2(0x739ba6, 0.005)
    stateRef.current.scene = scene

    // 2. Cámara desde arriba (Perspectiva Top-Down cenital/isométrica para 110m x 90m)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 400)
    camera.position.set(0, 75, 55)
    camera.lookAt(0, 0, 0)
    stateRef.current.camera = camera

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)
    stateRef.current.renderer = renderer

    // 4. OrbitControls para mover la vista del mapa
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.maxPolarAngle = Math.PI / 2.15
    controls.minDistance = 15
    controls.maxDistance = 200
    controls.target.set(0, 0, 0)
    stateRef.current.controls = controls

    // 5. Luces
    const ambientLight = new THREE.AmbientLight(0xffeed6, 0.75)
    scene.add(ambientLight)

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

    // 6. Terreno Satelital Real
    crearTerreno(scene)
    crearSenderos(scene)
    crearLago(scene)
    crearFogata(scene)
    crearBosque(scene)

    // Cuadrícula sutil y translúcida
    const grid = new THREE.GridHelper(100, 20, 0x4ade80, 0x334433)
    grid.position.y = 0.03
    grid.material.opacity = 0.2
    grid.material.transparent = true
    scene.add(grid)

    // 7. Aro y Flecha de Selección y Rotación 360°
    const ringGeo = new THREE.RingGeometry(3.6, 4.0, 32)
    ringGeo.rotateX(-Math.PI / 2)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x4ade80, side: THREE.DoubleSide })
    const selectionRing = new THREE.Mesh(ringGeo, ringMat)
    selectionRing.position.y = 0.05
    selectionRing.visible = false
    scene.add(selectionRing)
    stateRef.current.selectionRing = selectionRing

    const arrowGroup = new THREE.Group()
    const arrowCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.7, 1.5, 4),
      new THREE.MeshBasicMaterial({ color: 0x4ade80 })
    )
    arrowCone.rotation.x = Math.PI / 2
    arrowCone.position.set(0, 0.05, 5.0)
    arrowGroup.add(arrowCone)
    arrowGroup.visible = false
    scene.add(arrowGroup)
    stateRef.current.selectionArrow = arrowGroup

    // 8. Reconstruir cabañas y la Casa Principal
    reconstruirCabanas()

    // 9. Manejo de Clics y Arrastre directo en el Canvas 3D
    const getIntersectionWithGround = (e) => {
      const rect = renderer.domElement.getBoundingClientRect()
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      )
      stateRef.current.raycaster.setFromCamera(mouse, camera)
      const targetPoint = new THREE.Vector3()
      stateRef.current.raycaster.ray.intersectPlane(stateRef.current.groundPlane, targetPoint)
      return targetPoint
    }

    const onPointerDown = (e) => {
      if (e.button !== 0) return

      const rect = renderer.domElement.getBoundingClientRect()
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      )
      stateRef.current.raycaster.setFromCamera(mouse, camera)
      const intersects = stateRef.current.raycaster.intersectObjects(stateRef.current.hitBoxes)

      if (intersects.length > 0) {
        const cabanaData = intersects[0].object.userData.cabanaData
        if (cabanaData) {
          setSeleccionadoId(cabanaData.id)
          stateRef.current.isDraggingCabin = true
          stateRef.current.draggedId = cabanaData.id
          controls.enabled = false
        }
      } else {
        setSeleccionadoId(null)
      }
    }

    const onPointerMove = (e) => {
      if (!stateRef.current.isDraggingCabin || !stateRef.current.draggedId) return

      const pt = getIntersectionWithGround(e)
      if (pt) {
        const id = stateRef.current.draggedId
        const clampedX = Math.max(-48, Math.min(48, Math.round(pt.x * 2) / 2))
        const clampedZ = Math.max(-38, Math.min(38, Math.round(pt.z * 2) / 2))

        const group = stateRef.current.cabanaGroups[id]
        if (group) {
          group.position.x = clampedX
          group.position.z = clampedZ
        }

        selectionRing.position.set(clampedX, 0.05, clampedZ)
        arrowGroup.position.set(clampedX, 0.05, clampedZ)

        setLayout((prev) => ({
          ...prev,
          [id]: {
            ...(prev[id] || { rotacionY: 0, visible: true }),
            x: clampedX,
            z: clampedZ,
            visible: true
          }
        }))
      }
    }

    const onPointerUp = () => {
      if (stateRef.current.isDraggingCabin) {
        stateRef.current.isDraggingCabin = false
        stateRef.current.draggedId = null
        controls.enabled = true
      }
    }

    container.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    // 10. Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    // 11. Loop
    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      controls.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [espacios])

  // Reconstruir los modelos de cabañas en la escena cuando cambian
  const reconstruirCabanas = () => {
    const { scene } = stateRef.current
    if (!scene) return

    Object.values(stateRef.current.cabanaGroups).forEach((grp) => scene.remove(grp))
    stateRef.current.cabanaGroups = {}
    stateRef.current.hitBoxes = []

    // 1. Añadir la Casa Principal en su lugar real (-11, 0, -24)
    const espacioCasa = espacios.find((c) => c.tipo === 'SALON_COMIDA_CASA_PRINCIPAL') ||
                        espacios.find((c) => c.tipo === 'HABITACION_CASA_PRINCIPAL') ||
                        { id: 12, nombre: 'Casa Principal', tipo: 'HABITACION_CASA_PRINCIPAL' }
    const { houseGroup } = crearModeloCasaPrincipal(espacioCasa)
    scene.add(houseGroup)
    stateRef.current.cabanaGroups['casa_principal'] = houseGroup

    // 2. Añadir las cabañas configuradas
    const currentLayout = stateRef.current.layout

    espacios.forEach((esp) => {
      const conf = currentLayout[esp.id]
      if (!conf || conf.visible === false) return

      const esCabana = esp.tipo === 'CABANA' || (!esp.tipo && esp.id <= 4)
      if (esCabana) {
        const { cabanaGroup, hitBox } = crearModeloCabana(esp, conf)
        scene.add(cabanaGroup)
        stateRef.current.cabanaGroups[esp.id] = cabanaGroup
        stateRef.current.hitBoxes.push(hitBox)
      }
    })
  }

  // Actualizar aro de selección y orientación
  useEffect(() => {
    const { selectionRing, selectionArrow, cabanaGroups } = stateRef.current
    if (!selectionRing || !selectionArrow) return

    if (!seleccionadoId || !layout[seleccionadoId] || layout[seleccionadoId].visible === false) {
      selectionRing.visible = false
      selectionArrow.visible = false
      return
    }

    const conf = layout[seleccionadoId]
    const group = cabanaGroups[seleccionadoId]

    if (group && conf) {
      selectionRing.visible = true
      selectionArrow.visible = true

      selectionRing.position.set(conf.x, 0.05, conf.z)
      selectionArrow.position.set(conf.x, 0.05, conf.z)

      const rad = ((conf.rotacionY || 0) * Math.PI) / 180
      selectionArrow.rotation.y = rad
    }
  }, [seleccionadoId, layout])

  // Drop sobre el mapa 3D
  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const espacioIdRaw = e.dataTransfer.getData('text/plain')
    const espacioId = parseInt(espacioIdRaw, 10)
    if (!espacioId) return

    const { renderer, camera, groundPlane, raycaster } = stateRef.current
    if (!renderer || !camera) return

    const rect = renderer.domElement.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    )

    raycaster.setFromCamera(mouse, camera)
    const targetPoint = new THREE.Vector3()
    raycaster.ray.intersectPlane(groundPlane, targetPoint)

    if (targetPoint) {
      const dropX = Math.max(-48, Math.min(48, Math.round(targetPoint.x)))
      const dropZ = Math.max(-38, Math.min(38, Math.round(targetPoint.z)))

      setLayout((prev) => {
        const nuevo = {
          ...prev,
          [espacioId]: {
            ...(prev[espacioId] || { rotacionY: 0 }),
            x: dropX,
            z: dropZ,
            visible: true
          }
        }
        stateRef.current.layout = nuevo
        reconstruirCabanas()
        return nuevo
      })

      setSeleccionadoId(espacioId)
    }
  }

  // Modificar Rotación 360°
  const handleCambiarRotacion = (nuevaRotacion) => {
    if (!seleccionadoId) return
    const anguloNormalizado = ((Math.round(nuevaRotacion) % 360) + 360) % 360

    setLayout((prev) => {
      const nuevo = {
        ...prev,
        [seleccionadoId]: {
          ...(prev[seleccionadoId] || { x: 0, z: 0 }),
          rotacionY: anguloNormalizado,
          visible: true
        }
      }
      stateRef.current.layout = nuevo

      const grp = stateRef.current.cabanaGroups[seleccionadoId]
      if (grp) {
        grp.rotation.y = (anguloNormalizado * Math.PI) / 180
      }
      return nuevo
    })
  }

  const rotarRelativo = (delta) => {
    const actual = layout[seleccionadoId]?.rotacionY || 0
    handleCambiarRotacion(actual + delta)
  }

  const rotarHaciaPunto = (targetX, targetZ) => {
    const conf = layout[seleccionadoId]
    if (!conf) return
    const rad = Math.atan2(targetX - conf.x, targetZ - conf.z)
    const deg = (rad * 180) / Math.PI
    handleCambiarRotacion(deg)
  }

  // Quitar del mapa
  const handleDesposicionar = (id) => {
    setLayout((prev) => {
      const nuevo = {
        ...prev,
        [id]: {
          ...(prev[id] || { x: 0, z: 0, rotacionY: 0 }),
          visible: false
        }
      }
      stateRef.current.layout = nuevo
      reconstruirCabanas()
      return nuevo
    })
    if (seleccionadoId === id) setSeleccionadoId(null)
  }

  // Guardar en Storage
  const handleGuardar = () => {
    guardarDistribucionMapa(layout)
    setGuardadoToast(true)
    setTimeout(() => setGuardadoToast(false), 2500)
  }

  // Restablecer por defecto
  const handleRestablecer = () => {
    if (window.confirm('¿Deseas restablecer la posición de las cabañas a sus coordenadas predeterminadas en el campo real?')) {
      setLayout(LAYOUT_POR_DEFECTO)
      stateRef.current.layout = LAYOUT_POR_DEFECTO
      reconstruirCabanas()
      setSeleccionadoId(null)
    }
  }

  const lugarSeleccionado = espacios.find((e) => e.id === seleccionadoId)
  const configSeleccionada = seleccionadoId ? layout[seleccionadoId] || {} : {}

  return (
    <div className="admin-pagina">
      <div className="admin-contenedor admin-mapa-container">
        {/* Encabezado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <PageHeader
            overline="MASTERPLAN DEL COMPLEJO"
            titulo="Distribución Satelital del Predio"
            subtitulo="Proyecta la ubicación y rotación 360° de las cabañas sobre la vista aérea real del campo."
          />
          <div className="admin-mapa-header-actions">
            <button type="button" className="nav-btn-outline" onClick={handleRestablecer}>
              🔄 Restablecer
            </button>
            <button type="button" className="nav-btn-primary" onClick={handleGuardar}>
              💾 Guardar Distribución
            </button>
          </div>
        </div>

        {/* Layout Principal: Mapa 3D (Izquierda) + Sidebar (Derecha) */}
        <div className="admin-mapa-layout">
          {/* Canvas 3D */}
          <div
            className="admin-mapa-canvas-wrapper"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div ref={mountRef} className="admin-mapa-canvas-container" />

            <div className="admin-mapa-overlay-hint">
              <span>🗺️ <strong>Vista Satelital:</strong> Terreno real calibrado a escala</span>
              <span>🖱️ <strong>Clic y arrastre en cabaña:</strong> Mover por el predio</span>
              <span>🌀 <strong>Clic derecho / Rueda:</strong> Rotar vista y hacer Zoom</span>
            </div>
          </div>

          {/* Sidebar lateral */}
          <div className="admin-mapa-sidebar">
            {/* Panel de Edición y Rotación 360° si hay un lugar seleccionado */}
            {lugarSeleccionado && configSeleccionada.visible !== false ? (
              <div className="admin-editor-card">
                <div className="admin-editor-header">
                  <div>
                    <span className="admin-editor-badge">{lugarSeleccionado.tipo || 'CABAÑA'}</span>
                    <h4 className="admin-editor-title">{lugarSeleccionado.nombre.split('/')[0].trim()}</h4>
                  </div>
                  <button
                    type="button"
                    className="admin-editor-close"
                    onClick={() => setSeleccionadoId(null)}
                    title="Cerrar edición"
                  >
                    ✕
                  </button>
                </div>

                {/* Coordenadas */}
                <div className="admin-coords-row">
                  <span>Posición X: <strong>{configSeleccionada.x ?? 0}m</strong></span>
                  <span>Posición Z: <strong>{configSeleccionada.z ?? 0}m</strong></span>
                </div>

                {/* Control de Rotación 360° */}
                <div className="admin-rotation-control">
                  <div className="admin-rotation-label">
                    <span>Orientación (Rotación 360°)</span>
                    <span className="admin-rotation-val">{configSeleccionada.rotacionY || 0}°</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    value={configSeleccionada.rotacionY || 0}
                    onChange={(e) => handleCambiarRotacion(Number(e.target.value))}
                    className="admin-rotation-slider"
                  />

                  {/* Botones de rotación rápida */}
                  <div className="admin-rotation-presets">
                    <button
                      type="button"
                      className="admin-btn-preset"
                      onClick={() => rotarRelativo(-15)}
                    >
                      ↺ -15°
                    </button>
                    <button
                      type="button"
                      className="admin-btn-preset"
                      onClick={() => rotarRelativo(15)}
                    >
                      ↻ +15°
                    </button>
                    <button
                      type="button"
                      className="admin-btn-preset"
                      onClick={() => rotarRelativo(-45)}
                    >
                      ↺ -45°
                    </button>
                    <button
                      type="button"
                      className="admin-btn-preset"
                      onClick={() => rotarRelativo(45)}
                    >
                      ↻ +45°
                    </button>
                    <button
                      type="button"
                      className="admin-btn-preset"
                      onClick={() => rotarHaciaPunto(18, 18)}
                    >
                      🌊 Mirar a Laguna
                    </button>
                    <button
                      type="button"
                      className="admin-btn-preset"
                      onClick={() => rotarHaciaPunto(-11, -24)}
                    >
                      🏛️ Mirar a Casona
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="nav-btn-outline"
                  style={{ fontSize: '0.8rem', padding: '6px' }}
                  onClick={() => handleDesposicionar(lugarSeleccionado.id)}
                >
                  ❌ Quitar del mapa
                </button>
              </div>
            ) : null}

            {/* Lista de lugares para arrastrar */}
            <div className="admin-lugares-section">
              <h3>
                Cabañas Disponibles
                <span className="admin-lugares-count">
                  {espacios.filter(e => e.tipo === 'CABANA' || (!e.tipo && e.id <= 4)).length}
                </span>
              </h3>

              {espacios
                .filter(e => e.tipo === 'CABANA' || (!e.tipo && e.id <= 4))
                .map((esp) => {
                  const conf = layout[esp.id]
                  const estaEnMapa = conf && conf.visible !== false
                  const isSelected = seleccionadoId === esp.id

                  return (
                    <div
                      key={esp.id}
                      className={`admin-lugar-card ${isSelected ? 'selected' : ''}`}
                      draggable="true"
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', String(esp.id))
                        e.dataTransfer.effectAllowed = 'copy'
                      }}
                      onClick={() => {
                        if (estaEnMapa) {
                          setSeleccionadoId(esp.id)
                        }
                      }}
                    >
                      <img
                        src={imagenPrincipal(esp.imagenes)}
                        alt={esp.nombre}
                        className="admin-lugar-thumb"
                      />

                      <div className="admin-lugar-info">
                        <h4 className="admin-lugar-name">{esp.nombre.split('/')[0].trim()}</h4>

                        <span className={`admin-lugar-status ${estaEnMapa ? 'on-map' : 'off-map'}`}>
                          {estaEnMapa ? (
                            <>📍 En el predio ({conf.rotacionY || 0}°)</>
                          ) : (
                            <>⚪ Sin proyectar</>
                          )}
                        </span>

                        <span className="admin-lugar-drag-hint">
                          ⠿ Arrastra sobre el terreno
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>

        {/* Toast animado al guardar */}
        {guardadoToast && (
          <div className="admin-toast-save">
            ✓ ¡Distribución satelital guardada exitosamente!
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminMapa3DView
