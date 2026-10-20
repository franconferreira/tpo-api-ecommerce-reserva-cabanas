import React from 'react'
import CheckoutResumen from '../components/CheckoutResumen'
import '../components/CheckoutResumen.css'

function CheckoutView({ idioma, carritoData, setCarritoData }) {
  const es = idioma === 'es'

  return (
    <div className="checkout-wrapper">
      <div className="checkout-box">
        <div className="checkout-header">
          <span className="checkout-overline">
            {es ? 'RESUMEN DE RESERVA' : 'RESERVATION SUMMARY'}
          </span>
          <h1 className="checkout-title">
            {es ? 'Confirmar tu Estadía en el Complejo' : 'Confirm Your Sanctuary Stay'}
          </h1>
          <p className="checkout-subtitle">
            {es
              ? 'Revisa los espacios seleccionados y tus descuentos automáticos por temporada o pack antes de confirmar.'
              : 'Review your selected spaces and automatic seasonal or multi-pack discounts before confirming.'}
          </p>
        </div>

        <CheckoutResumen
          idioma={idioma}
          carritoData={carritoData}
          setCarritoData={setCarritoData}
        />
      </div>
    </div>
  )
}

export default CheckoutView
