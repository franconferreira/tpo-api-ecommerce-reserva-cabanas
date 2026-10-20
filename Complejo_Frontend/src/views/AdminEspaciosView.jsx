import React from 'react'
import PageHeader from '../components/layout/PageHeader'
import AdminEspacios from '../components/admin/espacios/AdminEspacios'
import textos from '../i18n/textos'
import './AdminView.css'

function AdminEspaciosView({ idioma }) {
  const t = textos[idioma].adminEspacios

  return (
    <div className="admin-pagina">
      <div className="admin-contenedor">
        <PageHeader overline={t.overline} titulo={t.titulo} subtitulo={t.subtitulo} />
        <AdminEspacios idioma={idioma} />
      </div>
    </div>
  )
}

export default AdminEspaciosView
