import React, { useState, useEffect } from 'react'
import AdminUsuarioRow from './AdminUsuarioRow'
import './AdminUsuarios.css'

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [error, setError] = useState('')
  const URL = 'http://localhost:8080'

  useEffect(() => {
    const token = localStorage.getItem('jwtToken')
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    fetch(`${URL}/api/admin/usuarios`, options)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setUsuarios(data)
        }
      })
      .catch((err) => {
        console.error('Error al cargar usuarios: ', err)
      })
  }, [])

  const handleToggleEstado = (usuario) => {
    const token = localStorage.getItem('jwtToken')
    const endpoint = usuario.activo
      ? `${URL}/api/admin/usuarios/${usuario.id}`
      : `${URL}/api/admin/usuarios/${usuario.id}/restaurar`
    const metodo = usuario.activo ? 'DELETE' : 'PATCH'

    const options = {
      method: metodo,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    fetch(endpoint, options)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error al actualizar estado del usuario')
        }
        return res.json()
      })
      .then(() => {
        setUsuarios(
          usuarios.map((u) =>
            u.id === usuario.id ? { ...u, activo: !usuario.activo } : u
          )
        )
        setError('')
      })
      .catch((err) => {
        console.error('Error al actualizar estado de usuario: ', err)
        setError('No se pudo cambiar el estado del usuario')
      })
  }

  const handleCambiarRol = (usuario, nuevoRol) => {
    const token = localStorage.getItem('jwtToken')
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ rol: nuevoRol })
    }

    fetch(`${URL}/api/admin/usuarios/${usuario.id}/rol`, options)
      .then((res) => res.json())
      .then((data) => {
        setUsuarios(
          usuarios.map((u) => (u.id === usuario.id ? data : u))
        )
      })
      .catch((err) => {
        console.error('Error al cambiar rol: ', err)
      })
  }

  return (
    <div className="admin-usr-wrapper">
      <div className="admin-usr-container">
        <div className="admin-usr-header">
          <div>
            <span className="admin-usr-overline">🛡️ MEMBER STEWARDSHIP</span>
            <h1 className="admin-usr-title">Client Accounts</h1>
            <p className="admin-usr-subtitle">
              Directory of registered sanctuary guests. Manage roles and toggle account activation status.
            </p>
          </div>
          <div className="admin-usr-header-der">
            <div className="kpi-pill">
              <strong>TOTAL</strong> {usuarios.length}
            </div>
          </div>
        </div>

        {error && <p className="admin-usr-error">{error}</p>}

        <div className="admin-usr-table-container">
          <table className="admin-usr-table">
            <thead>
              <tr>
                <th>CLIENT PROFILE</th>
                <th>EMAIL & USERNAME</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>LIFECYCLE ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <AdminUsuarioRow
                  usuario={usuario}
                  onCambiarRol={handleCambiarRol}
                  onToggleEstado={handleToggleEstado}
                  key={usuario.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminUsuarios
