import React from 'react'
import LoginForm from '../components/LoginForm'

function LoginView({ idioma, setIdioma, onLogin }) {
  return (
    <>
      <LoginForm idioma={idioma} setIdioma={setIdioma} onLogin={onLogin} />
    </>
  )
}

export default LoginView
