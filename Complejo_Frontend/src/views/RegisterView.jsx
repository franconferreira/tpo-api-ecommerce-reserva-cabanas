import React from 'react'
import AuthBanner from '../components/AuthBanner'
import RegisterForm from '../components/RegisterForm'

function RegisterView({ idioma, setIdioma, onLogin }) {
  const es = idioma === 'es'

  return (
    <div className="register-container">
      <AuthBanner
        panelClass="register-left-panel"
        headerClass="register-left-header"
        brandClass="register-brand"
        heroClass="register-left-hero"
        badgeClass="register-badge"
        footerClass="register-left-footer"
        badge={es ? '🏕️ ÚNETE AL COMPLEJO' : '🏕️ JOIN THE SANCTUARY'}
        title={es ? 'Comienza tu tradición en el bosque.' : 'Begin your woodland tradition.'}
        description={
          es
            ? 'Crea tu perfil de huésped para reservar cabañas, salones de eventos y actividades en la laguna.'
            : 'Create your guest profile to reserve cabins, event barns, and lakeside activities with member benefits.'
        }
        footerText="🌲 Whispering Pines Sanctuary & Retreats"
      />

      <RegisterForm idioma={idioma} setIdioma={setIdioma} onLogin={onLogin} />
    </div>
  )
}

export default RegisterView
