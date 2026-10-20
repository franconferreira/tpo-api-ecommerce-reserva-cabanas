import React from 'react'
import AdminUsuarios from '../components/AdminUsuarios'
import '../components/AdminUsuarios.css'

function AdminUsuariosView({ idioma }) {
  return (
    <div className="admin-usr-wrapper">
      <div className="admin-usr-container">
        <AdminUsuarios idioma={idioma} />
      </div>
    </div>
  )
}

export default AdminUsuariosView
