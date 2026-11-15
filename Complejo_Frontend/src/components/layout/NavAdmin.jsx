import React from 'react'
import { Link } from 'react-router-dom'
import textos from '../../i18n/textos'
import { BotonTema, IconoTema } from '../ornamentos/Ornamentos'

function NavAdmin({ idioma, tema, onToggleTema, onToggleIdioma, pathname, nombreUsuario, onSignOut }) {
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
            {pathname === '/admin/espacios' && <IconoTema className="nav-marca" />}
          </Link>
        </li>
        <li>
          <Link
            to="/admin/reservas"
            className={pathname === '/admin/reservas' ? 'nav-link active' : 'nav-link'}
          >
            {t.reservas}
            {pathname === '/admin/reservas' && <IconoTema className="nav-marca" />}
          </Link>
        </li>
        <li>
          <Link
            to="/admin/usuarios"
            className={pathname === '/admin/usuarios' ? 'nav-link active' : 'nav-link'}
          >
            {t.usuarios}
            {pathname === '/admin/usuarios' && <IconoTema className="nav-marca" />}
          </Link>
        </li>
        <li>
          <Link
            to="/admin/mapa-3d"
            className={pathname === '/admin/mapa-3d' ? 'nav-link active' : 'nav-link'}
          >
            🗺️ Editor Mapa 3D
            {pathname === '/admin/mapa-3d' && <IconoTema className="nav-marca" />}
          </Link>
        </li>
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
