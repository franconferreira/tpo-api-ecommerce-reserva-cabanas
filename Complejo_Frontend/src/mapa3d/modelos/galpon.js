import * as THREE from 'three'
import { caja, hastial, techoDosAguas, material } from '../piezas'
import { paredConAberturas, ventanaRedonda } from '../aberturas'
import { PALETA, rellenoTablas, nervadurasChapa, guirnalda, farol, banco, pasto, barril, cajon, mesaLarga } from '../detalles'

// Galpón de fiestas, hasta 120 personas (disenos/REGLAS_MAPA_3D.md, sección 3).
// Ejes: X = ancho (frente), Z = fondo. El frente mira hacia +Z. Origen: centro de la planta a nivel del suelo.
export const GALPON = {
  ancho: 12,
  fondo: 22,
  zocalo: 0.5,
  altoMuro: 4.5,
  espesorMuro: 0.25,
  pendiente: 30,
  alero: 0.5,
  espesorTecho: 0.18,
  colorTabla: '#b07a45',
  colorListon: '#8a5a30',
  colorChapa: '#9c4a32',
  colorNervadura: '#7f3a26',
  anexo: { ancho: 6, fondo: 5, alto: 3 },
  pergola: { fondo: 4, alto: 3.2 }
}

export function crearGalpon(opciones = {}) {
  const c = { ...GALPON, ...opciones }
  const grupo = new THREE.Group()
  const avisos = []
  const e = c.espesorMuro
  const zFrente = c.fondo / 2
  const yBase = c.zocalo
  const yMuro = yBase + c.altoMuro
  const rad = THREE.MathUtils.degToRad(c.pendiente)
  const subida = (c.ancho / 2) * Math.tan(rad)
  const caidaAlero = c.alero * Math.tan(rad)

  // ---- Zócalo de piedra ----
  grupo.add(caja(c.ancho + 0.1, c.zocalo, c.fondo + 0.1, PALETA.piedra, 0, 0, 0))

  // ---- Paredes de tablas verticales con aberturas ----
  const paredes = [
    { nombre: 'frente', largo: c.ancho, rotY: 0, pos: [0, zFrente], aberturas: [{ tipo: 'grande', x: -4 }, { tipo: 'porton', x: 0 }, { tipo: 'grande', x: 4 }] },
    { nombre: 'fondo', largo: c.ancho, rotY: Math.PI, pos: [0, -zFrente], aberturas: [{ tipo: 'puerta', x: 0 }] },
    { nombre: 'lateral izquierdo', largo: c.fondo - e * 2, rotY: -Math.PI / 2, pos: [-c.ancho / 2, 0], aberturas: [{ tipo: 'grande' }, { tipo: 'grande' }, { tipo: 'grande' }, { tipo: 'grande' }] },
    { nombre: 'lateral derecho', largo: c.fondo - e * 2, rotY: Math.PI / 2, pos: [c.ancho / 2, 0], aberturas: [{ tipo: 'grande' }, { tipo: 'grande' }, { tipo: 'grande' }, { tipo: 'grande' }] }
  ]
  for (const p of paredes) {
    const pared = paredConAberturas({
      largo: p.largo,
      alto: c.altoMuro,
      espesor: e,
      color: c.colorTabla,
      aberturas: p.aberturas,
      nombre: p.nombre,
      alturaLibre: p.nombre.startsWith('lateral') ? c.altoMuro - caidaAlero : Infinity,
      relleno: rellenoTablas(e, c.colorTabla, c.colorListon, p.largo)
    })
    pared.rotation.y = p.rotY
    pared.position.set(p.pos[0], yBase, p.pos[1])
    avisos.push(...pared.userData.avisos)
    grupo.add(pared)
  }
  // esquineros (tablas que cubren las esquinas)
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    grupo.add(caja(0.3, c.altoMuro, 0.3, c.colorListon, sx * (c.ancho / 2 - 0.1), yBase, sz * (zFrente - 0.1)))
  }

  // ---- Hastiales: el del frente con la ventana redonda ----
  const radioOjo = 0.6
  const yOjo = 1.6
  grupo.add(hastial(c.ancho, subida, e, c.colorTabla, yMuro, zFrente - e / 2, [{ radio: radioOjo, yCentro: yOjo }]))
  const ojo = ventanaRedonda(radioOjo)
  ojo.position.set(0, yMuro + yOjo, zFrente)
  grupo.add(ojo)
  grupo.add(hastial(c.ancho, subida, e, c.colorTabla, yMuro, -zFrente + e / 2))
  // listones verticales en los hastiales, recortados a la forma del triángulo
  for (const z of [zFrente + 0.02, -zFrente - 0.02]) {
    for (let x = -c.ancho / 2 + 0.6; x < c.ancho / 2 - 0.3; x += 0.6) {
      const alto = subida * (1 - Math.abs(x) / (c.ancho / 2)) - 0.1
      if (alto < 0.3) continue
      if (z > 0 && Math.abs(x) < radioOjo + 0.15) continue // no tapar el ojo de buey
      grupo.add(caja(0.07, alto, 0.04, c.colorListon, x, yMuro, z))
    }
  }

  // ---- Techo de chapa a dos aguas ----
  const datosTecho = {
    anchoMuro: c.ancho,
    pendiente: c.pendiente,
    alero: c.alero,
    espesor: c.espesorTecho,
    yMuro: yMuro,
    zDesde: -zFrente - c.alero,
    zHasta: zFrente + c.alero
  }
  grupo.add(techoDosAguas({ ...datosTecho, color: c.colorChapa }))
  grupo.add(nervadurasChapa({ ...datosTecho, color: c.colorNervadura }))

  // ---- Rampa de madera frente al portón (salva el zócalo) ----
  const rampa = caja(4.4, 0.12, 2.0, PALETA.tabla, 0, 0, 0)
  rampa.position.set(0, c.zocalo / 2, zFrente + 1.0)
  rampa.rotation.x = Math.atan2(c.zocalo, 2.0)
  grupo.add(rampa)

  // ---- Anexo de cocina en el fondo, con techo de una pendiente ----
  const a = c.anexo
  const zAnexo = -zFrente - a.fondo / 2
  grupo.add(caja(a.ancho + 0.1, c.zocalo, a.fondo + 0.1, PALETA.piedra, 0, 0, zAnexo))
  const paredesAnexo = [
    { nombre: 'anexo fondo', largo: a.ancho, rotY: Math.PI, pos: [0, -zFrente - a.fondo], aberturas: [{ tipo: 'chica' }] },
    { nombre: 'anexo izquierdo', largo: a.fondo - e, rotY: -Math.PI / 2, pos: [-a.ancho / 2, zAnexo + e / 2], aberturas: [{ tipo: 'puerta' }] },
    { nombre: 'anexo derecho', largo: a.fondo - e, rotY: Math.PI / 2, pos: [a.ancho / 2, zAnexo + e / 2], aberturas: [{ tipo: 'chica' }] }
  ]
  for (const p of paredesAnexo) {
    const pared = paredConAberturas({
      largo: p.largo,
      alto: a.alto,
      espesor: e,
      color: c.colorTabla,
      aberturas: p.aberturas,
      nombre: p.nombre,
      relleno: rellenoTablas(e, c.colorTabla, c.colorListon, p.largo)
    })
    pared.rotation.y = p.rotY
    pared.position.set(p.pos[0], yBase, p.pos[1])
    avisos.push(...pared.userData.avisos)
    grupo.add(pared)
  }
  // techo inclinado: alto contra el galpón (lado +Z del anexo) y más bajo hacia afuera
  const desnivel = 0.6
  const yBajoAnexo = yBase + a.alto
  const yAltoAnexo = yBajoAnexo + desnivel
  const vuelo = 0.4
  const largoTechoAnexo = Math.hypot(a.fondo + vuelo, desnivel)
  const techoAnexo = new THREE.Mesh(new THREE.BoxGeometry(a.ancho + 0.6, 0.15, largoTechoAnexo), material(c.colorChapa))
  techoAnexo.position.set(0, (yAltoAnexo + yBajoAnexo) / 2 + 0.08, zAnexo - vuelo / 2)
  techoAnexo.rotation.x = -Math.atan2(desnivel, a.fondo + vuelo)
  techoAnexo.castShadow = true
  grupo.add(techoAnexo)
  // nervaduras de la chapa del anexo (siguen la pendiente)
  for (let x = -a.ancho / 2; x <= a.ancho / 2 + 1e-6; x += 0.35) {
    const n = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, largoTechoAnexo), material(c.colorNervadura))
    n.position.set(x, techoAnexo.position.y + 0.1, techoAnexo.position.z)
    n.rotation.x = techoAnexo.rotation.x
    grupo.add(n)
  }
  // triángulos que cierran los costados bajo la pendiente
  const cuna = new THREE.Shape()
  cuna.moveTo(0, 0)
  cuna.lineTo(a.fondo, 0)
  cuna.lineTo(a.fondo, desnivel)
  cuna.lineTo(0, 0)
  for (const sx of [-1, 1]) {
    const lado = new THREE.Mesh(new THREE.ExtrudeGeometry(cuna, { depth: e, bevelEnabled: false }), material(c.colorTabla))
    lado.rotation.y = -Math.PI / 2
    lado.position.set(sx * (a.ancho / 2) + (sx > 0 ? 0 : e), yBajoAnexo, -zFrente - a.fondo)
    grupo.add(lado)
  }
  // caño de la cocina
  const cano = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.6, 6), material('#4a4a4a'))
  cano.position.set(1.8, yAltoAnexo + 0.6, zAnexo)
  grupo.add(cano)

  // ---- Pérgola al frente con guirnaldas ----
  const pg = c.pergola
  const zP = zFrente + pg.fondo
  for (const x of [-5.8, -2.6, 2.6, 5.8]) grupo.add(caja(0.22, pg.alto, 0.22, PALETA.viga, x, 0, zP))
  grupo.add(caja(c.ancho, 0.22, 0.22, PALETA.viga, 0, pg.alto, zP))
  grupo.add(caja(c.ancho, 0.2, 0.2, PALETA.viga, 0, pg.alto, zFrente + 0.12))
  for (let x = -5.8; x <= 5.81; x += 1.16) grupo.add(caja(0.12, 0.18, pg.fondo, PALETA.viga, x, pg.alto + 0.22, zFrente + pg.fondo / 2))
  for (const [x0, x1] of [[-5.8, -2.6], [-2.6, 2.6], [2.6, 5.8]]) {
    grupo.add(guirnalda(new THREE.Vector3(x0, pg.alto - 0.05, zP), new THREE.Vector3(x1, pg.alto - 0.05, zFrente + 0.2), 0.45))
    grupo.add(guirnalda(new THREE.Vector3(x1, pg.alto - 0.05, zP), new THREE.Vector3(x0, pg.alto - 0.05, zFrente + 0.2), 0.45))
  }

  // ---- Accesorios ----
  grupo.add(banco(-4.2, 0, zFrente + 1.6, 1.8))
  grupo.add(banco(4.2, 0, zFrente + 1.6, 1.8))
  grupo.add(mesaLarga(-4.2, zFrente + 2.6, 2.2))
  grupo.add(mesaLarga(4.2, zFrente + 2.6, 2.2))
  grupo.add(barril(a.ancho / 2 + 0.7, -zFrente - 1.0))
  grupo.add(barril(a.ancho / 2 + 0.75, -zFrente - 1.8))
  grupo.add(cajon(-a.ancho / 2 - 0.8, -zFrente - 3.5))
  grupo.add(cajon(-a.ancho / 2 - 0.8, -zFrente - 3.5, 0.45, 0.55, 0.2))
  grupo.add(farol(-3.2, zP + 2.0))
  grupo.add(farol(3.2, zP + 2.0))
  for (const [x, z] of [[-6.4, 3], [6.5, -5], [-6.3, -8], [2.8, zP + 1.2]]) grupo.add(pasto(x, z))

  grupo.userData = {
    nombre: 'Galpón de fiestas',
    etapa: 'detalles y colores',
    avisos: avisos,
    techo: { yMuro, anchoMedio: c.ancho / 2, tan: Math.tan(rad), espesorVertical: c.espesorTecho / Math.cos(rad), zDesde: datosTecho.zDesde, zHasta: datosTecho.zHasta },
    medidas: {
      planta: `${c.ancho} × ${c.fondo} m`,
      muros: `${c.altoMuro} m + zócalo ${c.zocalo} m`,
      cumbrera: `${(yMuro + subida).toFixed(2)} m`
    }
  }
  return grupo
}
