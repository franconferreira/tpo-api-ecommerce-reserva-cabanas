import React from 'react'
import { Link } from 'react-router-dom'

function NavAdmin({ pathname, nombreUsuario, onSignOut }) {
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
            className={pathname === '/admin/espacios' ? 'nav-link active' : 'nav-link'}
          >
            Accommodations
          </Link>
        </li>
        <li>
          <Link
            to="/admin/reservas"
            className={pathname === '/admin/reservas' ? 'nav-link active' : 'nav-link'}
          >
            Guest Reservations
          </Link>
        </li>
        <li>
          <Link
            to="/admin/usuarios"
            className={pathname === '/admin/usuarios' ? 'nav-link active' : 'nav-link'}
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
          <button type="button" className="nav-btn-outline" onClick={onSignOut}>
            Sign Out
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default NavAdmin
