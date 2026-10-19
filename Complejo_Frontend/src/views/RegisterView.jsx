import React from 'react'
import RegisterForm from '../components/RegisterForm'

function RegisterView({ idioma, setIdioma, onLogin }) {
  return (
    <>
      <RegisterForm idioma={idioma} setIdioma={setIdioma} onLogin={onLogin} />
    </>
  )
}

export default RegisterView
