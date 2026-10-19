import React from 'react'
import EspacioList from '../components/EspacioList'

function CatalogoView({ idioma, onAbrirDetalle }) {
  return (
    <>
      <EspacioList idioma={idioma} onAbrirDetalle={onAbrirDetalle} />
    </>
  )
}

export default CatalogoView
