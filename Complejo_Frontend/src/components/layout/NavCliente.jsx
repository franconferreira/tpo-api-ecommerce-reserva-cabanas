import React from 'react'
import { Link } from 'react-router-dom'
import textos from '../../i18n/textos'

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
  const t = textos[idioma].nav

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
            {t.explorar}
          </Link>
        </li>
        {isLogged && (
          <li>
            <Link
              to="/mis-reservas"
              className={pathname === '/mis-reservas' ? 'nav-link active-text' : 'nav-link'}
            >
              {t.misReservas}
            </Link>
          </li>
        )}
      </ul>

      <ul className="nav-list nav-actions">
        <li>
          <button type="button" className="nav-btn-lang" onClick={onToggleIdioma}>
            {t.idioma}
          </button>
        </li>
        {isLogged && (
          <>
            <li>
              <button
                type="button"
                className={cantidadBuzon > 0 ? 'nav-btn-buzon has-unread' : 'nav-btn-buzon'}
                onClick={onAbrirBuzon}
              >
                📬 {t.buzon} ({cantidadBuzon})
              </button>
            </li>
            <li>
              <button type="button" className="nav-btn-cart" onClick={onAbrirCarrito}>
                🛍️ {t.carrito} ({cantidadCarrito})
              </button>
            </li>
          </>
        )}
        {isLogged ? (
          <>
            <li className="nav-user-info">
              <strong>{nombreUsuario || textos[idioma].comun.huesped}</strong>
            </li>
            <li>
              <button type="button" className="nav-btn-outline" onClick={onSignOut}>
                {t.cerrarSesion}
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="nav-link">
                {t.iniciarSesion}
              </Link>
            </li>
            <li>
              <Link to="/register" className="nav-btn-primary">
                {t.registrarse}
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}

export default NavCliente
