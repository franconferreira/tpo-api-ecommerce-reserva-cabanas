import React from 'react'
import { Link } from 'react-router-dom'
import textos from '../../i18n/textos'

function NavAdmin({ idioma, onToggleIdioma, pathname, nombreUsuario, onSignOut }) {
  const t = textos[idioma].nav

  return (
    <nav className="nav-container admin-nav">
      <ul className="nav-list nav-brand">
        <li>
          <span className="nav-logo">Whispering Pines</span>
        </li>
        <li>
          <span className="nav-badge">{t.consolaStaff}</span>
        </li>
      </ul>

      <ul className="nav-list nav-pills">
        <li>
          <Link
            to="/admin/espacios"
            className={pathname === '/admin/espacios' ? 'nav-link active' : 'nav-link'}
          >
            {t.espacios}
          </Link>
        </li>
        <li>
          <Link
            to="/admin/reservas"
            className={pathname === '/admin/reservas' ? 'nav-link active' : 'nav-link'}
          >
            {t.reservas}
          </Link>
        </li>
        <li>
          <Link
            to="/admin/usuarios"
            className={pathname === '/admin/usuarios' ? 'nav-link active' : 'nav-link'}
          >
            {t.usuarios}
          </Link>
        </li>
      </ul>

      <ul className="nav-list nav-actions">
        <li>
          <button type="button" className="nav-btn-lang" onClick={onToggleIdioma}>
            {t.idioma}
          </button>
        </li>
        <li className="nav-user-info">
          <strong>{nombreUsuario || 'Admin'}</strong>
          <span>{t.rolAdmin}</span>
        </li>
        <li>
          <button type="button" className="nav-btn-outline" onClick={onSignOut}>
            {t.cerrarSesion}
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default NavAdmin
