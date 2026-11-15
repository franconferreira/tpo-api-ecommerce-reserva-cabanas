import * as THREE from 'three'

// Piezas reutilizables del mapa 3D. 1 unidad = 1 metro.
// Las reglas de medidas están en disenos/REGLAS_MAPA_3D.md

const cacheMateriales = {}

// Material plano (flat shading) cacheado por color
export function material(color) {
  if (!cacheMateriales[color]) {
    cacheMateriales[color] = new THREE.MeshLambertMaterial({ color: color, flatShading: true })
  }
  return cacheMateriales[color]
}

// Caja definida por su centro en x/z y su base en y (más fácil para apilar)
export function caja(ancho, alto, profundidad, color, x = 0, yBase = 0, z = 0) {
  const malla = new THREE.Mesh(new THREE.BoxGeometry(ancho, alto, profundidad), material(color))
  malla.position.set(x, yBase + alto / 2, z)
  malla.castShadow = true
  malla.receiveShadow = true
  return malla
}

// Triángulo del hastial (frente o fondo de un techo a dos aguas): base = ancho, alto = altura de la cumbrera sobre el muro.
// huecos: rectángulos { ancho, alto, yCentro } (y medida desde la base del triángulo) que se recortan para poner ventanas
export function hastial(ancho, alto, espesor, color, yBase, z, huecos = []) {
  const forma = new THREE.Shape()
  forma.moveTo(-ancho / 2, 0)
  forma.lineTo(ancho / 2, 0)
  forma.lineTo(0, alto)
  forma.lineTo(-ancho / 2, 0)
  for (const h of huecos) {
    const hueco = new THREE.Path()
    if (h.radio) {
      // hueco circular (ventana redonda)
      hueco.absarc(0, h.yCentro, h.radio, 0, Math.PI * 2, false)
      forma.holes.push(hueco)
      continue
    }
    hueco.moveTo(-h.ancho / 2, h.yCentro - h.alto / 2)
    hueco.lineTo(h.ancho / 2, h.yCentro - h.alto / 2)
    hueco.lineTo(h.ancho / 2, h.yCentro + h.alto / 2)
    hueco.lineTo(-h.ancho / 2, h.yCentro + h.alto / 2)
    hueco.lineTo(-h.ancho / 2, h.yCentro - h.alto / 2)
    forma.holes.push(hueco)
  }
  const geo = new THREE.ExtrudeGeometry(forma, { depth: espesor, bevelEnabled: false })
  const malla = new THREE.Mesh(geo, material(color))
  malla.position.set(0, yBase, z - espesor / 2)
  malla.castShadow = true
  malla.receiveShadow = true
  return malla
}

// Techo a dos aguas con la cumbrera a lo largo del eje Z.
// anchoMuro: ancho entre muros; pendiente en grados; alero: cuánto sobresale a los costados;
// zDesde/zHasta: dónde empieza y termina el techo (incluye aleros de frente y fondo).
export function techoDosAguas({ anchoMuro, pendiente, alero, espesor, yMuro, zDesde, zHasta, color }) {
  const grupo = new THREE.Group()
  const rad = THREE.MathUtils.degToRad(pendiente)
  const subida = (anchoMuro / 2) * Math.tan(rad)
  const cumbrera = yMuro + subida
  const xBorde = anchoMuro / 2 + alero
  const yBorde = yMuro - alero * Math.tan(rad)
  const largoFaldon = xBorde / Math.cos(rad)
  const largoZ = zHasta - zDesde
  for (const lado of [-1, 1]) {
    const faldon = new THREE.Mesh(new THREE.BoxGeometry(largoFaldon, espesor, largoZ), material(color))
    // punto medio entre la cumbrera (0, cumbrera) y el borde del alero (xBorde, yBorde), subido medio espesor
    faldon.position.set(lado * xBorde / 2, (cumbrera + yBorde) / 2 + (espesor / 2) / Math.cos(rad), zDesde + largoZ / 2)
    faldon.rotation.z = -lado * rad
    faldon.castShadow = true
    faldon.receiveShadow = true
    grupo.add(faldon)
  }
  grupo.userData.cumbrera = cumbrera
  return grupo
}

// Personaje de referencia de 1,75 m (solo se usa en el visor de trabajo)
export function personaReferencia(x = 0, z = 0) {
  const grupo = new THREE.Group()
  grupo.add(caja(0.18, 0.85, 0.18, '#3b5f8a', -0.12, 0, 0))
  grupo.add(caja(0.18, 0.85, 0.18, '#3b5f8a', 0.12, 0, 0))
  grupo.add(caja(0.5, 0.62, 0.26, '#c0392b', 0, 0.85, 0))
  grupo.add(caja(0.26, 0.28, 0.26, '#f0c9a0', 0, 1.47, 0))
  grupo.position.set(x, 0, z)
  return grupo
}
