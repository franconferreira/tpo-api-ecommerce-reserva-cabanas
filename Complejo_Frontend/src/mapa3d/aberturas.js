import * as THREE from 'three'
import { caja, material } from './piezas'

// Ventanas, puertas y paredes con aberturas. Las medidas y reglas salen de disenos/REGLAS_MAPA_3D.md (1.4).
export const TIPOS = {
  ventana: { ancho: 1.0, alto: 1.2, antepecho: 0.9, clase: 'ventana' },
  chica: { ancho: 0.7, alto: 0.7, antepecho: 1.4, clase: 'ventana' },
  ventanal: { ancho: 1.8, alto: 1.6, antepecho: 0.6, clase: 'ventana' },
  angosta: { ancho: 0.5, alto: 1.1, antepecho: 0, clase: 'ventana' },
  grande: { ancho: 1.2, alto: 1.5, antepecho: 1.0, clase: 'ventana' },
  puerta: { ancho: 0.9, alto: 2.1, antepecho: 0, clase: 'puerta' },
  doble: { ancho: 1.6, alto: 2.2, antepecho: 0, clase: 'puerta' },
  porton: { ancho: 4.0, alto: 3.5, antepecho: 0, clase: 'puerta' }
}

export const REGLAS = { aEsquina: 0.6, entreAberturas: 0.8 }

export const COLORES = {
  marco: '#f2e6cc',
  vidrio: '#9fc7d6',
  hojaPuerta: '#7a4a2a',
  manija: '#d9b27c'
}

const MARCO = 0.08 // ancho del marco
const SALE = 0.04 // cuánto sobresale de la pared

// Ventana con marco, cruz, vidrio y alféizar. Se dibuja centrada en x=0 con la base del hueco en y=0,
// apoyada sobre la cara exterior de la pared (z = 0 es la cara exterior).
export function ventana(ancho, alto) {
  const g = new THREE.Group()
  const prof = 0.1
  // vidrio un poco hundido respecto de la cara de la pared
  const vidrio = caja(ancho, alto, 0.02, COLORES.vidrio, 0, 0, -0.06)
  vidrio.userData.esVidrio = true // de noche se enciende
  g.add(vidrio)
  // marco
  g.add(caja(ancho + MARCO * 2, MARCO, prof, COLORES.marco, 0, alto, SALE - prof / 2))
  g.add(caja(ancho + MARCO * 2, MARCO, prof, COLORES.marco, 0, -MARCO, SALE - prof / 2))
  g.add(caja(MARCO, alto, prof, COLORES.marco, -ancho / 2 - MARCO / 2, 0, SALE - prof / 2))
  g.add(caja(MARCO, alto, prof, COLORES.marco, ancho / 2 + MARCO / 2, 0, SALE - prof / 2))
  // cruz de dos hojas
  g.add(caja(0.05, alto, 0.05, COLORES.marco, 0, 0, -0.03))
  g.add(caja(ancho, 0.05, 0.05, COLORES.marco, 0, alto * 0.55, -0.03))
  // alféizar
  g.add(caja(ancho + MARCO * 2 + 0.1, 0.05, 0.12, COLORES.marco, 0, -MARCO - 0.05, 0.06))
  return g
}

// Puerta con marco, hoja de madera y manija (cerrada)
export function puerta(ancho, alto) {
  const g = new THREE.Group()
  const prof = 0.1
  g.add(caja(ancho, alto, 0.06, COLORES.hojaPuerta, 0, 0, -0.05))
  // tablas verticales marcadas con listones
  for (const x of [-ancho / 4, ancho / 4]) {
    g.add(caja(0.03, alto - 0.1, 0.02, '#5e3820', x, 0.05, -0.01))
  }
  g.add(caja(ancho + MARCO * 2, MARCO, prof, COLORES.marco, 0, alto, SALE - prof / 2))
  g.add(caja(MARCO, alto, prof, COLORES.marco, -ancho / 2 - MARCO / 2, 0, SALE - prof / 2))
  g.add(caja(MARCO, alto, prof, COLORES.marco, ancho / 2 + MARCO / 2, 0, SALE - prof / 2))
  g.add(caja(0.06, 0.06, 0.06, COLORES.manija, ancho / 2 - 0.15, alto * 0.47, 0.02))
  return g
}

// Contraventanas de madera abiertas a los costados de una ventana (dos hojas con tablillas)
export function contraventanas(ancho, alto, color = '#4f6b3a', colorTablilla = '#3f5a2e') {
  const g = new THREE.Group()
  const hoja = ancho / 2
  for (const s of [-1, 1]) {
    const xc = s * (ancho / 2 + MARCO + hoja / 2 + 0.02)
    g.add(caja(hoja, alto, 0.05, color, xc, 0, 0.03))
    for (let y = 0.15; y < alto - 0.1; y += 0.22) g.add(caja(hoja - 0.08, 0.04, 0.03, colorTablilla, xc, y, 0.07))
  }
  return g
}

// Portón corredizo de granero: dos hojas con cruz de refuerzo y riel arriba
export function porton(ancho, alto) {
  const g = new THREE.Group()
  const hoja = ancho / 2
  for (const s of [-1, 1]) {
    const xc = s * hoja / 2
    g.add(caja(hoja - 0.04, alto, 0.08, COLORES.hojaPuerta, xc, 0, -0.04))
    // marco de la hoja
    g.add(caja(hoja, 0.12, 0.06, COLORES.marco, xc, alto - 0.12, 0.02))
    g.add(caja(hoja, 0.12, 0.06, COLORES.marco, xc, 0, 0.02))
    g.add(caja(0.12, alto, 0.06, COLORES.marco, xc - s * (hoja / 2 - 0.06), 0, 0.02))
    g.add(caja(0.12, alto, 0.06, COLORES.marco, xc + s * (hoja / 2 - 0.06), 0, 0.02))
    // cruz en X
    const diag = Math.hypot(hoja - 0.24, alto - 0.24)
    for (const d of [-1, 1]) {
      const barra = caja(diag, 0.12, 0.05, COLORES.marco, xc, 0, 0.03)
      barra.position.y = alto / 2
      barra.rotation.z = d * Math.atan2(alto - 0.24, hoja - 0.24)
      g.add(barra)
    }
  }
  g.add(caja(ancho + 1.2, 0.12, 0.12, '#3a3a3a', 0, alto + 0.05, 0.08))
  return g
}

// Ventana redonda (ojo de buey) para hastiales: vidrio, marco circular y cruz. Centro en (0,0), sobre la cara exterior
export function ventanaRedonda(radio) {
  const g = new THREE.Group()
  const vidrio = new THREE.Mesh(new THREE.CircleGeometry(radio, 12), material(COLORES.vidrio))
  vidrio.position.z = -0.05
  vidrio.userData.esVidrio = true
  g.add(vidrio)
  const marco = new THREE.Mesh(new THREE.TorusGeometry(radio + 0.04, 0.07, 4, 12), material(COLORES.marco))
  marco.position.z = 0.02
  g.add(marco)
  g.add(caja(radio * 2, 0.05, 0.05, COLORES.marco, 0, -0.025, -0.02))
  const vertical = caja(0.05, radio * 2, 0.05, COLORES.marco, 0, -radio, -0.02)
  g.add(vertical)
  return g
}

// Pared con aberturas. Se construye a lo largo del eje X (de -largo/2 a largo/2), base en y=0,
// con la cara exterior en z=0 y el espesor hacia -z.
// aberturas: [{ tipo: 'ventana' | 'chica' | 'puerta' | ..., x?: posición del centro }]
// Si no se indica x, se reparten simétricas. Si hay hilada (troncos), el hueco se ajusta a hiladas completas.
// Devuelve el grupo; los incumplimientos de reglas quedan en grupo.userData.avisos.
// alturaLibre: si la pared queda bajo un alero, altura máxima (desde la base de la pared) a la que puede llegar una abertura
// relleno(x0, x1, y0, y1): función opcional que dibuja cada tramo macizo de la pared (por ejemplo, con troncos)
// desfase: corrimiento vertical de las hiladas (en las paredes que se cruzan con otras, media hilada)
export function paredConAberturas({ largo, alto, espesor, color, aberturas = [], hilada = 0, desfase = 0, nombre = 'pared', alturaLibre = Infinity, relleno = null }) {
  const g = new THREE.Group()
  const avisos = []
  const n = aberturas.length
  const huecos = aberturas.map((a, i) => {
    const t = TIPOS[a.tipo]
    const x = a.x !== undefined ? a.x : -largo / 2 + ((i + 1) * largo) / (n + 1)
    let y0 = t.antepecho
    let y1 = t.antepecho + t.alto
    if (hilada > 0 && t.clase === 'ventana') {
      // el hueco empieza y termina en el borde de una hilada (antepecho redondeado hacia abajo)
      y0 = Math.floor((y0 - desfase) / hilada) * hilada + desfase
      y1 = y0 + Math.round(t.alto / hilada) * hilada
      // si queda bajo el alero, se baja de a una hilada (sin bajar el antepecho de 0,5 m)
      while (y1 > alturaLibre + 1e-6 && y0 - hilada >= 0.5) {
        y0 -= hilada
        y1 -= hilada
      }
    }
    if (hilada > 0 && t.clase === 'puerta') {
      y1 = Math.ceil((t.alto - desfase) / hilada) * hilada + desfase
    }
    return { ...t, tipo: a.tipo, x, y0, y1, contraventanas: !!a.contraventanas }
  }).sort((a, b) => a.x - b.x)

  // Reglas: distancia a las esquinas y entre aberturas
  huecos.forEach((h, i) => {
    const izq = h.x - h.ancho / 2 + largo / 2
    const der = largo / 2 - (h.x + h.ancho / 2)
    if (izq < REGLAS.aEsquina - 1e-6 || der < REGLAS.aEsquina - 1e-6) avisos.push(`${nombre}: ${h.tipo} a menos de ${REGLAS.aEsquina} m de la esquina`)
    if (h.y1 > alto) avisos.push(`${nombre}: ${h.tipo} más alta que la pared`)
    if (h.y1 > alturaLibre + 1e-6) avisos.push(`${nombre}: ${h.tipo} queda tapada por el alero`)
    if (i > 0) {
      const ant = huecos[i - 1]
      const gap = h.x - h.ancho / 2 - (ant.x + ant.ancho / 2)
      if (gap < REGLAS.entreAberturas - 1e-6) avisos.push(`${nombre}: ${ant.tipo} y ${h.tipo} separadas menos de ${REGLAS.entreAberturas} m`)
    }
  })

  // Muro: columnas llenas entre huecos + tramos arriba y abajo de cada hueco
  const tramo = (x0, x1, y0, y1) => {
    if (x1 - x0 <= 1e-6 || y1 - y0 <= 1e-6) return
    // el relleno sabe si el tramo toca un extremo de la pared (para que los troncos sigan más allá de la esquina)
    const extremos = { izq: x0 <= -largo / 2 + 1e-6, der: x1 >= largo / 2 - 1e-6 }
    g.add(relleno ? relleno(x0, x1, y0, y1, extremos) : caja(x1 - x0, y1 - y0, espesor, color, (x0 + x1) / 2, y0, -espesor / 2))
  }
  let xActual = -largo / 2
  for (const h of huecos) {
    const xa = h.x - h.ancho / 2
    tramo(xActual, xa, 0, alto)
    tramo(h.x - h.ancho / 2, h.x + h.ancho / 2, 0, h.y0)
    tramo(h.x - h.ancho / 2, h.x + h.ancho / 2, h.y1, alto)
    const pieza = h.tipo === 'porton' ? porton(h.ancho, h.y1 - h.y0) : h.clase === 'puerta' ? puerta(h.ancho, h.y1 - h.y0) : ventana(h.ancho, h.y1 - h.y0)
    pieza.position.set(h.x, h.y0, 0)
    g.add(pieza)
    if (h.contraventanas) {
      const cv = contraventanas(h.ancho, h.y1 - h.y0)
      cv.position.set(h.x, h.y0, 0)
      g.add(cv)
    }
    xActual = h.x + h.ancho / 2
  }
  tramo(xActual, largo / 2, 0, alto)

  g.userData.avisos = avisos
  g.userData.huecos = huecos
  return g
}
