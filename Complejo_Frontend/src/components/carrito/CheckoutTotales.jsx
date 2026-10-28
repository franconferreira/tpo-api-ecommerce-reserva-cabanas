import React from 'react'
import textos from '../../i18n/textos'

function CheckoutTotales({ idioma, totalSinDescuento, descuentoPack, total }) {
  const t = textos[idioma].checkout

  return (
    <div className="checkout-totals-box">
      <div className="ct-row">
        <span>{t.subtotal}</span>
        <span>USD ${totalSinDescuento}</span>
      </div>
      <div className="ct-row">
        <span>{t.descuento}</span>
        <span className="ct-discount">{descuentoPack}% OFF</span>
      </div>
      <div className="ct-total-row">
        <strong>{t.totalFinal}</strong>
        <strong className="ct-final-amount">USD ${total}</strong>
      </div>
    </div>
  )
}

export default CheckoutTotales
