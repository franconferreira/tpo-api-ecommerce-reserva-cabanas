import React from 'react'
import { Link } from 'react-router-dom'
import './AuthBanner.css'

function AuthBanner({ badge, title, description, footerText }) {
  return (
    <div className="auth-banner">
      <div>
        <Link to="/catalogo" className="auth-brand">
          🌲 Whispering Pines
        </Link>
      </div>

      <div className="auth-banner-hero">
        <span className="auth-badge">{badge}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <div className="auth-banner-footer">
        <span>{footerText}</span>
      </div>
    </div>
  )
}

export default AuthBanner
