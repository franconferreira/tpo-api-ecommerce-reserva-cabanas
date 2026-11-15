import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AdminReservaRow from './AdminReservaRow'
import textos from '../../../i18n/textos'
import { fetchAdminReservas, cancelarReservaAdmin } from '../../../Redux/adminReservasSlice'
import './AdminReservas.css'
import { EsquinasPanel } from '../../ornamentos/Ornamentos'

function AdminReservas({ idioma }) {
  const dispatch = useDispatch()
  const { items: reservas, errorCancelar } = useSelector((state) => state.adminReservas)
  const t = textos[idioma].adminReservas

  useEffect(() => {
    dispatch(fetchAdminReservas())
  }, [dispatch])

  // El motivo que se va escribiendo vive en el estado local de cada fila
  const handleCancelarReserva = (reserva, motivoEscrito) => {
    const motivo = motivoEscrito.trim()
    const mensajeCancelacion = motivo !== '' ? motivo : t.motivoPorDefecto
    dispatch(cancelarReservaAdmin({ id: reserva.id, mensajeCancelacion: mensajeCancelacion }))
  }

  return (
    <>
      {errorCancelar && <p className="admin-res-error">{t.errorCancelar}</p>}

      <div className="admin-res-table-container">
        <EsquinasPanel variante={1} />
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
