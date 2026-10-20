import React from 'react'
import textos from '../../i18n/textos'

function ReservaWidgetInfo({ idioma }) {
  const t = textos[idioma].widget

  return (
    <div className="wr-summary">
      <p className="wr-info-note">
        {t.notaTemporada}
        <strong>{t.notaTemporadaDestacado}</strong>.
      </p>
      <p className="wr-info-note">
        {t.notaPack}
        <strong>{t.notaPackDestacado}</strong>.
      </p>
      <p className="wr-info-note">
        {t.notaReserva}
        <strong>{t.notaReservaDestacado}</strong>.
      </p>
    </div>
  )
}

export default ReservaWidgetInfo
