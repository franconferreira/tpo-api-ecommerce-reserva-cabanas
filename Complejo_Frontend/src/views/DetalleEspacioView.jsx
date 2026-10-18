import React from 'react'
import DetalleEspacio from '../components/DetalleEspacio'

function DetalleEspacioView({ espacio, isLogged, setCarritoData, onAbrirCarrito }) {
  return (
    <>
      <DetalleEspacio
        espacio={espacio}
        isLogged={isLogged}
        setCarritoData={setCarritoData}
        onAbrirCarrito={onAbrirCarrito}
      />
    </>
  )
}

export default DetalleEspacioView
