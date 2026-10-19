import React from 'react'
import AdminUsuarioRow from './AdminUsuarioRow'

function AdminUsuariosTabla({ idioma, usuarios, onCambiarRol, onToggleEstado }) {
  const es = idioma === 'es'

  return (
    <div className="admin-usr-table-container">
      <table className="admin-usr-table">
        <thead>
          <tr>
            <th>{es ? 'PERFIL DEL CLIENTE' : 'CLIENT PROFILE'}</th>
            <th>{es ? 'EMAIL Y USUARIO' : 'EMAIL & USERNAME'}</th>
            <th>{es ? 'ROL' : 'ROLE'}</th>
            <th>{es ? 'ESTADO' : 'STATUS'}</th>
            <th>{es ? 'ACCIONES DE CUENTA' : 'LIFECYCLE ACTIONS'}</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <AdminUsuarioRow
              idioma={idioma}
              usuario={usuario}
              onCambiarRol={onCambiarRol}
              onToggleEstado={onToggleEstado}
              key={usuario.id}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminUsuariosTabla
