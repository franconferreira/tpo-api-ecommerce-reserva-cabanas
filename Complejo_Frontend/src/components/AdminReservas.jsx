import React, { useState, useEffect } from 'react'
import AdminReservaRow from './AdminReservaRow'

function AdminReservas({ idioma }) {
  const [reservas, setReservas] = useState([])
  const [error, setError] = useState('')
  const URL = 'http://localhost:8080'
  const es = idioma === 'es'

  useEffect(() => {
    const token = localStorage.getItem('jwtToken')
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    fetch(`${URL}/api/admin/reservas`, options)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setReservas(data)
        }
      })
      .catch((err) => {
        console.error('Error al cargar reservas admin: ', err)
      })
  }, [])

  // Guarda en memoria el motivo que el admin va escribiendo en la fila
  const handleCambiarMotivo = (id, texto) => {
    setReservas(
      reservas.map((r) => (r.id === id ? { ...r, mensajeCancelacion: texto } : r))
    )
  }

  const handleCancelarReserva = (reserva) => {
    const motivoEscrito = reserva.mensajeCancelacion ? reserva.mensajeCancelacion.trim() : ''
    const mensajeCancelacion =
      motivoEscrito !== ''
        ? motivoEscrito
        : es
          ? 'Cancelada por administración del complejo.'
          : 'Cancelled by sanctuary administration.'

    const token = localStorage.getItem('jwtToken')
    const datosAEnviar = {
      mensajeCancelacion: mensajeCancelacion
    }
    const options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(datosAEnviar)
    }

    fetch(`${URL}/api/admin/reservas/${reserva.id}`, options)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.mensaje) {
          setReservas(
            reservas.map((r) =>
              r.id === reserva.id
                ? { ...r, estado: 'CANCELADA', mensajeCancelacion: mensajeCancelacion }
                : r
            )
          )
          setError('')
        } else {
          console.error('Error al cancelar reserva: ', data)
          setError(es ? 'No se pudo cancelar la reserva' : 'Could not cancel reservation')
        }
      })
      .catch((err) => {
        console.error('Error al cancelar reserva: ', err)
        setError(es ? 'No se pudo cancelar la reserva' : 'Could not cancel reservation')
      })
  }

  return (
    <>
      {error && <p className="admin-res-error">{error}</p>}

      <div className="admin-res-table-container">
        <table className="admin-res-table">
          <thead>
            <tr>
              <th>{es ? 'ID RESERVA' : 'BOOKING ID'}</th>
              <th>{es ? 'HUÉSPED' : 'GUEST'}</th>
              <th>{es ? 'ESPACIOS Y FECHAS' : 'RESERVED SPACES & DATES'}</th>
              <th>TOTAL</th>
              <th>{es ? 'ESTADO' : 'STATUS'}</th>
              <th>{es ? 'ACCIONES / MOTIVO' : 'ACTIONS / REASON'}</th>
            </tr>
          </thead>
          <tbody>
            {reservas.length === 0 ? (
              <tr>
                <td colSpan="6" className="admin-res-empty">
                  {es ? 'No hay reservas registradas aún.' : 'No reservations registered yet.'}
                </td>
              </tr>
            ) : (
              reservas.map((reserva) => (
                <AdminReservaRow
                  idioma={idioma}
                  reserva={reserva}
                  onCambiarMotivo={handleCambiarMotivo}
                  onCancelar={handleCancelarReserva}
                  key={reserva.id}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default AdminReservas
