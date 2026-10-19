import React from 'react'

function CarritoFooter({ idioma, totalSinDescuento, descuentoPack, total, mostrarCheckout, onIrACheckout }) {
  const es = idioma === 'es'

  return (
    <div className="carrito-footer">
      <div className="cf-row">
        <span>
          {es
            ? 'Subtotal (incl. 20% temp. baja si aplica)'
            : 'Subtotal (incl. seasonal 20% if applicable)'}
        </span>
        <span>${totalSinDescuento}</span>
      </div>
      <div className="cf-row">
        <span>
          {es ? 'Descuento Pack Multi-Espacio (2+ espacios)' : 'Multi-Space Pack Discount (2+ spaces)'}
        </span>
        <span className="cf-discount">{descuentoPack}% OFF</span>
      </div>
      <div className="cf-total-row">
        <span>Total</span>
        <span className="cf-total-price">${total}</span>
      </div>

      {mostrarCheckout && (
        <button type="button" className="cf-checkout-btn" onClick={onIrACheckout}>
          {es ? 'Continuar al Checkout ➔' : 'Proceed to Checkout ➔'}
        </button>
      )}
    </div>
  )
}

export default CarritoFooter
