import React from 'react'
import textos from '../../i18n/textos'

function CalendarioDia({ celda, idioma, seleccionado, onSeleccionar }) {
  const t = textos[idioma].calendario

  if (celda.vacio) {
    return <div className="cal-dia cal-dia-vacio"></div>
  }

  let claseEstado = 'dia-disponible'
  let textoTitulo = t.ayudaDisponible

  if (celda.estado === 'pasado') {
    claseEstado = 'dia-pasado'
    textoTitulo = t.ayudaPasado
  } else if (celda.estado === 'ocupado') {
    claseEstado = 'dia-ocupado'
    textoTitulo = t.ayudaOcupado
  }

  const claseSeleccionado = seleccionado ? ' dia-seleccionado' : ''

  const handleClick = () => {
    if (celda.estado === 'disponible') {
      onSeleccionar(celda.fechaIso)
    }
  }

  return (
    <div
      className={`cal-dia ${claseEstado}${claseSeleccionado}`}
      title={`${celda.fechaIso} - ${textoTitulo}`}
      onClick={handleClick}
    >
      <span className="cal-dia-num">{celda.numero}</span>
    </div>
  )
}

export default CalendarioDia
