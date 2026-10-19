import React from 'react'

function CalendarioDia({ celda, idioma }) {
  const es = idioma === 'es'

  if (celda.vacio) {
    return <div className="cal-dia cal-dia-vacio"></div>
  }

  let claseEstado = 'dia-disponible'
  let textoTitulo = es ? 'Disponible' : 'Available'

  if (celda.estado === 'pasado') {
    claseEstado = 'dia-pasado'
    textoTitulo = es ? 'Fecha pasada' : 'Past date'
  } else if (celda.estado === 'ocupado') {
    claseEstado = 'dia-ocupado'
    textoTitulo = es ? 'No disponible / Reservado' : 'Unavailable / Reserved'
  }

  return (
    <div className={`cal-dia ${claseEstado}`} title={`${celda.fechaIso} - ${textoTitulo}`}>
      <span className="cal-dia-num">{celda.numero}</span>
    </div>
  )
}

export default CalendarioDia
