import React from 'react'
import textos from '../../../i18n/textos'
import { imagenPrincipal } from '../../../utils/constantes'

function AdminEspacioRow({ idioma, espacio, guardado, onCambiarPrecio, onGuardarPrecio, onToggleEstado }) {
  const t = textos[idioma].adminEspacios

  return (
    <tr>
      <td>
        <div className="ad-td-acc">
          <img
            src={imagenPrincipal(espacio.imagenes)}
            alt={espacio.nombre}
            className="ad-td-img"
          />
          <div>
            <strong>{espacio.nombre}</strong>
            <span>
              {t.lote(espacio.id)}
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
          <small>{textos[idioma].comun.porNoche}</small>
          <button type="submit" className="ad-btn-save" onClick={() => onGuardarPrecio(espacio)}>
            {guardado ? '✓' : t.guardar}
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
          {espacio.activo ? t.activo : t.mantenimiento}
        </button>
      </td>
    </tr>
  )
}

export default AdminEspacioRow
