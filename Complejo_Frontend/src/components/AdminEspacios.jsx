import React, { useState, useEffect } from 'react'
import AdminEspacioForm from './AdminEspacioForm'
import AdminEspaciosTabla from './AdminEspaciosTabla'
import './AdminEspacios.css'

function AdminEspacios({ idioma }) {
  const [espacios, setEspacios] = useState([])
  const [error, setError] = useState('')
  const [mensajeExito, setMensajeExito] = useState('')
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

  const handleModificarPrecio = (espacio, nuevoValor) => {
    const token = localStorage.getItem('jwtToken')
    const nuevoPrecio = Number(nuevoValor)

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
    <div className="admin-dashboard-wrapper">
      <div className="admin-dashboard-container">
        <div className="ad-header">
          <div className="ad-header-izq">
            <span className="ad-overline">
              {es ? 'CATÁLOGO E INSTALACIONES DEL COMPLEJO' : 'PROPERTY ROSTER & FACILITIES'}
            </span>
            <h1 className="ad-title">
              {es ? 'Espacios y Alojamientos' : 'Places & Accommodations'}
            </h1>
            <p className="ad-subtitle">
              {es
                ? 'Administra cabañas, salones de eventos e instalaciones recreativas en el predio de Whispering Pines.'
                : 'Manage cabins, event barns, and recreational facilities across Whispering Pines resort plots.'}
            </p>
          </div>
        </div>

        <AdminEspacioForm idioma={idioma} onEspacioCreado={handleEspacioCreado} />

        {error && <p className="ad-error">{error}</p>}
        {mensajeExito && <p className="ad-success">{mensajeExito}</p>}

        <AdminEspaciosTabla
          idioma={idioma}
          espacios={espacios}
          onModificarPrecio={handleModificarPrecio}
          onToggleEstado={handleToggleEstado}
        />
      </div>
    </div>
  )
}

export default AdminEspacios
