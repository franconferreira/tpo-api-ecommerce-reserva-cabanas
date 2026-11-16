import * as THREE from 'three'

// Cielo del mapa: de día un sol y unas nubes caricaturescas; de noche la luna y estrellas.
// El sol y la luna usan los mismos dibujos que la página (public/ornamentos.svg: sol-talla y luna-talla).
// Todo el cielo acompaña a la cámara, así parece estar infinitamente lejos.

const LEJOS = 330 // distancia del sol, la luna y las estrellas (la cámara ve hasta 400)
// Ciclo del cielo: el sol y la luna recorren el mismo círculo, uno en el lado opuesto al otro. El círculo sale por
// el este, pasa alto hacia el norte y baja por el oeste (inclinado como se ve desde el hemisferio sur).
// La posición se da con un ángulo `fase` que siempre avanza: el sol sale por el este y se pone por el oeste,
// y mientras tanto la luna hace lo mismo del otro lado (como la Tierra girando, nunca para atrás).
//   fase 60°  -> pleno día: el sol al noreste a media altura (arriba a la derecha mirando por el camino a la casa)
//   fase 180° -> el sol se pone por el oeste y la luna sale por el este
//   fase 240° -> noche: la luna en el mismo lugar donde estaba el sol de día
export const FASE_DIA = 60
export const FASE_NOCHE = 240
const INCLINACION = THREE.MathUtils.degToRad(55) // cuánto se inclina el círculo hacia el norte
const suave = (t) => {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}
// dirección (este = +x, norte = -z, arriba = +y) de un punto del círculo
function enCirculo(grados) {
  const a = THREE.MathUtils.degToRad(grados)
  return new THREE.Vector3(Math.cos(a), Math.sin(a) * Math.cos(INCLINACION), -Math.sin(a) * Math.sin(INCLINACION))
}

// Dibuja un símbolo del sprite en un canvas: un fondo pintado (disco o media luna) y encima las líneas del dibujo
async function dibujoDelSprite(sprite, id, colorLinea, pintarFondo) {
  const simbolo = sprite.getElementById(id)
  const lado = 256
  const lienzo = document.createElement('canvas')
  lienzo.width = lado
  lienzo.height = lado
  const ctx = lienzo.getContext('2d')
  ctx.save()
  ctx.scale(lado / 64, lado / 64)
  pintarFondo(ctx)
  ctx.restore()
  if (simbolo) {
    const texto = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${lado}" height="${lado}" style="color:${colorLinea}">${simbolo.innerHTML}</svg>`
    const url = URL.createObjectURL(new Blob([texto], { type: 'image/svg+xml' }))
    const img = await new Promise((resolver) => {
      const i = new Image()
      i.onload = () => resolver(i)
      i.onerror = () => resolver(null)
      i.src = url
    })
    URL.revokeObjectURL(url)
    if (img) ctx.drawImage(img, 0, 0, lado, lado)
  }
  const textura = new THREE.CanvasTexture(lienzo)
  textura.colorSpace = THREE.SRGBColorSpace
  return textura
}

function astro(tamano) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ fog: false, depthWrite: false, transparent: true }))
  s.scale.set(tamano, tamano, 1)
  s.visible = false // aparece cuando termina de dibujarse
  return s
}

// Nube: unas bolas blancas aplastadas, de distintos tamaños
function nube(semilla) {
  const g = new THREE.Group()
  // blancas aunque les dé la sombra abajo (brillo propio), como de dibujo animado
  const mat = new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#c9d5dd', flatShading: true, fog: false, transparent: true })
  const geo = new THREE.IcosahedronGeometry(1, 1)
  const partes = 4 + (semilla % 3)
  for (let i = 0; i < partes; i++) {
    const b = new THREE.Mesh(geo, mat)
    const r = 4 + ((semilla * 7 + i * 13) % 5)
    b.scale.set(r * 1.3, r * 0.75, r)
    b.position.set((i - partes / 2) * 5.5, ((i * 5 + semilla) % 3) * 1.4, ((i * 3) % 2) * 3)
    g.add(b)
  }
  return g
}

export function crearCielo(escena) {
  const cielo = new THREE.Group()
  escena.add(cielo)

  const sol = astro(60)
  const luna = astro(42)
  cielo.add(sol, luna)

  // nubes repartidas alrededor, a distintas alturas; avanzan con el viento y vuelven a entrar por el otro lado
  const nubes = []
  for (let i = 0; i < 6; i++) {
    const n = nube(i + 1)
    const ang = (i / 6) * Math.PI * 2 + 0.4
    n.userData.base = new THREE.Vector3(Math.cos(ang) * 160, 55 + (i % 3) * 10, Math.sin(ang) * 160)
    n.userData.desfase = i * 53
    cielo.add(n)
    nubes.push(n)
  }

  // estrellas: puntos chicos repartidos en la mitad de arriba del cielo
  const puntos = []
  for (let i = 0; i < 500; i++) {
    const ang = Math.random() * Math.PI * 2
    const alt = Math.asin(0.08 + Math.random() * 0.92) // más estrellas cerca del horizonte que arriba de todo
    puntos.push(Math.cos(ang) * Math.cos(alt) * LEJOS, Math.sin(alt) * LEJOS, Math.sin(ang) * Math.cos(alt) * LEJOS)
  }
  const geoEstrellas = new THREE.BufferGeometry()
  geoEstrellas.setAttribute('position', new THREE.Float32BufferAttribute(puntos, 3))
  const estrellas = new THREE.Points(geoEstrellas, new THREE.PointsMaterial({ color: '#ffffff', size: 2, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9 }))
  cielo.add(estrellas)

  // hora: 0 = día, 1 = noche (en el medio, amanecer o atardecer); sale de qué tan alto está el sol
  let hora = 0
  let dirSol = enCirculo(FASE_DIA)
  let dirLuna = enCirculo(FASE_DIA + 180)
  const actualizar = () => {
    sol.position.copy(dirSol).multiplyScalar(LEJOS)
    luna.position.copy(dirLuna).multiplyScalar(LEJOS)
    // abajo del horizonte no se ven (además los tapa el terreno)
    sol.visible = Boolean(sol.material.map) && dirSol.y > -0.12
    luna.visible = Boolean(luna.material.map) && dirLuna.y > -0.12
    estrellas.material.opacity = 0.9 * suave((hora - 0.45) / 0.45)
    estrellas.visible = estrellas.material.opacity > 0.01
    const nubesOpacas = 1 - suave((hora - 0.2) / 0.5)
    for (const n of nubes) {
      n.children[0].material.opacity = nubesOpacas
      n.visible = nubesOpacas > 0.01
    }
  }

  // los dibujos del sol y la luna se arman con el sprite de ornamentos de la página
  fetch('/ornamentos.svg')
    .then((r) => r.text())
    .then(async (texto) => {
      const sprite = new DOMParser().parseFromString(texto, 'image/svg+xml')
      sol.material.map = await dibujoDelSprite(sprite, 'sol-talla', '#c9902f', (ctx) => {
        const brillo = ctx.createRadialGradient(32, 32, 4, 32, 32, 30)
        brillo.addColorStop(0, '#fff6d8')
        brillo.addColorStop(0.45, '#ffe8a8cc')
        brillo.addColorStop(1, '#ffe8a800')
        ctx.fillStyle = brillo
        ctx.fillRect(0, 0, 64, 64)
        ctx.fillStyle = '#ffe28a'
        ctx.beginPath()
        ctx.arc(32, 32, 13, 0, Math.PI * 2)
        ctx.fill()
      })
      luna.material.map = await dibujoDelSprite(sprite, 'luna-talla', '#c3d2ce', (ctx) => {
        ctx.fillStyle = '#e9f0ec'
        ctx.fill(new Path2D('M40 8 A 25 25 0 1 0 57 45 A 19 19 0 1 1 40 8 Z'))
      })
      sol.material.needsUpdate = true
      luna.material.needsUpdate = true
      actualizar()
    })
    .catch(() => {})

  actualizar()

  return {
    // ubica el sol y la luna según la fase (en grados) y devuelve la hora que corresponde
    setFase(grados) {
      dirSol = enCirculo(grados)
      dirLuna = enCirculo(grados + 180)
      hora = Math.max(0, Math.min(1, 0.5 - dirSol.y)) // sol alto = día, en el horizonte = atardecer, abajo = noche
      actualizar()
      return hora
    },
    // de dónde viene la luz: del sol de día y de la luna de noche (si están bajos, sale más inclinada)
    direccionLuz() {
      return (dirSol.y > 0 ? dirSol : dirLuna).clone()
    },
    // sigue a la cámara y corre las nubes con el viento
    mover(t, posicionCamara, viento) {
      cielo.position.copy(posicionCamara) // también en altura: desde la vista aérea el cielo sigue arriba
      for (const n of nubes) {
        const corrida = ((t * 1.5 + n.userData.desfase) % 320) - 160
        n.position.set(n.userData.base.x + viento[0] * corrida, n.userData.base.y, n.userData.base.z + viento[1] * corrida)
      }
    }
  }
}
