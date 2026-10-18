import React from 'react'

function AdminEspacioRow({ espacio, onModificarPrecio, onToggleEstado }) {
  return (
    <tr>
      <td>
        <div className="ad-td-acc">
          {espacio.imagenes && espacio.imagenes.length > 0 && (
            <img
              src={espacio.imagenes[0]}
              alt={espacio.nombre}
              className="ad-td-img"
            />
          )}
          <div>
            <strong>{espacio.nombre}</strong>
            <span>Plot #{espacio.id} — {espacio.descripcion}</span>
          </div>
        </div>
      </td>
      <td>
        <span className="ad-type-badge">{espacio.tipo}</span>
      </td>
      <td>
        <div className="ad-td-rate">
          <span>$</span>
          <input
            type="number"
            name="precioBase"
            className="ad-inline-input"
            value={espacio.precioBase}
            onChange={(e) => onModificarPrecio(espacio, e.target.value)}
          />
          <small>/ night</small>
        </div>
      </td>
      <td>
        <button
          type="button"
          className={espacio.activo ? 'ad-status-pill active' : 'ad-status-pill maintenance'}
          onClick={() => onToggleEstado(espacio)}
        >
          <span className="dot"></span>
          {espacio.activo ? 'Active' : 'Under Maintenance'}
        </button>
      </td>
    </tr>
  )
}

export default AdminEspacioRow
