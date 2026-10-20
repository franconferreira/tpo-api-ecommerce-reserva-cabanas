import React, { useState, useEffect } from 'react'
import AdminEspacioForm from './AdminEspacioForm'
import AdminEspacioRow from './AdminEspacioRow'

function AdminEspacios({ idioma }) {
  const [espacios, setEspacios] = useState([])
  const [error, setError] = useState('')
  const [mensajeExito, setMensajeExito] = useState('')
  const [guardadoId, setGuardadoId] = useState(null)
  const URL = 'http://localhost:8080'
  const es = idioma === 'es'

  useEffect(() => {
    const token = localStorage.getItem('jwtToken')
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    fetch(`${URL}/api/admin/espacios`, options)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
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
      setError(es ? 'Ingresa un precio mayor a 0' : 'Enter a rate greater than 0')
      return
    }

    const token = localStorage.getItem('jwtToken')
    const datosAEnviar = {
      nombre: espacio.nombre,
      precioBase: nuevoPrecio,
      tipo: espacio.tipo,
      descripcion: espacio.descripcion,
      imagenes: espacio.imagenes
    }

    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(datosAEnviar)
    }

    fetch(`${URL}/api/admin/espacios/${espacio.id}`, options)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          setEspacios(
            espacios.map((item) => (item.id === espacio.id ? data : item))
          )
          setGuardadoId(data.id)
          setError('')
          setMensajeExito(
            es
              ? `✓ Tarifa de "${data.nombre}" actualizada a $${data.precioBase} / noche.`
              : `✓ Rate for "${data.nombre}" updated to $${data.precioBase} / night.`
          )
        } else {
          setError(
            es
              ? 'No se pudo actualizar el precio del espacio'
              : 'Could not update space rate'
          )
        }
      })
      .catch((err) => {
        console.error('Error al actualizar precio: ', err)
        setError(
          es
            ? 'No se pudo actualizar el precio del espacio'
            : 'Could not update space rate'
        )
      })
  }

  const handleToggleEstado = (espacio) => {
    const token = localStorage.getItem('jwtToken')
    const endpoint = espacio.activo
      ? `${URL}/api/admin/espacios/${espacio.id}`
      : `${URL}/api/admin/espacios/${espacio.id}/restaurar`
    const metodo = espacio.activo ? 'DELETE' : 'PATCH'
    const nuevoEstado = !espacio.activo

    const options = {
      method: metodo,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    fetch(endpoint, options)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.mensaje) {
          setEspacios(
            espacios.map((item) =>
              item.id === espacio.id ? { ...item, activo: nuevoEstado } : item
            )
          )
          setError('')
          setMensajeExito(
            nuevoEstado
              ? es
                ? `✓ Espacio "${espacio.nombre}" reactivado y visible en el catálogo.`
                : `✓ Space "${espacio.nombre}" reactivated and visible in catalog.`
              : es
                ? `✓ Espacio "${espacio.nombre}" puesto en mantenimiento.`
                : `✓ Space "${espacio.nombre}" set to maintenance.`
          )
        } else {
          setError(
            es
              ? 'No se pudo cambiar el estado del espacio'
              : 'Could not change space status'
          )
        }
      })
      .catch((err) => {
        console.error('Error al cambiar estado del espacio: ', err)
        setError(
          es
            ? 'No se pudo cambiar el estado del espacio'
            : 'Could not change space status'
        )
      })
  }

  return (
    <>
      <AdminEspacioForm idioma={idioma} onEspacioCreado={handleEspacioCreado} />

      {error && <p className="ad-error">{error}</p>}
      {mensajeExito && <p className="ad-success">{mensajeExito}</p>}

      <div className="ad-table-container">
        <table className="ad-table">
          <thead>
            <tr>
              <th>{es ? 'ESPACIO Y LOTE' : 'ACCOMMODATION & PLOT'}</th>
              <th>{es ? 'CATEGORÍA' : 'CATEGORY'}</th>
              <th>{es ? 'TARIFA ($ / NOCHE)' : 'RATE ($ / NIGHT)'}</th>
              <th>{es ? 'ESTADO' : 'STATUS'}</th>
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
