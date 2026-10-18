import React, { useState } from 'react'

function AdminPrecioForm({ espacio, onModificarPrecio }) {
  const [precioBase, setPrecioBase] = useState(`${espacio.precioBase}`)

  const handlePrecioBaseChange = (e) => setPrecioBase(e.target.value)

  const handleGuardar = () => {
    if (precioBase.trim() === '') {
      return
    }
    onModificarPrecio(espacio, precioBase)
  }

  return (
    <div className="ad-td-rate">
      <span>$</span>
      <input
        type="number"
        name="precioBase"
        className="ad-inline-input"
        value={precioBase}
        onChange={handlePrecioBaseChange}
      />
      <small>/ night</small>
      <button type="button" className="ad-btn-save" onClick={handleGuardar}>
        Save
      </button>
    </div>
  )
}

export default AdminPrecioForm
