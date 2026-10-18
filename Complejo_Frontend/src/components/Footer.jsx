import React from 'react'
import { useLocation } from 'react-router-dom'
import './Footer.css'

function Footer() {
  const location = useLocation()

  if (location.pathname === '/login' || location.pathname === '/register') {
    return null
  }

  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand">
          <strong>🌲 Whispering Pines Sanctuary</strong>
          <span> — Woodland Retreats & Accommodations</span>
        </div>
        <p className="footer-copy">
          © 2026 Whispering Pines Sanctuary & Retreats. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
