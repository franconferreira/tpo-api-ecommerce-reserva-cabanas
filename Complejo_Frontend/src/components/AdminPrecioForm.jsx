import React, { useState } from 'react'

function AdminPrecioForm({ idioma, espacio, onModificarPrecio }) {
  const [precioBase, setPrecioBase] = useState(`${espacio.precioBase}`)
  const [guardado, setGuardado] = useState(false)
  const es = idioma === 'es'

  const handlePrecioBaseChange = (e) => {
    setPrecioBase(e.target.value)
    setGuardado(false)
  }

  const handleGuardar = () => {
    if (precioBase.trim() === '') {
      return
    }
    const valorNumerico = Number(precioBase)
    if (!valorNumerico || valorNumerico <= 0) {
      return
    }
    onModificarPrecio(espacio, valorNumerico)
    setGuardado(true)
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="ad-td-rate">
      <span>$</span>
      <input
        type="number"
        name="precioBase"
        className="ad-inline-input"
        value={precioBase}
        onChange={handlePrecioBaseChange}
      />
      <small>{es ? '/ noche' : '/ night'}</small>
      <button type="submit" className="ad-btn-save" onClick={handleGuardar}>
        {guardado ? '✓' : es ? 'Guardar' : 'Save'}
      </button>
    </form>
  )
}

export default AdminPrecioForm
