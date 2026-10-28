import React from 'react'
import textos from '../../i18n/textos'

function CarritoFooter({ idioma, totalSinDescuento, descuentoPack, total, mostrarCheckout, onIrACheckout }) {
  const t = textos[idioma].carrito

  return (
    <div className="carrito-footer">
      <div className="cf-row">
        <span>{t.subtotal}</span>
        <span>USD ${totalSinDescuento}</span>
      </div>
      <div className="cf-row">
        <span>{t.descuento}</span>
        <span className="cf-discount">{descuentoPack}% OFF</span>
      </div>
      <div className="cf-total-row">
        <span>Total</span>
        <span className="cf-total-price">USD ${total}</span>
      </div>

      {mostrarCheckout && (
        <button type="button" className="cf-checkout-btn" onClick={onIrACheckout}>
          {t.irAlCheckout}
        </button>
      )}
    </div>
  )
}

export default CarritoFooter
