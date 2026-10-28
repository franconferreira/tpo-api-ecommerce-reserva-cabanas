import React, { useState } from 'react'
import CampoFormulario from '../../ui/CampoFormulario'
import textos from '../../../i18n/textos'
import { apiFetch } from '../../../utils/api'
import { IMAGEN_POR_DEFECTO } from '../../../utils/constantes'
import './AdminEspacioForm.css'

function AdminEspacioForm({ idioma, onEspacioCreado, onCuentaDesactivada }) {
  const [nombre, setNombre] = useState('')
  const [precioBase, setPrecioBase] = useState('')
  const [tipo, setTipo] = useState('CABANA')
  const [descripcion, setDescripcion] = useState('')
  const [imagenes, setImagenes] = useState('')
  const [error, setError] = useState('')
  const t = textos[idioma].adminEspacios

  const handleNombreChange = (e) => setNombre(e.target.value)
  const handlePrecioBaseChange = (e) => setPrecioBase(e.target.value)
  const handleTipoChange = (e) => setTipo(e.target.value)
  const handleDescripcionChange = (e) => setDescripcion(e.target.value)
  const handleImagenesChange = (e) => setImagenes(e.target.value)

  const handleAgregarEspacio = () => {
    if (nombre.trim() === '' || precioBase.trim() === '' || descripcion.trim() === '') {
      setError(t.errorObligatorios)
      return
    }

    const datosAEnviar = {
      nombre: nombre,
      precioBase: Number(precioBase),
      tipo: tipo,
      descripcion: descripcion,
      imagenes: [imagenes.trim() !== '' ? imagenes : IMAGEN_POR_DEFECTO]
    }

    apiFetch('/api/admin/espacios', { method: 'POST', body: datosAEnviar })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.error === 'CUENTA_DESACTIVADA') {
          onCuentaDesactivada()
          return
        }
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
          setError(t.errorCrear)
        }
      })
      .catch((err) => {
        console.error('Error al crear espacio: ', err)
        setError(t.errorCrear)
      })
  }

  return (
    <div className="ad-form-card">
      <h2 className="ad-form-title">{t.formTitulo}</h2>
      {error && <p className="ad-error">{error}</p>}

      <form onSubmit={(e) => e.preventDefault()} className="ad-inline-form">
        <CampoFormulario
          className="ad-field"
          label={t.nombre}
          type="text"
          name="nombre"
          placeholder="Cabaña del Ocaso / Sunset Ridge Cabin"
          value={nombre}
          onChange={handleNombreChange}
        />

        <div className="ad-field">
          <label>{t.categoria}</label>
          <select name="tipo" value={tipo} onChange={handleTipoChange}>
            <option value="CABANA">CABANA</option>
            <option value="GALPON_FIESTAS">GALPON_FIESTAS</option>
            <option value="LAGUNA_RECREATIVA">LAGUNA_RECREATIVA</option>
          </select>
        </div>

        <CampoFormulario
          className="ad-field"
          label={t.tarifa}
          type="number"
          name="precioBase"
          placeholder="120"
          value={precioBase}
          onChange={handlePrecioBaseChange}
        />
        <CampoFormulario
          className="ad-field"
          label={t.descripcion}
          type="text"
          name="descripcion"
          placeholder="Cabaña rústica frente al lago. / Rustic pine cabin overlooking the lake."
          value={descripcion}
          onChange={handleDescripcionChange}
        />
        <CampoFormulario
          className="ad-field"
          label={t.imagen}
          type="text"
          name="imagenes"
          placeholder="https://..."
          value={imagenes}
          onChange={handleImagenesChange}
        />

        <button type="submit" className="ad-btn-add" onClick={handleAgregarEspacio}>
          {t.botonAgregar}
        </button>
      </form>
    </div>
  )
}

export default AdminEspacioForm
