import React from 'react'
import CheckoutResumen from '../components/CheckoutResumen'

function CheckoutView({ carritoData, setCarritoData }) {
  return (
    <>
      <CheckoutResumen
        carritoData={carritoData}
        setCarritoData={setCarritoData}
      />
    </>
  )
}

export default CheckoutView
