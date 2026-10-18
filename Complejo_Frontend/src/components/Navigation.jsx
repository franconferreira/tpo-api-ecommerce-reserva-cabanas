import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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
      <nav className="nav-container admin-nav">
        <div className="nav-brand">
          <span className="nav-logo">Whispering Pines</span>
          <span className="nav-badge">STAFF CONSOLE</span>
        </div>

        <ul className="nav-list nav-pills">
          <li>
            <Link
              to="/admin/espacios"
              className={location.pathname === '/admin/espacios' ? 'nav-link active' : 'nav-link'}
            >
              Accommodations
            </Link>
          </li>
          <li>
            <Link
              to="/admin/reservas"
              className={location.pathname === '/admin/reservas' ? 'nav-link active' : 'nav-link'}
            >
              Guest Reservations
            </Link>
          </li>
          <li>
            <Link
              to="/admin/usuarios"
              className={location.pathname === '/admin/usuarios' ? 'nav-link active' : 'nav-link'}
            >
              Client Accounts
            </Link>
          </li>
        </ul>

        <ul className="nav-list nav-actions">
          <li className="nav-user-info">
            <strong>{nombreUsuario || 'Admin'}</strong>
            <span>Super Admin</span>
          </li>
          <li>
            <button type="button" className="nav-btn-outline" onClick={handleSignOut}>
              Sign Out
            </button>
          </li>
        </ul>
      </nav>
    )
  }

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
            className={location.pathname === '/catalogo' || location.pathname === '/' ? 'nav-link active-text' : 'nav-link'}
          >
            Explore Spaces
          </Link>
        </li>
        {isLogged && (
          <li>
            <Link
              to="/mis-reservas"
              className={location.pathname === '/mis-reservas' ? 'nav-link active-text' : 'nav-link'}
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
              <button type="button" className="nav-btn-outline" onClick={handleSignOut}>
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

export default Navigation
