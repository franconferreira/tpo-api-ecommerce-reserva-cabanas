import React from 'react'
import AdminEspacioRow from './AdminEspacioRow'

function AdminEspaciosTabla({ espacios, onModificarPrecio, onToggleEstado }) {
  return (
    <div className="ad-table-container">
      <table className="ad-table">
        <thead>
          <tr>
            <th>ACCOMMODATION & PLOT</th>
            <th>CATEGORY</th>
            <th>RATE ($ / NIGHT)</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {espacios.map((espacio) => (
            <AdminEspacioRow
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
