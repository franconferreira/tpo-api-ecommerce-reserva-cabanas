import React from 'react'

function AdminReservaDetalleLine({ detalle }) {
  return (
    <div className="td-detalle-line">
      <strong>{detalle.nombreEspacio}</strong>
      <span> ({detalle.checkIn} to {detalle.checkOut})</span>
    </div>
  )
}

export default AdminReservaDetalleLine
