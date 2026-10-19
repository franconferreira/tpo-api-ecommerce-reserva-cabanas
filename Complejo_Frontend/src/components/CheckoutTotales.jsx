import React from 'react'

function CheckoutTotales({ idioma, totalSinDescuento, descuentoPack, total }) {
  const es = idioma === 'es'

  return (
    <div className="checkout-totals-box">
      <div className="ct-row">
        <span>
          {es
            ? 'Subtotal (incluye 20% OFF en noches de May, Jun y Ago)'
            : 'Subtotal (includes 20% OFF on May, Jun & Aug nights)'}
        </span>
        <span>${totalSinDescuento}</span>
      </div>
      <div className="ct-row">
        <span>
          {es
            ? 'Descuento Pack Multi-Espacio (15% OFF en 2+ espacios)'
            : 'Multi-Space Pack Discount (15% OFF on 2+ spaces)'}
        </span>
        <span className="ct-discount">{descuentoPack}% OFF</span>
      </div>
      <div className="ct-total-row">
        <strong>{es ? 'Total Final' : 'Final Total'}</strong>
        <strong className="ct-final-amount">${total} USD</strong>
      </div>
    </div>
  )
}

export default CheckoutTotales
