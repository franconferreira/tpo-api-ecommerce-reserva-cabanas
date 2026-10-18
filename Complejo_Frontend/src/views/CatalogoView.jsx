import React from 'react'
import EspacioList from '../components/EspacioList'

function CatalogoView({ onAbrirDetalle }) {
  return (
    <>
      <EspacioList onAbrirDetalle={onAbrirDetalle} />
    </>
  )
}

export default CatalogoView
