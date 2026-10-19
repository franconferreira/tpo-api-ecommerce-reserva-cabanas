import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CampoFormulario from './CampoFormulario'
import ReservaWidgetInfo from './ReservaWidgetInfo'

function ReservaWidgetForm({ idioma, espacio, isLogged, setCarritoData, onAbrirCarrito }) {
  const navigate = useNavigate()
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [error, setError] = useState('')
  const URL = 'http://localhost:8080'
  const es = idioma === 'es'

  const ahora = new Date()
  const anio = ahora.getFullYear()
  const mesNum = ahora.getMonth() + 1
  const diaNum = ahora.getDate()
  const mesStr = mesNum < 10 ? `0${mesNum}` : `${mesNum}`
  const diaStr = diaNum < 10 ? `0${diaNum}` : `${diaNum}`
  const hoy = `${anio}-${mesStr}-${diaStr}`

  const handleCheckInChange = (e) => setCheckIn(e.target.value)
  const handleCheckOutChange = (e) => setCheckOut(e.target.value)

  const handleClick = () => {
    if (!isLogged) {
      navigate('/login')
      return
    }

    if (checkIn.trim() === '' || checkOut.trim() === '') {
      setError(
        es
          ? 'Debes seleccionar las fechas de Check-in y Check-out'
          : 'You must select both Check-in and Check-out dates'
      )
      return
    }

    if (checkIn < hoy) {
      setError(
        es
          ? 'No se pueden reservar fechas anteriores al día de hoy'
          : 'Check-in date cannot be in the past'
      )
      return
    }

    if (checkOut <= checkIn) {
      setError(
        es
          ? 'La fecha de Check-out debe ser posterior a la fecha de Check-in'
          : 'Check-out date must be after Check-in date'
      )
      return
    }

    const token = localStorage.getItem('jwtToken')

    const datosAEnviar = {
      espacioId: espacio.id,
      checkIn: checkIn,
      checkOut: checkOut
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(datosAEnviar)
    }

    fetch(`${URL}/api/carrito/items`, options)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.items) {
          setCarritoData(data)
          setError('')
          onAbrirCarrito()
          navigate('/catalogo')
        } else {
          console.error('Error al agregar al carrito: ', data)
          setError(
            es
              ? 'El espacio no está disponible en esas fechas o el rango es inválido'
              : 'This space is unavailable on the selected dates or the range is invalid'
          )
        }
      })
      .catch((err) => {
        console.error('Error al agregar al carrito: ', err)
        setError(
          es
            ? 'El espacio no está disponible en esas fechas o el rango es inválido'
            : 'This space is unavailable on the selected dates or the range is invalid'
        )
      })
  }

  return (
    <div className="widget-reserva">
      <div className="wr-header">
        <div className="wr-price-block">
          <span className="wr-price-big">${espacio.precioBase}</span>
          <span className="wr-price-suffix">{es ? ' / noche' : ' / night'}</span>
        </div>
        <span className="wr-promo-tag">
          {es ? '🍂 20% OFF en May, Jun y Ago' : '🍂 20% OFF in May, Jun & Aug'}
        </span>
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
          {es ? 'Agregar al Carrito ➔' : 'Add to Sanctuary Cart ➔'}
        </button>
      </form>
    </div>
  )
}

export default ReservaWidgetForm
