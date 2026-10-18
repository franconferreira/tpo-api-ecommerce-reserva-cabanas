import React from 'react'
import { Link } from 'react-router-dom'

function NavCliente({ pathname, isLogged, nombreUsuario, cantidadCarrito, onAbrirCarrito, onSignOut }) {
  return (
    <nav className="nav-container">
      <div className="nav-brand">
        <Link to="/catalogo" className="nav-logo">
          🌲 Whispering Pines
        </Link>
      </div>

      <ul className="nav-list">
        <li>
          <Link
            to="/catalogo"
            className={pathname === '/catalogo' || pathname === '/' ? 'nav-link active-text' : 'nav-link'}
          >
            Explore Spaces
          </Link>
        </li>
        {isLogged && (
          <li>
            <Link
              to="/mis-reservas"
              className={pathname === '/mis-reservas' ? 'nav-link active-text' : 'nav-link'}
            >
              My Reservations
            </Link>
          </li>
        )}
      </ul>

      <ul className="nav-list nav-actions">
        {isLogged && (
          <li>
            <button type="button" className="nav-btn-cart" onClick={onAbrirCarrito}>
              🛍️ Cart ({cantidadCarrito})
            </button>
          </li>
        )}
        {isLogged ? (
          <>
            <li className="nav-user-info">
              <strong>{nombreUsuario || 'Guest'}</strong>
            </li>
            <li>
              <button type="button" className="nav-btn-outline" onClick={onSignOut}>
                Sign Out
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="nav-link">
                Sign In
              </Link>
            </li>
            <li>
              <Link to="/register" className="nav-btn-primary">
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}

export default NavCliente
