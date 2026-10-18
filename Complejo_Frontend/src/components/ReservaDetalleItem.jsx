import React from 'react'

function ReservaDetalleItem({ detalle }) {
  return (
    <div className="mr-detalle-item">
      <div>
        <strong>🏠 {detalle.nombreEspacio}</strong>
        <span className="mr-detalle-dates">
          📅 {detalle.checkIn} to {detalle.checkOut}
        </span>
      </div>
      <span className="mr-detalle-rate">${detalle.subtotal} / night</span>
    </div>
  )
}

export default ReservaDetalleItem
