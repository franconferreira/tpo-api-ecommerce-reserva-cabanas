import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import EspacioCard from './EspacioCard'
import textos from '../../i18n/textos'
import { fetchEspacios } from '../../Redux/espaciosSlice'
import './EspacioList.css'

function EspacioList({ idioma, onAbrirDetalle }) {
  const dispatch = useDispatch()
  const { items: espacios, loading, error } = useSelector((state) => state.espacios)
  const t = textos[idioma].catalogo

  useEffect(() => {
    dispatch(fetchEspacios())
  }, [dispatch])

  if (loading) return <p className="catalogo-estado">{t.cargando}</p>
  if (error) return <p className="catalogo-estado">{t.errorCarga}{error}</p>

  return (
    <div className="catalogo-grid">
      {espacios.map((espacio) => (
        <EspacioCard
          idioma={idioma}
          id={espacio.id}
          nombre={espacio.nombre}
          descripcion={espacio.descripcion}
          precioBase={espacio.precioBase}
          tipo={espacio.tipo}
          imagenes={espacio.imagenes}
          onVerDetalle={onAbrirDetalle}
          key={espacio.id}
        />
      ))}
    </div>
  )
}

export default EspacioList
