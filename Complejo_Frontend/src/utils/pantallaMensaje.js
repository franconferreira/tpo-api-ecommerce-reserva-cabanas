// Pantalla de paso con un mensaje ("Bienvenido", "Hasta pronto"): aparece con un fundido sobre lo que se está
// viendo, se hace el cambio de pantalla por debajo (`accion`) y se desvanece mostrando la pantalla nueva.
// Lleva un rinceau arriba y otro abajo, con el mismo dibujo del sprite de ornamentos del sitio.
let enCurso = false

function rinceau(clase) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 400 40')
  svg.setAttribute('class', clase)
  svg.setAttribute('aria-hidden', 'true')
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
  use.setAttribute('href', '/ornamentos.svg#divisor')
  svg.appendChild(use)
  return svg
}

export function mostrarMensaje(texto, accion) {
  if (enCurso) return // si el efecto que la llama se repite durante la transición, no se arma otra
  enCurso = true
  const capa = document.createElement('div')
  capa.className = 'pantalla-mensaje'
  const titulo = document.createElement('h1')
  titulo.textContent = texto
  capa.append(rinceau('pm-rinceau'), titulo, rinceau('pm-rinceau pm-rinceau-abajo'))
  ;(document.querySelector('.app') || document.body).appendChild(capa)
  requestAnimationFrame(() => requestAnimationFrame(() => capa.classList.add('visible')))
  setTimeout(() => {
    accion()
    window.scrollTo(0, 0)
    setTimeout(() => {
      capa.classList.remove('visible')
      setTimeout(() => {
        capa.remove()
        enCurso = false
      }, 650)
    }, 1000)
  }, 550)
}
