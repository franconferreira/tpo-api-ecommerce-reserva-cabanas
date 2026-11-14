import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import CarritoItem from './CarritoItem'
import CarritoHeader from './CarritoHeader'
import CarritoFooter from './CarritoFooter'
import textos from '../../i18n/textos'
import { cerrarCarrito, eliminarDelCarrito } from '../../Redux/carritoSlice'
import './CarritoDrawer.css'

function CarritoDrawer({ idioma }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { data: carritoData, abierto, errorEliminar } = useSelector((state) => state.carrito)
  const t = textos[idioma].carrito

  if (!abierto) {
    return null
  }

  const items = carritoData.items ? carritoData.items : []
  const totalSinDescuento = carritoData.totalSinDescuento ? carritoData.totalSinDescuento : 0
  const descuentoPack = carritoData.descuentoPackPorcentaje ? carritoData.descuentoPackPorcentaje : 0
  const total = carritoData.total ? carritoData.total : 0

  const handleCerrar = () => {
    dispatch(cerrarCarrito())
  }

  const handleEliminar = (itemId) => {
    dispatch(eliminarDelCarrito(itemId))
  }

  const handleIrACheckout = () => {
    dispatch(cerrarCarrito())
    navigate('/checkout')
  }

  return (
    <div className="carrito-backdrop">
      <div className="carrito-panel">
        <CarritoHeader idioma={idioma} cantidad={items.length} onClose={handleCerrar} />

        <div className="carrito-body">
          {errorEliminar && <p className="carrito-error">{t.errorEliminar}</p>}

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
