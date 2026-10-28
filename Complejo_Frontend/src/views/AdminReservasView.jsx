import React from 'react'
import PageHeader from '../components/layout/PageHeader'
import AdminReservas from '../components/admin/reservas/AdminReservas'
import textos from '../i18n/textos'
import './AdminView.css'

function AdminReservasView({ idioma, onCuentaDesactivada }) {
  const t = textos[idioma].adminReservas

  return (
    <div className="admin-pagina">
      <div className="admin-contenedor">
        <PageHeader overline={t.overline} titulo={t.titulo} subtitulo={t.subtitulo} />
        <AdminReservas idioma={idioma} onCuentaDesactivada={onCuentaDesactivada} />
      </div>
    </div>
  )
}

export default AdminReservasView
