import React from 'react'
import DetalleEspacio from '../components/DetalleEspacio'

function DetalleEspacioView({ idioma, espacio, isLogged, setCarritoData, onAbrirCarrito }) {
  return (
    <>
      <DetalleEspacio
        idioma={idioma}
        espacio={espacio}
        isLogged={isLogged}
        setCarritoData={setCarritoData}
        onAbrirCarrito={onAbrirCarrito}
      />
    </>
  )
}

export default DetalleEspacioView
