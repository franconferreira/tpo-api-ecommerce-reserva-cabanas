import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import NavAdmin from './NavAdmin'
import NavCliente from './NavCliente'
import './Navigation.css'

function Navigation({ isLogged, rolUsuario, nombreUsuario, onLogout, onAbrirCarrito, cantidadCarrito }) {
  const navigate = useNavigate()
  const location = useLocation()

  if (location.pathname === '/login' || location.pathname === '/register') {
    return null
  }

  const handleSignOut = () => {
    onLogout()
    navigate('/login')
  }

  if (rolUsuario === 'ROLE_ADMIN') {
    return (
      <NavAdmin
        pathname={location.pathname}
        nombreUsuario={nombreUsuario}
        onSignOut={handleSignOut}
      />
    )
  }

  return (
    <NavCliente
      pathname={location.pathname}
      isLogged={isLogged}
      nombreUsuario={nombreUsuario}
      cantidadCarrito={cantidadCarrito}
      onAbrirCarrito={onAbrirCarrito}
      onSignOut={handleSignOut}
    />
  )
}

export default Navigation
