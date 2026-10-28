import React, { useState, useEffect } from 'react'
import AdminEspacioForm from './AdminEspacioForm'
import AdminEspacioRow from './AdminEspacioRow'
import textos from '../../../i18n/textos'
import { apiFetch } from '../../../utils/api'
import './AdminEspacios.css'

function AdminEspacios({ idioma, onCuentaDesactivada }) {
  const [espacios, setEspacios] = useState([])
  const [error, setError] = useState('')
  const [mensajeExito, setMensajeExito] = useState('')
  const [guardadoId, setGuardadoId] = useState(null)
  const t = textos[idioma].adminEspacios

  useEffect(() => {
    apiFetch('/api/admin/espacios')
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setEspacios(data)
        }
      })
      .catch((err) => {
        console.error('Error al cargar espacios admin: ', err)
      })
  }, [])

  const handleEspacioCreado = (nuevoEspacio) => {
    setEspacios([...espacios, nuevoEspacio])
  }

  // Solo cambia el valor en memoria mientras el admin escribe (sin llamar a la API)
  const handleCambiarPrecio = (id, nuevoValor) => {
    setEspacios(
      espacios.map((item) => (item.id === id ? { ...item, precioBase: nuevoValor } : item))
    )
    setGuardadoId(null)
  }

  // Un único PUT cuando el admin confirma con el botón Guardar
  const handleGuardarPrecio = (espacio) => {
    const nuevoPrecio = Number(espacio.precioBase)
    if (!nuevoPrecio || nuevoPrecio <= 0) {
      setError(t.errorPrecioInvalido)
      return
    }

    const datosAEnviar = {
      nombre: espacio.nombre,
      precioBase: nuevoPrecio,
      tipo: espacio.tipo,
      descripcion: espacio.descripcion,
      imagenes: espacio.imagenes
    }

    apiFetch(`/api/admin/espacios/${espacio.id}`, { method: 'PUT', body: datosAEnviar })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.error === 'CUENTA_DESACTIVADA') {
          onCuentaDesactivada()
          return
        }
        if (data && data.id) {
          setEspacios(
            espacios.map((item) => (item.id === espacio.id ? data : item))
          )
          setGuardadoId(data.id)
          setError('')
          setMensajeExito(t.precioActualizado(data.nombre, data.precioBase))
        } else {
          setError(t.errorPrecio)
        }
      })
      .catch((err) => {
        console.error('Error al actualizar precio: ', err)
        setError(t.errorPrecio)
      })
  }

  const handleToggleEstado = (espacio) => {
    const ruta = espacio.activo
      ? `/api/admin/espacios/${espacio.id}`
      : `/api/admin/espacios/${espacio.id}/restaurar`
    const metodo = espacio.activo ? 'DELETE' : 'PATCH'
    const nuevoEstado = !espacio.activo

    apiFetch(ruta, { method: metodo })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.error === 'CUENTA_DESACTIVADA') {
          onCuentaDesactivada()
          return
        }
        if (data && data.mensaje) {
          setEspacios(
            espacios.map((item) =>
              item.id === espacio.id ? { ...item, activo: nuevoEstado } : item
            )
          )
          setError('')
          setMensajeExito(
            nuevoEstado ? t.reactivado(espacio.nombre) : t.enMantenimiento(espacio.nombre)
          )
        } else {
          setError(t.errorEstado)
        }
      })
      .catch((err) => {
        console.error('Error al cambiar estado del espacio: ', err)
        setError(t.errorEstado)
      })
  }

  return (
    <>
      <AdminEspacioForm
        idioma={idioma}
        onEspacioCreado={handleEspacioCreado}
        onCuentaDesactivada={onCuentaDesactivada}
      />

      {error && <p className="ad-error">{error}</p>}
      {mensajeExito && <p className="ad-success">{mensajeExito}</p>}

      <div className="ad-table-container">
        <table className="ad-table">
          <thead>
            <tr>
              <th>{t.colEspacio}</th>
              <th>{t.colCategoria}</th>
              <th>{t.colTarifa}</th>
              <th>{t.colEstado}</th>
            </tr>
          </thead>
          <tbody>
            {espacios.map((espacio) => (
              <AdminEspacioRow
                idioma={idioma}
                espacio={espacio}
                guardado={guardadoId === espacio.id}
                onCambiarPrecio={handleCambiarPrecio}
                onGuardarPrecio={handleGuardarPrecio}
                onToggleEstado={handleToggleEstado}
                key={espacio.id}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default AdminEspacios
