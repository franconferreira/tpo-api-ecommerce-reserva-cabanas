import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthBanner from './AuthBanner'
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
      .then((res) => {
        if (!res.ok) {
          throw new Error('Credenciales incorrectas')
        }
        return res.json()
      })
      .then((data) => {
        if (data && data.token) {
          localStorage.setItem('jwtToken', data.token)
          setError('')
          onLogin(data.token)
        } else {
          setError('No se pudo iniciar sesion')
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
          <div className="login-header-titles">
            <span className="login-overline">WELCOME BACK</span>
            <h2>Guest Sign In</h2>
            <p>Enter your credentials to access your sanctuary account.</p>
          </div>

          {error && <p className="login-error">{error}</p>}

          <form onSubmit={(e) => e.preventDefault()} className="login-form">
            <div className="login-field">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={email}
                onChange={handleEmailChange}
              />
            </div>

            <div className="login-field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
              />
            </div>

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
