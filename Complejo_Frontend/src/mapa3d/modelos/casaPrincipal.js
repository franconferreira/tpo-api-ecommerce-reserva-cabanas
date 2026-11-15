import * as THREE from 'three'
import { caja, hastial, techoDosAguas, material } from '../piezas'
import { paredConAberturas } from '../aberturas'
import { PALETA, farol, banco, pasto, humo } from '../detalles'

// Casa principal: una planta en U, de piedra (disenos/REGLAS_MAPA_3D.md, sección 4).
// Bloque central al fondo (cocina, comedor y baños comunales) y dos alas hacia el frente con 3 habitaciones cada una.
// Ejes: X = ancho, Z = fondo. La U se abre hacia +Z (sur). Origen: centro de la planta total, a nivel del suelo.
export const CASA = {
  ancho: 23,
  fondoCentral: 7,
  anchoAla: 5.5,
  largoAla: 13.5, // 3 habitaciones de 4,5 m
  zocalo: 0.5,
  altoMuro: 3.0,
  espesorMuro: 0.4,
  pendiente: 35,
  alero: 0.5,
  espesorTecho: 0.18,
  galeria: 2.0,
  colorPiedra: '#8d8a82',
  colorZocalo: '#6f6c66',
  colorEsquina: '#7a776f',
  colorPizarra: '#4a5a6a',
  colorPizarraOscura: '#3b4856'
}

// Esquinero de piedras alternadas (sillares) en una esquina exterior
function esquinero(x, z, sx, sz, yBase, alto, color) {
  const g = new THREE.Group()
  let i = 0
  for (let y = 0; y < alto - 0.05; y += 0.38, i++) {
    const largoA = i % 2 ? 0.7 : 0.45
    const largoB = i % 2 ? 0.45 : 0.7
    g.add(caja(largoA, 0.34, 0.12, color, x - sx * largoA / 2, yBase + y, z + sz * 0.04))
    g.add(caja(0.12, 0.34, largoB, color, x + sx * 0.04, yBase + y, z - sz * largoB / 2))
  }
  return g
}

// Hastial girado: triángulo con la base a lo largo del eje Z (para los extremos del bloque central)
function hastialLateral(ancho, subida, espesor, color, yBase, x, zCentro, haciaAfuera) {
  const h = hastial(ancho, subida, espesor, color, yBase, 0)
  const g = new THREE.Group()
  g.add(h)
  g.rotation.y = haciaAfuera > 0 ? Math.PI / 2 : -Math.PI / 2
  g.position.set(x - haciaAfuera * espesor / 2, 0, zCentro)
  return g
}

export function crearCasaPrincipal(opciones = {}) {
  const c = { ...CASA, ...opciones }
  const grupo = new THREE.Group()
  const avisos = []
  const e = c.espesorMuro
  const fondoTotal = c.fondoCentral + c.largoAla
  const zFondo = -fondoTotal / 2
  const zCentralFrente = zFondo + c.fondoCentral
  const zFrente = fondoTotal / 2
  const xAla = c.ancho / 2 - c.anchoAla / 2 // centro de cada ala
  const xPatio = c.ancho / 2 - c.anchoAla // cara interior de las alas
  const yBase = c.zocalo
  const yMuro = yBase + c.altoMuro
  const rad = THREE.MathUtils.degToRad(c.pendiente)
  const caida = c.alero * Math.tan(rad)
  const zAla = (zCentralFrente + zFrente) / 2
  const centrosHab = [0, 1, 2].map((i) => zCentralFrente + 2.25 + i * 4.5)

  // ---- Zócalo de piedra oscura (U completa) ----
  grupo.add(caja(c.ancho + 0.1, c.zocalo, c.fondoCentral + 0.1, c.colorZocalo, 0, 0, (zFondo + zCentralFrente) / 2))
  for (const s of [-1, 1]) grupo.add(caja(c.anchoAla + 0.1, c.zocalo, c.largoAla + 0.1, c.colorZocalo, s * xAla, 0, zAla))

  // ---- Paredes de piedra con aberturas ----
  const paredes = [
    // fondo (norte): baños, comedor y puerta de cocina
    { nombre: 'fondo', largo: c.ancho, rotY: Math.PI, pos: [0, zFondo], aberturas: [{ tipo: 'chica' }, { tipo: 'ventana', contraventanas: true }, { tipo: 'puerta' }, { tipo: 'ventana', contraventanas: true }, { tipo: 'chica' }] },
    // frente del bloque central (da al patio): puerta doble y dos ventanales
    { nombre: 'central al patio', largo: xPatio * 2, rotY: 0, pos: [0, zCentralFrente], aberturas: [{ tipo: 'ventanal', x: -3.6 }, { tipo: 'doble', x: 0 }, { tipo: 'ventanal', x: 3.6 }] },
    // laterales exteriores: una ventana del bloque central y una por habitación
    { nombre: 'lateral izquierdo', largo: fondoTotal - e * 2, rotY: -Math.PI / 2, pos: [-c.ancho / 2, 0], aberturas: [(zFondo + zCentralFrente) / 2, ...centrosHab].map((z) => ({ tipo: 'ventana', x: z, contraventanas: true })) },
    { nombre: 'lateral derecho', largo: fondoTotal - e * 2, rotY: Math.PI / 2, pos: [c.ancho / 2, 0], aberturas: [(zFondo + zCentralFrente) / 2, ...centrosHab].map((z) => ({ tipo: 'ventana', x: -z, contraventanas: true })) },
    // caras interiores de las alas: una puerta por habitación hacia la galería
    { nombre: 'ala izquierda al patio', largo: c.largoAla, rotY: Math.PI / 2, pos: [-xPatio, zAla], aberturas: centrosHab.map((z) => ({ tipo: 'puerta', x: -(z - zAla) })) },
    { nombre: 'ala derecha al patio', largo: c.largoAla, rotY: -Math.PI / 2, pos: [xPatio, zAla], aberturas: centrosHab.map((z) => ({ tipo: 'puerta', x: z - zAla })) },
    // puntas de las alas (sur): ventana extra de las habitaciones 3 y 6
    { nombre: 'punta ala izquierda', largo: c.anchoAla, rotY: 0, pos: [-xAla, zFrente], aberturas: [{ tipo: 'ventana', contraventanas: true }] },
    { nombre: 'punta ala derecha', largo: c.anchoAla, rotY: 0, pos: [xAla, zFrente], aberturas: [{ tipo: 'ventana', contraventanas: true }] }
  ]
  for (const p of paredes) {
    const pared = paredConAberturas({
      largo: p.largo,
      alto: c.altoMuro,
      espesor: e,
      color: c.colorPiedra,
      aberturas: p.aberturas,
      nombre: p.nombre,
      alturaLibre: c.altoMuro - caida
    })
    pared.rotation.y = p.rotY
    pared.position.set(p.pos[0], yBase, p.pos[1])
    avisos.push(...pared.userData.avisos)
    grupo.add(pared)
  }

  // ---- Esquineros de piedra en las esquinas exteriores ----
  for (const [x, z, sx, sz] of [
    [-c.ancho / 2, zFondo, -1, -1], [c.ancho / 2, zFondo, 1, -1],
    [-c.ancho / 2, zFrente, -1, 1], [c.ancho / 2, zFrente, 1, 1],
    [-xPatio, zFrente, 1, 1], [xPatio, zFrente, -1, 1]
  ]) grupo.add(esquinero(x, z, sx, sz, yBase, c.altoMuro, c.colorEsquina))

  // ---- Techos de pizarra ----
  const subidaCentral = (c.fondoCentral / 2) * Math.tan(rad)
  const subidaAla = (c.anchoAla / 2) * Math.tan(rad)
  // bloque central: cumbrera a lo largo de X (se arma girado)
  const techoCentral = new THREE.Group()
  techoCentral.add(techoDosAguas({ anchoMuro: c.fondoCentral, pendiente: c.pendiente, alero: c.alero, espesor: c.espesorTecho, yMuro, zDesde: -c.ancho / 2 - c.alero, zHasta: c.ancho / 2 + c.alero, color: c.colorPizarra }))
  techoCentral.rotation.y = Math.PI / 2
  techoCentral.position.z = (zFondo + zCentralFrente) / 2
  grupo.add(techoCentral)
  // alas: cumbrera a lo largo de Z; entran en el techo central hasta cruzarse con él
  const entrada = subidaAla / Math.tan(rad) + 0.3
  for (const s of [-1, 1]) {
    const techoAla = techoDosAguas({ anchoMuro: c.anchoAla, pendiente: c.pendiente, alero: c.alero, espesor: c.espesorTecho, yMuro, zDesde: zCentralFrente - entrada, zHasta: zFrente + c.alero, color: c.colorPizarra })
    techoAla.position.x = s * xAla
    grupo.add(techoAla)
    // hastial de piedra en la punta de cada ala
    const h = hastial(c.anchoAla, subidaAla, e, c.colorPiedra, yMuro, zFrente - e / 2)
    h.position.x = s * xAla
    grupo.add(h)
  }
  // hastiales de los extremos del bloque central
  for (const s of [-1, 1]) grupo.add(hastialLateral(c.fondoCentral, subidaCentral, e, c.colorPiedra, yMuro, s * c.ancho / 2, (zFondo + zCentralFrente) / 2, s))

  // ---- Galería techada alrededor del patio ----
  const yGaleria = yMuro - 0.15
  const yBorde = yMuro - 0.6
  const tramosGaleria = [
    // a lo largo del bloque central
    { x0: -xPatio, x1: xPatio, z0: zCentralFrente, z1: zCentralFrente + c.galeria, eje: 'x' },
    // a lo largo de cada ala
    { x0: -xPatio, x1: -xPatio + c.galeria, z0: zCentralFrente + c.galeria, z1: zFrente, eje: 'zIzq' },
    { x0: xPatio - c.galeria, x1: xPatio, z0: zCentralFrente + c.galeria, z1: zFrente, eje: 'zDer' }
  ]
  for (const t of tramosGaleria) {
    // piso de la galería a la altura del zócalo
    grupo.add(caja(t.x1 - t.x0, c.zocalo, t.z1 - t.z0, c.colorZocalo, (t.x0 + t.x1) / 2, 0, (t.z0 + t.z1) / 2))
    // techo de una pendiente (alto contra la pared, bajo hacia el patio)
    const ancho = t.eje === 'x' ? t.x1 - t.x0 : t.z1 - t.z0
    const geo = new THREE.BoxGeometry(t.eje === 'x' ? ancho + 0.4 : c.galeria + 0.5, 0.12, t.eje === 'x' ? c.galeria + 0.5 : ancho + 0.4)
    const techo = new THREE.Mesh(geo, material(c.colorPizarraOscura))
    techo.position.set((t.x0 + t.x1) / 2, (yGaleria + yBorde) / 2, (t.z0 + t.z1) / 2)
    const inclinacion = Math.atan2(yGaleria - yBorde, c.galeria)
    if (t.eje === 'x') techo.rotation.x = inclinacion
    if (t.eje === 'zIzq') techo.rotation.z = -inclinacion
    if (t.eje === 'zDer') techo.rotation.z = inclinacion
    techo.castShadow = true
    grupo.add(techo)
  }
  // columnas de madera cada 2,5 m en el borde de la galería
  const altoCol = yBorde - c.zocalo
  for (let x = -xPatio + c.galeria; x <= xPatio - c.galeria + 1e-6; x += (xPatio - c.galeria) * 2 / 4) {
    grupo.add(caja(0.2, altoCol, 0.2, PALETA.viga, x, c.zocalo, zCentralFrente + c.galeria - 0.1))
  }
  for (const s of [-1, 1]) {
    for (let z = zCentralFrente + c.galeria; z <= zFrente - 0.2 + 1e-6; z += 2.5) {
      grupo.add(caja(0.2, altoCol, 0.2, PALETA.viga, s * (xPatio - c.galeria + 0.1), c.zocalo, z))
    }
  }

  // ---- Chimenea grande de piedra sobre el comedor ----
  const xChim = -6.5
  const zChim = zFondo + 2.2
  const yTecho = yMuro + (c.fondoCentral / 2 - Math.abs(zChim - (zFondo + zCentralFrente) / 2)) * Math.tan(rad)
  grupo.add(caja(2.0, yTecho + 1.0 - (yMuro - 1), 1.0, c.colorPiedra, xChim, yMuro - 1, zChim))
  grupo.add(caja(2.2, 0.15, 1.2, c.colorZocalo, xChim, yTecho + 1.0, zChim))
  grupo.add(humo(xChim, yTecho + 1.6, zChim))

  // ---- Escalones de la puerta de la cocina (norte) ----
  grupo.add(caja(1.4, 0.25, 0.6, c.colorZocalo, 0, 0, zFondo - 0.3))

  // ---- Accesorios ----
  grupo.add(farol(-xPatio + c.galeria + 1.2, zFrente + 1.2))
  grupo.add(farol(xPatio - c.galeria - 1.2, zFrente + 1.2))
  grupo.add(banco(-2.5, c.zocalo, zCentralFrente + 0.7, 1.6))
  grupo.add(banco(2.5, c.zocalo, zCentralFrente + 0.7, 1.6))
  for (const [x, z] of [[-3, 4], [2.5, 6], [0, 1.5], [-c.ancho / 2 - 0.4, 2], [c.ancho / 2 + 0.4, -4]]) grupo.add(pasto(x, z))

  grupo.userData = {
    nombre: 'Casa principal',
    etapa: 'volumen, aberturas y detalles',
    avisos: avisos,
    medidas: {
      planta: `${c.ancho} × ${fondoTotal} m (U)`,
      patio: `${xPatio * 2} × ${c.largoAla} m`,
      habitaciones: '6 de 4,5 × 5,5 m',
      cumbrera: `${(yMuro + subidaCentral).toFixed(2)} m`
    }
  }
  return grupo
}
