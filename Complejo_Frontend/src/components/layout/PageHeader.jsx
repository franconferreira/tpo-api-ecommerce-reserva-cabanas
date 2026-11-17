import React from 'react'
import { Divisor } from '../ornamentos/Ornamentos'
import './PageHeader.css'

// Encabezado común de las pantallas internas: línea superior opcional, título, subtítulo
// y, a la derecha, lo que se le pase como children (un botón, un contador, etc.)
function PageHeader({ overline, titulo, subtitulo, children }) {
  return (
    <div className="page-header">
      <div>
        {overline && <span className="page-overline">{overline}</span>}
        <h1 className="page-title">{titulo}</h1>
        <Divisor className="page-divisor" />
        <p className="page-subtitle">{subtitulo}</p>
      </div>
      {children}
    </div>
  )
}

export default PageHeader
