import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import CheckoutItem from './CheckoutItem'
import './CheckoutResumen.css'

function CheckoutResumen({ carritoData, setCarritoData }) {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const URL = 'http://localhost:8080'

  const items = carritoData && carritoData.items ? carritoData.items : []
  const totalSinDescuento = carritoData && carritoData.totalSinDescuento ? carritoData.totalSinDescuento : 0
  const descuentoPack = carritoData && carritoData.descuentoPackPorcentaje ? carritoData.descuentoPackPorcentaje : 0
  const total = carritoData && carritoData.total ? carritoData.total : 0

  const handleConfirmarCheckout = () => {
    if (items.length === 0) {
      setError('Tu carrito esta vacio')
      return
    }

    const token = localStorage.getItem('jwtToken')
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    fetch(`${URL}/api/carrito/checkout`, options)
      .then((res) => {
        if (!res.ok) {
          throw new Error('No se pudo procesar el checkout')
        }
        setCarritoData({
          id: null,
          totalSinDescuento: 0,
          descuentoPackPorcentaje: 0,
          total: 0,
          items: []
        })
        setError('')
        navigate('/mis-reservas')
      })
      .catch((err) => {
        console.error('Error en checkout: ', err)
        setError('Alguno de los espacios ha expirado (10 min) o ya no se encuentra disponible.')
      })
  }

  return (
    <div className="checkout-wrapper">
      <div className="checkout-box">
        <div className="checkout-header">
          <span className="checkout-overline">RESERVATION SUMMARY</span>
          <h1 className="checkout-title">Confirm Your Sanctuary Stay</h1>
          <p className="checkout-subtitle">
            Review your selected spaces and automatic seasonal or multi-pack discounts before confirming.
          </p>
        </div>

        {error && <p className="checkout-error">{error}</p>}

        {items.length === 0 ? (
          <div className="checkout-empty">
            <p>You have no spaces in your cart.</p>
            <Link to="/catalogo" className="checkout-link-back">
              ← Explore Spaces
            </Link>
          </div>
        ) : (
          <>
            <div className="checkout-items-list">
              {items.map((item) => (
                <CheckoutItem item={item} key={item.id} />
              ))}
            </div>

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

            <div className="checkout-actions">
              <Link to="/catalogo" className="checkout-btn-secondary">
                ← Continue Exploring
              </Link>
              <button
                type="button"
                className="checkout-btn-confirm"
                onClick={handleConfirmarCheckout}
              >
                Confirm Reservation ➔
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CheckoutResumen
