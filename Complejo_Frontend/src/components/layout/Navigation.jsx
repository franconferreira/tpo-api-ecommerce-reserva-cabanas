import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import NavAdmin from './NavAdmin'
import NavCliente from './NavCliente'
import './Navigation.css'

function Navigation({
  idioma,
  setIdioma,
  isLogged,
  rolUsuario,
  nombreUsuario,
  onLogout,
  onAbrirCarrito,
  cantidadCarrito,
  onAbrirBuzon,
  cantidadBuzon
}) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = () => {
    onLogout()
    navigate('/login')
  }

  const handleToggleIdioma = () => {
    setIdioma(idioma === 'es' ? 'en' : 'es')
  }

  if (rolUsuario === 'ROLE_ADMIN') {
    return (
      <NavAdmin
        idioma={idioma}
        onToggleIdioma={handleToggleIdioma}
        pathname={location.pathname}
        nombreUsuario={nombreUsuario}
        onSignOut={handleSignOut}
      />
    )
  }

  return (
    <NavCliente
      idioma={idioma}
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
  )
}

export default Navigation
