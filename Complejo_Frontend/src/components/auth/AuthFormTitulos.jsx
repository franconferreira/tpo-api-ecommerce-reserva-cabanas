import React from 'react'

function AuthFormTitulos({ overline, title, description }) {
  return (
    <div className="auth-header-titles">
      <span className="auth-overline">{overline}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  )
}

export default AuthFormTitulos
