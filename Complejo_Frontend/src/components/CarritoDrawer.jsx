import React from 'react'
import { useNavigate } from 'react-router-dom'
import CarritoItem from './CarritoItem'
import CarritoHeader from './CarritoHeader'
import CarritoFooter from './CarritoFooter'
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
        <CarritoHeader cantidad={items.length} onClose={onClose} />

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

        <CarritoFooter
          totalSinDescuento={totalSinDescuento}
          descuentoPack={descuentoPack}
          total={total}
          mostrarCheckout={items.length > 0}
          onIrACheckout={handleIrACheckout}
        />
      </div>
    </div>
  )
}

export default CarritoDrawer
