import React from 'react'

function CheckoutItem({ item }) {
  return (
    <div className="checkout-item-row">
      <div>
        <strong>{item.espacio ? item.espacio.nombre : 'Space'}</strong>
        <span className="checkout-item-dates">
          📅 Check-in: {item.checkIn} | Check-out: {item.checkOut}
        </span>
      </div>
      <div className="checkout-item-price">USD ${item.subtotal}</div>
    </div>
  )
}

export default CheckoutItem
