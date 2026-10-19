import React from 'react'
import { Link } from 'react-router-dom'
import BuzonButton from './BuzonButton'

function NavCliente({
  idioma,
  onToggleIdioma,
  pathname,
  isLogged,
  nombreUsuario,
  cantidadCarrito,
  onAbrirCarrito,
  cantidadBuzon,
  onAbrirBuzon,
  onSignOut
}) {
  const es = idioma === 'es'

  return (
    <nav className="nav-container">
      <ul className="nav-list nav-brand">
        <li>
          <Link to="/catalogo" className="nav-logo">
            🌲 Whispering Pines
          </Link>
        </li>
      </ul>

      <ul className="nav-list">
        <li>
          <Link
            to="/catalogo"
            className={pathname === '/catalogo' || pathname === '/' ? 'nav-link active-text' : 'nav-link'}
          >
            {es ? 'Explorar Espacios' : 'Explore Spaces'}
          </Link>
        </li>
        {isLogged && (
          <li>
            <Link
              to="/mis-reservas"
              className={pathname === '/mis-reservas' ? 'nav-link active-text' : 'nav-link'}
            >
              {es ? 'Mis Reservas' : 'My Reservations'}
            </Link>
          </li>
        )}
      </ul>

      <ul className="nav-list nav-actions">
        <li>
          <button type="button" className="nav-btn-lang" onClick={onToggleIdioma}>
            {es ? '🌐 ES | EN' : '🌐 EN | ES'}
          </button>
        </li>
        {isLogged && (
          <>
            <li>
              <BuzonButton
                idioma={idioma}
                cantidad={cantidadBuzon}
                onAbrirBuzon={onAbrirBuzon}
              />
            </li>
            <li>
              <button type="button" className="nav-btn-cart" onClick={onAbrirCarrito}>
                🛍️ {es ? 'Carrito' : 'Cart'} ({cantidadCarrito})
              </button>
            </li>
          </>
        )}
        {isLogged ? (
          <>
            <li className="nav-user-info">
              <strong>{nombreUsuario || (es ? 'Huésped' : 'Guest')}</strong>
            </li>
            <li>
              <button type="button" className="nav-btn-outline" onClick={onSignOut}>
                {es ? 'Cerrar Sesión' : 'Sign Out'}
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="nav-link">
                {es ? 'Iniciar Sesión' : 'Sign In'}
              </Link>
            </li>
            <li>
              <Link to="/register" className="nav-btn-primary">
                {es ? 'Registrarse' : 'Register'}
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}

export default NavCliente
