import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CampoFormulario from '../../ui/CampoFormulario'
import textos from '../../../i18n/textos'
import { crearEspacio } from '../../../Redux/adminEspaciosSlice'
import { IMAGEN_POR_DEFECTO } from '../../../utils/constantes'
import './AdminEspacioForm.css'

function AdminEspacioForm({ idioma }) {
  const dispatch = useDispatch()
  const errorSlice = useSelector((state) => state.adminEspacios.error)
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

    // Igual que el PostForm de la clase: se dispara el thunk y se limpian los campos.
    // Si sale bien, el slice agrega el espacio nuevo a la tabla.
    dispatch(crearEspacio(datosAEnviar))
    setNombre('')
    setPrecioBase('')
    setTipo('CABANA')
    setDescripcion('')
    setImagenes('')
    setError('')
  }

  const mensajeError = error || (errorSlice === 'crear' ? t.errorCrear : '')

  return (
    <div className="ad-form-card">
      <h2 className="ad-form-title">{t.formTitulo}</h2>
      {mensajeError && <p className="ad-error">{mensajeError}</p>}

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
            <option value="CABANA">{t.tipoCabana || 'CABANA'}</option>
            <option value="GALPON_FIESTAS">{t.tipoGalpon || 'GALPON_FIESTAS'}</option>
            <option value="HABITACION_CASA_PRINCIPAL">{t.tipoHabitacion || 'HABITACION_CASA_PRINCIPAL'}</option>
            <option value="SALON_COMIDA_CASA_PRINCIPAL">{t.tipoSalon || 'SALON_COMIDA_CASA_PRINCIPAL'}</option>
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
