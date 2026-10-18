import React, { useState, useEffect } from 'react'
import AdminEspacioForm from './AdminEspacioForm'
import AdminEspacioRow from './AdminEspacioRow'
import './AdminEspacios.css'

function AdminEspacios() {
  const [espacios, setEspacios] = useState([])
  const URL = 'http://localhost:8080'

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
        setEspacios(
          espacios.map((item) => (item.id === espacio.id ? data : item))
        )
      })
      .catch((err) => {
        console.error('Error al actualizar precio: ', err)
      })
  }

  const handleToggleEstado = (espacio) => {
    const token = localStorage.getItem('jwtToken')
    const endpoint = espacio.activo
      ? `${URL}/api/admin/espacios/${espacio.id}`
      : `${URL}/api/admin/espacios/${espacio.id}/restaurar`
    const metodo = espacio.activo ? 'DELETE' : 'PATCH'

    const options = {
      method: metodo,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    fetch(endpoint, options)
      .then((res) => res.json())
      .then(() => {
        setEspacios(
          espacios.map((item) =>
            item.id === espacio.id ? { ...item, activo: !espacio.activo } : item
          )
        )
      })
      .catch((err) => {
        console.error('Error al cambiar estado del espacio: ', err)
      })
  }

  return (
    <div className="admin-dashboard-wrapper">
      <div className="admin-dashboard-container">
        <div className="ad-header">
          <div className="ad-header-izq">
            <span className="ad-overline">PROPERTY ROSTER & FACILITIES</span>
            <h1 className="ad-title">Places & Accommodations</h1>
            <p className="ad-subtitle">
              Manage cabins, event barns, and recreational facilities across Whispering Pines resort plots.
            </p>
          </div>
        </div>

        <AdminEspacioForm onEspacioCreado={handleEspacioCreado} />

        <div className="ad-table-container">
          <table className="ad-table">
            <thead>
              <tr>
                <th>ACCOMMODATION & PLOT</th>
                <th>CATEGORY</th>
                <th>RATE ($ / NIGHT)</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {espacios.map((espacio) => (
                <AdminEspacioRow
                  espacio={espacio}
                  onModificarPrecio={handleModificarPrecio}
                  onToggleEstado={handleToggleEstado}
                  key={espacio.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminEspacios
