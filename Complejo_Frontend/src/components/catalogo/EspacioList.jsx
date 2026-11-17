import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import EspacioCard from './EspacioCard'
import { Divisor } from '../ornamentos/Ornamentos'
import textos from '../../i18n/textos'
import { fetchEspacios } from '../../Redux/espaciosSlice'
import './EspacioList.css'

// Grupos del catálogo, en el orden en que se muestran: cada uno junta uno o más tipos de espacio del back
const CATEGORIAS = [
  { clave: 'cabanas', tipos: ['CABANA'] },
  { clave: 'casa', tipos: ['HABITACION_CASA_PRINCIPAL', 'SALON_COMIDA_CASA_PRINCIPAL'] },
  { clave: 'galpon', tipos: ['GALPON_FIESTAS'] }
]

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
    <div className="catalogo-categorias">
      {CATEGORIAS.map((categoria) => {
        const lista = espacios.filter((espacio) => categoria.tipos.includes(espacio.tipo))
        // si una categoría no tiene espacios (por ejemplo, el admin los dio de baja), no se muestra su encabezado
        if (lista.length === 0) return null
        const textosCategoria = t.categorias[categoria.clave]
        return (
          <section className="catalogo-categoria" key={categoria.clave}>
            <header className="categoria-encabezado">
              <h3>{textosCategoria.titulo}</h3>
              <p>{textosCategoria.subtitulo}</p>
              <Divisor className="categoria-divisor" />
            </header>
            <div className="catalogo-grid">
              {lista.map((espacio, indice) => (
                <EspacioCard
                  idioma={idioma}
                  id={espacio.id}
                  nombre={espacio.nombre}
                  descripcion={espacio.descripcion}
                  precioBase={espacio.precioBase}
                  tipo={espacio.tipo}
                  imagenes={espacio.imagenes}
                  variante={indice % 3}
                  onVerDetalle={onAbrirDetalle}
                  key={espacio.id}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default EspacioList
