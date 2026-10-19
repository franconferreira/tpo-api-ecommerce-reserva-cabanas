import React from 'react'
import CheckoutResumen from '../components/CheckoutResumen'

function CheckoutView({ idioma, carritoData, setCarritoData }) {
  return (
    <>
      <CheckoutResumen
        idioma={idioma}
        carritoData={carritoData}
        setCarritoData={setCarritoData}
      />
    </>
  )
}

export default CheckoutView
