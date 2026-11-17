// Dibuja en un canvas una copia de la parte visible de la página (fondo, fotos, ornamentos, textos y botones)
// para usarla como textura del póster del cartel. Se lee la posición real de cada elemento en pantalla.
// Se usa al final de la transición, cuando la página real se desvanece y queda solo el póster.

const ESCALA = 1.5

// Copia de la página que se estaba viendo al tocar "Recorrido virtual" (para mostrarla como póster).
// Es una copia del HTML (sin React): se ve igual porque usa las mismas clases y el mismo CSS.
let captura = null

// Se copia todo lo que se ve (barra, página y pie), porque el mapa ocupa la ventana entera
export function capturarPagina() {
  const app = document.querySelector('.app')
  if (!app || app.querySelector('.mapa3d-pagina')) return
  const copia = document.createElement('div')
  for (const hijo of app.children) copia.appendChild(hijo.cloneNode(true))
  captura = { copia, arriba: -window.scrollY, ruta: window.location.pathname + window.location.search }
}

export function leerCaptura() {
  return captura
}

export function olvidarCaptura() {
  captura = null
} // más resolución que la pantalla, para que el póster se vea nítido de cerca

// Carga una imagen pidiéndola con permiso CORS (si no, el canvas queda "manchado" y no se puede usar como textura)
function cargarImagen(src, cors = true) {
  return new Promise((resolver) => {
    const img = new Image()
    if (cors) img.crossOrigin = 'anonymous'
    img.onload = () => resolver(img)
    img.onerror = () => resolver(null)
    img.src = src
  })
}

// Recorta la foto como object-fit: cover
function dibujarCubriendo(ctx, img, x, y, w, h) {
  const escala = Math.max(w / img.width, h / img.height)
  const sw = w / escala
  const sh = h / escala
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h)
}

// Primer contenedor (desde el elemento hacia arriba) que recorta lo que se le sale: overflow distinto de visible
function recortador(el, raiz) {
  let actual = el
  while (actual && actual !== raiz) {
    const e = getComputedStyle(actual)
    if (e.overflowX !== 'visible' || e.overflowY !== 'visible') return actual
    actual = actual.parentElement
  }
  return null
}

// Contorno del elemento según su border-radius (el arco de la ventana y de los botones)
function contorno(ctx, r, estilo) {
  const radio = (v) => Math.min(parseFloat(v) || 0, r.width / 2, r.height / 2)
  ctx.beginPath()
  ctx.roundRect(r.left, r.top, r.width, r.height, [
    radio(estilo.borderTopLeftRadius), radio(estilo.borderTopRightRadius),
    radio(estilo.borderBottomRightRadius), radio(estilo.borderBottomLeftRadius)
  ])
}

const NS = 'http://www.w3.org/2000/svg'

// Pasa una imagen externa a "data URL" (un SVG dibujado como imagen no carga archivos de afuera)
async function aDataUrl(href) {
  try {
    const blob = await fetch(href, { mode: 'cors' }).then((r) => r.blob())
    return await new Promise((resolver) => {
      const lector = new FileReader()
      lector.onload = () => resolver(lector.result)
      lector.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

// Copia suelta de un <svg> de la página: con los colores ya resueltos (el CSS no viaja con la copia),
// los <use> del sprite reemplazados por su dibujo y las fotos embebidas
async function svgSuelto(svg, sprite) {
  const copia = svg.cloneNode(true)
  const originales = [svg, ...svg.querySelectorAll('*')]
  const copias = [copia, ...copia.querySelectorAll('*')]
  originales.forEach((o, i) => {
    const e = getComputedStyle(o)
    const definicion = o.closest('defs, clipPath, mask, symbol')
    if (e.display === 'none' && !definicion) copias[i].setAttribute('display', 'none')
    copias[i].setAttribute('style', `color:${e.color};fill:${e.fill};stroke:${e.stroke};stroke-width:${e.strokeWidth};opacity:${e.opacity};fill-opacity:${e.fillOpacity};stroke-opacity:${e.strokeOpacity}`)
  })
  for (const use of [...copia.querySelectorAll('use')]) {
    const id = (use.getAttribute('href') || use.getAttribute('xlink:href') || '').split('#')[1]
    const simbolo = id && sprite.getElementById(id)
    if (!simbolo || use.getAttribute('display') === 'none') {
      use.remove()
      continue
    }
    const grupo = document.createElementNS(NS, 'g')
    if (use.getAttribute('transform')) grupo.setAttribute('transform', use.getAttribute('transform'))
    const interno = document.createElementNS(NS, 'svg')
    for (const atr of ['x', 'y', 'width', 'height']) interno.setAttribute(atr, use.getAttribute(atr) || (atr === 'width' || atr === 'height' ? '100%' : '0'))
    for (const atr of ['viewBox', 'preserveAspectRatio']) if (simbolo.getAttribute(atr)) interno.setAttribute(atr, simbolo.getAttribute(atr))
    interno.setAttribute('style', use.getAttribute('style'))
    interno.innerHTML = simbolo.innerHTML
    grupo.appendChild(interno)
    use.replaceWith(grupo)
  }
  for (const imagen of [...copia.querySelectorAll('image')]) {
    const datos = await aDataUrl(imagen.getAttribute('href'))
    if (datos) imagen.setAttribute('href', datos)
    else imagen.remove()
  }
  const r = svg.getBoundingClientRect()
  copia.setAttribute('xmlns', NS)
  copia.setAttribute('width', r.width)
  copia.setAttribute('height', r.height)
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copia)], { type: 'image/svg+xml' }))
  const img = await cargarImagen(url, false)
  URL.revokeObjectURL(url)
  return img
}

// Escribe el texto de un nodo respetando los renglones que ocupa en la página
function dibujarTexto(ctx, nodo, colorDegrade) {
  const el = nodo.parentElement
  const estilo = getComputedStyle(el)
  if (estilo.visibility === 'hidden' || estilo.display === 'none' || estilo.opacity === '0') return
  let texto = nodo.textContent.replace(/\s+/g, ' ').trim()
  if (!texto) return
  if (estilo.textTransform === 'uppercase') texto = texto.toUpperCase()
  const rango = document.createRange()
  rango.selectNodeContents(nodo)
  // solo los renglones que se ven (los textos cortados a tantas líneas tienen más renglones ocultos)
  const marco = recortador(el, null)
  const limite = marco ? marco.getBoundingClientRect() : null
  const renglones = [...rango.getClientRects()].filter((r) => r.width > 0 && (!limite || (r.top >= limite.top - 1 && r.bottom <= limite.bottom + 1)))
  if (!renglones.length) return
  ctx.font = `${estilo.fontStyle} ${estilo.fontWeight} ${estilo.fontSize} ${estilo.fontFamily}`
  // los títulos con degradé recortado al texto tienen color transparente: se usa el color del degradé
  ctx.fillStyle = estilo.color === 'rgba(0, 0, 0, 0)' ? colorDegrade : estilo.color
  ctx.letterSpacing = estilo.letterSpacing === 'normal' ? '0px' : estilo.letterSpacing
  ctx.textBaseline = 'middle'
  // reparte las palabras en los renglones según el ancho de cada uno
  const palabras = texto.split(' ')
  let i = 0
  for (const r of renglones) {
    let linea = ''
    while (i < palabras.length) {
      const prueba = linea ? `${linea} ${palabras[i]}` : palabras[i]
      if (linea && ctx.measureText(prueba).width > r.width + 2) break
      linea = prueba
      i++
    }
    ctx.fillText(linea, r.left, r.top + r.height / 2)
  }
}

export async function dibujarPoster(raiz) {
  const caja = raiz.getBoundingClientRect()
  const lienzo = document.createElement('canvas')
  lienzo.width = Math.round(caja.width * ESCALA)
  lienzo.height = Math.round(caja.height * ESCALA)
  const ctx = lienzo.getContext('2d')
  ctx.scale(ESCALA, ESCALA)
  ctx.translate(-caja.left, -caja.top)
  const visible = (r) => r.width > 0 && r.bottom > caja.top && r.top < caja.bottom && r.right > caja.left && r.left < caja.right

  // Fondo: los colores del tema (degradé vertical como el de la página)
  const vars = getComputedStyle(raiz)
  const degrade = ctx.createLinearGradient(0, caja.top, 0, caja.bottom)
  degrade.addColorStop(0, vars.getPropertyValue('--fondo').trim())
  degrade.addColorStop(1, vars.getPropertyValue('--superficie-2').trim())
  ctx.fillStyle = degrade
  ctx.fillRect(caja.left, caja.top, caja.width, caja.height)

  // Cajas de los componentes (tarjetas, paneles, etiquetas): su fondo y su borde
  const conColor = (c) => c && c !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(c)
  for (const el of raiz.querySelectorAll('*')) {
    if (el.closest('svg') || el.tagName === 'IMG') continue
    const r = el.getBoundingClientRect()
    if (!visible(r)) continue
    const e = getComputedStyle(el)
    if (e.visibility === 'hidden' || e.opacity === '0') continue
    const fondo = conColor(e.backgroundColor)
    const grosor = parseFloat(e.borderTopWidth) || 0
    const borde = grosor > 0 && e.borderTopStyle !== 'none' && conColor(e.borderTopColor)
    if (!fondo && !borde) continue
    ctx.save()
    ctx.globalAlpha = parseFloat(e.opacity) || 1
    contorno(ctx, r, e)
    if (fondo) {
      ctx.fillStyle = e.backgroundColor
      ctx.fill()
    }
    if (borde) {
      ctx.lineWidth = grosor
      ctx.strokeStyle = e.borderTopColor
      ctx.stroke()
    }
    ctx.restore()
  }

  // Fotos (recortadas con el arco de su marco)
  for (const img of raiz.querySelectorAll('img')) {
    const r = img.getBoundingClientRect()
    if (!visible(r)) continue
    const copia = await cargarImagen(img.currentSrc || img.src)
    if (!copia) continue
    ctx.save()
    // la foto se recorta con la forma de la tarjeta que la contiene (arco) y con la suya propia
    const marco = recortador(img.parentElement, raiz)
    if (marco) {
      contorno(ctx, marco.getBoundingClientRect(), getComputedStyle(marco))
      ctx.clip()
    }
    contorno(ctx, r, getComputedStyle(img))
    ctx.clip()
    dibujarCubriendo(ctx, copia, r.left, r.top, r.width, r.height)
    ctx.restore()
  }

  // Botones con fondo propio
  for (const b of raiz.querySelectorAll('.boton-tema')) {
    const r = b.getBoundingClientRect()
    if (!visible(r)) continue
    const estilo = getComputedStyle(b)
    contorno(ctx, r, estilo)
    ctx.fillStyle = vars.getPropertyValue('--fondo-fuerte').trim()
    ctx.fill()
  }

  // Ornamentos del sprite
  const textoSprite = await fetch('/ornamentos.svg').then((res) => res.text()).catch(() => '')
  const sprite = new DOMParser().parseFromString(textoSprite, 'image/svg+xml')
  for (const svg of raiz.querySelectorAll('svg')) {
    const r = svg.getBoundingClientRect()
    if (!visible(r) || svg.parentElement.closest('svg')) continue
    const img = await svgSuelto(svg, sprite)
    if (img) ctx.drawImage(img, r.left, r.top, r.width, r.height)
  }

  // Textos
  const recorrido = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT)
  while (recorrido.nextNode()) {
    const nodo = recorrido.currentNode
    if (nodo.parentElement.closest('svg')) continue
    dibujarTexto(ctx, nodo, vars.getPropertyValue('--h1b').trim())
  }
  return lienzo
}
