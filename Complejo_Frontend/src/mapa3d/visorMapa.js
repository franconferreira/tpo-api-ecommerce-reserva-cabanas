import { iniciarMapa } from './motorMapa'

// Página de prueba del mapa (visor-mapa.html): ?noche=1  ?vista=aerea  ?cam=x,z,giro,inclinacion (grados)
const params = new URLSearchParams(location.search)
const cartelNombre = document.getElementById('nombre')

let camara
if (params.get('cam')) {
  const [x, z, giro = 0, inc = 0] = params.get('cam').split(',').map(Number)
  camara = { x, z, giro: (giro * Math.PI) / 180, inclinacion: (inc * Math.PI) / 180 }
}

const mostrar = (texto) => {
  cartelNombre.textContent = texto
  cartelNombre.style.display = texto ? 'block' : 'none'
}

const motor = iniciarMapa(document.getElementById('mapa'), {
  camara,
  aerea: params.get('vista') === 'aerea',
  alAcercarse: (c) => mostrar(c ? c.nombre : ''),
  alElegir: (c) => mostrar(`Abrir detalle: ${c.nombre}`)
})
motor.setNoche(Boolean(params.get('noche')))
