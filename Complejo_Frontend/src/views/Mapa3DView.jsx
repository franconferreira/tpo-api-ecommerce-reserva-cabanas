import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEspacios } from '../Redux/espaciosSlice'
import { iniciarMapa } from '../mapa3d/motorMapa'
import { dibujarPoster } from '../mapa3d/posterPagina'
import CatalogoView from './CatalogoView'
import textos from '../i18n/textos'
import './Mapa3DView.css'

// Palabra del nombre que identifica a cada cabaña del mapa (variante del modelo) entre los espacios del back
const CLAVE_CABANA = { cedro: 'Cedro', pinos: 'Pinos', roble: 'Roble', arroyo: 'Arroyo' }
const TIPOS_CASA = ['HABITACION_CASA_PRINCIPAL', 'SALON_COMIDA_CASA_PRINCIPAL']

// Recorrido 3D en primera persona. El mapa sigue el tema del sitio (oscuro = noche).
// Clic en una cabaña o en el galpón abre su detalle; en la casa principal, la lista de sus espacios.
//
// Transición de entrada: mientras se arma el mapa se sigue viendo la página principal (encima del lienzo).
// Después la cámara arranca pegada al póster del cartel de la entrada y retrocede; la página se achica
// acompañando al póster y se desvanece: la página "era" el póster.
function Mapa3DView({ idioma, tema, onAbrirDetalle }) {
  const t = textos[idioma].mapa
  const dispatch = useDispatch()
  const espacios = useSelector((state) => state.espacios.items)
  const contenedorRef = useRef(null)
  const motorRef = useRef(null)
  const [cerca, setCerca] = useState(null) // construcción en cuyo frente está la persona
  const [verCasa, setVerCasa] = useState(false)
  const [fase, setFase] = useState('poster') // 'poster' (transición) o 'libre'
  const posterRef = useRef(null)
  const temaRef = useRef(tema)
  temaRef.current = tema

  useEffect(() => {
    dispatch(fetchEspacios())
  }, [dispatch])

  // Nombre en el idioma elegido ("Cabaña del Cedro / Cedar Hollow Cabin")
  const nombreCorto = (nombre) => {
    const partes = nombre.split('/')
    return (idioma === 'en' && partes[1] ? partes[1] : partes[0]).trim()
  }

  // Espacio del back que corresponde a una construcción del mapa
  const espacioDe = (datos) => {
    if (datos.tipo === 'cabana') return espacios.find((e) => e.tipo === 'CABANA' && e.nombre.includes(CLAVE_CABANA[datos.variante]))
    if (datos.tipo === 'galpon') return espacios.find((e) => e.tipo === 'GALPON_FIESTAS')
    return null
  }

  const elegir = (datos) => {
    if (datos.tipo === 'casa') {
      setVerCasa(true)
      return
    }
    const espacio = espacioDe(datos)
    if (espacio) onAbrirDetalle(espacio)
  }

  // El motor guarda la función del primer render; con una ref siempre llama a la versión actual
  const elegirRef = useRef(elegir)
  elegirRef.current = elegir

  // La página de encima lleva el mismo fondo que el sitio (antes de pintarse, para que no se note el cambio)
  useLayoutEffect(() => {
    window.scrollTo(0, 0) // la página de encima arranca arriba, igual que la principal
    const app = document.querySelector('.app')
    if (app && posterRef.current) posterRef.current.style.background = getComputedStyle(app).background
  }, [])

  // Se arma una sola vez al entrar y se desarma al salir de la página
  useEffect(() => {
    let motor = null
    let cancelado = false
    // se espera un momento para que primero se pinte la página (armar el mapa congela la pantalla unos segundos)
    const espera = setTimeout(async () => {
      motor = iniciarMapa(contenedorRef.current, {
        alElegir: (datos) => elegirRef.current(datos),
        alAcercarse: setCerca
      })
      motorRef.current = motor
      motor.setNoche(temaRef.current === 'oscuro')
      const poster = posterRef.current
      motor.setPoster(await dibujarPoster(poster))
      if (cancelado) return
      const { width, height } = poster.getBoundingClientRect()
      motor.empezarTransicion({
        // la página sigue al rectángulo del póster en pantalla y se desvanece en la segunda mitad
        alMover: (r, avance) => {
          poster.style.transform = `translate(${r.x}px, ${r.y}px) scale(${r.ancho / width}, ${r.alto / height})`
          poster.style.opacity = String(Math.max(0, Math.min(1, 1 - (avance - 0.5) / 0.35)))
        },
        alTerminar: () => setFase('libre')
      })
    }, 120)
    return () => {
      cancelado = true
      clearTimeout(espera)
      if (motor) motor.destruir()
    }
  }, [])

  useEffect(() => {
    if (motorRef.current) motorRef.current.setNoche(tema === 'oscuro')
  }, [tema])

  const espacioCerca = cerca ? espacioDe(cerca) : null
  const espaciosCasa = espacios.filter((e) => TIPOS_CASA.includes(e.tipo))

  return (
    <div className="mapa3d-pagina">
      <div ref={contenedorRef} className="mapa3d-lienzo" />

      {fase === 'poster' && (
        <div ref={posterRef} className="mapa3d-poster" aria-hidden="true">
          <CatalogoView idioma={idioma} onAbrirDetalle={() => {}} />
        </div>
      )}

      {fase === 'libre' && (
      <div className="mapa3d-ayuda">
        <span className="mapa3d-titulo">{t.titulo}</span>
        <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> {t.ayudaCaminar}</span>
        <span><kbd>Shift</kbd> {t.ayudaCorrer}</span>
        <span>{t.ayudaMirar}</span>
        <span>{t.ayudaElegir}</span>
      </div>
      )}

      {cerca && !verCasa && fase === 'libre' && (
        <div className="mapa3d-aviso">
          <strong>{espacioCerca ? nombreCorto(espacioCerca.nombre) : cerca.nombre}</strong>
          {espacioCerca && (
            <span>{t.desde} USD ${espacioCerca.precioBase} {t.porNoche}</span>
          )}
          <button type="button" className="mapa3d-boton" onClick={() => elegir(cerca)}>
            <kbd>E</kbd> {t.verDetalle}
          </button>
        </div>
      )}

      {verCasa && (
        <div className="mapa3d-panel">
          <h3>{t.habitaciones}</h3>
          {espaciosCasa.length === 0 && <p>{t.sinDatos}</p>}
          <ul>
            {espaciosCasa.map((e) => (
              <li key={e.id}>
                <button type="button" onClick={() => onAbrirDetalle(e)}>
                  <span>{nombreCorto(e.nombre).replace('Casa Principal - ', '')}</span>
                  {e.precioBase > 0 && <span className="mapa3d-precio">USD ${e.precioBase}</span>}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="mapa3d-boton" onClick={() => setVerCasa(false)}>{t.cerrar}</button>
        </div>
      )}
    </div>
  )
}

export default Mapa3DView
