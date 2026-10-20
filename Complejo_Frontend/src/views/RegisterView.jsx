import React from 'react'
import AuthBanner from '../components/auth/AuthBanner'
import RegisterForm from '../components/auth/RegisterForm'
import textos from '../i18n/textos'
import './AuthView.css'

function RegisterView({ idioma, setIdioma, onLogin }) {
  const t = textos[idioma].registro

  return (
    <div className="auth-container auth-compacto">
      <AuthBanner
        badge={t.bannerBadge}
        title={t.bannerTitulo}
        description={t.bannerDescripcion}
        footerText="🌲 Whispering Pines Sanctuary & Retreats"
      />

      <RegisterForm idioma={idioma} setIdioma={setIdioma} onLogin={onLogin} />
    </div>
  )
}

export default RegisterView
