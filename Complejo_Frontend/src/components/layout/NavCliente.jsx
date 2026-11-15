import React from 'react'
import { Link } from 'react-router-dom'
import textos from '../../i18n/textos'
import { BotonTema, IconoTema } from '../ornamentos/Ornamentos'

function NavCliente({
  idioma,
  tema,
  onToggleTema,
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
            {(pathname === '/catalogo' || pathname === '/') && <IconoTema className="nav-marca" />}
          </Link>
        </li>
        <li>
          <Link
            to="/mapa-3d"
            className={pathname === '/mapa-3d' ? 'nav-link active-text' : 'nav-link'}
          >
            🗺️ Recorrido 3D
            {pathname === '/mapa-3d' && <IconoTema className="nav-marca" />}
          </Link>
        </li>
        {isLogged && (
          <li>
            <Link
              to="/mis-reservas"
              className={pathname === '/mis-reservas' ? 'nav-link active-text' : 'nav-link'}
            >
              {t.misReservas}
            {pathname === '/mis-reservas' && <IconoTema className="nav-marca" />}
            </Link>
          </li>
        )}
      </ul>

      <ul className="nav-list nav-actions">
        <li>
          <BotonTema tema={tema} onToggle={onToggleTema} idioma={idioma} />
        </li>
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
                className={cantidadBuzon > 0 ? 'nav-icon-btn nav-btn-buzon has-unread' : 'nav-icon-btn nav-btn-buzon'}
                onClick={onAbrirBuzon}
                title={t.buzon}
                aria-label={t.buzon}
              >
                <svg
                  className="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                {cantidadBuzon > 0 && (
                  <span className="nav-icon-badge">{cantidadBuzon}</span>
                )}
              </button>
            </li>
            <li>
              <button
                type="button"
                className="nav-icon-btn nav-btn-cart"
                onClick={onAbrirCarrito}
                title={t.carrito}
                aria-label={t.carrito}
              >
                <svg
                  className="nav-icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
                {cantidadCarrito > 0 && (
                  <span className="nav-icon-badge">{cantidadCarrito}</span>
                )}
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
