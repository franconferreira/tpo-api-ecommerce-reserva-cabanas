import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CalendarioDisponibilidad from './CalendarioDisponibilidad'
import textos from '../../i18n/textos'
import { apiFetch } from '../../utils/api'
import {
  diaSiguienteIso,
  sonFechasConsecutivas,
  calcularPrecioSeleccionado
} from '../../utils/fechas'
import './ReservaWidgetForm.css'

function ReservaWidgetForm({
  idioma,
  espacio,
  isLogged,
  setCarritoData,
  onAbrirCarrito,
  onCuentaDesactivada
}) {
  const navigate = useNavigate()
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState([])
  const [error, setError] = useState('')
  const t = textos[idioma].widget
  const tDetalle = textos[idioma].detalle

  const precioMostrado = calcularPrecioSeleccionado(espacio.precioBase, fechasSeleccionadas)
  const sufijoPrecio =
    fechasSeleccionadas.length === 0
      ? textos[idioma].comun.porNocheSufijo
      : t.nochesSeleccionadas(fechasSeleccionadas.length)

  if (espacio.tipo === 'SALON_COMIDA_CASA_PRINCIPAL') {
    return (
      <div className="widget-reserva salon-comunal-box">
        <h3 className="salon-comunal-title">🍽️ {tDetalle.infoSalonTitulo}</h3>
        <p className="salon-comunal-text">
          {tDetalle.infoSalonTexto}
        </p>
        <button
          type="button"
          className="wr-submit-btn"
          onClick={() => navigate('/catalogo')}
        >
          {tDetalle.botonVerHabitaciones || '← Explorar Habitaciones'}
        </button>
      </div>
    )
  }

  const handleClick = () => {
    if (!isLogged) {
      navigate('/login')
      return
    }

    if (fechasSeleccionadas.length === 0) {
      setError(t.errorFechas)
      return
    }

    const fechasOrdenadas = [...fechasSeleccionadas].sort()

    if (!sonFechasConsecutivas(fechasOrdenadas)) {
      setError(t.errorConsecutivas)
      return
    }

    const checkIn = fechasOrdenadas[0]
    const ultimaNoche = fechasOrdenadas[fechasOrdenadas.length - 1]
    const checkOut = diaSiguienteIso(ultimaNoche)

    const datosAEnviar = {
      espacioId: espacio.id,
      checkIn: checkIn,
      checkOut: checkOut
    }

    apiFetch('/api/carrito/items', { method: 'POST', body: datosAEnviar })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.error === 'CUENTA_DESACTIVADA') {
          onCuentaDesactivada()
          return
        }
        if (data && data.id) {
          setCarritoData(data)
          setError('')
          onAbrirCarrito()
        } else {
          console.error('Error al agregar al carrito: ', data)
          setError(t.errorDisponible)
        }
      })
      .catch((err) => {
        console.error('Error al agregar al carrito: ', err)
        setError(t.errorDisponible)
      })
  }

  return (
    <div className="widget-reserva">
      <CalendarioDisponibilidad
        idioma={idioma}
        espacioId={espacio.id}
        fechasSeleccionadas={fechasSeleccionadas}
        setFechasSeleccionadas={setFechasSeleccionadas}
      />

      <div className="wr-header">
        <div className="wr-price-block">
          <span className="wr-price-big">USD ${precioMostrado}</span>
          <span className="wr-price-suffix">{sufijoPrecio}</span>
        </div>
      </div>

      {error && <p className="wr-error">{error}</p>}

      <form onSubmit={(e) => e.preventDefault()}>
        <button type="submit" className="wr-submit-btn" onClick={handleClick}>
          {t.boton}
        </button>
      </form>
    </div>
  )
}

export default ReservaWidgetForm
