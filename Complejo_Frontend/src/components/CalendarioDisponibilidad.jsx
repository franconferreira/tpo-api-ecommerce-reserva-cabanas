import React, { useState, useEffect } from 'react'
import CalendarioDia from './CalendarioDia'
import './CalendarioDisponibilidad.css'

function CalendarioDisponibilidad({ idioma, espacioId }) {
  const [offsetMes, setOffsetMes] = useState(0)
  const [fechasOcupadas, setFechasOcupadas] = useState([])
  const URL = 'http://localhost:8080'
  const es = idioma === 'es'

  useEffect(() => {
    fetch(`${URL}/api/espacios/${espacioId}/fechas-ocupadas`)
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

  const ahora = new Date()
  const anioHoy = ahora.getFullYear()
  const mesHoyNum = ahora.getMonth() + 1
  const diaHoyNum = ahora.getDate()
  const mesHoyStr = mesHoyNum < 10 ? `0${mesHoyNum}` : `${mesHoyNum}`
  const diaHoyStr = diaHoyNum < 10 ? `0${diaHoyNum}` : `${diaHoyNum}`
  const hoyIso = `${anioHoy}-${mesHoyStr}-${diaHoyStr}`

  const fechaVista = new Date(ahora.getFullYear(), ahora.getMonth() + offsetMes, 1)
  const anioVista = fechaVista.getFullYear()
  const mesVista = fechaVista.getMonth()

  const mesesEs = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  const mesesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const nombreMes = es ? mesesEs[mesVista] : mesesEn[mesVista]
  const primerDiaSemana = new Date(anioVista, mesVista, 1).getDay()
  const diasEnMes = new Date(anioVista, mesVista + 1, 0).getDate()

  let celdas = []

  for (let i = 0; i < primerDiaSemana; i = i + 1) {
    celdas = [
      ...celdas,
      {
        key: `vacio-${i}`,
        vacio: true
      }
    ]
  }

  const mesVistaNum = mesVista + 1
  const mesVistaStr = mesVistaNum < 10 ? `0${mesVistaNum}` : `${mesVistaNum}`

  for (let d = 1; d <= diasEnMes; d = d + 1) {
    const diaStr = d < 10 ? `0${d}` : `${d}`
    const fechaIso = `${anioVista}-${mesVistaStr}-${diaStr}`

    let estado = 'disponible'
    if (fechaIso < hoyIso) {
      estado = 'pasado'
    } else if (fechasOcupadas.includes(fechaIso)) {
      estado = 'ocupado'
    }

    celdas = [
      ...celdas,
      {
        key: fechaIso,
        vacio: false,
        numero: d,
        fechaIso: fechaIso,
        estado: estado
      }
    ]
  }

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

  return (
    <div className="cal-box">
      <div className="cal-top-bar">
        <strong className="cal-titulo">
          {es ? '📅 Almanaque de Disponibilidad' : '📅 Availability Calendar'}
        </strong>
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
            {nombreMes} {anioVista}
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
        <span>{es ? 'Dom' : 'Sun'}</span>
        <span>{es ? 'Lun' : 'Mon'}</span>
        <span>{es ? 'Mar' : 'Tue'}</span>
        <span>{es ? 'Mié' : 'Wed'}</span>
        <span>{es ? 'Jue' : 'Thu'}</span>
        <span>{es ? 'Vie' : 'Fri'}</span>
        <span>{es ? 'Sáb' : 'Sat'}</span>
      </div>

      <div className="cal-grid">
        {celdas.map((celda) => (
          <CalendarioDia celda={celda} idioma={idioma} key={celda.key} />
        ))}
      </div>

      <div className="cal-leyenda">
        <span className="cal-leyenda-item">
          <span className="cal-dot dot-disponible"></span>
          {es ? 'Disponible' : 'Available'}
        </span>
        <span className="cal-leyenda-item">
          <span className="cal-dot dot-ocupado"></span>
          {es ? 'Ocupado' : 'Unavailable'}
        </span>
        <span className="cal-leyenda-item">
          <span className="cal-dot dot-pasado"></span>
          {es ? 'Pasado' : 'Past'}
        </span>
      </div>
    </div>
  )
}

export default CalendarioDisponibilidad
