import React, { useState } from 'react'
import CampoFormulario from './CampoFormulario'

function AdminEspacioForm({ onEspacioCreado }) {
  const [nombre, setNombre] = useState('')
  const [precioBase, setPrecioBase] = useState('')
  const [tipo, setTipo] = useState('CABANA')
  const [descripcion, setDescripcion] = useState('')
  const [imagenes, setImagenes] = useState('')
  const [error, setError] = useState('')
  const URL = 'http://localhost:8080'

  const handleNombreChange = (e) => setNombre(e.target.value)
  const handlePrecioBaseChange = (e) => setPrecioBase(e.target.value)
  const handleTipoChange = (e) => setTipo(e.target.value)
  const handleDescripcionChange = (e) => setDescripcion(e.target.value)
  const handleImagenesChange = (e) => setImagenes(e.target.value)

  const handleAgregarEspacio = () => {
    if (nombre.trim() === '' || precioBase.trim() === '' || descripcion.trim() === '') {
      setError('Nombre, precio base y descripcion son obligatorios')
      return
    }

    const token = localStorage.getItem('jwtToken')
    const urlImagen =
      imagenes.trim() !== ''
        ? imagenes
        : 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800'

    const datosAEnviar = {
      nombre: nombre,
      precioBase: Number(precioBase),
      tipo: tipo,
      descripcion: descripcion,
      imagenes: [urlImagen]
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(datosAEnviar)
    }

    fetch(`${URL}/api/admin/espacios`, options)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          onEspacioCreado(data)
          setNombre('')
          setPrecioBase('')
          setTipo('CABANA')
          setDescripcion('')
          setImagenes('')
          setError('')
        } else {
          console.error('Error al crear espacio: ', data)
          setError('No se pudo crear el espacio')
        }
      })
      .catch((err) => {
        console.error('Error al crear espacio: ', err)
        setError('No se pudo crear el espacio')
      })
  }

  return (
    <div className="ad-form-card">
      <h2 className="ad-form-title">Add New Place</h2>
      {error && <p className="ad-error">{error}</p>}

      <form onSubmit={(e) => e.preventDefault()} className="ad-inline-form">
        <CampoFormulario className="ad-field" label="Name" type="text" name="nombre"
          placeholder="Sunset Ridge Cabin" value={nombre} onChange={handleNombreChange} />

        <div className="ad-field">
          <label>Category (Tipo)</label>
          <select name="tipo" value={tipo} onChange={handleTipoChange}>
            <option value="CABANA">CABANA</option>
            <option value="GALPON_FIESTAS">GALPON_FIESTAS</option>
            <option value="LAGUNA_RECREATIVA">LAGUNA_RECREATIVA</option>
          </select>
        </div>

        <CampoFormulario className="ad-field" label="Base Rate ($ / night)" type="number" name="precioBase"
          placeholder="180" value={precioBase} onChange={handlePrecioBaseChange} />
        <CampoFormulario className="ad-field" label="Description" type="text" name="descripcion"
          placeholder="Rustic pine cabin overlooking the lake" value={descripcion} onChange={handleDescripcionChange} />
        <CampoFormulario className="ad-field" label="Image URL" type="text" name="imagenes"
          placeholder="https://..." value={imagenes} onChange={handleImagenesChange} />

        <button type="submit" className="ad-btn-add" onClick={handleAgregarEspacio}>
          + Save Place
        </button>
      </form>
    </div>
  )
}

export default AdminEspacioForm
