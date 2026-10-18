import React from 'react'
import AdminUsuarioRow from './AdminUsuarioRow'

function AdminUsuariosTabla({ usuarios, onCambiarRol, onToggleEstado }) {
  return (
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
