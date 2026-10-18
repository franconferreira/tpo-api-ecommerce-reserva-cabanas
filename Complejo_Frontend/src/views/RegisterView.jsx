import React from 'react'
import RegisterForm from '../components/RegisterForm'

function RegisterView({ onLogin }) {
  return (
    <>
      <RegisterForm onLogin={onLogin} />
    </>
  )
}

export default RegisterView
