import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CarritoItem from './CarritoItem'
import CarritoHeader from './CarritoHeader'
import CarritoFooter from './CarritoFooter'
import textos from '../../i18n/textos'
import { apiFetch } from '../../utils/api'
import './CarritoDrawer.css'

function CarritoDrawer({ idioma, carritoData, setCarritoData, isOpen, onClose }) {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const t = textos[idioma].carrito

  if (!isOpen) {
    return null
  }

  const items = carritoData && carritoData.items ? carritoData.items : []
  const totalSinDescuento = carritoData && carritoData.totalSinDescuento ? carritoData.totalSinDescuento : 0
  const descuentoPack = carritoData && carritoData.descuentoPackPorcentaje ? carritoData.descuentoPackPorcentaje : 0
  const total = carritoData && carritoData.total ? carritoData.total : 0

  const handleEliminar = (itemId, indice) => {
    apiFetch(`/api/carrito/items/${itemId}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then((data) => {
        // El backend devuelve el carrito actualizado; si no llega, la eliminación falló
        if (data && data.items) {
          const nuevosItems = [...items]
          nuevosItems.splice(indice, 1)
          setCarritoData({
            ...data,
            items: nuevosItems
          })
          setError('')
        } else {
          console.error('Error al eliminar item del carrito: ', data)
          setError(t.errorEliminar)
        }
      })
      .catch((err) => {
        console.error('Error al eliminar item del carrito: ', err)
        setError(t.errorEliminar)
      })
  }

  const handleIrACheckout = () => {
    onClose()
    navigate('/checkout')
  }

  return (
    <div className="carrito-backdrop">
      <div className="carrito-panel">
        <CarritoHeader idioma={idioma} cantidad={items.length} onClose={onClose} />

        <div className="carrito-body">
          {error && <p className="carrito-error">{error}</p>}

          {items.length === 0 ? (
            <div className="carrito-empty">
              <p>{t.vacio}</p>
              <span>{t.vacioTexto}</span>
            </div>
          ) : (
            items.map((item, index) => (
              <CarritoItem
                idioma={idioma}
                item={item}
                index={index}
                onEliminar={handleEliminar}
                key={item.id}
              />
            ))
          )}
        </div>

        <CarritoFooter
          idioma={idioma}
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
