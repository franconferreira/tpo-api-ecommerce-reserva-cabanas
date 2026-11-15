import * as THREE from 'three'
import { caja, material } from './piezas'

// Detalles reutilizables (troncos, chapa, barandas, escaleras, accesorios). 1 unidad = 1 metro.

export const PALETA = {
  tronco: '#c47a3c',
  corteTronco: '#d98f4e',
  viga: '#7a4a2a',
  tabla: '#a8743f',
  piedra: '#8d8a82',
  piedraOscura: '#6f6c66',
  pasto: '#6e9a4a',
  pastoClaro: '#86b45a',
  piedraPaso: '#cfcabd',
  humo: '#ececec',
  luz: '#ffd27a',
  hierro: '#3a3a3a'
}

// Tronco horizontal de 8 lados, a lo largo del eje X, con las caras de corte más claras
export function tronco(largo, diametro, x = 0, y = 0, z = 0, eje = 'x') {
  const geo = new THREE.CylinderGeometry(diametro / 2, diametro / 2, largo, 8, 1)
  // giro sobre su propio eje (en la geometría, antes de acostarlo) para que quede una cara plana arriba
  geo.rotateY(Math.PI / 8)
  const malla = new THREE.Mesh(geo, [material(PALETA.tronco), material(PALETA.corteTronco), material(PALETA.corteTronco)])
  if (eje === 'x') malla.rotation.z = Math.PI / 2
  else malla.rotation.x = Math.PI / 2
  malla.position.set(x, y, z)
  malla.castShadow = true
  malla.receiveShadow = true
  return malla
}

// Relleno de troncos para un tramo de pared (se usa con paredConAberturas).
// desfase: corrimiento de las hiladas; salida: cuánto siguen los troncos más allá de la esquina (encastre en cruz).
// Si una hilada queda cortada (arriba o abajo por el desfase), se completa con media viga plana.
// salidaHasta: altura máxima (desde la base de la pared) hasta la que los troncos pueden salir de la esquina (para no atravesar el alero)
export function rellenoTroncos(espesor, hilada, desfase = 0, salida = 0, salidaHasta = Infinity) {
  return (x0, x1, y0, y1, extremos = {}) => {
    const g = new THREE.Group()
    let y = y0
    // primer borde de hilada a partir de y0
    let borde = Math.ceil((y0 - desfase) / hilada - 1e-6) * hilada + desfase
    if (borde - y0 > 0.01) {
      g.add(caja(x1 - x0, borde - y0, espesor * 0.9, PALETA.tronco, (x0 + x1) / 2, y0, -espesor / 2))
      y = borde
    }
    for (; y + hilada <= y1 + 1e-6; y += hilada) {
      const sale = y + hilada <= salidaHasta + 1e-6 ? salida : 0
      const xa = x0 - (extremos.izq ? sale : 0)
      const xb = x1 + (extremos.der ? sale : 0)
      g.add(tronco(xb - xa, hilada * 1.05, (xa + xb) / 2, y + hilada / 2, -espesor / 2))
    }
    if (y1 - y > 0.01) g.add(caja(x1 - x0, y1 - y, espesor * 0.9, PALETA.tronco, (x0 + x1) / 2, y, -espesor / 2))
    return g
  }
}

// Hastial de troncos: triángulo hecho con troncos que se acortan hacia la cumbrera. hueco = { ancho, alto, yCentro }
export function hastialTroncos(ancho, subida, hilada, yBase, z, hueco = null) {
  const g = new THREE.Group()
  for (let y = 0; y < subida - hilada * 0.6; y += hilada) {
    const medio = (ancho / 2) * (1 - (y + hilada / 2) / subida)
    if (medio < 0.15) break
    const yc = yBase + y + hilada / 2
    const enHueco = hueco && y + hilada > hueco.yCentro - hueco.alto / 2 + 1e-6 && y < hueco.yCentro + hueco.alto / 2 - 1e-6
    if (enHueco) {
      const largo = medio - hueco.ancho / 2
      g.add(tronco(largo, hilada * 1.05, -hueco.ancho / 2 - largo / 2, yc, z))
      g.add(tronco(largo, hilada * 1.05, hueco.ancho / 2 + largo / 2, yc, z))
    } else {
      g.add(tronco(medio * 2, hilada * 1.05, 0, yc, z))
    }
  }
  return g
}

// Nervaduras de chapa sobre un techo a dos aguas (cumbrera a lo largo de Z) + caballete en la cumbrera
export function nervadurasChapa({ anchoMuro, pendiente, alero, espesor, yMuro, zDesde, zHasta, color, paso = 0.35 }) {
  const g = new THREE.Group()
  const rad = THREE.MathUtils.degToRad(pendiente)
  const xBorde = anchoMuro / 2 + alero
  const cumbrera = yMuro + (anchoMuro / 2) * Math.tan(rad)
  const yBorde = yMuro - alero * Math.tan(rad)
  const largo = xBorde / Math.cos(rad)
  for (const lado of [-1, 1]) {
    for (let z = zDesde + paso / 2; z < zHasta; z += paso) {
      const n = new THREE.Mesh(new THREE.BoxGeometry(largo, 0.06, 0.05), material(color))
      n.position.set(lado * xBorde / 2, (cumbrera + yBorde) / 2 + (espesor + 0.06) / Math.cos(rad), z)
      n.rotation.z = -lado * rad
      n.castShadow = true
      g.add(n)
    }
  }
  const caballete = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, zHasta - zDesde + 0.05), material(color))
  caballete.position.set(0, cumbrera + espesor + 0.08, (zDesde + zHasta) / 2)
  g.add(caballete)
  return g
}

// Baranda recta entre dos puntos (x0,z0) y (x1,z1) a la altura yBase: pasamanos, travesaño bajo y balaustres
export function baranda(x0, z0, x1, z1, yBase, color = PALETA.viga, alto = 0.9, paso = 0.15) {
  const g = new THREE.Group()
  const dx = x1 - x0
  const dz = z1 - z0
  const largo = Math.hypot(dx, dz)
  const ang = Math.atan2(dz, dx)
  const pivote = new THREE.Group()
  pivote.position.set(x0, yBase, z0)
  pivote.rotation.y = -ang
  pivote.add(caja(largo, 0.07, 0.1, color, largo / 2, alto - 0.07, 0))
  pivote.add(caja(largo, 0.05, 0.06, color, largo / 2, 0.08, 0))
  for (let s = 0; s <= largo + 1e-6; s += paso) {
    pivote.add(caja(0.04, alto - 0.13, 0.04, color, s, 0.08, 0))
  }
  pivote.add(caja(0.1, alto, 0.1, color, 0, 0, 0))
  pivote.add(caja(0.1, alto, 0.1, color, largo, 0, 0))
  g.add(pivote)
  return g
}

// Escalera recta que baja hacia +Z desde (x, yArriba, zArriba): escalones macizos y pasamanos inclinados a ambos lados
export function escalera(x, yArriba, zArriba, ancho, escalones, color = PALETA.tabla) {
  const g = new THREE.Group()
  const contra = yArriba / escalones
  const huella = 0.3
  for (let i = 0; i < escalones; i++) {
    const tope = yArriba - (i + 1) * contra
    if (tope <= 0.01) break
    g.add(caja(ancho, tope, huella, color, x, 0, zArriba + huella / 2 + i * huella))
    g.add(caja(ancho, 0.04, 0.04, PALETA.viga, x, tope - 0.04, zArriba + (i + 1) * huella - 0.02))
  }
  // pasamanos: va de arriba (sobre el piso) hasta el pie de la escalera, siempre a 0,9 m sobre la línea de los escalones
  const recorrido = escalones * huella
  const largo = Math.hypot(recorrido, yArriba)
  const ang = Math.atan2(yArriba, recorrido)
  for (const lado of [-1, 1]) {
    const xl = x + lado * (ancho / 2 + 0.05)
    const riel = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, largo), material(PALETA.viga))
    riel.position.set(xl, yArriba / 2 + 0.9, zArriba + recorrido / 2)
    riel.rotation.x = ang
    riel.castShadow = true
    g.add(riel)
    g.add(caja(0.09, yArriba + 0.9, 0.09, PALETA.viga, xl, 0, zArriba + 0.05))
    g.add(caja(0.09, 0.95, 0.09, PALETA.viga, xl, 0, zArriba + recorrido - 0.05))
  }
  return g
}

// Humo low poly: bolitas que suben y se corren con el viento
export function humo(x, y, z, cantidad = 7) {
  const g = new THREE.Group()
  for (let i = 0; i < cantidad; i++) {
    const r = 0.18 + i * 0.05
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), material(PALETA.humo))
    b.position.set(x + Math.sin(i * 0.9) * 0.25 + i * 0.12, y + i * 0.45, z - i * 0.08)
    g.add(b)
  }
  g.userData.esHumo = true
  return g
}

// Farol en un poste con brazo
export function farol(x, z) {
  const g = new THREE.Group()
  g.add(caja(0.14, 2.2, 0.14, PALETA.viga, 0, 0, 0))
  g.add(caja(0.6, 0.1, 0.1, PALETA.viga, 0.25, 2.05, 0))
  g.add(caja(0.04, 0.2, 0.04, PALETA.hierro, 0.5, 1.85, 0))
  // farol de hierro: tapa, base y 4 parantes finos, con la luz visible en el medio
  g.add(caja(0.26, 0.05, 0.26, PALETA.hierro, 0.5, 1.8, 0))
  g.add(caja(0.22, 0.04, 0.22, PALETA.hierro, 0.5, 1.53, 0))
  for (const [dx, dz] of [[-0.1, -0.1], [0.1, -0.1], [-0.1, 0.1], [0.1, 0.1]]) g.add(caja(0.025, 0.24, 0.025, PALETA.hierro, 0.5 + dx, 1.56, dz))
  const luz = caja(0.15, 0.22, 0.15, PALETA.luz, 0.5, 1.57, 0)
  luz.material = new THREE.MeshLambertMaterial({ color: PALETA.luz, emissive: PALETA.luz, emissiveIntensity: 0.6 })
  luz.userData.esLuz = true
  g.add(luz)
  g.position.set(x, 0, z)
  return g
}

// Barril de 8 lados con zunchos
export function barril(x, z) {
  const g = new THREE.Group()
  const cuerpo = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.75, 8), material(PALETA.tabla))
  cuerpo.position.y = 0.375
  cuerpo.castShadow = true
  g.add(cuerpo)
  for (const y of [0.15, 0.6]) {
    const zuncho = new THREE.Mesh(new THREE.CylinderGeometry(0.295, 0.295, 0.05, 8), material(PALETA.hierro))
    zuncho.position.y = y
    g.add(zuncho)
  }
  g.position.set(x, 0, z)
  return g
}

// Cajón de madera con marco
export function cajon(x, z, lado = 0.55, y = 0, rot = 0) {
  const g = new THREE.Group()
  g.add(caja(lado, lado, lado, PALETA.tabla, 0, 0, 0))
  g.add(caja(lado + 0.02, 0.06, lado + 0.02, PALETA.viga, 0, lado - 0.06, 0))
  g.add(caja(lado + 0.02, 0.06, lado + 0.02, PALETA.viga, 0, 0, 0))
  g.position.set(x, y, z)
  g.rotation.y = rot
  return g
}

// Piedras de paso desde (x, z) hacia +Z
export function piedrasPaso(x, z, cantidad = 5) {
  const g = new THREE.Group()
  for (let i = 0; i < cantidad; i++) {
    const p = caja(0.9 - (i % 2) * 0.15, 0.06, 0.45, PALETA.piedraPaso, x + (i % 2 ? 0.15 : -0.1), 0, z + i * 0.7)
    p.rotation.y = (i % 3 - 1) * 0.12
    g.add(p)
  }
  return g
}

// Tramo de cerco rústico (dos travesaños) desde (x0,z0) a (x1,z1)
export function cerco(x0, z0, x1, z1) {
  const g = new THREE.Group()
  const largo = Math.hypot(x1 - x0, z1 - z0)
  const pivote = new THREE.Group()
  pivote.position.set(x0, 0, z0)
  pivote.rotation.y = -Math.atan2(z1 - z0, x1 - x0)
  const postes = Math.max(2, Math.round(largo / 1.5) + 1)
  for (let i = 0; i < postes; i++) pivote.add(caja(0.12, 1.0, 0.12, PALETA.viga, (i * largo) / (postes - 1), 0, 0))
  pivote.add(caja(largo, 0.1, 0.06, PALETA.viga, largo / 2, 0.75, 0.06))
  pivote.add(caja(largo, 0.1, 0.06, PALETA.viga, largo / 2, 0.4, 0.06))
  g.add(pivote)
  return g
}

// Matas de pasto low poly
export function pasto(x, z) {
  const g = new THREE.Group()
  for (let i = 0; i < 3; i++) {
    const hoja = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.35, 4), material(i % 2 ? PALETA.pasto : PALETA.pastoClaro))
    hoja.position.set(x + (i - 1) * 0.07, 0.17, z + (i % 2) * 0.05)
    hoja.rotation.z = (i - 1) * 0.3
    g.add(hoja)
  }
  return g
}

// ---- Accesorios de las variantes de cabaña ----

// Banco de madera (largo a lo largo del eje X)
export function banco(x, y, z, largo = 1.4) {
  const g = new THREE.Group()
  g.add(caja(largo, 0.06, 0.4, PALETA.tabla, 0, 0.42, 0))
  g.add(caja(largo, 0.4, 0.06, PALETA.tabla, 0, 0.5, -0.18))
  for (const sx of [-1, 1]) g.add(caja(0.08, 0.42, 0.36, PALETA.viga, sx * (largo / 2 - 0.1), 0, 0))
  g.position.set(x, y, z)
  return g
}

// Leñero: troncos cortados apilados bajo un techito
export function lenero(x, z) {
  const g = new THREE.Group()
  for (let fila = 0; fila < 3; fila++) {
    for (let i = 0; i < 5 - fila; i++) {
      g.add(tronco(0.6, 0.2, 0, 0.1 + fila * 0.18, (i - (4 - fila) / 2) * 0.21, 'x'))
    }
  }
  g.add(caja(0.1, 1.1, 0.1, PALETA.viga, 0, 0, -0.6))
  g.add(caja(0.1, 1.1, 0.1, PALETA.viga, 0, 0, 0.6))
  const techito = caja(0.9, 0.06, 1.5, PALETA.viga, 0, 1.1, 0)
  techito.rotation.x = 0
  g.add(techito)
  g.position.set(x, 0, z)
  return g
}

// Parrilla de ladrillo con chimenea chica
export function parrilla(x, z) {
  const g = new THREE.Group()
  g.add(caja(1.2, 0.9, 0.6, '#a5523a', 0, 0, 0))
  g.add(caja(1.0, 0.04, 0.5, PALETA.hierro, 0, 0.9, 0))
  g.add(caja(0.4, 0.9, 0.35, '#a5523a', 0, 0.9, -0.1))
  g.position.set(x, 0, z)
  return g
}

// Canoa de madera apoyada en el suelo (casco de 6 lados achatado, a lo largo del eje X)
export function canoa(x, z, rot = 0) {
  const g = new THREE.Group()
  const casco = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 3.2, 6), material(PALETA.tabla))
  casco.rotation.z = Math.PI / 2
  casco.scale.set(1, 1, 0.55)
  casco.position.y = 0.2
  casco.castShadow = true
  g.add(casco)
  g.add(caja(2.8, 0.02, 0.5, PALETA.viga, 0, 0.4, 0))
  g.add(caja(0.08, 0.05, 0.6, PALETA.tabla, 0.6, 0.41, 0))
  g.add(caja(0.08, 0.05, 0.6, PALETA.tabla, -0.6, 0.41, 0))
  g.position.set(x, 0, z)
  g.rotation.y = rot
  return g
}

// Relleno de tablas verticales con listones (estilo granero), para paredConAberturas.
// Los listones se alinean a una grilla fija desde el borde de la pared para que no salten entre tramos.
export function rellenoTablas(espesor, color, colorListon, largoPared, paso = 0.6) {
  return (x0, x1, y0, y1) => {
    const g = new THREE.Group()
    g.add(caja(x1 - x0, y1 - y0, espesor, color, (x0 + x1) / 2, y0, -espesor / 2))
    const inicio = -largoPared / 2
    for (let k = Math.ceil((x0 - inicio) / paso); inicio + k * paso <= x1 + 1e-6; k++) {
      const x = inicio + k * paso
      if (x - x0 < 0.04 || x1 - x < 0.04) continue
      g.add(caja(0.07, y1 - y0, 0.04, colorListon, x, y0, 0.02))
    }
    return g
  }
}

// Bombitas de una guirnalda colgando en catenaria entre dos puntos
export function guirnalda(desde, hasta, caida = 0.4, separacion = 0.5) {
  const g = new THREE.Group()
  const largo = desde.distanceTo(hasta)
  const n = Math.max(2, Math.round(largo / separacion))
  const puntos = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const p = desde.clone().lerp(hasta, t)
    p.y -= caida * 4 * t * (1 - t)
    puntos.push(p)
  }
  const cable = new THREE.Line(new THREE.BufferGeometry().setFromPoints(puntos), new THREE.LineBasicMaterial({ color: '#2a2a2a' }))
  g.add(cable)
  const matBombita = new THREE.MeshLambertMaterial({ color: '#ffe3a3', emissive: '#ffcf6a', emissiveIntensity: 0.25 })
  for (let i = 1; i < n; i++) {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), matBombita)
    b.position.copy(puntos[i])
    b.position.y -= 0.07
    b.userData.esBombita = true
    g.add(b)
  }
  return g
}

// Mesa larga de caballetes (largo a lo largo del eje X)
export function mesaLarga(x, z, largo = 2.4) {
  const g = new THREE.Group()
  g.add(caja(largo, 0.06, 0.8, PALETA.tabla, 0, 0.74, 0))
  for (const sx of [-1, 1]) {
    for (const d of [-1, 1]) {
      const pata = caja(0.07, 0.78, 0.07, PALETA.viga, sx * (largo / 2 - 0.25), 0, d * 0.3)
      g.add(pata)
    }
  }
  g.position.set(x, 0, z)
  return g
}
