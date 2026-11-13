import * as THREE from 'three'

export const LAYOUT_STORAGE_KEY = 'whispering_pines_map_layout'

export const COLORES_TECHO = [
  0x2e3d33, // Verde musgo / pizarra oscura (como la foto real)
  0x8b2500, // Teja roja rústica
  0x2b4c6f, // Azul pizarra
  0x5a3d28, // Madera oscura
  0x6e2c00, // Cobre tostado
  0x4a3b32  // Pizarra gris
]

export const CABANAS_DEFAULT = [
  {
    id: 1,
    nombre: 'Cabaña del Cedro / Cedar Hollow Cabin',
    tipo: 'CABANA',
    precioBase: 120,
    descripcion: 'Cabaña independiente de pino y roble frente a la laguna, con deck techado, parrilla privada y capacidad para 4 a 5 huéspedes.',
    caracteristicas: ['🔥 Hogar a leña', '🌲 Vista al bosque', '📶 Wi-Fi fibra', '☕ Balcón alpino'],
    imagenes: ['https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800']
  },
  {
    id: 2,
    nombre: 'Refugio de Troncos Los Pinos / Whispering Pines Timber Lodge',
    tipo: 'CABANA',
    precioBase: 140,
    descripcion: 'Cabaña de troncos macizos en medio del bosque nativo, amplia cocina integrada y hogar a leña para 4 a 5 personas.',
    caracteristicas: ['⛰️ Vista a las sierras', '🥩 Parrilla techada', '🌿 Jardín privado', '❄️ Climatizada'],
    imagenes: ['https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&q=80&w=800']
  },
  {
    id: 3,
    nombre: 'Cabaña El Roble / The Oak Sanctuary Cabin',
    tipo: 'CABANA',
    precioBase: 110,
    descripcion: 'Cabaña entre robles centenarios con terraza panorámica, living espacioso y capacidad para 4 a 5 huéspedes.',
    caracteristicas: ['🔥 Chimenea rústica', '🪵 Troncos macizos', '🛁 Jacuzzi privado', '🌅 Vista al atardecer'],
    imagenes: ['https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800']
  },
  {
    id: 4,
    nombre: 'Chalet del Arroyo / Mountain Stream Chalet',
    tipo: 'CABANA',
    precioBase: 160,
    descripcion: 'Chalet de montaña de dos plantas junto al arroyo cristalino, deck mirador y fogonero para 4 a 5 huéspedes.',
    caracteristicas: ['🌊 Frente a la laguna', '🛶 Muelle disponible', '🔥 Gran estufa', '☕ Desayuno campestre'],
    imagenes: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800']
  }
]

// Ubicaciones de las 4 Cabañas proyectadas armónicamente en el predio real
export const LAYOUT_POR_DEFECTO = {
  1: { x: -16, z: -4, rotacionY: 45, colorTecho: 0x2e3d33, visible: true },  // Cabaña del Cedro (oeste de la casa)
  2: { x: -14, z: 22, rotacionY: 30, colorTecho: 0x5a3d28, visible: true },  // Refugio Los Pinos (montecito sur)
  3: { x: 14, z: -6, rotacionY: 135, colorTecho: 0x8b2500, visible: true },  // Cabaña El Roble (norte de laguna)
  4: { x: 0, z: 12, rotacionY: -65, colorTecho: 0x2b4c6f, visible: true }    // Chalet del Arroyo (costa oeste laguna)
}

export function cargarDistribucionMapa() {
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...LAYOUT_POR_DEFECTO, ...parsed }
    }
  } catch (e) {
    console.warn('Error leyendo layout del mapa:', e)
  }
  return { ...LAYOUT_POR_DEFECTO }
}

export function guardarDistribucionMapa(layout) {
  try {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout))
  } catch (e) {
    console.warn('Error guardando layout del mapa:', e)
  }
}

// ----------------------------------------------------
// TERRENO BASADO EN LA IMAGEN SATELITAL REAL (1024x840)
// Proporción 110m x 90m
// ----------------------------------------------------
export function crearTerreno(scene) {
  const textureLoader = new THREE.TextureLoader()
  const satTex = textureLoader.load('/terreno_satelital.jpg')
  satTex.colorSpace = THREE.SRGBColorSpace

  // Terreno base tipo maqueta / diorama (110m de ancho x 90m de profundidad)
  const groundGeo = new THREE.BoxGeometry(110, 2, 90)

  const dirtSideMat = new THREE.MeshLambertMaterial({ color: 0x3d2b1f, flatShading: true })
  const topMat = new THREE.MeshLambertMaterial({
    map: satTex,
    color: 0xffffff,
    roughness: 0.95
  })

  // Materiales en orden: [+X, -X, +Y (arriba), -Y, +Z, -Z]
  const materials = [
    dirtSideMat,
    dirtSideMat,
    topMat,
    dirtSideMat,
    dirtSideMat,
    dirtSideMat
  ]

  const ground = new THREE.Mesh(groundGeo, materials)
  ground.position.y = -1
  ground.receiveShadow = true
  scene.add(ground)

  return ground
}

// Alambrados rústicos en el corral de la casa
export function crearSenderos(scene) {
  const fenceMat = new THREE.MeshLambertMaterial({ color: 0x5a3d28, flatShading: true })
  // Postes de alambrado bordeando el sector este de la casona
  for (let x = -2; x <= 14; x += 3.2) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 4), fenceMat)
    post.position.set(x, 0.6, -16)
    scene.add(post)
  }
  for (let z = -16; z <= -8; z += 2.8) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 4), fenceMat)
    post.position.set(14, 0.6, z)
    scene.add(post)
  }
}

// Laguna natural (ubicada sobre la cuenca real en el sureste)
export function crearLago(scene) {
  const waterGeo = new THREE.CircleGeometry(18, 36)
  waterGeo.scale(1.22, 0.95, 1)

  const waterMat = new THREE.MeshLambertMaterial({
    color: 0x3d6e8a,
    transparent: true,
    opacity: 0.8,
    flatShading: true
  })

  const water = new THREE.Mesh(waterGeo, waterMat)
  water.rotation.x = -Math.PI / 2
  water.position.set(18, 0.05, 18)
  scene.add(water)

  // Muelle de madera en la orilla noroeste de la laguna
  const dockWoodMat = new THREE.MeshLambertMaterial({ color: 0x6e4321, flatShading: true })
  const dock = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.28, 8.5), dockWoodMat)
  dock.position.set(2, 0.24, 13)
  dock.rotation.y = -Math.PI / 4
  dock.castShadow = true
  dock.receiveShadow = true
  scene.add(dock)

  return { water, dock }
}

// Fogata central en el claro entre la casa y la laguna
export function crearFogata(scene, nightLights = []) {
  const campfireGroup = new THREE.Group()
  campfireGroup.position.set(2, 0, -3)

  // Piedras
  const stoneMat = new THREE.MeshLambertMaterial({ color: 0x7f8c8d, flatShading: true })
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35), stoneMat)
    stone.position.set(Math.cos(angle) * 1.1, 0.2, Math.sin(angle) * 1.1)
    stone.castShadow = true
    campfireGroup.add(stone)
  }

  // Leños
  const logMat = new THREE.MeshLambertMaterial({ color: 0x4a2f1b, flatShading: true })
  const log1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.6, 5), logMat)
  log1.rotation.z = Math.PI / 3
  log1.position.y = 0.25
  campfireGroup.add(log1)

  const log2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.6, 5), logMat)
  log2.rotation.z = -Math.PI / 3
  log2.position.y = 0.25
  campfireGroup.add(log2)

  // Fuego
  const fireMat = new THREE.MeshBasicMaterial({ color: 0xff6b35 })
  const fireMesh = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.2, 5), fireMat)
  fireMesh.position.y = 0.65
  campfireGroup.add(fireMesh)

  const fireLight = new THREE.PointLight(0xff7700, 2.0, 16)
  fireLight.position.set(0, 1.2, 0)
  campfireGroup.add(fireLight)
  nightLights.push(fireLight)

  scene.add(campfireGroup)
  return { campfireGroup, fireMesh, fireLight }
}

// Árboles 3D situados exactamente en las masas de sombra de la foto satelital
export function crearBosque(scene) {
  const pineTrunkMat = new THREE.MeshLambertMaterial({ color: 0x4a2c11, flatShading: true })
  const pineLeavesMat = new THREE.MeshLambertMaterial({ color: 0x1f4e30, flatShading: true })
  const pineLeavesLightMat = new THREE.MeshLambertMaterial({ color: 0x2e6b45, flatShading: true })

  function crearPino(x, z, escala = 1) {
    const pino = new THREE.Group()
    pino.position.set(x, 0, z)

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25 * escala, 0.35 * escala, 1.5 * escala, 5), pineTrunkMat)
    trunk.position.y = (1.5 * escala) / 2
    trunk.castShadow = true
    pino.add(trunk)

    const cone1 = new THREE.Mesh(new THREE.ConeGeometry(1.8 * escala, 2.2 * escala, 5), pineLeavesMat)
    cone1.position.y = 1.8 * escala
    cone1.castShadow = true
    pino.add(cone1)

    const cone2 = new THREE.Mesh(new THREE.ConeGeometry(1.4 * escala, 1.8 * escala, 5), pineLeavesLightMat)
    cone2.position.y = 2.8 * escala
    cone2.castShadow = true
    pino.add(cone2)

    const cone3 = new THREE.Mesh(new THREE.ConeGeometry(0.9 * escala, 1.4 * escala, 5), pineLeavesMat)
    cone3.position.y = 3.6 * escala
    cone3.castShadow = true
    pino.add(cone3)

    scene.add(pino)
  }

  const arbolesCoords = [
    // Monte protector de la Casa Principal (arboleda real del pin rojo)
    [-18, -26, 1.4], [-16, -30, 1.2], [-10, -32, 1.5], [-5, -28, 1.3],
    [-4, -22, 1.1], [-6, -18, 1.2], [-14, -17, 1.4], [-20, -21, 1.3],
    [-22, -28, 1.1], [-12, -20, 1.0],

    // Monte arbolado circular del suroeste
    [-24, 4, 1.3], [-20, 2, 1.4], [-17, 6, 1.2], [-19, 11, 1.5],
    [-23, 14, 1.3], [-26, 10, 1.4], [-22, 7, 1.2], [-27, 6, 1.1],
    [-16, 12, 1.3], [-21, 16, 1.2],

    // Árboles a lo largo del camino de acceso noroeste
    [-28, -36, 1.2], [-34, -40, 1.3], [-24, -32, 1.1],

    // Árboles aislados en el campo
    [8, -24, 1.0], [14, -28, 1.2], [4, -14, 0.9], [6, 2, 1.1], [34, -12, 1.2]
  ]

  arbolesCoords.forEach(([x, z, s]) => crearPino(x, z, s))
}

// ----------------------------------------------------
// MODELO 3D DE LA GRAN CASA PRINCIPAL (EN FORMA DE "U" - 2 PLANTAS)
// Ubicada en (-11, 0, -24) mirando hacia el parque / laguna
// Escala monumental: 24m ancho x 18m profundidad x 10m altura total
// Aloja el Salón Común de Comida y las 6 Habitaciones Privadas
// ----------------------------------------------------
export function crearModeloCasaPrincipal(espacioCasa, nightLights = [], smokeParticles = []) {
  const houseGroup = new THREE.Group()
  houseGroup.position.set(-11, 0, -24)
  houseGroup.rotation.y = (35 * Math.PI) / 180
  houseGroup.userData = { cabanaData: espacioCasa, isCasaPrincipal: true }

  // Materiales
  const stoneMat = new THREE.MeshLambertMaterial({ color: 0x8a8276, flatShading: true })
  const wallMat = new THREE.MeshLambertMaterial({ color: 0xc8a986, flatShading: true })
  const timberMat = new THREE.MeshLambertMaterial({ color: 0x4a2410, flatShading: true })
  const deckMat = new THREE.MeshLambertMaterial({ color: 0xa47c52, flatShading: true })
  const patioStoneMat = new THREE.MeshLambertMaterial({ color: 0xaba498, flatShading: true })
  const roofMat = new THREE.MeshLambertMaterial({ color: 0x8b3a2b, flatShading: true }) // tejas terracota
  const windowMat = new THREE.MeshLambertMaterial({
    color: 0xffea88,
    emissive: 0xff9900,
    emissiveIntensity: 0.85,
    flatShading: true
  })
  const windowFrameMat = new THREE.MeshLambertMaterial({ color: 0x2e1708, flatShading: true })
  const doorMat = new THREE.MeshLambertMaterial({ color: 0x562a12, flatShading: true })
  const foliageMat = new THREE.MeshLambertMaterial({ color: 0x2e5c32, flatShading: true })

  // ==========================================
  // 1. CIMIENTOS Y BASES DE PIEDRA (SÓLIDOS, SIN HUECOS)
  // Ancho 24m (X: -12 a 12), Profundidad 18m (Z: -9 a 9)
  // ==========================================
  // Ala Oeste (Salón): X in [-12, -4], Z in [-9, 9]
  const baseWest = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.6, 18.2), stoneMat)
  baseWest.position.set(-8.0, 0.3, 0)
  baseWest.receiveShadow = true
  houseGroup.add(baseWest)

  // Ala Norte Trasera: Conecta de extremo a extremo sin huecos: X in [-12, 12], Z in [-9, -2]
  const baseNorth = new THREE.Mesh(new THREE.BoxGeometry(24.2, 0.6, 7.2), stoneMat)
  baseNorth.position.set(0, 0.3, -5.5)
  baseNorth.receiveShadow = true
  houseGroup.add(baseNorth)

  // Ala Este (Habitaciones): X in [5, 12], Z in [-2, 9]
  const baseEast = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.6, 11.2), stoneMat)
  baseEast.position.set(8.5, 0.3, 3.5)
  baseEast.receiveShadow = true
  houseGroup.add(baseEast)

  // Patio Central Adoquinado en el hueco de la U: X in [-4, 5], Z in [-2, 9]
  const courtyardFloor = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.25, 11.0), patioStoneMat)
  courtyardFloor.position.set(0.5, 0.125, 3.5)
  courtyardFloor.receiveShadow = true
  houseGroup.add(courtyardFloor)

  // ==========================================
  // 2. PAREDES DE 2 PLANTAS (ALTURA TOTAL 6.4m, de Y=0.6 a Y=7.0)
  // ==========================================
  const wallWest = new THREE.Mesh(new THREE.BoxGeometry(8.0, 6.4, 18.0), wallMat)
  wallWest.position.set(-8.0, 3.8, 0)
  wallWest.castShadow = true
  wallWest.receiveShadow = true
  houseGroup.add(wallWest)

  const wallNorth = new THREE.Mesh(new THREE.BoxGeometry(24.0, 6.4, 7.0), wallMat)
  wallNorth.position.set(0, 3.8, -5.5)
  wallNorth.castShadow = true
  wallNorth.receiveShadow = true
  houseGroup.add(wallNorth)

  const wallEast = new THREE.Mesh(new THREE.BoxGeometry(7.0, 6.4, 11.0), wallMat)
  wallEast.position.set(8.5, 3.8, 3.5)
  wallEast.castShadow = true
  wallEast.receiveShadow = true
  houseGroup.add(wallEast)

  // Postes verticales esquineros
  const corners = [
    [-12.0, 3.8, -9.0],
    [-12.0, 3.8, 9.0],
    [-4.0, 3.8, 9.0],
    [-4.0, 3.8, -2.0],
    [12.0, 3.8, -9.0],
    [12.0, 3.8, 9.0],
    [5.0, 3.8, 9.0],
    [5.0, 3.8, -2.0]
  ]
  corners.forEach(([cx, cy, cz]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.35, 6.4, 0.35), timberMat)
    post.position.set(cx, cy, cz)
    post.castShadow = true
    houseGroup.add(post)
  })

  // Vigas divisorias de entrepiso entre planta baja y alta
  const bandWest = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.18, 18.2), timberMat)
  bandWest.position.set(-8.0, 3.8, 0)
  houseGroup.add(bandWest)

  const bandNorth = new THREE.Mesh(new THREE.BoxGeometry(24.2, 0.18, 7.2), timberMat)
  bandNorth.position.set(0, 3.8, -5.5)
  houseGroup.add(bandNorth)

  const bandEast = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.18, 11.2), timberMat)
  bandEast.position.set(8.5, 3.8, 3.5)
  houseGroup.add(bandEast)

  // ==========================================
  // 3. TECHOS A DOS AGUAS ORIENTADOS CORRECTAMENTE (EN FORMA DE ^)
  // ==========================================
  // 3.1 Techo Ala Oeste (Cumbrera en X = -8.0, Y = 10.0, Z in [-9.4, 9.4])
  const westAngle = 0.618
  const westSlopeW = 5.6
  const westRoofLen = 18.8

  // Izquierda: baja hacia X=-12.5 -> rotación Z = +westAngle
  const roofWestL = new THREE.Mesh(new THREE.BoxGeometry(westSlopeW, 0.22, westRoofLen), roofMat)
  roofWestL.position.set(-10.25, 8.4, 0)
  roofWestL.rotation.z = westAngle
  roofWestL.castShadow = true
  roofWestL.receiveShadow = true
  houseGroup.add(roofWestL)

  // Derecha: baja hacia X=-3.5 -> rotación Z = -westAngle
  const roofWestR = new THREE.Mesh(new THREE.BoxGeometry(westSlopeW, 0.22, westRoofLen), roofMat)
  roofWestR.position.set(-5.75, 8.4, 0)
  roofWestR.rotation.z = -westAngle
  roofWestR.castShadow = true
  roofWestR.receiveShadow = true
  houseGroup.add(roofWestR)

  const ridgeWest = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, westRoofLen + 0.1), timberMat)
  ridgeWest.position.set(-8.0, 10.05, 0)
  houseGroup.add(ridgeWest)

  // Triángulos hastiales Oeste
  const gWestShape = new THREE.Shape()
  gWestShape.moveTo(-4.0, 0)
  gWestShape.lineTo(4.0, 0)
  gWestShape.lineTo(0, 3.0)
  gWestShape.closePath()
  const gWestGeo = new THREE.ExtrudeGeometry(gWestShape, { depth: 0.2, bevelEnabled: false })

  const gableWestF = new THREE.Mesh(gWestGeo, wallMat)
  gableWestF.position.set(-8.0, 7.0, 8.9)
  houseGroup.add(gableWestF)

  const gableWestB = new THREE.Mesh(gWestGeo, wallMat)
  gableWestB.position.set(-8.0, 7.0, -9.1)
  houseGroup.add(gableWestB)

  // 3.2 Techo Ala Este (Cumbrera en X = 8.5, Y = 9.6, Z in [-2.2, 9.4])
  const eastAngle = 0.648
  const eastSlopeW = 4.7
  const eastRoofLen = 11.6

  // Izquierda: baja hacia el patio en X=4.8 -> rotación Z = +eastAngle
  const roofEastL = new THREE.Mesh(new THREE.BoxGeometry(eastSlopeW, 0.22, eastRoofLen), roofMat)
  roofEastL.position.set(6.65, 8.2, 3.6)
  roofEastL.rotation.z = eastAngle
  roofEastL.castShadow = true
  roofEastL.receiveShadow = true
  houseGroup.add(roofEastL)

  // Derecha: baja hacia el exterior en X=12.2 -> rotación Z = -eastAngle
  const roofEastR = new THREE.Mesh(new THREE.BoxGeometry(eastSlopeW, 0.22, eastRoofLen), roofMat)
  roofEastR.position.set(10.35, 8.2, 3.6)
  roofEastR.rotation.z = -eastAngle
  roofEastR.castShadow = true
  roofEastR.receiveShadow = true
  houseGroup.add(roofEastR)

  const ridgeEast = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, eastRoofLen + 0.1), timberMat)
  ridgeEast.position.set(8.5, 9.65, 3.6)
  houseGroup.add(ridgeEast)

  const gEastShape = new THREE.Shape()
  gEastShape.moveTo(-3.5, 0)
  gEastShape.lineTo(3.5, 0)
  gEastShape.lineTo(0, 2.6)
  gEastShape.closePath()
  const gEastGeo = new THREE.ExtrudeGeometry(gEastShape, { depth: 0.2, bevelEnabled: false })

  const gableEastF = new THREE.Mesh(gEastGeo, wallMat)
  gableEastF.position.set(8.5, 7.0, 8.9)
  houseGroup.add(gableEastF)

  // 3.3 Techo Ala Norte (Cumbrera en Z = -5.5, Y = 9.6, longitud 16.8m)
  const northAngle = 0.622
  const northSlopeW = 4.8
  const northRoofLen = 16.8

  // Trasera: baja hacia -Z -> rotación X = -northAngle
  const roofNorthB = new THREE.Mesh(new THREE.BoxGeometry(northRoofLen, 0.22, northSlopeW), roofMat)
  roofNorthB.position.set(0.25, 8.2, -7.45)
  roofNorthB.rotation.x = -northAngle
  roofNorthB.castShadow = true
  roofNorthB.receiveShadow = true
  houseGroup.add(roofNorthB)

  // Frontal: baja hacia +Z (patio) -> rotación X = +northAngle
  const roofNorthF = new THREE.Mesh(new THREE.BoxGeometry(northRoofLen, 0.22, northSlopeW), roofMat)
  roofNorthF.position.set(0.25, 8.2, -3.55)
  roofNorthF.rotation.x = northAngle
  roofNorthF.castShadow = true
  roofNorthF.receiveShadow = true
  houseGroup.add(roofNorthF)

  const ridgeNorth = new THREE.Mesh(new THREE.BoxGeometry(northRoofLen + 0.1, 0.28, 0.35), timberMat)
  ridgeNorth.position.set(0.25, 9.65, -5.5)
  houseGroup.add(ridgeNorth)

  // ==========================================
  // 4. GALERÍA TECHADA PERIMETRAL EN EL PATIO
  // ==========================================
  const deckW = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.2, 10.8), deckMat)
  deckW.position.set(-3.0, 0.5, 3.4)
  houseGroup.add(deckW)

  const deckN = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.2, 2.0), deckMat)
  deckN.position.set(0.5, 0.5, -1.0)
  houseGroup.add(deckN)

  const deckE = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.2, 10.8), deckMat)
  deckE.position.set(4.0, 0.5, 3.4)
  houseGroup.add(deckE)

  const galPosts = [
    [-2.0, 2.0, 0.0], [-2.0, 2.0, 3.0], [-2.0, 2.0, 6.0], [-2.0, 2.0, 8.8],
    [0.5, 2.0, 0.0],
    [3.0, 2.0, 0.0], [3.0, 2.0, 3.0], [3.0, 2.0, 6.0], [3.0, 2.0, 8.8]
  ]
  galPosts.forEach(([px, py, pz]) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.0, 0.25), timberMat)
    col.position.set(px, py, pz)
    col.castShadow = true
    houseGroup.add(col)
  })

  const gBeamW = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 9.2), timberMat)
  gBeamW.position.set(-2.0, 3.5, 4.4)
  houseGroup.add(gBeamW)

  const gBeamN = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.22, 0.26), timberMat)
  gBeamN.position.set(0.5, 3.5, 0.0)
  houseGroup.add(gBeamN)

  const gBeamE = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 9.2), timberMat)
  gBeamE.position.set(3.0, 3.5, 4.4)
  houseGroup.add(gBeamE)

  // Tejadillos de la galería con caída suave hacia el patio
  const gRoofW = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.14, 9.2), roofMat)
  gRoofW.position.set(-2.9, 3.75, 4.4)
  gRoofW.rotation.z = -0.25
  gRoofW.castShadow = true
  houseGroup.add(gRoofW)

  const gRoofN = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.14, 2.4), roofMat)
  gRoofN.position.set(0.5, 3.75, -0.9)
  gRoofN.rotation.x = 0.25
  gRoofN.castShadow = true
  houseGroup.add(gRoofN)

  const gRoofE = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.14, 9.2), roofMat)
  gRoofE.position.set(3.9, 3.75, 4.4)
  gRoofE.rotation.z = 0.25
  gRoofE.castShadow = true
  houseGroup.add(gRoofE)

  // ==========================================
  // 5. PUERTAS Y VENTANAS (CLARAS, SIN Z-FIGHTING)
  // ==========================================
  // 5.1 ENTRADA PRINCIPAL DEL SALÓN COMÚN (Frente Oeste, Z = 9.04)
  const mainDoor = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.8, 0.14), doorMat)
  mainDoor.position.set(-8.0, 2.0, 9.04)
  houseGroup.add(mainDoor)

  const mainDoorFrame = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3.0, 0.1), timberMat)
  mainDoorFrame.position.set(-8.0, 2.05, 9.02)
  houseGroup.add(mainDoorFrame)

  const mainSteps = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.3, 1.2), stoneMat)
  mainSteps.position.set(-8.0, 0.15, 9.6)
  houseGroup.add(mainSteps)

  // Ventanales del Salón Comedor en PB
  ;[-10.4, -5.6].forEach((wx) => {
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.0, 0.1), windowMat)
    win.position.set(wx, 2.2, 9.05)
    houseGroup.add(win)

    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.2, 0.08), windowFrameMat)
    frame.position.set(wx, 2.2, 9.03)
    houseGroup.add(frame)
  })

  // Ventanales del salón en la pared lateral exterior (X = -12.05)
  ;[-4.0, 0, 4.0].forEach((wz) => {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.0, 2.2), windowMat)
    win.position.set(-12.05, 2.2, wz)
    houseGroup.add(win)

    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 2.4), windowFrameMat)
    frame.position.set(-12.03, 2.2, wz)
    houseGroup.add(frame)
  })

  // Ventanas de planta alta del salón (X = -12.05, Y = 5.4)
  ;[-4.0, 0, 4.0].forEach((wz) => {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.6, 1.8), windowMat)
    win.position.set(-12.05, 5.4, wz)
    houseGroup.add(win)
  })

  // 5.2 HABITACIONES PRIVADAS: DISTRIBUCIÓN CLARA
  // Ala Norte (Habitaciones 1 y 2 en PB):
  ;[-1.5, 2.5].forEach((rx) => {
    const rDoor = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.2, 0.1), doorMat)
    rDoor.position.set(rx, 1.7, -1.95)
    houseGroup.add(rDoor)

    const rWin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.1), windowMat)
    rWin.position.set(rx + 1.6, 2.0, -1.95)
    houseGroup.add(rWin)
  })

  // Ala Este (Habitaciones 3, 4, 5 en PB hacia la galería X = 4.95):
  ;[1.0, 4.5, 7.5].forEach((rz) => {
    const rDoor = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.2, 1.0), doorMat)
    rDoor.position.set(4.95, 1.7, rz)
    houseGroup.add(rDoor)

    const outWin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 1.5), windowMat)
    outWin.position.set(12.05, 2.2, rz)
    houseGroup.add(outWin)
  })

  // Ventanas de Planta Alta Ala Este
  ;[1.0, 4.5, 7.5].forEach((rz) => {
    const topWin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 1.4), windowMat)
    topWin.position.set(12.05, 5.4, rz)
    houseGroup.add(topWin)
  })

  // ==========================================
  // 6. GRAN CHIMENEA DE PIEDRA (ALA OESTE)
  // ==========================================
  const chimBase = new THREE.Mesh(new THREE.BoxGeometry(2.2, 7.2, 2.0), stoneMat)
  chimBase.position.set(-12.0, 3.6, 0)
  chimBase.castShadow = true
  houseGroup.add(chimBase)

  const chimShaft = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.4, 1.5), stoneMat)
  chimShaft.position.set(-12.0, 8.8, 0)
  chimShaft.castShadow = true
  houseGroup.add(chimShaft)

  const chimCap = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.3, 1.8), timberMat)
  chimCap.position.set(-12.0, 11.1, 0)
  houseGroup.add(chimCap)

  for (let s = 0; s < 4; s++) {
    const puff = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.45),
      new THREE.MeshLambertMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.55 })
    )
    puff.position.set(-12.0, 11.6 + s * 0.7, 0)
    houseGroup.add(puff)
    smokeParticles.push({ mesh: puff, baseY: 11.6, offsetY: s * 0.7 })
  }

  // ==========================================
  // 7. DETALLES DEL PATIO INTERIOR
  // ==========================================
  const planter = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, 2.0), stoneMat)
  planter.position.set(0.5, 0.45, 4.0)
  planter.castShadow = true
  houseGroup.add(planter)

  const shrubTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.0, 5), timberMat)
  shrubTrunk.position.set(0.5, 1.1, 4.0)
  houseGroup.add(shrubTrunk)

  const shrub1 = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 5), foliageMat)
  shrub1.position.set(0.5, 2.1, 4.0)
  shrub1.castShadow = true
  houseGroup.add(shrub1)

  const shrub2 = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.4, 5), foliageMat)
  shrub2.position.set(0.5, 3.0, 4.0)
  shrub2.castShadow = true
  houseGroup.add(shrub2)

  const bench = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 2.4), timberMat)
  bench.position.set(4.0, 0.7, 7.0)
  houseGroup.add(bench)

  // ==========================================
  // 8. FAROLES DE NOCHE
  // ==========================================
  const lampPositions = [
    [-8.0, 3.2, 9.3],
    [-2.0, 3.2, 4.4],
    [0.5, 3.2, 0.0],
    [3.0, 3.2, 4.4]
  ]
  lampPositions.forEach(([lx, ly, lz]) => {
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.32, 0.2), timberMat)
    lamp.position.set(lx, ly, lz)
    houseGroup.add(lamp)

    const light = new THREE.PointLight(0xffbe69, 2.0, 16)
    light.position.set(lx, ly - 0.1, lz)
    light.visible = false
    houseGroup.add(light)
    nightLights.push(light)
  })

  // ==========================================
  // 9. HITBOX PARA INTERACCIÓN Y SELECCIÓN
  // ==========================================
  const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false })
  const hitBox = new THREE.Mesh(new THREE.BoxGeometry(26, 11, 20), hitBoxMat)
  hitBox.position.set(0, 5.5, 0)
  hitBox.userData = { cabanaData: espacioCasa, isCasaPrincipal: true, parentGroup: houseGroup }
  houseGroup.add(hitBox)

  return { houseGroup, hitBox }
}

// ----------------------------------------------------
// Creador procedural de Modelo 3D de Cabaña de Troncos Alpina
// (Idéntico al del visor 3D para absoluta coherencia)
// ----------------------------------------------------
export function crearModeloCabana(cabanaData, config = {}, nightLights = [], smokeParticles = []) {
  const cabanaGroup = new THREE.Group()
  const x = config.x ?? 0
  const z = config.z ?? 0
  const rotacionY = config.rotacionY ? (config.rotacionY * Math.PI) / 180 : 0
  const colorTecho = config.colorTecho || COLORES_TECHO[(cabanaData.id || 1) % COLORES_TECHO.length]

  cabanaGroup.position.set(x, 0, z)
  cabanaGroup.rotation.y = rotacionY
  cabanaGroup.userData = { cabanaData, config }

  // 1. MATERIALES
  const stoneMat = new THREE.MeshLambertMaterial({ color: 0xb5ab96, flatShading: true })
  const stoneTrimMat = new THREE.MeshLambertMaterial({ color: 0x8c826e, flatShading: true })
  const logWoodMat = new THREE.MeshLambertMaterial({ color: 0xa95221, flatShading: true })
  const logWoodAltMat = new THREE.MeshLambertMaterial({ color: 0x934318, flatShading: true })
  const logBeamMat = new THREE.MeshLambertMaterial({ color: 0x6e3212, flatShading: true })
  const deckPlankMat = new THREE.MeshLambertMaterial({ color: 0x7a3e1b, flatShading: true })
  const darkFrameMat = new THREE.MeshLambertMaterial({ color: 0x3d1b09, flatShading: true })
  const roofMat = new THREE.MeshLambertMaterial({ color: colorTecho, flatShading: true })
  const windowLitMat = new THREE.MeshLambertMaterial({
    color: 0xffea9f,
    emissive: 0xff9922,
    emissiveIntensity: 0.75,
    flatShading: true
  })

  // 2. ZÓCALO Y CIMIENTOS
  const stoneBase = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.52, 7.8), stoneMat)
  stoneBase.position.set(0, 0.26, -0.05)
  stoneBase.castShadow = true
  stoneBase.receiveShadow = true
  cabanaGroup.add(stoneBase)

  const stoneTrim = new THREE.Mesh(new THREE.BoxGeometry(6.34, 0.08, 7.94), stoneTrimMat)
  stoneTrim.position.set(0, 0.54, -0.05)
  stoneTrim.receiveShadow = true
  cabanaGroup.add(stoneTrim)

  // 3. CUERPO DE TRONCOS (PLANTA BAJA)
  const body = new THREE.Mesh(new THREE.BoxGeometry(5.8, 2.38, 5.6), logWoodMat)
  body.position.set(0, 1.73, -1.0)
  body.castShadow = true
  body.receiveShadow = true
  cabanaGroup.add(body)

  // Postes verticales esquineros
  const cabinCorners = [
    [-2.9, 1.73, 1.8],
    [2.9, 1.73, 1.8],
    [-2.9, 1.73, -3.8],
    [2.9, 1.73, -3.8]
  ]
  cabinCorners.forEach(([cx, cy, cz]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.38, 0.24), logBeamMat)
    post.position.set(cx, cy, cz)
    cabanaGroup.add(post)
  })

  // 4. GALERÍA / PORCHE TECHADO
  const porchDeck = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.14, 2.1), deckPlankMat)
  porchDeck.position.set(0, 0.59, 2.8)
  porchDeck.receiveShadow = true
  cabanaGroup.add(porchDeck)

  ;[-2.7, 0.1, 2.7].forEach((px) => {
    const pilar = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.36, 0.22), logBeamMat)
    pilar.position.set(px, 1.84, 3.75)
    pilar.castShadow = true
    cabanaGroup.add(pilar)
  })

  // Barandas del porche
  const railFrontR1 = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 2.4, 6), logWoodAltMat)
  railFrontR1.rotation.z = Math.PI / 2
  railFrontR1.position.set(1.4, 1.0, 3.75)
  cabanaGroup.add(railFrontR1)

  const railFrontR2 = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 2.4, 6), logWoodAltMat)
  railFrontR2.rotation.z = Math.PI / 2
  railFrontR2.position.set(1.4, 1.32, 3.75)
  cabanaGroup.add(railFrontR2)

  // Escaleras frontales hacia adelante con base de piedra
  const stairLanding = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.14, 1.3), stoneMat)
  stairLanding.position.set(-1.35, 0.07, 4.4)
  cabanaGroup.add(stairLanding)

  for (let s = 0; s < 3; s++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.14, 0.32), deckPlankMat)
    step.position.set(-1.35, 0.46 - s * 0.16, 3.85 + s * 0.32)
    step.receiveShadow = true
    cabanaGroup.add(step)
  }

  // 5. TECHO ALPINO A DOS AGUAS (CAÍDA CORRECTA EN FORMA DE ^)
  const slopeAngle = 0.77
  const roofLeft = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.14, 8.65), roofMat)
  roofLeft.position.set(-1.8, 4.7, 0.05)
  roofLeft.rotation.z = slopeAngle // ¡Baja a la izquierda!
  roofLeft.castShadow = true
  roofLeft.receiveShadow = true
  cabanaGroup.add(roofLeft)

  const roofRight = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.14, 8.65), roofMat)
  roofRight.position.set(1.8, 4.7, 0.05)
  roofRight.rotation.z = -slopeAngle // ¡Baja a la derecha!
  roofRight.castShadow = true
  roofRight.receiveShadow = true
  cabanaGroup.add(roofRight)

  const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 8.75), roofMat)
  ridge.position.set(0, 6.47, 0.05)
  cabanaGroup.add(ridge)

  // Hastiales frontal y trasero
  const gableShape = new THREE.Shape()
  gableShape.moveTo(-2.9, 0)
  gableShape.lineTo(2.9, 0)
  gableShape.lineTo(0, 3.25)
  gableShape.closePath()
  const gableGeo = new THREE.ExtrudeGeometry(gableShape, { depth: 0.16, bevelEnabled: false })

  const frontGableMesh = new THREE.Mesh(gableGeo, logWoodMat)
  frontGableMesh.position.set(0, 3.05, 1.72)
  cabanaGroup.add(frontGableMesh)

  const backGableMesh = new THREE.Mesh(gableGeo, logWoodMat)
  backGableMesh.position.set(0, 3.05, -3.96)
  cabanaGroup.add(backGableMesh)

  // 6. BALCÓN SUPERIOR (SIN ATRAVESAR EL TECHO)
  const balconyFloor = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.14, 2.05), deckPlankMat)
  balconyFloor.position.set(0, 3.08, 2.75)
  cabanaGroup.add(balconyFloor)

  const bRailFrontHigh = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 4.8, 6), logWoodAltMat)
  bRailFrontHigh.rotation.z = Math.PI / 2
  bRailFrontHigh.position.set(0, 3.75, 3.82)
  cabanaGroup.add(bRailFrontHigh)

  // 7. PUERTA Y VENTANA FRONTAL
  const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.94, 0.08), logWoodAltMat)
  doorPanel.position.set(-1.15, 1.62, 1.82)
  cabanaGroup.add(doorPanel)

  const winFrontGlass = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.05, 0.06), windowLitMat)
  winFrontGlass.position.set(1.35, 1.7, 1.82)
  cabanaGroup.add(winFrontGlass)

  const winFrontFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.25, 0.12), darkFrameMat)
  winFrontFrame.position.set(1.35, 1.7, 1.76)
  cabanaGroup.add(winFrontFrame)

  // 8. CHIMENEA DE PIEDRA Y HUMO
  const chimShaft = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.7, 0.72), stoneMat)
  chimShaft.position.set(0.65, 5.85, -1.2)
  cabanaGroup.add(chimShaft)

  const puffs = []
  for (let s = 0; s < 3; s++) {
    const puff = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.22),
      new THREE.MeshLambertMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.55 })
    )
    puff.position.set(0.65, 7.1 + s * 0.45, -1.2)
    cabanaGroup.add(puff)
    puffs.push(puff)
    smokeParticles.push({ mesh: puff, baseY: 7.1, offsetY: s * 0.55 })
  }

  // 9. ILUMINACIÓN NOCTURNA
  const lanternMat = new THREE.MeshLambertMaterial({ color: 0x1f1f1f })
  const lanternFrame = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 0.16), lanternMat)
  lanternFrame.position.set(0.1, 2.5, 3.65)
  cabanaGroup.add(lanternFrame)

  const porchLight = new THREE.PointLight(0xffbe69, 1.8, 9)
  porchLight.position.set(0.1, 2.4, 3.55)
  porchLight.visible = false
  cabanaGroup.add(porchLight)
  nightLights.push(porchLight)

  // 10. HITBOX
  const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false })
  const hitBox = new THREE.Mesh(new THREE.BoxGeometry(8.2, 7.2, 9.6), hitBoxMat)
  hitBox.position.set(0, 3.5, 0.1)
  hitBox.userData = { cabanaData, config, parentGroup: cabanaGroup }
  cabanaGroup.add(hitBox)

  return { cabanaGroup, hitBox, puffs, body, roof: roofLeft }
}
