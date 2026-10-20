import React from 'react'
import textos from '../../i18n/textos'

function CalendarioDia({ celda, idioma }) {
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

  return (
    <div className={`cal-dia ${claseEstado}`} title={`${celda.fechaIso} - ${textoTitulo}`}>
      <span className="cal-dia-num">{celda.numero}</span>
    </div>
  )
}

export default CalendarioDia
