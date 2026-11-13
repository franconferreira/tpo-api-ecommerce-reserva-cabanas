import React from 'react'
import DetalleEspacioModal from '../components/detalle/DetalleEspacioModal'

function DetalleEspacioView({
  idioma,
  espacio,
  isLogged,
  setCarritoData,
  onAbrirCarrito,
  onCuentaDesactivada,
  onClose
}) {
  return (
    <DetalleEspacioModal
      idioma={idioma}
      espacio={espacio}
      onClose={onClose}
      isLogged={isLogged}
      setCarritoData={setCarritoData}
      onAbrirCarrito={onAbrirCarrito}
      onCuentaDesactivada={onCuentaDesactivada}
    />
  )
}

export default DetalleEspacioView
