import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import CheckoutItem from './CheckoutItem'
import CheckoutTotales from './CheckoutTotales'
import MediosDePago from './MediosDePago'
import textos from '../../i18n/textos'
import { apiFetch } from '../../utils/api'
import { CARRITO_VACIO } from '../../utils/constantes'
import './CheckoutResumen.css'

function CheckoutResumen({ idioma, carritoData, setCarritoData, onCuentaDesactivada }) {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [medioPago, setMedioPago] = useState('tarjeta')
  const [datosPago, setDatosPago] = useState({
    numeroTarjeta: '',
    nombreTitular: '',
    vencimiento: '',
    cvv: '',
    cuotas: '1',
    billeteraTipo: 'mp',
    cuentaVinculada: true,
    comprobante: '',
    aceptaRecepcion: false
  })

  const t = textos[idioma].checkout
  const items = carritoData && carritoData.items ? carritoData.items : []
  const totalSinDescuento = carritoData && carritoData.totalSinDescuento ? carritoData.totalSinDescuento : 0
  const descuentoPack = carritoData && carritoData.descuentoPackPorcentaje ? carritoData.descuentoPackPorcentaje : 0
  const total = carritoData && carritoData.total ? carritoData.total : 0

  const actualizarDato = (campo, valor) => {
    setDatosPago((prev) => ({ ...prev, [campo]: valor }))
    if (error) {
      setError('')
    }
  }

  const handleConfirmarCheckout = () => {
    if (items.length === 0) {
      setError(t.errorVacio)
      return
    }

    // Validación simulada interactiva de medios de pago
    if (medioPago === 'tarjeta') {
      const digitosLimpios = (datosPago.numeroTarjeta || '').replace(/\D/g, '')
      if (digitosLimpios.length < 16) {
        setError(t.mediosPago.errorTarjetaNumero)
        return
      }
      if (!datosPago.nombreTitular || !datosPago.nombreTitular.trim()) {
        setError(t.mediosPago.errorTarjetaTitular)
        return
      }
      if (!datosPago.vencimiento || datosPago.vencimiento.trim().length < 5) {
        setError(t.mediosPago.errorTarjetaVencimiento)
        return
      }
      if (!datosPago.cvv || datosPago.cvv.trim().length < 3) {
        setError(t.mediosPago.errorTarjetaCvv)
        return
      }
    } else if (medioPago === 'billetera') {
      if (!datosPago.cuentaVinculada) {
        setError(t.mediosPago.errorBilleteraVincular)
        return
      }
    } else if (medioPago === 'transferencia') {
      if (!datosPago.comprobante || !datosPago.comprobante.trim()) {
        setError(t.mediosPago.errorComprobante)
        return
      }
    } else if (medioPago === 'recepcion') {
      if (!datosPago.aceptaRecepcion) {
        setError(t.mediosPago.errorRecepcionCheck)
        return
      }
    }

    setError('')

    apiFetch('/api/carrito/checkout', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.error === 'CUENTA_DESACTIVADA') {
          onCuentaDesactivada()
          return
        }
        if (data && data.mensaje) {
          setCarritoData(CARRITO_VACIO)
          setError('')
          navigate('/mis-reservas')
        } else {
          console.error('Error en checkout: ', data)
          setCarritoData(CARRITO_VACIO)
          setError(t.errorExpirado)
        }
      })
      .catch((err) => {
        console.error('Error en checkout: ', err)
        setCarritoData(CARRITO_VACIO)
        setError(t.errorExpirado)
      })
  }

  return (
    <>
      {error && <p className="checkout-error">{error}</p>}

      {items.length === 0 ? (
        <div className="checkout-empty">
          <p>{t.vacio}</p>
          <Link to="/catalogo" className="checkout-link-back">
            {t.explorar}
          </Link>
        </div>
      ) : (
        <>
          <div className="checkout-items-list">
            {items.map((item) => (
              <CheckoutItem item={item} key={item.id} />
            ))}
          </div>

          <MediosDePago
            idioma={idioma}
            total={total}
            medioPago={medioPago}
            setMedioPago={(nuevoMedio) => {
              setMedioPago(nuevoMedio)
              setError('')
            }}
            datosPago={datosPago}
            actualizarDato={actualizarDato}
          />

          <CheckoutTotales
            idioma={idioma}
            totalSinDescuento={totalSinDescuento}
            descuentoPack={descuentoPack}
            total={total}
          />

          <div className="checkout-actions">
            <Link to="/catalogo" className="checkout-btn-secondary">
              {t.seguirExplorando}
            </Link>
            <button
              type="button"
              className="checkout-btn-confirm"
              onClick={handleConfirmarCheckout}
            >
              {t.confirmar}
            </button>
          </div>
        </>
      )}
    </>
  )
}

export default CheckoutResumen
