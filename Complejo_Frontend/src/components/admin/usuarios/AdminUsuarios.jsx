import React, { useState, useEffect } from 'react'
import AdminUsuarioRow from './AdminUsuarioRow'
import PageHeader from '../../layout/PageHeader'
import textos from '../../../i18n/textos'
import { apiFetch } from '../../../utils/api'
import './AdminUsuarios.css'

function AdminUsuarios({ idioma, onCuentaDesactivada }) {
  const [usuarios, setUsuarios] = useState([])
  const [error, setError] = useState('')
  const t = textos[idioma].adminUsuarios

  useEffect(() => {
    apiFetch('/api/admin/usuarios')
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setUsuarios(data)
        }
      })
      .catch((err) => {
        console.error('Error al cargar usuarios: ', err)
      })
  }, [])

  const handleToggleEstado = (usuario) => {
    const ruta = usuario.activo
      ? `/api/admin/usuarios/${usuario.id}`
      : `/api/admin/usuarios/${usuario.id}/restaurar`
    const metodo = usuario.activo ? 'DELETE' : 'PATCH'

    apiFetch(ruta, { method: metodo })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.error === 'CUENTA_DESACTIVADA') {
          onCuentaDesactivada()
          return
        }
        if (data && data.mensaje) {
          setUsuarios(
            usuarios.map((u) =>
              u.id === usuario.id ? { ...u, activo: !usuario.activo } : u
            )
          )
          setError('')
        } else {
          console.error('Error al actualizar estado de usuario: ', data)
          setError(t.errorEstado)
        }
      })
      .catch((err) => {
        console.error('Error al actualizar estado de usuario: ', err)
        setError(t.errorEstado)
      })
  }

  const handleToggleRol = (usuario) => {
    const nuevoRol = usuario.rol === 'ROLE_ADMIN' ? 'ROLE_CLIENTE' : 'ROLE_ADMIN'

    apiFetch(`/api/admin/usuarios/${usuario.id}/rol`, { method: 'PUT', body: { rol: nuevoRol } })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.error === 'CUENTA_DESACTIVADA') {
          onCuentaDesactivada()
          return
        }
        // El backend devuelve el usuario actualizado; si no llega, el cambio falló
        if (data && data.id) {
          setUsuarios(
            usuarios.map((u) => (u.id === usuario.id ? data : u))
          )
          setError('')
        } else {
          console.error('Error al cambiar rol: ', data)
          setError(t.errorRol)
        }
      })
      .catch((err) => {
        console.error('Error al cambiar rol: ', err)
        setError(t.errorRol)
      })
  }

  return (
    <>
      <PageHeader overline={t.overline} titulo={t.titulo} subtitulo={t.subtitulo}>
        <div className="kpi-pill">
          <strong>TOTAL</strong> {usuarios.length}
        </div>
      </PageHeader>

      {error && <p className="admin-usr-error">{error}</p>}

      <div className="admin-usr-table-container">
        <table className="admin-usr-table">
          <thead>
            <tr>
              <th>{t.colPerfil}</th>
              <th>{t.colContacto}</th>
              <th>{t.colRol}</th>
              <th>{t.colEstado}</th>
              <th>{t.colAcciones}</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <AdminUsuarioRow
                idioma={idioma}
                usuario={usuario}
                onToggleRol={handleToggleRol}
                onToggleEstado={handleToggleEstado}
                key={usuario.id}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default AdminUsuarios
