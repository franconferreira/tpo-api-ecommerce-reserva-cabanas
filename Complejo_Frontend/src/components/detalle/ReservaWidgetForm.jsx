import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import CalendarioDisponibilidad from './CalendarioDisponibilidad'
import textos from '../../i18n/textos'
import { agregarAlCarrito, limpiarErroresCarrito } from '../../Redux/carritoSlice'
import {
  diaSiguienteIso,
  sonFechasConsecutivas,
  calcularPrecioSeleccionado
} from '../../utils/fechas'
import './ReservaWidgetForm.css'

function ReservaWidgetForm({ idioma, espacio }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isLogged = useSelector((state) => state.auth.isLogged)
  const errorAgregar = useSelector((state) => state.carrito.errorAgregar)
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState([])
  const [error, setError] = useState('')
  const t = textos[idioma].widget
  const tDetalle = textos[idioma].detalle

  // Al abrir el detalle de otro espacio no se tiene que ver el error del anterior
  useEffect(() => {
    dispatch(limpiarErroresCarrito())
  }, [dispatch])

  const precioMostrado = calcularPrecioSeleccionado(espacio.precioBase, fechasSeleccionadas)
  const sufijoPrecio =
    fechasSeleccionadas.length === 0
      ? textos[idioma].comun.porNocheSufijo
      : t.nochesSeleccionadas(fechasSeleccionadas.length)

  if (espacio.tipo === 'SALON_COMIDA_CASA_PRINCIPAL') {
    return (
      <div className="widget-reserva salon-comunal-box">
        <h3 className="salon-comunal-title">{tDetalle.infoSalonTitulo}</h3>
        <p className="salon-comunal-text">
          {tDetalle.infoSalonTexto}
        </p>
        <button
          type="button"
          className="wr-submit-btn"
          onClick={() => navigate('/catalogo')}
        >
          {tDetalle.botonVerHabitaciones || '← Explorar Habitaciones'}
        </button>
      </div>
    )
  }

  const handleClick = () => {
    if (!isLogged) {
      navigate('/login')
      return
    }

    if (fechasSeleccionadas.length === 0) {
      setError(t.errorFechas)
      return
    }

    const fechasOrdenadas = [...fechasSeleccionadas].sort()

    if (!sonFechasConsecutivas(fechasOrdenadas)) {
      setError(t.errorConsecutivas)
      return
    }

    const checkIn = fechasOrdenadas[0]
    const ultimaNoche = fechasOrdenadas[fechasOrdenadas.length - 1]
    const checkOut = diaSiguienteIso(ultimaNoche)

    const datosAEnviar = {
      espacioId: espacio.id,
      checkIn: checkIn,
      checkOut: checkOut
    }

    setError('')
    // Si sale bien, el slice guarda el carrito nuevo y lo abre
    dispatch(agregarAlCarrito(datosAEnviar))
  }

  const mensajeError = error || (errorAgregar ? t.errorDisponible : '')

  return (
    <div className="widget-reserva">
      <CalendarioDisponibilidad
        idioma={idioma}
        espacioId={espacio.id}
        fechasSeleccionadas={fechasSeleccionadas}
        setFechasSeleccionadas={setFechasSeleccionadas}
      />

      <div className="wr-header">
        <div className="wr-price-block">
          <span className="wr-price-big">USD ${precioMostrado}</span>
          <span className="wr-price-suffix">{sufijoPrecio}</span>
        </div>
      </div>

      {mensajeError && <p className="wr-error">{mensajeError}</p>}

      <form onSubmit={(e) => e.preventDefault()}>
        <button type="submit" className="wr-submit-btn" onClick={handleClick}>
          {t.boton}
        </button>
      </form>
    </div>
  )
}

export default ReservaWidgetForm
