import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cruzarYNavegar } from '../../utils/fundido'

// Link que cambia de pantalla con un fundido cruzado (la pantalla actual se desvanece sobre la nueva).
// Si se hace clic con Ctrl/Cmd (abrir en otra pestaña) o ya se está en esa pantalla, funciona como un Link común.
function LinkFundido({ to, onClick, ...resto }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const alHacerClic = (e) => {
    if (onClick) onClick(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || to === pathname) return
    e.preventDefault()
    cruzarYNavegar(navigate, to)
  }

  return <Link to={to} {...resto} onClick={alHacerClic} />
}

export default LinkFundido
