import React from 'react'
import './Ornamentos.css'

// Ornamentos Art Nouveau (rinceaux, latigazos, luna y sol tallados).
// Los dibujos están en public/ornamentos.svg (generado por disenos/generador/gen_tpo.py)
// y se reutilizan con <use href="...#id" />. Toman el color del tema con currentColor.
// Reglas del diseño: disenos/REGLAS_DISENO.md
const SPRITE = '/ornamentos.svg'

const IMAGEN_VENTANA =
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=900'

// Luna en el modo oscuro y sol en el claro, siempre en el mismo lugar (el CSS oculta el que no corresponde)
export function IconoTema({ className }) {
  return (
    <svg className={`tallado ${className || ''}`} viewBox="0 0 64 64" aria-hidden="true">
      <use className="solo-oscuro" href={`${SPRITE}#luna-talla`} />
      <use className="solo-claro" href={`${SPRITE}#sol-talla`} />
    </svg>
  )
}

// Rinceau largo (sin patrón repetido) para debajo de la barra y el pie
export function Friso({ className }) {
  return (
    <svg className={`friso ${className || ''}`} viewBox="0 0 1200 34" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <use href={`${SPRITE}#frisoLargo`} />
    </svg>
  )
}

// Separador con la luna o el sol en el centro
export function Divisor({ className }) {
  return (
    <div className={`divisor ${className || ''}`} aria-hidden="true">
      <svg viewBox="0 0 400 40">
        <use href={`${SPRITE}#divisor`} />
      </svg>
      <IconoTema className="divisor-centro" />
    </div>
  )
}

// Pequeña voluta para los costados de los botones principales
export function Voluta({ derecha }) {
  return (
    <svg className={derecha ? 'der' : ''} viewBox="0 0 20 20" aria-hidden="true">
      <use href={`${SPRITE}#voluta`} />
    </svg>
  )
}

// Título de sección enmarcado por dos latigazos (coup de fouet)
export function TituloSeccion({ titulo }) {
  return (
    <div className="titulo-seccion">
      <svg className="ts-latigo" viewBox="0 0 240 50" aria-hidden="true">
        <use href={`${SPRITE}#latigo`} />
      </svg>
      <IconoTema className="ts-icono" />
      <h2>{titulo}</h2>
      <IconoTema className="ts-icono" />
      <svg className="ts-latigo der" viewBox="0 0 240 50" aria-hidden="true">
        <use href={`${SPRITE}#latigo`} />
      </svg>
    </div>
  )
}

// Latigazos grandes y suaves de fondo
export function LatigosFondo() {
  return (
    <svg className="latigos-fondo" aria-hidden="true">
      <use href={`${SPRITE}#latigosFondo`} width="100%" height="100%" />
    </svg>
  )
}

// Plantas que crecen desde las dos esquinas de abajo de un panel rectangular.
// Cada esquina usa una planta distinta (asimetría); el panel tiene que tener position: relative.
export function EsquinasPanel({ variante }) {
  const v = variante || 0
  return (
    <>
      <svg className="esquina-panel izq" viewBox="-40 -230 280 270" aria-hidden="true">
        <use href={`${SPRITE}#p${v % 3}`} />
      </svg>
      <svg className="esquina-panel der" viewBox="-40 -230 280 270" aria-hidden="true">
        <use href={`${SPRITE}#p${(v + 1) % 3}`} />
      </svg>
    </>
  )
}

// Rinceaux entrelazados con el borde de una tarjeta en arco (hay 3 combinaciones distintas)
export function RinceauTarjeta({ variante }) {
  const v = (variante || 0) % 3
  return (
    <svg className="rinceau-tarjeta" viewBox="0 0 307 470" aria-hidden="true">
      <use href={`${SPRITE}#t${v}a`} />
      <g transform="translate(307 0) scale(-1 1)">
        <use href={`${SPRITE}#t${v}b`} />
      </g>
    </svg>
  )
}

// Medallón tallado arriba de cada tarjeta
export function Medallon() {
  return (
    <svg className="medallon tallado" viewBox="0 0 44 44" aria-hidden="true">
      <circle cx="22" cy="22" r="18" className="medallon-fondo" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="22" cy="22" r="14.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <use className="solo-oscuro" href={`${SPRITE}#luna-talla`} x="10" y="10" width="24" height="24" />
      <use className="solo-claro" href={`${SPRITE}#sol-talla`} x="10" y="10" width="24" height="24" />
    </svg>
  )
}

// Ventana principal: arco con marco doble y la foto adentro, con la enredadera que la rodea
export function MarcoVentana() {
  return (
    <div className="marco-ventana">
      <IconoTema className="mv-icono" />
      <svg className="mv-svg" viewBox="0 0 400 540" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <clipPath id="arco-ventana">
            <path d="M26 506 V 210 C 26 99, 105 28, 200 28 C 295 28, 374 99, 374 210 V 506 Z" />
          </clipPath>
        </defs>
        <path className="mv-marco" d="M10 520 V 208 C 10 88, 96 12, 200 12 C 304 12, 390 88, 390 208 V 520 Z" strokeWidth="1.6" />
        <path className="mv-brillo" d="M18 513 V 209 C 18 94, 101 20, 200 20 C 299 20, 382 94, 382 209 V 513 Z" fill="none" strokeWidth="1" />
        <image
          className="mv-foto"
          href={IMAGEN_VENTANA}
          x="26"
          y="28"
          width="348"
          height="478"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#arco-ventana)"
        />
        <path className="mv-borde-foto" d="M26 506 V 210 C 26 99, 105 28, 200 28 C 295 28, 374 99, 374 210 V 506 Z" fill="none" strokeWidth="1.2" />
        <g className="mv-rinceaux">
          <use href={`${SPRITE}#vIzq`} />
          <g transform="translate(400 0) scale(-1 1)">
            <use href={`${SPRITE}#vDer`} />
            <use href={`${SPRITE}#vTope`} />
          </g>
        </g>
      </svg>
    </div>
  )
}

// Botón para cambiar entre modo claro y oscuro: muestra la luna o el sol del tema actual
export function BotonTema({ tema, onToggle, idioma }) {
  const etiqueta = idioma === 'en'
    ? (tema === 'claro' ? 'Switch to dark mode' : 'Switch to light mode')
    : (tema === 'claro' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro')

  return (
    <button type="button" className="boton-cambio-tema" onClick={onToggle} title={etiqueta} aria-label={etiqueta}>
      <IconoTema />
    </button>
  )
}
