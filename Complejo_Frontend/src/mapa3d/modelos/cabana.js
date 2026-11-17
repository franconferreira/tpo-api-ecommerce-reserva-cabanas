import * as THREE from 'three'
import { caja, techoDosAguas } from '../piezas'
import { paredConAberturas, ventana, TIPOS } from '../aberturas'
import {
  PALETA, rellenoTroncos, hastialTroncos, nervadurasChapa, baranda, escalera,
  humo, farol, barril, cajon, piedrasPaso, cerco, pasto, banco, lenero, parrilla, canoa
} from '../detalles'

// Cabaña de 4 a 5 personas (disenos/REGLAS_MAPA_3D.md, sección 2).
// Ejes: X = ancho (frente), Z = fondo. El frente mira hacia +Z. El origen es el centro de la planta cerrada a nivel del suelo.
export const CABANA = {
  ancho: 6.5,
  fondo: 6.0,
  altoPilotes: 0.9,
  altoMuro: 2.75, // 11 hiladas de troncos
  espesorMuro: 0.25,
  hilada: 0.25,
  salidaEsquina: 0.3,
  pendiente: 55,
  alero: 0.5,
  porche: 2.2,
  espesorTecho: 0.15,
  colorChapa: '#8a5230',
  colorNervadura: '#74431f'
}

// Las 4 cabañas son el mismo modelo: cambian el color de la chapa y un accesorio (ficha, sección 2)
export const VARIANTES = {
  cedro: { nombre: 'Cabaña del Cedro', colorChapa: '#8a5230', colorNervadura: '#74431f', extra: 'banco' },
  pinos: { nombre: 'Refugio Los Pinos', colorChapa: '#4f6b3a', colorNervadura: '#3f5a2e', extra: 'lenero' },
  roble: { nombre: 'Cabaña El Roble', colorChapa: '#9c4a32', colorNervadura: '#7f3a26', extra: 'parrilla' },
  arroyo: { nombre: 'Chalet del Arroyo', colorChapa: '#4a5a6a', colorNervadura: '#3b4856', extra: 'canoa' }
}

// Etapa "detalles": troncos, chapa, porche con vigas y barandas, escalera, chimenea con humo y accesorios
export function crearCabana(opciones = {}) {
  const variante = VARIANTES[opciones.variante || 'cedro']
  const c = { ...CABANA, ...variante, ...opciones }
  const grupo = new THREE.Group()
  const avisos = []
  const yPiso = c.altoPilotes
  const zFrente = c.fondo / 2
  const zPorche = zFrente + c.porche
  const yMuro = yPiso + c.altoMuro
  const rad = THREE.MathUtils.degToRad(c.pendiente)
  const subida = (c.ancho / 2) * Math.tan(rad)
  const cumbrera = yMuro + subida

  // ---- Pilotes y plataforma ----
  const xPil = c.ancho / 2 - 0.2
  for (const x of [-xPil, xPil]) {
    for (const z of [-c.fondo / 2 + 0.2, 0, zFrente - 0.2, zPorche - 0.2]) {
      grupo.add(caja(0.25, yPiso, 0.25, PALETA.viga, x, 0, z))
    }
  }
  // cruz de refuerzo entre los pilotes delanteros
  const diag = Math.hypot(xPil * 2, yPiso)
  for (const s of [-1, 1]) {
    const riostra = caja(diag, 0.1, 0.08, PALETA.viga, 0, 0, zPorche - 0.2)
    riostra.position.y = yPiso / 2
    riostra.rotation.z = s * Math.atan2(yPiso, xPil * 2)
    grupo.add(riostra)
  }
  grupo.add(caja(c.ancho + 0.1, 0.2, c.fondo + c.porche + 0.1, PALETA.tabla, 0, yPiso - 0.2, c.porche / 2))
  // tablas del piso del porche
  for (let x = -c.ancho / 2 + 0.15; x < c.ancho / 2; x += 0.3) {
    grupo.add(caja(0.02, 0.01, c.porche, PALETA.viga, x, yPiso, zFrente + c.porche / 2))
  }

  // ---- Muros de troncos con aberturas ----
  const e = c.espesorMuro
  const paredes = [
    { nombre: 'frente', largo: c.ancho, rotY: 0, pos: [0, zFrente], aberturas: [{ tipo: 'puerta', x: -1.3 }, { tipo: 'ventana', x: 1.4 }] },
    { nombre: 'fondo', largo: c.ancho, rotY: Math.PI, pos: [0, -zFrente], aberturas: [{ tipo: 'chica' }] },
    // Los laterales van corridos media hilada: así sus troncos se intercalan con los del frente y el fondo en las esquinas
    { nombre: 'lateral izquierdo', largo: c.fondo, rotY: -Math.PI / 2, pos: [-c.ancho / 2, 0], desfase: c.hilada / 2, aberturas: [{ tipo: 'ventana' }] },
    { nombre: 'lateral derecho', largo: c.fondo, rotY: Math.PI / 2, pos: [c.ancho / 2, 0], desfase: c.hilada / 2, aberturas: [{ tipo: 'ventana' }] }
  ]
  const caidaAlero = c.alero * Math.tan(rad)
  for (const p of paredes) {
    const pared = paredConAberturas({
      largo: p.largo,
      alto: c.altoMuro,
      espesor: e,
      color: PALETA.tronco,
      aberturas: p.aberturas,
      hilada: c.hilada,
      desfase: p.desfase || 0,
      nombre: p.nombre,
      alturaLibre: p.nombre.startsWith('lateral') ? c.altoMuro - caidaAlero : Infinity,
      // en frente y fondo, los troncos de arriba no salen de la esquina porque ahí ya baja el alero
      relleno: rellenoTroncos(e, c.hilada, p.desfase || 0, c.salidaEsquina, p.desfase ? Infinity : c.altoMuro - (c.salidaEsquina + e / 2) * Math.tan(rad))
    })
    pared.rotation.y = p.rotY
    pared.position.set(p.pos[0], yPiso, p.pos[1])
    avisos.push(...pared.userData.avisos)
    grupo.add(pared)
  }
  // ---- Hastiales de troncos; el del frente con la ventana angosta del altillo ----
  const angosta = TIPOS.angosta
  const yCentroAngosta = 1.8
  grupo.add(hastialTroncos(c.ancho, subida, c.hilada, yMuro, zFrente - e / 2, { ancho: angosta.ancho, alto: angosta.alto, yCentro: yCentroAngosta }))
  const vAngosta = ventana(angosta.ancho, angosta.alto)
  vAngosta.position.set(0, yMuro + yCentroAngosta - angosta.alto / 2, zFrente)
  grupo.add(vAngosta)
  grupo.add(hastialTroncos(c.ancho, subida, c.hilada, yMuro, -zFrente + e / 2))

  // ---- Techo de chapa con nervaduras ----
  const datosTecho = {
    anchoMuro: c.ancho,
    pendiente: c.pendiente,
    alero: c.alero,
    espesor: c.espesorTecho,
    yMuro: yMuro,
    zDesde: -c.fondo / 2 - c.alero,
    zHasta: zPorche + 0.3
  }
  const techo = techoDosAguas({ ...datosTecho, color: c.colorChapa })
  const nervaduras = nervadurasChapa({ ...datosTecho, color: c.colorNervadura })
  techo.traverse((o) => { o.userData.esTecho = true })
  nervaduras.traverse((o) => { o.userData.esTecho = true })
  grupo.add(techo)
  grupo.add(nervaduras)

  // ---- Porche: postes, viga y cruz de vigas en el triángulo del frente ----
  const zViga = zPorche - 0.15
  const xPoste = c.ancho / 2 - 0.15
  for (const x of [-xPoste, xPoste]) grupo.add(caja(0.2, c.altoMuro, 0.2, PALETA.viga, x, yPiso, zViga))
  grupo.add(caja(c.ancho, 0.22, 0.22, PALETA.viga, 0, yMuro - 0.22, zViga))
  // pendolón central y diagonales que se cruzan con él
  grupo.add(caja(0.18, subida - 0.3, 0.18, PALETA.viga, 0, yMuro, zViga))
  const alturaCruce = subida * 0.62
  for (const s of [-1, 1]) {
    const x0 = s * (c.ancho / 2 - 0.6)
    const largoDiag = Math.hypot(x0, alturaCruce)
    const d = caja(largoDiag + 0.6, 0.16, 0.16, PALETA.viga, 0, 0, zViga)
    d.position.set(x0 / 2, yMuro + alturaCruce / 2, zViga)
    d.rotation.z = -s * Math.atan2(alturaCruce, Math.abs(x0)) * -1
    d.rotation.z = s > 0 ? Math.PI - Math.atan2(alturaCruce, Math.abs(x0)) : Math.atan2(alturaCruce, Math.abs(x0))
    grupo.add(d)
  }

  // ---- Barandas del porche (abierta en el centro para la escalera) ----
  const zB = zPorche - 0.1
  const xB = c.ancho / 2 - 0.1
  grupo.add(baranda(-xB, zFrente + 0.35, -xB, zB, yPiso))
  grupo.add(baranda(xB, zFrente + 0.35, xB, zB, yPiso))
  grupo.add(baranda(-xB, zB, -0.7, zB, yPiso))
  grupo.add(baranda(0.7, zB, xB, zB, yPiso))

  // ---- Escalera frontal de 5 escalones con pasamanos ----
  grupo.add(escalera(0, yPiso, zPorche, 1.2, 5))

  // ---- Chimenea de piedra en el faldón derecho, con sombrerete y humo ----
  const xChim = c.ancho / 4
  const zChim = -c.fondo / 2 + 1
  const yTechoEnChim = yMuro + (c.ancho / 2 - xChim) * Math.tan(rad)
  const yTopeChim = yTechoEnChim + 1
  grupo.add(caja(0.8, yTopeChim - (yMuro - 1.2), 0.8, PALETA.piedra, xChim, yMuro - 1.2, zChim))
  grupo.add(caja(0.95, 0.12, 0.95, PALETA.piedraOscura, xChim, yTopeChim, zChim))
  grupo.add(humo(xChim, yTopeChim + 0.5, zChim))

  // ---- Accesorios ----
  const zSuelo = zPorche + 5 * 0.3
  grupo.add(piedrasPaso(0, zSuelo + 0.4, 5))
  grupo.add(farol(c.ancho / 2 + 1.0, zSuelo + 0.8))
  grupo.add(barril(-c.ancho / 2 - 0.6, zFrente + 0.6))
  grupo.add(barril(-c.ancho / 2 - 0.55, zFrente + 1.3))
  grupo.add(cajon(c.ancho / 2 + 0.7, -1.4))
  grupo.add(cajon(c.ancho / 2 + 0.75, -0.8, 0.5, 0, 0.3))
  grupo.add(cajon(c.ancho / 2 + 0.7, -1.4, 0.45, 0.55, 0.15))
  grupo.add(cerco(-3.4, zSuelo + 2.6, -1.2, zSuelo + 3.1))
  // accesorio propio de cada variante
  if (c.extra === 'banco') grupo.add(banco(1.4, yPiso, zFrente + 0.45))
  if (c.extra === 'lenero') grupo.add(lenero(-c.ancho / 2 - 1.0, -1.2))
  if (c.extra === 'parrilla') grupo.add(parrilla(-2.4, zSuelo + 1.2))
  if (c.extra === 'canoa') grupo.add(canoa(-c.ancho / 2 - 1.2, -0.6, Math.PI / 2 + 0.12))
  for (const [x, z] of [[-1.1, zSuelo + 0.5], [1.0, zSuelo + 1.9], [-c.ancho / 2 - 0.3, zFrente - 0.5], [c.ancho / 2 + 0.4, zFrente + 1.6], [1.4, -c.fondo / 2 - 0.4]]) {
    grupo.add(pasto(x, z))
  }

  grupo.userData = {
    nombre: c.nombre,
    etapa: 'colores',
    avisos: avisos,
    techo: { yMuro, anchoMedio: c.ancho / 2, tan: Math.tan(rad), espesorVertical: c.espesorTecho / Math.cos(rad), zDesde: datosTecho.zDesde, zHasta: datosTecho.zHasta },
    medidas: {
      planta: `${c.ancho} × ${c.fondo} m`,
      cumbrera: `${cumbrera.toFixed(2)} m`
    }
  }
  return grupo
}
