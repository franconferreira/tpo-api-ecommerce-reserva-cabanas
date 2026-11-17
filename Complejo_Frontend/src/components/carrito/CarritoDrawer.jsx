import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import CarritoItem from './CarritoItem'
import CarritoHeader from './CarritoHeader'
import CarritoFooter from './CarritoFooter'
import textos from '../../i18n/textos'
import { cerrarCarrito, eliminarDelCarrito } from '../../Redux/carritoSlice'
import { fundirYNavegar } from '../../utils/fundido'
import './CarritoDrawer.css'

function CarritoDrawer({ idioma }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const { data: carritoData, abierto, errorEliminar } = useSelector((state) => state.carrito)
  const t = textos[idioma].carrito

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
    // desde el recorrido 3D se pasa al checkout con un fundido (el panel se cierra recién al cambiar de pantalla)
    if (pathname === '/mapa-3d') {
      fundirYNavegar(navigate, '/checkout', () => dispatch(cerrarCarrito()))
      return
    }
    dispatch(cerrarCarrito())
    navigate('/checkout')
  }

  return (
    // siempre montado: al abrir y cerrar el panel se desliza desde la derecha (ver CarritoDrawer.css)
    <div className={`carrito-backdrop ${abierto ? 'abierto' : ''}`} aria-hidden={!abierto}>
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
