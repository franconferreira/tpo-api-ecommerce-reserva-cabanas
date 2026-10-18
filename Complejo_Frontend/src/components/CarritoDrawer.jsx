import React from 'react'
import { useNavigate } from 'react-router-dom'
import CarritoItem from './CarritoItem'
import './CarritoDrawer.css'

function CarritoDrawer({ carritoData, setCarritoData, isOpen, onClose }) {
  const navigate = useNavigate()
  const URL = 'http://localhost:8080'

  if (!isOpen) {
    return null
  }

  const items = carritoData && carritoData.items ? carritoData.items : []
  const totalSinDescuento = carritoData && carritoData.totalSinDescuento ? carritoData.totalSinDescuento : 0
  const descuentoPack = carritoData && carritoData.descuentoPackPorcentaje ? carritoData.descuentoPackPorcentaje : 0
  const total = carritoData && carritoData.total ? carritoData.total : 0

  const handleEliminar = (itemId, indice) => {
    const token = localStorage.getItem('jwtToken')
    const options = {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    fetch(`${URL}/api/carrito/items/${itemId}`, options)
      .then((res) => res.json())
      .then((data) => {
        const nuevosItems = [...items]
        nuevosItems.splice(indice, 1)
        setCarritoData({
          ...data,
          items: nuevosItems
        })
      })
      .catch((err) => {
        console.error('Error al eliminar item del carrito: ', err)
      })
  }

  const handleIrACheckout = () => {
    onClose()
    navigate('/checkout')
  }

  return (
    <div className="carrito-backdrop">
      <div className="carrito-panel">
        <div className="carrito-header">
          <div className="ch-title-block">
            <span className="ch-icon">🛍️</span>
            <div>
              <h2 className="ch-title">Your Sanctuary Cart</h2>
              <span className="ch-subtitle">{items.length} spaces selected</span>
            </div>
          </div>
          <button type="button" className="ch-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="carrito-body">
          {items.length === 0 ? (
            <div className="carrito-empty">
              <p>Your cart is empty.</p>
              <span>Explore our spaces to reserve your stay.</span>
            </div>
          ) : (
            items.map((item, index) => (
              <CarritoItem
                item={item}
                index={index}
                onEliminar={handleEliminar}
                key={item.id}
              />
            ))
          )}
        </div>

        <div className="carrito-footer">
          <div className="cf-row">
            <span>Subtotal (incl. seasonal 20% if applicable)</span>
            <span>${totalSinDescuento}</span>
          </div>
          <div className="cf-row">
            <span>Multi-Space Pack Discount (2+ spaces)</span>
            <span className="cf-discount">{descuentoPack}% OFF</span>
          </div>
          <div className="cf-total-row">
            <span>Total</span>
            <span className="cf-total-price">${total}</span>
          </div>

          {items.length > 0 && (
            <button type="button" className="cf-checkout-btn" onClick={handleIrACheckout}>
              Proceed to Checkout ➔
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CarritoDrawer
