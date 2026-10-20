import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CampoFormulario from '../ui/CampoFormulario'
import ReservaWidgetInfo from './ReservaWidgetInfo'
import textos from '../../i18n/textos'
import { apiFetch } from '../../utils/api'
import { hoyIso } from '../../utils/fechas'
import './ReservaWidgetForm.css'

function ReservaWidgetForm({ idioma, espacio, isLogged, setCarritoData, onAbrirCarrito }) {
  const navigate = useNavigate()
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [error, setError] = useState('')
  const t = textos[idioma].widget
  const hoy = hoyIso()

  const handleCheckInChange = (e) => setCheckIn(e.target.value)
  const handleCheckOutChange = (e) => setCheckOut(e.target.value)

  const handleClick = () => {
    if (!isLogged) {
      navigate('/login')
      return
    }

    if (checkIn.trim() === '' || checkOut.trim() === '') {
      setError(t.errorFechas)
      return
    }

    if (checkIn < hoy) {
      setError(t.errorPasado)
      return
    }

    if (checkOut <= checkIn) {
      setError(t.errorOrden)
      return
    }

    const datosAEnviar = {
      espacioId: espacio.id,
      checkIn: checkIn,
      checkOut: checkOut
    }

    apiFetch('/api/carrito/items', { method: 'POST', body: datosAEnviar })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.items) {
          setCarritoData(data)
          setError('')
          onAbrirCarrito()
          navigate('/catalogo')
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
      <div className="wr-header">
        <div className="wr-price-block">
          <span className="wr-price-big">${espacio.precioBase}</span>
          <span className="wr-price-suffix">{textos[idioma].comun.porNocheSufijo}</span>
        </div>
        <span className="wr-promo-tag">{t.promo}</span>
      </div>

      {error && <p className="wr-error">{error}</p>}

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="wr-dates-container">
          <CampoFormulario
            className="wr-date-box"
            label="CHECK-IN"
            type="date"
            name="checkIn"
            min={hoy}
            value={checkIn}
            onChange={handleCheckInChange}
          />
          <CampoFormulario
            className="wr-date-box"
            label="CHECK-OUT"
            type="date"
            name="checkOut"
            min={checkIn !== '' ? checkIn : hoy}
            value={checkOut}
            onChange={handleCheckOutChange}
          />
        </div>

        <ReservaWidgetInfo idioma={idioma} />

        <button type="submit" className="wr-submit-btn" onClick={handleClick}>
          {t.boton}
        </button>
      </form>
    </div>
  )
}

export default ReservaWidgetForm
