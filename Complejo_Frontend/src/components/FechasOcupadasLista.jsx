import React from 'react'
import FechaOcupadaItem from './FechaOcupadaItem'

function FechasOcupadasLista({ fechas }) {
  return (
    <div className="di-ocupadas-box">
      <strong>📅 Currently Unavailable Dates:</strong>
      <div className="di-ocupadas-list">
        {fechas.map((fecha, index) => (
          <FechaOcupadaItem fecha={fecha} key={index} />
        ))}
      </div>
    </div>
  )
}

export default FechasOcupadasLista
