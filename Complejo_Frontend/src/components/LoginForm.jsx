import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthBanner from './AuthBanner'
import AuthFormTitulos from './AuthFormTitulos'
import CampoFormulario from './CampoFormulario'
import './LoginForm.css'

function LoginForm({ idioma, setIdioma, onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const URL = 'http://localhost:8080/api/auth/login'
  const es = idioma === 'es'

  const handleEmailChange = (e) => setEmail(e.target.value)
  const handlePasswordChange = (e) => setPassword(e.target.value)
  const handleToggleIdioma = () => setIdioma(idioma === 'es' ? 'en' : 'es')

  const handleClick = () => {
    if (email.trim() === '' || password.trim() === '') {
      setError(es ? 'Los campos no pueden estar vacíos' : 'Fields cannot be empty')
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
          setError(es ? 'Email o contraseña incorrectos' : 'Invalid email or password')
        }
      })
      .catch((err) => {
        console.error('Error al iniciar sesion: ', err)
        setError(es ? 'Email o contraseña incorrectos' : 'Invalid email or password')
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
        badge={es ? '✨ SANTUARIO PRIVADO EN EL BOSQUE' : '✨ PRIVATE WOODLAND SANCTUARY'}
        title={es ? 'Regresa a la calma de los pinos.' : 'Return to the quiet of the pines.'}
        description={
          es
            ? 'Gestiona tus reservas de cabañas, explora senderos junto al lago y prepara tu próxima estadía.'
            : 'Manage your cabin reservations, explore lakeside trails, and prepare for your upcoming retreat.'
        }
        footerText="📍 Blue Ridge Mountains, NC"
      />

      <div className="login-right-panel">
        <div className="login-form-box">
          <div className="login-lang-bar">
            <button type="button" className="nav-btn-lang" onClick={handleToggleIdioma}>
              {es ? '🌐 ES | EN' : '🌐 EN | ES'}
            </button>
          </div>

          <AuthFormTitulos
            titlesClass="login-header-titles"
            overlineClass="login-overline"
            overline={es ? 'BIENVENIDO DE NUEVO' : 'WELCOME BACK'}
            title={es ? 'Iniciar Sesión' : 'Guest Sign In'}
            description={
              es
                ? 'Ingresa tus credenciales para acceder a tu cuenta del complejo.'
                : 'Enter your credentials to access your sanctuary account.'
            }
          />

          {error && <p className="login-error">{error}</p>}

          <form onSubmit={(e) => e.preventDefault()} className="login-form">
            <CampoFormulario
              className="login-field"
              label={es ? 'Correo Electrónico' : 'Email Address'}
              type="email"
              name="email"
              placeholder="name@example.com"
              value={email}
              onChange={handleEmailChange}
            />
            <CampoFormulario
              className="login-field"
              label={es ? 'Contraseña' : 'Password'}
              type="password"
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={handlePasswordChange}
            />

            <button type="submit" className="login-btn-submit" onClick={handleClick}>
              {es ? 'Ingresar a mi Cuenta ➔' : 'Sign In to Account ➔'}
            </button>
          </form>

          <div className="login-footer-links">
            <p>
              {es ? '¿Nuevo en Whispering Pines? ' : 'New to Whispering Pines? '}
              <Link to="/register">{es ? 'Crear una cuenta' : 'Create an account'}</Link>
            </p>
            <p className="login-back-home">
              <Link to="/catalogo">{es ? '← Volver al Catálogo' : '← Back to Catalog'}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
