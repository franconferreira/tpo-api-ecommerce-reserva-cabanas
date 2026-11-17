// Navegación: flechas, espacio, clic en los botones; T cambia el tema, N muestra las notas y F pone pantalla completa.
const slides = [...document.querySelectorAll('.slide')]
const escenario = document.getElementById('escenario')
const contador = document.getElementById('contador')
const barra = document.querySelector('#barra div')
const notas = document.getElementById('notas')
let actual = 0

// Las cuatro enredaderas y el marco en cada diapositiva
for (const s of slides) {
  s.insertAdjacentHTML('afterbegin', '<div class="marco"></div>' + ['si', 'sd', 'ii', 'id'].map((c) => `<svg class="esquina ${c}" aria-hidden="true"><use href="#enredadera"/></svg>`).join(''))
  const t = s.querySelector('.titulo-sec')
  if (t) t.insertAdjacentHTML('beforeend', '<svg aria-hidden="true"><use href="#divisor"/></svg>')
}

function escalar() {
  const k = Math.min(innerWidth / 1600, innerHeight / 900)
  escenario.style.transform = `translate(-50%, -50%) scale(${k})`
}

function mostrar(n) {
  actual = Math.max(0, Math.min(slides.length - 1, n))
  slides.forEach((s, i) => s.classList.toggle('activa', i === actual))
  contador.textContent = `${actual + 1} / ${slides.length}`
  barra.style.width = `${((actual + 1) / slides.length) * 100}%`
  notas.innerHTML = `<b>Notas</b>${slides[actual].dataset.notas || ''}`
  history.replaceState(null, '', `#${actual + 1}`)
}

function cambiarTema() {
  document.body.classList.toggle('tema-claro')
  document.body.classList.toggle('tema-oscuro')
}

function pantallaCompleta() {
  if (document.fullscreenElement) document.exitFullscreen()
  else document.documentElement.requestFullscreen().catch(() => {})
}

addEventListener('keydown', (e) => {
  if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); mostrar(actual + 1) }
  else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); mostrar(actual - 1) }
  else if (e.key === 'Home') mostrar(0)
  else if (e.key === 'End') mostrar(slides.length - 1)
  else if (e.key === 't' || e.key === 'T') cambiarTema()
  else if (e.key === 'n' || e.key === 'N') notas.classList.toggle('visible')
  else if (e.key === 'f' || e.key === 'F') pantallaCompleta()
})
document.getElementById('b-ant').onclick = () => mostrar(actual - 1)
document.getElementById('b-sig').onclick = () => mostrar(actual + 1)
document.getElementById('b-tema').onclick = cambiarTema
document.getElementById('b-notas').onclick = () => notas.classList.toggle('visible')
document.getElementById('b-pantalla').onclick = pantallaCompleta
addEventListener('resize', escalar)

escalar()
mostrar((parseInt(location.hash.slice(1), 10) || 1) - 1)
