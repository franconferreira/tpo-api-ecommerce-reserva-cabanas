import React, { useState } from 'react'
import textos from '../../../i18n/textos'
import { imagenPrincipal } from '../../../utils/constantes'

function AdminEspacioRow({ idioma, espacio, guardado, onGuardarPrecio, onToggleEstado }) {
  // Estado local que arranca con el precio actual (como el EditPostForm de la clase)
  const [precio, setPrecio] = useState(espacio.precioBase)
  const t = textos[idioma].adminEspacios
  // El ✓ se muestra si se guardó y no se volvió a cambiar el valor
  const mostrarGuardado = guardado && Number(precio) === Number(espacio.precioBase)

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
        <span className="ad-type-badge">
          {espacio.tipo === 'CABANA' && (t.tipoCabana || 'Cabaña')}
          {espacio.tipo === 'GALPON_FIESTAS' && (t.tipoGalpon || 'Galpón')}
          {espacio.tipo === 'HABITACION_CASA_PRINCIPAL' && (t.tipoHabitacion || 'Habitación')}
          {espacio.tipo === 'SALON_COMIDA_CASA_PRINCIPAL' && (t.tipoSalon || 'Salón Comunal')}
          {!['CABANA', 'GALPON_FIESTAS', 'HABITACION_CASA_PRINCIPAL', 'SALON_COMIDA_CASA_PRINCIPAL'].includes(espacio.tipo) && espacio.tipo}
        </span>
      </td>
      <td>
        <form onSubmit={(e) => e.preventDefault()} className="ad-td-rate">
          <span>USD $</span>
          <input
            type="number"
            name="precioBase"
            className="ad-inline-input"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
          <small>{textos[idioma].comun.porNoche}</small>
          <button type="submit" className="ad-btn-save" onClick={() => onGuardarPrecio(espacio, precio)}>
            {mostrarGuardado ? '✓' : t.guardar}
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
