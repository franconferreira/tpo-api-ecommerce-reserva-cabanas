import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
      .then((res) => {
        if (!res.ok) {
          throw new Error('Fechas no disponibles o invalidas')
        }
        return res.json()
      })
      .then((data) => {
        setCarritoData(data)
        setError('')
        onAbrirCarrito()
        navigate('/catalogo')
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
          <div className="wr-date-box">
            <label>CHECK-IN</label>
            <input
              type="date"
              name="checkIn"
              value={checkIn}
              onChange={handleCheckInChange}
            />
          </div>
          <div className="wr-date-box">
            <label>CHECK-OUT</label>
            <input
              type="date"
              name="checkOut"
              value={checkOut}
              onChange={handleCheckOutChange}
            />
          </div>
        </div>

        <div className="wr-summary">
          <p className="wr-info-note">
            • Low-season nights (May, June, August) receive an automatic <strong>20% discount</strong>.
          </p>
          <p className="wr-info-note">
            • Adding 2 or more spaces to your cart unlocks an automatic <strong>15% Multi-Pack discount</strong>.
          </p>
          <p className="wr-info-note">
            • Spaces added to cart are held for <strong>10 minutes</strong>.
          </p>
        </div>

        <button type="submit" className="wr-submit-btn" onClick={handleClick}>
          Add to Sanctuary Cart ➔
        </button>
      </form>
    </div>
  )
}

export default ReservaWidgetForm
