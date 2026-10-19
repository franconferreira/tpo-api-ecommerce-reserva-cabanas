import React from 'react'

function AdminReservaDetalleLine({ idioma, detalle }) {
  const es = idioma === 'es'

  return (
    <div className="td-detalle-line">
      <strong>{detalle.nombreEspacio}</strong>
      <span>
        {' '}
        ({detalle.checkIn} {es ? 'al' : 'to'} {detalle.checkOut})
      </span>
    </div>
  )
}

export default AdminReservaDetalleLine
