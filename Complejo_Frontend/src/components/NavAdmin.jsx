import React from 'react'
import { Link } from 'react-router-dom'

function NavAdmin({ idioma, onToggleIdioma, pathname, nombreUsuario, onSignOut }) {
  const es = idioma === 'es'

  return (
    <nav className="nav-container admin-nav">
      <ul className="nav-list nav-brand">
        <li>
          <span className="nav-logo">Whispering Pines</span>
        </li>
        <li>
          <span className="nav-badge">{es ? 'CONSOLA STAFF' : 'STAFF CONSOLE'}</span>
        </li>
      </ul>

      <ul className="nav-list nav-pills">
        <li>
          <Link
            to="/admin/espacios"
            className={pathname === '/admin/espacios' ? 'nav-link active' : 'nav-link'}
          >
            {es ? 'Espacios' : 'Accommodations'}
          </Link>
        </li>
        <li>
          <Link
            to="/admin/reservas"
            className={pathname === '/admin/reservas' ? 'nav-link active' : 'nav-link'}
          >
            {es ? 'Reservas' : 'Guest Reservations'}
          </Link>
        </li>
        <li>
          <Link
            to="/admin/usuarios"
            className={pathname === '/admin/usuarios' ? 'nav-link active' : 'nav-link'}
          >
            {es ? 'Usuarios' : 'Client Accounts'}
          </Link>
        </li>
      </ul>

      <ul className="nav-list nav-actions">
        <li>
          <button type="button" className="nav-btn-lang" onClick={onToggleIdioma}>
            {es ? '🌐 ES | EN' : '🌐 EN | ES'}
          </button>
        </li>
        <li className="nav-user-info">
          <strong>{nombreUsuario || 'Admin'}</strong>
          <span>{es ? 'Administrador' : 'Super Admin'}</span>
        </li>
        <li>
          <button type="button" className="nav-btn-outline" onClick={onSignOut}>
            {es ? 'Cerrar Sesión' : 'Sign Out'}
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default NavAdmin
