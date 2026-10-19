import React from 'react'
import MisReservasList from '../components/MisReservasList'

function MisReservasView({ idioma, ocultasIds, setOcultasIds }) {
  return (
    <>
      <MisReservasList
        idioma={idioma}
        ocultasIds={ocultasIds}
        setOcultasIds={setOcultasIds}
      />
    </>
  )
}

export default MisReservasView
