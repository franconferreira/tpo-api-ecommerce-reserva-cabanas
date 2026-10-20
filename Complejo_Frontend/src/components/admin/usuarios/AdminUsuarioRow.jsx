import React from 'react'
import textos from '../../../i18n/textos'

function AdminUsuarioRow({ idioma, usuario, onCambiarRol, onToggleEstado }) {
  const t = textos[idioma].adminUsuarios
  const isDeactivated = !usuario.activo

  return (
    <tr>
      <td>
        <div className="td-profile">
          <div>
            <strong className={isDeactivated ? 'strikethrough' : ''}>
              {usuario.nombre} {usuario.apellido}
            </strong>
            <span className="usr-id">#{usuario.id}</span>
          </div>
        </div>
      </td>

      <td>
        <div className="td-contact">
          <span className="usr-email">{usuario.email}</span>
          <span className="usr-username">@{usuario.username}</span>
        </div>
      </td>

      <td>
        <select
          name="rol"
          className="usr-role-select"
          value={usuario.rol}
          onChange={(e) => onCambiarRol(usuario, e.target.value)}
        >
          <option value="ROLE_CLIENTE">ROLE_CLIENTE</option>
          <option value="ROLE_ADMIN">ROLE_ADMIN</option>
        </select>
      </td>

      <td>
        <span className={isDeactivated ? 'status-pill status-deact' : 'status-pill status-act'}>
          {isDeactivated ? t.desactivado : t.activo}
        </span>
      </td>

      <td>
        <button
          type="button"
          className={isDeactivated ? 'btn-toggle-lifecycle btn-restore' : 'btn-toggle-lifecycle btn-deactivate'}
          onClick={() => onToggleEstado(usuario)}
        >
          {isDeactivated ? t.restaurar : t.desactivar}
        </button>
      </td>
    </tr>
  )
}

export default AdminUsuarioRow
