import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthBanner from './AuthBanner'
import AuthFormTitulos from './AuthFormTitulos'
import CampoFormulario from './CampoFormulario'
import './LoginForm.css'

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const URL = 'http://localhost:8080/api/auth/login'

  const handleEmailChange = (e) => setEmail(e.target.value)
  const handlePasswordChange = (e) => setPassword(e.target.value)

  const handleClick = () => {
    if (email.trim() === '' || password.trim() === '') {
      setError('Los campos no pueden estar vacios')
      return
    }

    const datosAEnviar = {
      email: email,
      password: password
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosAEnviar)
    }

    fetch(URL, options)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.token) {
          localStorage.setItem('jwtToken', data.token)
          setError('')
          onLogin(data.token)
        } else {
          console.error('Error al iniciar sesion: ', data)
          setError('Email o contraseña incorrectos')
        }
      })
      .catch((err) => {
        console.error('Error al iniciar sesion: ', err)
        setError('Email o contraseña incorrectos')
      })
  }

  return (
    <div className="login-container">
      <AuthBanner
        panelClass="login-left-panel"
        headerClass="login-left-header"
        brandClass="login-brand"
        heroClass="login-left-hero"
        badgeClass="login-badge"
        footerClass="login-left-footer"
        badge="✨ PRIVATE WOODLAND SANCTUARY"
        title="Return to the quiet of the pines."
        description="Manage your cabin reservations, explore lakeside trails, and prepare for your upcoming retreat."
        footerText="📍 Blue Ridge Mountains, NC"
      />

      <div className="login-right-panel">
        <div className="login-form-box">
          <AuthFormTitulos
            titlesClass="login-header-titles"
            overlineClass="login-overline"
            overline="WELCOME BACK"
            title="Guest Sign In"
            description="Enter your credentials to access your sanctuary account."
          />

          {error && <p className="login-error">{error}</p>}

          <form onSubmit={(e) => e.preventDefault()} className="login-form">
            <CampoFormulario className="login-field" label="Email Address" type="email" name="email"
              placeholder="name@example.com" value={email} onChange={handleEmailChange} />
            <CampoFormulario className="login-field" label="Password" type="password" name="password"
              placeholder="••••••••" value={password} onChange={handlePasswordChange} />

            <button type="submit" className="login-btn-submit" onClick={handleClick}>
              Sign In to Account ➔
            </button>
          </form>

          <div className="login-footer-links">
            <p>
              New to Whispering Pines? <Link to="/register">Create an account</Link>
            </p>
            <p className="login-back-home">
              <Link to="/catalogo">← Back to Catalog</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
