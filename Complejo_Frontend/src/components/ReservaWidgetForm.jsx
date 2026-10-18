import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CampoFormulario from './CampoFormulario'
import ReservaWidgetInfo from './ReservaWidgetInfo'

function ReservaWidgetForm({ espacio, isLogged, setCarritoData, onAbrirCarrito }) {
  const navigate = useNavigate()
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [error, setError] = useState('')
  const URL = 'http://localhost:8080'

  const handleCheckInChange = (e) => setCheckIn(e.target.value)
  const handleCheckOutChange = (e) => setCheckOut(e.target.value)

  const handleClick = () => {
    if (!isLogged) {
      navigate('/login')
      return
    }

    if (checkIn.trim() === '' || checkOut.trim() === '') {
      setError('Debes seleccionar las fechas de Check-in y Check-out')
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
          setError('El espacio no esta disponible en esas fechas o el rango es invalido')
        }
      })
      .catch((err) => {
        console.error('Error al agregar al carrito: ', err)
        setError('El espacio no esta disponible en esas fechas o el rango es invalido')
      })
  }

  return (
    <div className="widget-reserva">
      <div className="wr-header">
        <div className="wr-price-block">
          <span className="wr-price-big">${espacio.precioBase}</span>
          <span className="wr-price-suffix"> / night</span>
        </div>
        <span className="wr-promo-tag">🍂 20% OFF in May, Jun & Aug</span>
      </div>

      {error && <p className="wr-error">{error}</p>}

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="wr-dates-container">
          <CampoFormulario className="wr-date-box" label="CHECK-IN" type="date" name="checkIn"
            value={checkIn} onChange={handleCheckInChange} />
          <CampoFormulario className="wr-date-box" label="CHECK-OUT" type="date" name="checkOut"
            value={checkOut} onChange={handleCheckOutChange} />
        </div>

        <ReservaWidgetInfo />

        <button type="submit" className="wr-submit-btn" onClick={handleClick}>
          Add to Sanctuary Cart ➔
        </button>
      </form>
    </div>
  )
}

export default ReservaWidgetForm
