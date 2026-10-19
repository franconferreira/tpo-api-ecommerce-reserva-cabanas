import React from 'react'

function BuzonButton({ idioma, cantidad, onAbrirBuzon }) {
  const es = idioma === 'es'

  return (
    <button
      type="button"
      className={cantidad > 0 ? 'nav-btn-buzon has-unread' : 'nav-btn-buzon'}
      onClick={onAbrirBuzon}
    >
      📬 {es ? 'Buzón' : 'Inbox'} ({cantidad})
    </button>
  )
}

export default BuzonButton
