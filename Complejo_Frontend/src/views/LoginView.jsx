import React from 'react'
import LoginForm from '../components/LoginForm'

function LoginView({ onLogin }) {
  return (
    <>
      <LoginForm onLogin={onLogin} />
    </>
  )
}

export default LoginView
