import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchEspacios } from '../Redux/espaciosSlice'
import { abrirCarrito, setAbrirAlAgregar } from '../Redux/carritoSlice'
import { iniciarMapa } from '../mapa3d/motorMapa'
import { dibujarPoster, leerCaptura, olvidarCaptura } from '../mapa3d/posterPagina'
import CatalogoView from './CatalogoView'
import { BotonTema } from '../components/ornamentos/Ornamentos'
import { CONSTRUCCIONES, LLEGADA, SENDEROS, aTerreno } from '../mapa3d/plano'
import { fundirYNavegar } from '../utils/fundido'
import textos from '../i18n/textos'
import './Mapa3DView.css'

// Palabra del nombre que identifica a cada cabaña del mapa (variante del modelo) entre los espacios del back
const CLAVE_CABANA = { cedro: 'Cedro', pinos: 'Pinos', roble: 'Roble', arroyo: 'Ciprés' } // la variante "arroyo" del modelo es la Cabaña del Ciprés
const TIPOS_CASA = ['HABITACION_CASA_PRINCIPAL', 'SALON_COMIDA_CASA_PRINCIPAL']

// Lugares donde se puede aparecer desde la vista aérea: frente al galpón, frente a la casa y en el cruce de las cabañas
const porId = Object.fromEntries(CONSTRUCCIONES.map((c) => [c.id, c]))
const cruceCabanas = SENDEROS[0].puntos[SENDEROS[0].puntos.length - 1]
const DESTINOS = [
  { clave: 'irGalpon', punto: aTerreno(porId.galpon, 0, LLEGADA.galpon + 3), mira: [porId.galpon.x, porId.galpon.z] },
  { clave: 'irCasa', punto: aTerreno(porId.casa, 0, LLEGADA.casa + 2), mira: [porId.casa.x, porId.casa.z] },
  { clave: 'irCabanas', punto: cruceCabanas, mira: [porId.pinos.x, porId.pinos.z] }
]

// Recorrido virtual en primera persona. El mapa sigue el tema del sitio (oscuro = noche).
// Clic en una cabaña o en el galpón abre su detalle; en la casa principal, la lista de sus espacios.
//
// Transición de entrada: mientras se arma el mapa se sigue viendo la página que se estaba mirando (una copia
// tomada al tocar "Recorrido virtual"; si se entra directo por la dirección, la página principal).
// Después la cámara arranca pegada al póster del cartel de la entrada y retrocede; la página se achica
// acompañando al póster y se desvanece: la página "era" el póster.
//
// Controles: el mapa ocupa toda la ventana y se mira moviendo el mouse (con el primer clic el navegador lo toma,
// así no se escapa de la ventana). Escape abre y cierra un menú con las opciones del sitio (la barra y el pie no se
// muestran acá). Al inspeccionar un lugar se libera el mouse y al cerrar se vuelve directo al recorrido.
// F pasa a una vista aérea con botones para aparecer frente al galpón, la casa o las cabañas, y M silencia el sonido.
// El póster del cartel de la entrada (clic o E) lleva de vuelta a la página que muestra.
function Mapa3DView({ idioma, setIdioma, tema, onToggleTema, onLogout, onAbrirDetalle, detalleAbierto }) {
  const t = textos[idioma].mapa
  const tNav = textos[idioma].nav
  const navigate = useNavigate()
  const isLogged = useSelector((state) => state.auth.isLogged)
  const [menu, setMenu] = useState(false) // menú de Escape
  const [aerea, setAerea] = useState(false) // vista aérea (tecla F)
  const [silencio, setSilencio] = useState(false) // sonido apagado (tecla M)
  const [aereaLista, setAereaLista] = useState(false) // la cámara ya llegó arriba: se muestran los botones
  const [, setTamano] = useState(0) // para reubicar los botones si cambia el tamaño de la ventana
  // el mapa soltó el mouse a propósito (inspección o vista aérea): en ese caso no se abre el menú
  const liberandoRef = useRef(false)
  // la lista de la casa se cerró con Escape: no se vuelve a pedir el mouse (ver el efecto de "inspeccionando")
  const cerradaConEscape = useRef(false)
  const menuAbiertoEn = useRef(0)
  const dispatch = useDispatch()
  const espacios = useSelector((state) => state.espacios.items)
  const contenedorRef = useRef(null)
  const motorRef = useRef(null)
  const [cerca, setCerca] = useState(null) // construcción en cuyo frente está la persona
  const [verCasa, setVerCasa] = useState(false)
  const [fase, setFase] = useState('poster') // 'poster' (transición) o 'libre'
  const posterRef = useRef(null)
  // copia de la página que se estaba viendo (si se entró desde el sitio); si no, se muestra la principal
  const [captura] = useState(leerCaptura)
  const temaRef = useRef(tema)
  temaRef.current = tema

  useEffect(() => {
    dispatch(fetchEspacios())
  }, [dispatch])

  // En el recorrido, agregar al carrito no abre el panel: aparece el ícono del carrito con un aviso
  const avisoCarrito = useSelector((state) => state.carrito.avisoMapa)
  const cantidadCarrito = useSelector((state) => state.carrito.data.items.length)
  const carritoAbierto = useSelector((state) => state.carrito.abierto)
  useEffect(() => {
    dispatch(setAbrirAlAgregar(false))
    return () => dispatch(setAbrirAlAgregar(true))
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

  // Inspeccionar: se libera el mouse (sin abrir el menú) y se frena el recorrido
  const inspeccionar = () => {
    liberandoRef.current = true
    if (motorRef.current) motorRef.current.liberar()
  }

  const elegir = (datos) => {
    if (datos.tipo === 'cartel') {
      volverAPagina()
      return
    }
    if (datos.tipo === 'casa') {
      inspeccionar()
      setVerCasa(true)
      return
    }
    const espacio = espacioDe(datos)
    if (espacio) {
      inspeccionar()
      onAbrirDetalle(espacio)
    }
  }

  // Cuando el navegador toma o suelta el mouse (Escape lo suelta): sin inspección abierta, aparece el menú
  const alCambiarBloqueo = (tomado) => {
    if (tomado) {
      liberandoRef.current = false
      setMenu(false)
    } else if (!liberandoRef.current) {
      menuAbiertoEn.current = performance.now()
      setMenu(true)
    }
  }

  const seguirExplorando = () => {
    setMenu(false)
    if (motorRef.current) motorRef.current.bloquear()
  }

  // Vuelta a la página del póster: la cámara se acerca al cartel, la página aparece encima siguiendo al póster
  // y crece hasta ocupar la pantalla; ahí se cambia de ruta (la página real queda en el mismo lugar)
  const volverAPagina = () => {
    liberandoRef.current = true
    setFase('vuelta')
  }
  useEffect(() => {
    if (fase !== 'vuelta' || !motorRef.current) return
    const poster = posterRef.current
    const { width, height } = poster.getBoundingClientRect()
    motorRef.current.empezarVuelta({
      alMover: (r, avance) => {
        poster.style.transform = `translate(${r.x}px, ${r.y}px) scale(${r.ancho / width}, ${r.alto / height})`
        poster.style.opacity = String(Math.min(1, avance / 0.6))
      },
      alTerminar: () => {
        const desplazado = captura ? -captura.arriba : 0
        navigate(captura ? captura.ruta : '/catalogo')
        setTimeout(() => window.scrollTo(0, desplazado), 30)
      }
    })
  }, [fase, captura, navigate])

  const cambiarSonido = () => {
    const valor = !silencio
    setSilencio(valor)
    if (motorRef.current) motorRef.current.setSilencio(valor)
  }

  // Vista aérea: arriba se suelta el mouse; al volver (F o un botón) se toma de nuevo
  const cambiarAerea = (valor) => {
    const motor = motorRef.current
    if (!motor) return
    setAerea(valor)
    setAereaLista(false)
    if (valor) {
      liberandoRef.current = true
      motor.setAerea(true)
    } else {
      motor.setAerea(false)
      motor.bloquear()
    }
  }

  const aparecerEn = (destino) => {
    const motor = motorRef.current
    if (!motor) return
    motor.irA(destino.punto[0], destino.punto[1], destino.mira)
    setAerea(false)
    setAereaLista(false)
    motor.bloquear() // es un clic, así que el navegador deja tomar el mouse
  }

  // El motor guarda la función del primer render; con una ref siempre llama a la versión actual
  const elegirRef = useRef(elegir)
  elegirRef.current = elegir

  // La página de encima lleva el mismo fondo que el sitio (antes de pintarse, para que no se note el cambio)
  useLayoutEffect(() => {
    if (fase === 'libre') return
    if (fase === 'poster') window.scrollTo(0, 0)
    const app = document.querySelector('.app')
    const poster = posterRef.current
    // el fondo del modo oscuro está en la capa ::before de la app
    if (app && poster) poster.style.background = getComputedStyle(app, app.classList.contains('tema-oscuro') ? '::before' : null).background
    if (fase === 'vuelta' && poster) poster.style.opacity = '0' // aparece de a poco mientras la cámara se acerca
    if (captura && poster) {
      // se ubica igual que estaba en pantalla (si la página estaba desplazada, la copia sube lo mismo)
      if (fase === 'poster') captura.copia.style.marginTop = `${captura.arriba - poster.getBoundingClientRect().top}px`
      poster.appendChild(captura.copia)
    }
    olvidarCaptura()
  }, [captura, fase])

  // Se arma una sola vez al entrar y se desarma al salir de la página
  useEffect(() => {
    let motor = null
    let cancelado = false
    // se espera un momento para que primero se pinte la página (armar el mapa congela la pantalla unos segundos)
    const espera = setTimeout(async () => {
      motor = iniciarMapa(contenedorRef.current, {
        alElegir: (datos) => elegirRef.current(datos),
        alAcercarse: setCerca,
        alCambiarBloqueo,
        alVistaAerea: (arriba) => setAereaLista(arriba)
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
        alTerminar: () => {
          // la página queda montada pero invisible y en su tamaño real, para redibujar el póster si cambia el tema
          poster.style.transform = 'none'
          poster.style.opacity = '0'
          setFase('libre')
          motor.bloquear() // si el navegador no lo permite (hace falta un clic reciente), se mira igual y el primer clic lo toma
        }
      })
    }, 120)
    return () => {
      cancelado = true
      clearTimeout(espera)
      if (motor) motor.destruir()
    }
  }, [])

  // Cambio de tema: el cielo pasa al día o a la noche y el póster del cartel se redibuja con los colores nuevos
  const temaAnterior = useRef(tema)
  useEffect(() => {
    if (motorRef.current) motorRef.current.setNoche(tema === 'oscuro')
    if (temaAnterior.current === tema) return
    temaAnterior.current = tema
    if (fase !== 'libre' || !motorRef.current || !posterRef.current) return
    let cancelado = false
    requestAnimationFrame(async () => {
      const lienzo = await dibujarPoster(posterRef.current)
      if (!cancelado && motorRef.current) motorRef.current.setPoster(lienzo, true) // con fundido
    })
    return () => { cancelado = true }
  }, [tema, fase])

  // En pausa (transición, menú, inspección o vista aérea) no se camina ni se mira
  const inspeccionando = detalleAbierto || verCasa || carritoAbierto
  const pausa = fase !== 'libre' || menu || inspeccionando || aerea
  useEffect(() => {
    if (motorRef.current) motorRef.current.setPausa(pausa)
  }, [pausa])

  // Al cerrar el detalle de un lugar se vuelve directo a mirar (el mapa soltó el mouse a propósito, así que el
  // navegador deja volver a tomarlo sin otro clic). Si se cerró con Escape no: el navegador lo soltaría enseguida
  // (Escape es la tecla que suelta el mouse) y se abriría el menú de pausa. En ese caso el próximo clic lo toma.
  const inspeccionAnterior = useRef(false)
  useEffect(() => {
    if (inspeccionAnterior.current && !inspeccionando && !aerea && motorRef.current && !cerradaConEscape.current) motorRef.current.bloquear()
    if (!inspeccionando) cerradaConEscape.current = false
    inspeccionAnterior.current = inspeccionando
  }, [inspeccionando, aerea])

  // Teclas de la vista: Escape abre y cierra el menú (o cierra la lista de la casa principal), C cambia entre modo claro y oscuro, F la vista aérea y M el sonido
  useEffect(() => {
    const alTecla = (e) => {
      if (fase !== 'libre') return
      if (e.code === 'Escape') {
        // se ignoran la tecla sostenida (se repite sola) y un Escape pegado al último cambio del menú
        // (el mismo Escape que soltó el mouse puede llegar justo después de abrirlo)
        if (e.repeat || performance.now() - menuAbiertoEn.current < 250) return
        menuAbiertoEn.current = performance.now()
        // con la lista de la casa principal abierta (y sin un detalle encima), Escape la cierra
        if (verCasa && !detalleAbierto && !carritoAbierto) {
          cerradaConEscape.current = true
          setVerCasa(false)
          return
        }
        if (menu) {
          // no se vuelve a pedir el mouse con este Escape: el navegador lo soltaría en seguida y volvería a abrir el
          // menú. El próximo clic (o tecla) lo toma y ahí se vuelve a girar con el mouse.
          setMenu(false)
        } else if (!document.pointerLockElement && !inspeccionando) {
          setMenu(true)
        }
        return
      }
      if (menu || inspeccionando) return
      if (e.code === 'KeyC') onToggleTema()
      if (e.code === 'KeyF') cambiarAerea(!aerea)
      if (e.code === 'KeyM') cambiarSonido()
    }
    addEventListener('keydown', alTecla)
    return () => removeEventListener('keydown', alTecla)
  })

  // Si se hace clic fuera del navegador (o se cambia de ventana) mientras se recorre, aparece el menú de pausa
  useEffect(() => {
    const alSalir = () => {
      if (pausa) return
      menuAbiertoEn.current = performance.now()
      setMenu(true)
    }
    addEventListener('blur', alSalir)
    return () => removeEventListener('blur', alSalir)
  }, [pausa])

  useEffect(() => {
    const alCambiar = () => setTamano((n) => n + 1)
    addEventListener('resize', alCambiar)
    return () => removeEventListener('resize', alCambiar)
  }, [])

  const cerrarCasa = () => {
    setVerCasa(false)
    seguirExplorando() // el botón es un clic, así que el navegador deja volver a tomar el mouse
  }

  const espacioCerca = cerca ? espacioDe(cerca) : null
  const espaciosCasa = espacios.filter((e) => TIPOS_CASA.includes(e.tipo))

  return (
    <div className={`mapa3d-pagina ${pausa ? '' : 'explorando'}`}>
      <div ref={contenedorRef} className="mapa3d-lienzo" />

      {/* la página del póster: se ve durante las transiciones y después queda invisible (para redibujar el póster) */}
      {(
        <div ref={posterRef} className="mapa3d-poster" aria-hidden="true">
          {!captura && <CatalogoView idioma={idioma} onAbrirDetalle={() => {}} />}
        </div>
      )}

      {fase === 'libre' && (
      <div className="mapa3d-ayuda">
        <span className="mapa3d-titulo">{t.titulo}</span>
        <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> {t.ayudaCaminar}</span>
        <span><kbd>Shift</kbd> {t.ayudaCorrer}</span>
        <span>{t.ayudaMirar}</span>
        <span>{t.ayudaElegir}</span>
        <span><kbd>F</kbd> {t.ayudaAerea}</span>
        <span><kbd>M</kbd> {t.ayudaSonido}</span>
        <span><kbd>C</kbd> {t.ayudaTema}</span>
        <span><kbd>Esc</kbd> {t.ayudaEsc}</span>
      </div>
      )}

      {fase === 'libre' && avisoCarrito && (
        <button type="button" className="mapa3d-carrito" onClick={() => { setMenu(false); dispatch(abrirCarrito()) }} aria-label={tNav.carrito}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 4h2l2.4 10.2a1.5 1.5 0 0 0 1.5 1.1h7.6a1.5 1.5 0 0 0 1.5-1.1L20 8H6.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9.5" cy="19.5" r="1.4" fill="currentColor" />
            <circle cx="16.5" cy="19.5" r="1.4" fill="currentColor" />
          </svg>
          <span className="mapa3d-carrito-punto" />
        </button>
      )}

      {!pausa && <div className="mapa3d-mira" />}

      {aerea && aereaLista && !menu && (
        <>
          <div className="mapa3d-aviso mapa3d-aviso-aerea">{t.aereaAyuda}</div>
          {DESTINOS.map((d) => {
            const p = motorRef.current.proyectar(d.punto[0], 4, d.punto[1])
            return p.visible && (
              <button key={d.clave} type="button" className="mapa3d-destino" style={{ left: p.x, top: p.y }} onClick={() => aparecerEn(d)}>
                {t[d.clave]}
              </button>
            )
          })}
        </>
      )}

      {fase === 'libre' && menu && (
        <div className="mapa3d-menu" role="dialog" aria-label={t.pausa}>
          <h3>{t.pausa}</h3>
          <button type="button" className="mapa3d-boton" onClick={seguirExplorando}>{t.seguir}</button>
          <button type="button" onClick={() => fundirYNavegar(navigate, '/catalogo')}>{tNav.explorar}</button>
          {isLogged ? (
            <>
              <button type="button" onClick={() => fundirYNavegar(navigate, '/mis-reservas')}>{tNav.misReservas}</button>
              <button type="button" onClick={onLogout}>{tNav.cerrarSesion}</button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => fundirYNavegar(navigate, '/login')}>{tNav.iniciarSesion}</button>
              <button type="button" onClick={() => fundirYNavegar(navigate, '/register')}>{tNav.registrarse}</button>
            </>
          )}
          <button type="button" onClick={cambiarSonido}>{silencio ? t.sonidoNo : t.sonidoSi}</button>
          {/* los mismos botones de idioma y de tema que tiene la barra del sitio */}
          <div className="mapa3d-menu-fila">
            {isLogged && (
              // el mismo botón de carrito que tiene la barra del sitio
              <button type="button" className="nav-icon-btn nav-btn-cart" onClick={() => { setMenu(false); dispatch(abrirCarrito()) }} title={tNav.carrito} aria-label={tNav.carrito}>
                <svg className="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
                {cantidadCarrito > 0 && <span className="nav-icon-badge">{cantidadCarrito}</span>}
              </button>
            )}
            <BotonTema tema={tema} onToggle={onToggleTema} idioma={idioma} />
            <button type="button" className="nav-btn-lang" onClick={() => setIdioma(idioma === 'es' ? 'en' : 'es')}>{tNav.idioma}</button>
          </div>
        </div>
      )}

      {cerca && !pausa && (
        <div className="mapa3d-aviso">
          <strong>{cerca.tipo === 'cartel' ? t.volverPagina : espacioCerca ? nombreCorto(espacioCerca.nombre) : cerca.nombre}</strong>
          {espacioCerca && (
            <span>{t.desde} USD ${espacioCerca.precioBase} {t.porNoche}</span>
          )}
          <button type="button" className="mapa3d-boton" onClick={() => elegir(cerca)}>
            <kbd>E</kbd> {cerca.tipo === 'cartel' ? '' : t.verDetalle}
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
          <button type="button" className="mapa3d-boton" onClick={cerrarCasa}>{t.cerrar}</button>
        </div>
      )}
    </div>
  )
}

export default Mapa3DView
