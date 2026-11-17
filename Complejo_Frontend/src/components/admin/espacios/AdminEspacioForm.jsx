import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CampoFormulario from '../../ui/CampoFormulario'
import textos from '../../../i18n/textos'
import { crearEspacio, subirImagen } from '../../../Redux/adminEspaciosSlice'
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
  const [subidas, setSubidas] = useState([]) // URLs de las imágenes elegidas desde la computadora
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')
  const t = textos[idioma].adminEspacios

  const handleNombreChange = (e) => setNombre(e.target.value)
  const handlePrecioBaseChange = (e) => setPrecioBase(e.target.value)
  const handleTipoChange = (e) => setTipo(e.target.value)
  const handleDescripcionChange = (e) => setDescripcion(e.target.value)
  const handleImagenesChange = (e) => setImagenes(e.target.value)

  // Imágenes elegidas desde una carpeta de la computadora: se suben una por una al back
  const handleArchivos = async (e) => {
    const archivos = [...e.target.files]
    e.target.value = '' // para poder volver a elegir los mismos archivos
    if (archivos.length === 0) return
    setSubiendo(true)
    setError('')
    const urls = []
    for (const archivo of archivos) {
      try {
        urls.push(await subirImagen(archivo))
      } catch {
        setError(t.errorSubir)
      }
    }
    setSubidas((anteriores) => [...anteriores, ...urls])
    setSubiendo(false)
  }

  const quitarSubida = (url) => setSubidas((anteriores) => anteriores.filter((u) => u !== url))

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
      // primero las elegidas desde la computadora, después la URL escrita; si no hay ninguna, la imagen por defecto
      imagenes: [...subidas, ...(imagenes.trim() !== '' ? [imagenes.trim()] : [])]
    }

    // Igual que el PostForm de la clase: se dispara el thunk y se limpian los campos.
    // Si sale bien, el slice agrega el espacio nuevo a la tabla.
    if (datosAEnviar.imagenes.length === 0) datosAEnviar.imagenes = [IMAGEN_POR_DEFECTO]
    dispatch(crearEspacio(datosAEnviar))
    setNombre('')
    setPrecioBase('')
    setTipo('CABANA')
    setDescripcion('')
    setImagenes('')
    setSubidas([])
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

        <div className="ad-field ad-subir">
          <label className="ad-btn-subir">
            {subiendo ? t.subiendo : t.subirImagenes}
            <input type="file" accept="image/png, image/jpeg, image/webp, image/gif" multiple onChange={handleArchivos} disabled={subiendo} />
          </label>
          {subidas.length > 0 && (
            <div className="ad-subidas">
              {subidas.map((url) => (
                <button key={url} type="button" className="ad-subida" onClick={() => quitarSubida(url)} title={t.quitarImagen}>
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="ad-btn-add" onClick={handleAgregarEspacio} disabled={subiendo}>
          {t.botonAgregar}
        </button>
      </form>
    </div>
  )
}

export default AdminEspacioForm
