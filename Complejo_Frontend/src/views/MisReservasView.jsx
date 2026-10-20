import React from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import MisReservasList from '../components/reservas/MisReservasList'
import textos from '../i18n/textos'
import './MisReservasView.css'

function MisReservasView({ idioma, ocultasIds, setOcultasIds }) {
  const t = textos[idioma].misReservas

  return (
    <div className="mr-wrapper">
      <div className="mr-container">
        <PageHeader titulo={t.titulo} subtitulo={t.subtitulo}>
          <Link to="/catalogo" className="mr-btn-new">
            {t.nueva}
          </Link>
        </PageHeader>

        <MisReservasList
          idioma={idioma}
          ocultasIds={ocultasIds}
          setOcultasIds={setOcultasIds}
        />
      </div>
    </div>
  )
}

export default MisReservasView
