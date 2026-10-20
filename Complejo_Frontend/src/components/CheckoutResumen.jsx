import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import CheckoutItem from './CheckoutItem'
import CheckoutTotales from './CheckoutTotales'

function CheckoutResumen({ idioma, carritoData, setCarritoData }) {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const URL = 'http://localhost:8080'
  const es = idioma === 'es'

  const items = carritoData && carritoData.items ? carritoData.items : []
  const totalSinDescuento = carritoData && carritoData.totalSinDescuento ? carritoData.totalSinDescuento : 0
  const descuentoPack = carritoData && carritoData.descuentoPackPorcentaje ? carritoData.descuentoPackPorcentaje : 0
  const total = carritoData && carritoData.total ? carritoData.total : 0
  const carritoVacio = {
    id: null,
    totalSinDescuento: 0,
    descuentoPackPorcentaje: 0,
    total: 0,
    items: []
  }

  const handleConfirmarCheckout = () => {
    if (items.length === 0) {
      setError(es ? 'Tu carrito está vacío' : 'Your cart is empty')
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
      .then((res) => res.json())
      .then((data) => {
        if (data && data.mensaje) {
          setCarritoData(carritoVacio)
          setError('')
          navigate('/mis-reservas')
        } else {
          console.error('Error en checkout: ', data)
          setCarritoData(carritoVacio)
          setError(
            es
              ? 'Alguno de los espacios ha expirado (10 min) o ya no se encuentra disponible.'
              : 'One of the spaces in your cart has expired (10 min) or is no longer available.'
          )
        }
      })
      .catch((err) => {
        console.error('Error en checkout: ', err)
        setCarritoData(carritoVacio)
        setError(
          es
            ? 'Alguno de los espacios ha expirado (10 min) o ya no se encuentra disponible.'
            : 'One of the spaces in your cart has expired (10 min) or is no longer available.'
        )
      })
  }

  return (
    <>
      {error && <p className="checkout-error">{error}</p>}

      {items.length === 0 ? (
        <div className="checkout-empty">
          <p>{es ? 'No tienes espacios en tu carrito.' : 'You have no spaces in your cart.'}</p>
          <Link to="/catalogo" className="checkout-link-back">
            {es ? '← Explorar Espacios' : '← Explore Spaces'}
          </Link>
        </div>
      ) : (
        <>
          <div className="checkout-items-list">
            {items.map((item) => (
              <CheckoutItem item={item} key={item.id} />
            ))}
          </div>

          <CheckoutTotales
            idioma={idioma}
            totalSinDescuento={totalSinDescuento}
            descuentoPack={descuentoPack}
            total={total}
          />

          <div className="checkout-actions">
            <Link to="/catalogo" className="checkout-btn-secondary">
              {es ? '← Seguir Explorando' : '← Continue Exploring'}
            </Link>
            <button
              type="button"
              className="checkout-btn-confirm"
              onClick={handleConfirmarCheckout}
            >
              {es ? 'Confirmar Reserva ➔' : 'Confirm Reservation ➔'}
            </button>
          </div>
        </>
      )}
    </>
  )
}

export default CheckoutResumen
