import React, { useState, useEffect } from 'react'
import AdminReservaRow from './AdminReservaRow'
import textos from '../../../i18n/textos'
import { apiFetch } from '../../../utils/api'
import './AdminReservas.css'

function AdminReservas({ idioma, onCuentaDesactivada }) {
  const [reservas, setReservas] = useState([])
  const [error, setError] = useState('')
  const t = textos[idioma].adminReservas

  useEffect(() => {
    apiFetch('/api/admin/reservas')
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
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
    const mensajeCancelacion = motivoEscrito !== '' ? motivoEscrito : t.motivoPorDefecto

    apiFetch(`/api/admin/reservas/${reserva.id}`, {
      method: 'DELETE',
      body: { mensajeCancelacion: mensajeCancelacion }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.error === 'CUENTA_DESACTIVADA') {
          onCuentaDesactivada()
          return
        }
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
          setError(t.errorCancelar)
        }
      })
      .catch((err) => {
        console.error('Error al cancelar reserva: ', err)
        setError(t.errorCancelar)
      })
  }

  return (
    <>
      {error && <p className="admin-res-error">{error}</p>}

      <div className="admin-res-table-container">
        <table className="admin-res-table">
          <thead>
            <tr>
              <th>{t.colId}</th>
              <th>{t.colHuesped}</th>
              <th>{t.colEspacios}</th>
              <th>{t.colTotal}</th>
              <th>{t.colEstado}</th>
              <th>{t.colAcciones}</th>
            </tr>
          </thead>
          <tbody>
            {reservas.length === 0 ? (
              <tr>
                <td colSpan="6" className="admin-res-empty">
                  {t.vacio}
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
