// Cambio de pantalla con fundido: una capa con el fondo del sitio aparece de a poco, se cambia de ruta
// por debajo y la capa se va. Se usa al cambiar de pantalla desde la barra y al salir del recorrido virtual.
export function fundirYNavegar(navigate, ruta, antes, duracion = 420) {
  const app = document.querySelector('.app')
  const capa = document.createElement('div')
  capa.className = 'fundido-pagina'
  // el fondo del modo oscuro está en la capa ::before de la app
  if (app) capa.style.background = getComputedStyle(app, app.classList.contains('tema-oscuro') ? '::before' : null).background
  capa.style.transitionDuration = `${duracion}ms`
  document.body.appendChild(capa)
  requestAnimationFrame(() => requestAnimationFrame(() => capa.classList.add('visible')))
  setTimeout(() => {
    if (antes) antes()
    navigate(ruta)
    window.scrollTo(0, 0)
    setTimeout(() => {
      capa.classList.remove('visible')
      setTimeout(() => capa.remove(), duracion + 50)
    }, 80)
  }, duracion)
}

// Cambio de pantalla con fundido cruzado: se toma una copia de lo que se ve, se cambia de ruta enseguida (la
// pantalla nueva ya queda debajo) y la copia se desvanece encima. Así una pantalla se va mientras aparece la otra,
// sin un fondo vacío en el medio. (Desde el recorrido virtual no se puede copiar el dibujo 3D: ahí se usa el otro.)
export function cruzarYNavegar(navigate, ruta, duracion = 450) {
  const app = document.querySelector('.app')
  if (!app) {
    navigate(ruta)
    return
  }
  const capa = document.createElement('div')
  capa.className = 'fundido-cruzado'
  capa.style.background = getComputedStyle(app, app.classList.contains('tema-oscuro') ? '::before' : null).background
  capa.style.transitionDuration = `${duracion}ms`
  const contenido = document.createElement('div')
  contenido.style.marginTop = `${-window.scrollY}px`
  for (const hijo of app.children) contenido.appendChild(hijo.cloneNode(true))
  capa.appendChild(contenido)
  app.appendChild(capa)
  navigate(ruta)
  window.scrollTo(0, 0)
  requestAnimationFrame(() => requestAnimationFrame(() => capa.classList.add('saliendo')))
  setTimeout(() => capa.remove(), duracion + 60)
}
