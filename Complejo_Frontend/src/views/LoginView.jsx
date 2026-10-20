import React from 'react'
import AuthBanner from '../components/AuthBanner'
import LoginForm from '../components/LoginForm'

function LoginView({ idioma, setIdioma, onLogin }) {
  const es = idioma === 'es'

  return (
    <div className="login-container">
      <AuthBanner
        panelClass="login-left-panel"
        headerClass="login-left-header"
        brandClass="login-brand"
        heroClass="login-left-hero"
        badgeClass="login-badge"
        footerClass="login-left-footer"
        badge={es ? '✨ SANTUARIO PRIVADO EN EL BOSQUE' : '✨ PRIVATE WOODLAND SANCTUARY'}
        title={es ? 'Regresa a la calma de los pinos.' : 'Return to the quiet of the pines.'}
        description={
          es
            ? 'Gestiona tus reservas de cabañas, explora senderos junto al lago y prepara tu próxima estadía.'
            : 'Manage your cabin reservations, explore lakeside trails, and prepare for your upcoming retreat.'
        }
        footerText="📍 Blue Ridge Mountains, NC"
      />

      <LoginForm idioma={idioma} setIdioma={setIdioma} onLogin={onLogin} />
    </div>
  )
}

export default LoginView
