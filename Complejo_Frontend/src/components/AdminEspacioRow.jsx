import React from 'react'

function AdminEspacioRow({ idioma, espacio, guardado, onCambiarPrecio, onGuardarPrecio, onToggleEstado }) {
  const es = idioma === 'es'
  const imagenPorDefecto = 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800'
  const imagenPrincipal =
    espacio.imagenes && espacio.imagenes.length > 0 && espacio.imagenes[0] && espacio.imagenes[0].trim() !== ''
      ? espacio.imagenes[0]
      : imagenPorDefecto

  return (
    <tr>
      <td>
        <div className="ad-td-acc">
          <img
            src={imagenPrincipal}
            alt={espacio.nombre}
            className="ad-td-img"
          />
          <div>
            <strong>{espacio.nombre}</strong>
            <span>
              {es ? `Lote #${espacio.id} — ` : `Plot #${espacio.id} — `}
              {espacio.descripcion}
            </span>
          </div>
        </div>
      </td>
      <td>
        <span className="ad-type-badge">{espacio.tipo}</span>
      </td>
      <td>
        <form onSubmit={(e) => e.preventDefault()} className="ad-td-rate">
          <span>$</span>
          <input
            type="number"
            name="precioBase"
            className="ad-inline-input"
            value={espacio.precioBase}
            onChange={(e) => onCambiarPrecio(espacio.id, e.target.value)}
          />
          <small>{es ? '/ noche' : '/ night'}</small>
          <button type="submit" className="ad-btn-save" onClick={() => onGuardarPrecio(espacio)}>
            {guardado ? '✓' : es ? 'Guardar' : 'Save'}
          </button>
        </form>
      </td>
      <td>
        <button
          type="button"
          className={espacio.activo ? 'ad-status-pill active' : 'ad-status-pill maintenance'}
          onClick={() => onToggleEstado(espacio)}
        >
          <span className="dot"></span>
          {espacio.activo
            ? es
              ? 'Activo'
              : 'Active'
            : es
              ? 'En Mantenimiento'
              : 'Under Maintenance'}
        </button>
      </td>
    </tr>
  )
}

export default AdminEspacioRow
