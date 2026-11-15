import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import NavAdmin from './NavAdmin'
import NavCliente from './NavCliente'
import { abrirCarrito } from '../../Redux/carritoSlice'
import { Friso } from '../ornamentos/Ornamentos'
import './Navigation.css'

function Navigation({ idioma, setIdioma, tema, onToggleTema, onLogout, onAbrirBuzon }) {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  // Datos del estado global: no hace falta que App los pase por props
  const { isLogged, rol: rolUsuario, nombreUsuario } = useSelector((state) => state.auth)
  const cantidadCarrito = useSelector((state) => state.carrito.data.items.length)
  const cantidadBuzon = useSelector((state) => state.reservas.notificaciones.length)

  const onAbrirCarrito = () => {
    dispatch(abrirCarrito())
  }

  const handleSignOut = () => {
    onLogout()
    navigate('/login')
  }

  const handleToggleIdioma = () => {
    setIdioma(idioma === 'es' ? 'en' : 'es')
  }

  if (rolUsuario === 'ROLE_ADMIN') {
    return (
      <>
      <NavAdmin
        idioma={idioma}
        tema={tema}
        onToggleTema={onToggleTema}
        onToggleIdioma={handleToggleIdioma}
        pathname={location.pathname}
        nombreUsuario={nombreUsuario}
        onSignOut={handleSignOut}
      />
      <Friso className="friso-nav" />
      </>
    )
  }

  return (
    <>
    <NavCliente
      idioma={idioma}
      tema={tema}
      onToggleTema={onToggleTema}
      onToggleIdioma={handleToggleIdioma}
      pathname={location.pathname}
      isLogged={isLogged}
      nombreUsuario={nombreUsuario}
      cantidadCarrito={cantidadCarrito}
      onAbrirCarrito={onAbrirCarrito}
      cantidadBuzon={cantidadBuzon}
      onAbrirBuzon={onAbrirBuzon}
      onSignOut={handleSignOut}
    />
    <Friso className="friso-nav" />
    </>
  )
}

export default Navigation
