import React from 'react'
import AdminEspacios from '../components/AdminEspacios'
import '../components/AdminEspacios.css'

function AdminEspaciosView({ idioma }) {
  const es = idioma === 'es'

  return (
    <div className="admin-dashboard-wrapper">
      <div className="admin-dashboard-container">
        <div className="ad-header">
          <div className="ad-header-izq">
            <span className="ad-overline">
              {es ? 'CATÁLOGO E INSTALACIONES DEL COMPLEJO' : 'PROPERTY ROSTER & FACILITIES'}
            </span>
            <h1 className="ad-title">
              {es ? 'Espacios y Alojamientos' : 'Places & Accommodations'}
            </h1>
            <p className="ad-subtitle">
              {es
                ? 'Administra cabañas, salones de eventos e instalaciones recreativas en el predio de Whispering Pines.'
                : 'Manage cabins, event barns, and recreational facilities across Whispering Pines resort plots.'}
            </p>
          </div>
        </div>

        <AdminEspacios idioma={idioma} />
      </div>
    </div>
  )
}

export default AdminEspaciosView
