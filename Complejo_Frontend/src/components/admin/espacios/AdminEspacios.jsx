import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AdminEspacioForm from './AdminEspacioForm'
import AdminEspacioRow from './AdminEspacioRow'
import textos from '../../../i18n/textos'
import {
  fetchAdminEspacios,
  actualizarEspacio,
  cambiarEstadoEspacio
} from '../../../Redux/adminEspaciosSlice'
import './AdminEspacios.css'
import { EsquinasPanel } from '../../ornamentos/Ornamentos'

function AdminEspacios({ idioma }) {
  const dispatch = useDispatch()
  const { items: espacios, error, exito, guardadoId } = useSelector((state) => state.adminEspacios)
  const [errorPrecio, setErrorPrecio] = useState('')
  const t = textos[idioma].adminEspacios

  useEffect(() => {
    dispatch(fetchAdminEspacios())
  }, [dispatch])

  // Un único PUT cuando el admin confirma con el botón Guardar.
  // El precio que se va escribiendo vive en el estado local de cada fila.
  const handleGuardarPrecio = (espacio, precioEscrito) => {
    const nuevoPrecio = Number(precioEscrito)
    if (!nuevoPrecio || nuevoPrecio <= 0) {
      setErrorPrecio(t.errorPrecioInvalido)
      return
    }

    setErrorPrecio('')
    dispatch(actualizarEspacio({ ...espacio, precioBase: nuevoPrecio }))
  }

  const handleToggleEstado = (espacio) => {
    setErrorPrecio('')
    dispatch(cambiarEstadoEspacio(espacio))
  }

  // Los mensajes se arman acá (y no en el slice) porque dependen del idioma
  let mensajeError = errorPrecio
  if (!mensajeError && error === 'precio') mensajeError = t.errorPrecio
  if (!mensajeError && error === 'estado') mensajeError = t.errorEstado

  let mensajeExito = ''
  if (exito && exito.tipo === 'precio') {
    mensajeExito = t.precioActualizado(exito.nombre, exito.precioBase)
  } else if (exito && exito.tipo === 'estado') {
    mensajeExito = exito.activo ? t.reactivado(exito.nombre) : t.enMantenimiento(exito.nombre)
  }

  return (
    <>
      <AdminEspacioForm idioma={idioma} />

      {mensajeError && <p className="ad-error">{mensajeError}</p>}
      {!mensajeError && mensajeExito && <p className="ad-success">{mensajeExito}</p>}

      <div className="ad-table-container">
        <EsquinasPanel variante={0} />
        <table className="ad-table">
          <thead>
            <tr>
              <th>{t.colEspacio}</th>
              <th>{t.colCategoria}</th>
              <th>{t.colTarifa}</th>
              <th>{t.colEstado}</th>
            </tr>
          </thead>
          <tbody>
            {espacios.map((espacio) => (
              <AdminEspacioRow
                idioma={idioma}
                espacio={espacio}
                guardado={guardadoId === espacio.id}
                onGuardarPrecio={handleGuardarPrecio}
                onToggleEstado={handleToggleEstado}
                key={espacio.id}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default AdminEspacios
