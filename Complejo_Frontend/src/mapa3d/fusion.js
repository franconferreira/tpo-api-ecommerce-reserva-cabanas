import * as THREE from 'three'

// Juntar mallas: la placa de video dibuja mucho más rápido pocas mallas grandes que miles de mallas chicas.
// (cada tronco, tabla o farol es una malla; el mapa entero tiene miles)

// Junta piezas { geo, color?, x, y, z, sx, sy, sz, giro } en una sola geometría con color por vértice.
// Si la pieza no trae color, usa los colores que ya tenga su geometría.
export function juntar(piezas) {
  const pos = []
  const nor = []
  const col = []
  const c = new THREE.Color()
  for (const p of piezas) {
    const g = p.geo.index ? p.geo.toNonIndexed() : p.geo.clone()
    g.scale(p.sx ?? 1, p.sy ?? 1, p.sz ?? 1)
    if (p.giro) g.rotateY(p.giro)
    g.translate(p.x ?? 0, p.y ?? 0, p.z ?? 0)
    if (!g.attributes.normal) g.computeVertexNormals()
    const a = g.attributes.position.array
    const n = g.attributes.normal.array
    const ca = p.color ? null : g.attributes.color.array
    if (p.color) c.set(p.color)
    for (let i = 0; i < a.length; i += 3) {
      pos.push(a[i], a[i + 1], a[i + 2])
      nor.push(n[i], n[i + 1], n[i + 2])
      if (ca) col.push(ca[i], ca[i + 1], ca[i + 2])
      else col.push(c.r, c.g, c.b)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  return geo
}

// Junta todas las mallas quietas de `raiz` en una malla por material, ya ubicadas en el mundo.
// `saltear(malla)` dice cuáles quedan sueltas (las que cambian de noche, se mueven o se eligen con el mouse).
export function fusionarEstaticos(raiz, saltear) {
  raiz.updateMatrixWorld(true)
  const porMaterial = new Map() // material -> [{ geo, desde, cantidad }]
  const quitar = []
  raiz.traverse((o) => {
    if (!o.isMesh || saltear(o)) return
    const geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()
    geo.applyMatrix4(o.matrixWorld)
    if (!geo.attributes.normal) geo.computeVertexNormals()
    const total = geo.attributes.position.count
    // una malla con varios materiales (los troncos: corteza y cortes) se separa por grupos
    const materiales = Array.isArray(o.material) ? o.material : [o.material]
    const grupos = Array.isArray(o.material) && geo.groups.length ? geo.groups : [{ start: 0, count: total, materialIndex: 0 }]
    for (const gr of grupos) {
      const mat = materiales[gr.materialIndex]
      if (!porMaterial.has(mat)) porMaterial.set(mat, [])
      porMaterial.get(mat).push({ geo, desde: gr.start, cantidad: Math.min(gr.count, total - gr.start) })
    }
    quitar.push(o)
  })
  for (const o of quitar) o.parent.remove(o)

  for (const [mat, partes] of porMaterial) {
    const vertices = partes.reduce((s, p) => s + p.cantidad, 0)
    const pos = new Float32Array(vertices * 3)
    const nor = new Float32Array(vertices * 3)
    let k = 0
    for (const { geo, desde, cantidad } of partes) {
      pos.set(geo.attributes.position.array.subarray(desde * 3, (desde + cantidad) * 3), k)
      nor.set(geo.attributes.normal.array.subarray(desde * 3, (desde + cantidad) * 3), k)
      k += cantidad * 3
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3))
    const malla = new THREE.Mesh(geo, mat)
    malla.castShadow = true
    malla.receiveShadow = true
    raiz.add(malla)
  }
  return quitar.length
}
