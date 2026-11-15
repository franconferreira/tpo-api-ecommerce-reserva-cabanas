// Dibuja en un canvas una copia de la parte visible de la página (fondo, fotos, ornamentos, textos y botones)
// para usarla como textura del póster del cartel. Se lee la posición real de cada elemento en pantalla.
// Se usa al final de la transición, cuando la página real se desvanece y queda solo el póster.

const ESCALA = 1.5 // más resolución que la pantalla, para que el póster se vea nítido de cerca

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
  const renglones = [...rango.getClientRects()].filter((r) => r.width > 0)
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

  // Fotos (recortadas con el arco de su marco)
  for (const img of raiz.querySelectorAll('img')) {
    const r = img.getBoundingClientRect()
    if (!visible(r)) continue
    const copia = await cargarImagen(img.currentSrc || img.src)
    if (!copia) continue
    ctx.save()
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
