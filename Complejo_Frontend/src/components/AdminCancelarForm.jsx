import React, { useState } from 'react'

function AdminCancelarForm({ idioma, reservaId, onCancelar }) {
  const [mensajeCancelacion, setMensajeCancelacion] = useState('')
  const es = idioma === 'es'

  const handleMensajeChange = (e) => setMensajeCancelacion(e.target.value)

  const handleConfirmar = () => {
    const motivo =
      mensajeCancelacion.trim() !== ''
        ? mensajeCancelacion.trim()
        : es
          ? 'Cancelada por administración del complejo.'
          : 'Cancelled by sanctuary administration.'
    onCancelar(reservaId, motivo)
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="admin-cancel-form">
      <input
        type="text"
        name="mensajeCancelacion"
        className="admin-cancel-input"
        placeholder={es ? 'Motivo de cancelación...' : 'Cancellation reason...'}
        value={mensajeCancelacion}
        onChange={handleMensajeChange}
      />
      <button
        type="submit"
        className="btn-cancel-admin"
        onClick={handleConfirmar}
      >
        {es ? '⊗ Cancelar' : '⊗ Cancel'}
      </button>
    </form>
  )
}

export default AdminCancelarForm
