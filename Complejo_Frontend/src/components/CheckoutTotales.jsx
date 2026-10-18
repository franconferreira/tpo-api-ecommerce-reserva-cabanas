import React from 'react'

function CheckoutTotales({ totalSinDescuento, descuentoPack, total }) {
  return (
    <div className="checkout-totals-box">
      <div className="ct-row">
        <span>Subtotal (includes 20% OFF on May, Jun & Aug nights)</span>
        <span>${totalSinDescuento}</span>
      </div>
      <div className="ct-row">
        <span>Multi-Space Pack Discount (15% OFF on 2+ spaces)</span>
        <span className="ct-discount">{descuentoPack}% OFF</span>
      </div>
      <div className="ct-total-row">
        <strong>Final Total</strong>
        <strong className="ct-final-amount">${total} USD</strong>
      </div>
    </div>
  )
}

export default CheckoutTotales
