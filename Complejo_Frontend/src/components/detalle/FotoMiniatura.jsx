import React from 'react'

function FotoMiniatura({ foto, indice, nombre, activa, onSeleccionar }) {
  return (
    <button
      type="button"
      className={activa ? 'foto-thumb foto-thumb-activa' : 'foto-thumb'}
      onClick={() => onSeleccionar(indice)}
    >
      <img src={foto} alt={`${nombre} - foto ${indice + 1}`} />
    </button>
  )
}

export default FotoMiniatura
