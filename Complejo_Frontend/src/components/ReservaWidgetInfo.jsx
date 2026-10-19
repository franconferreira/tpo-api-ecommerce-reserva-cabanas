import React from 'react'

function ReservaWidgetInfo({ idioma }) {
  const es = idioma === 'es'

  return (
    <div className="wr-summary">
      <p className="wr-info-note">
        {es
          ? '• Las noches de temporada baja (Mayo, Junio, Agosto) reciben '
          : '• Low-season nights (May, June, August) receive an automatic '}
        <strong>{es ? '20% de descuento automático' : '20% discount'}</strong>.
      </p>
      <p className="wr-info-note">
        {es
          ? '• Agregar 2 o más espacios al carrito aplica un '
          : '• Adding 2 or more spaces to your cart unlocks an automatic '}
        <strong>{es ? '15% de descuento Pack Multi-Espacio' : '15% Multi-Pack discount'}</strong>.
      </p>
      <p className="wr-info-note">
        {es
          ? '• Los espacios en el carrito se reservan temporalmente por '
          : '• Spaces added to cart are held for '}
        <strong>{es ? '10 minutos' : '10 minutes'}</strong>.
      </p>
    </div>
  )
}

export default ReservaWidgetInfo
