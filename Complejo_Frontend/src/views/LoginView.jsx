import React from 'react'
import AuthBanner from '../components/auth/AuthBanner'
import LoginForm from '../components/auth/LoginForm'
import textos from '../i18n/textos'
import './AuthView.css'

function LoginView({ idioma, setIdioma }) {
  const t = textos[idioma].login

  return (
    <div className="auth-container">
      <AuthBanner
        badge={t.bannerBadge}
        title={t.bannerTitulo}
        description={t.bannerDescripcion}
        footerText="📍 Blue Ridge Mountains, NC"
      />

      <LoginForm idioma={idioma} setIdioma={setIdioma} />
    </div>
  )
}

export default LoginView
