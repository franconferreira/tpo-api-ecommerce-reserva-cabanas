import React from 'react'
import AdminUsuarios from '../components/admin/usuarios/AdminUsuarios'
import './AdminView.css'

// El encabezado de esta pantalla lo arma AdminUsuarios porque muestra el total de usuarios cargados
function AdminUsuariosView({ idioma }) {
  return (
    <div className="admin-pagina">
      <div className="admin-contenedor">
        <AdminUsuarios idioma={idioma} />
      </div>
    </div>
  )
}

export default AdminUsuariosView
