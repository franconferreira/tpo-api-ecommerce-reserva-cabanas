import React from 'react'

function ReservaDetalleItem({ idioma, detalle }) {
  const es = idioma === 'es'

  return (
    <div className="mr-detalle-item">
      <div>
        <strong>🏠 {detalle.nombreEspacio}</strong>
        <span className="mr-detalle-dates">
          📅 {detalle.checkIn} {es ? 'al' : 'to'} {detalle.checkOut}
        </span>
      </div>
      <span className="mr-detalle-rate">
        ${detalle.subtotal} {es ? '/ noche' : '/ night'}
      </span>
    </div>
  )
}

export default ReservaDetalleItem
