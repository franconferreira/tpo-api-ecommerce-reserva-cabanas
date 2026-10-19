import React from 'react'
import AdminEspacioRow from './AdminEspacioRow'

function AdminEspaciosTabla({ idioma, espacios, onModificarPrecio, onToggleEstado }) {
  const es = idioma === 'es'

  return (
    <div className="ad-table-container">
      <table className="ad-table">
        <thead>
          <tr>
            <th>{es ? 'ESPACIO Y LOTE' : 'ACCOMMODATION & PLOT'}</th>
            <th>{es ? 'CATEGORÍA' : 'CATEGORY'}</th>
            <th>{es ? 'TARIFA ($ / NOCHE)' : 'RATE ($ / NIGHT)'}</th>
            <th>{es ? 'ESTADO' : 'STATUS'}</th>
          </tr>
        </thead>
        <tbody>
          {espacios.map((espacio) => (
            <AdminEspacioRow
              idioma={idioma}
              espacio={espacio}
              onModificarPrecio={onModificarPrecio}
              onToggleEstado={onToggleEstado}
              key={espacio.id}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminEspaciosTabla
