import React from 'react'
import DetalleEspacioModal from '../components/detalle/DetalleEspacioModal'

function DetalleEspacioView({ idioma, espacio, onClose }) {
  return <DetalleEspacioModal idioma={idioma} espacio={espacio} onClose={onClose} />
}

export default DetalleEspacioView
