import React from 'react'
import { Link } from 'react-router-dom'

function AuthBanner({ badge, title, description, footerText, panelClass, headerClass, brandClass, heroClass, badgeClass, footerClass }) {
  return (
    <div className={panelClass}>
      <div className={headerClass}>
        <Link to="/catalogo" className={brandClass}>
          🌲 Whispering Pines
        </Link>
      </div>

      <div className={heroClass}>
        <span className={badgeClass}>{badge}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <div className={footerClass}>
        <span>{footerText}</span>
      </div>
    </div>
  )
}

export default AuthBanner
