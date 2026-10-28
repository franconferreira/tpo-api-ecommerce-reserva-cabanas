import React, { useState, useEffect } from 'react'
import CalendarioDia from './CalendarioDia'
import textos from '../../i18n/textos'
import { apiFetch } from '../../utils/api'
import { armarCeldasMes } from '../../utils/fechas'
import './CalendarioDisponibilidad.css'

function CalendarioDisponibilidad({
  idioma,
  espacioId,
  fechasSeleccionadas,
  setFechasSeleccionadas
}) {
  const [offsetMes, setOffsetMes] = useState(0)
  const [fechasOcupadas, setFechasOcupadas] = useState([])
  const t = textos[idioma].calendario

  useEffect(() => {
    apiFetch(`/api/espacios/${espacioId}/fechas-ocupadas`, { auth: false })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setFechasOcupadas(data)
        }
      })
      .catch((err) => {
        console.error('Error al cargar fechas ocupadas: ', err)
      })
  }, [espacioId])

  // Mes que se está mostrando: el actual + offsetMes (de 0 a 11 meses hacia adelante)
  const ahora = new Date()
  const fechaVista = new Date(ahora.getFullYear(), ahora.getMonth() + offsetMes, 1)
  const anioVista = fechaVista.getFullYear()
  const mesVista = fechaVista.getMonth()
  const celdas = armarCeldasMes(anioVista, mesVista, fechasOcupadas)

  const handleMesAnterior = () => {
    if (offsetMes > 0) {
      setOffsetMes(offsetMes - 1)
    }
  }

  const handleMesSiguiente = () => {
    if (offsetMes < 11) {
      setOffsetMes(offsetMes + 1)
    }
  }

  const handleSeleccionarDia = (fechaIso) => {
    if (fechasSeleccionadas.includes(fechaIso)) {
      setFechasSeleccionadas(fechasSeleccionadas.filter((f) => f !== fechaIso))
    } else {
      setFechasSeleccionadas([...fechasSeleccionadas, fechaIso])
    }
  }

  return (
    <div className="cal-box">
      <div className="cal-top-bar">
        <strong className="cal-titulo">{t.titulo}</strong>
        <div className="cal-nav">
          <button
            type="button"
            className="cal-nav-btn"
            onClick={handleMesAnterior}
            disabled={offsetMes === 0}
          >
            ‹
          </button>
          <span className="cal-mes-label">
            {t.meses[mesVista]} {anioVista}
          </span>
          <button
            type="button"
            className="cal-nav-btn"
            onClick={handleMesSiguiente}
            disabled={offsetMes >= 11}
          >
            ›
          </button>
        </div>
      </div>

      <div className="cal-semana-header">
        {t.dias.map((dia) => (
          <span key={dia}>{dia}</span>
        ))}
      </div>

      <div className="cal-grid">
        {celdas.map((celda) => (
          <CalendarioDia
            celda={celda}
            idioma={idioma}
            seleccionado={!celda.vacio && fechasSeleccionadas.includes(celda.fechaIso)}
            onSeleccionar={handleSeleccionarDia}
            key={celda.key}
          />
        ))}
      </div>

      <div className="cal-leyenda">
        <span className="cal-leyenda-item">
          <span className="cal-dot dot-disponible"></span>
          {t.disponible}
        </span>
        <span className="cal-leyenda-item">
          <span className="cal-dot dot-ocupado"></span>
          {t.ocupado}
        </span>
        <span className="cal-leyenda-item">
          <span className="cal-dot dot-pasado"></span>
          {t.pasado}
        </span>
      </div>
    </div>
  )
}

export default CalendarioDisponibilidad
