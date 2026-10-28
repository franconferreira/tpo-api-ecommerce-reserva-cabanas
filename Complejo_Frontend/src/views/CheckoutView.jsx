import React from 'react'
import CheckoutResumen from '../components/carrito/CheckoutResumen'
import textos from '../i18n/textos'
import './CheckoutView.css'

function CheckoutView({ idioma, carritoData, setCarritoData, onCuentaDesactivada }) {
  const t = textos[idioma].checkout

  return (
    <div className="checkout-wrapper">
      <div className="checkout-box">
        <div className="checkout-header">
          <span className="checkout-overline">{t.overline}</span>
          <h1 className="checkout-title">{t.titulo}</h1>
          <p className="checkout-subtitle">{t.subtitulo}</p>
        </div>

        <CheckoutResumen
          idioma={idioma}
          carritoData={carritoData}
          setCarritoData={setCarritoData}
          onCuentaDesactivada={onCuentaDesactivada}
        />
      </div>
    </div>
  )
}

export default CheckoutView
