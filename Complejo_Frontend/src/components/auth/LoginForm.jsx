import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthFormTitulos from './AuthFormTitulos'
import CampoFormulario from '../ui/CampoFormulario'
import textos from '../../i18n/textos'
import { apiFetch } from '../../utils/api'
import './AuthForm.css'

function LoginForm({ idioma, setIdioma, onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const t = textos[idioma].login

  const handleEmailChange = (e) => setEmail(e.target.value)
  const handlePasswordChange = (e) => setPassword(e.target.value)
  const handleToggleIdioma = () => setIdioma(idioma === 'es' ? 'en' : 'es')

  const handleClick = () => {
    if (email.trim() === '' || password.trim() === '') {
      setError(t.errorVacios)
      return
    }

    const datosAEnviar = {
      email: email,
      password: password
    }

    apiFetch('/api/auth/login', { method: 'POST', body: datosAEnviar, auth: false })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.token) {
          localStorage.setItem('jwtToken', data.token)
          setError('')
          onLogin(data)
        } else {
          console.error('Error al iniciar sesion: ', data)
          setError(t.errorCredenciales)
        }
      })
      .catch((err) => {
        console.error('Error al iniciar sesion: ', err)
        setError(t.errorCredenciales)
      })
  }

  return (
    <div className="auth-panel-form">
      <div className="auth-form-box">
        <div className="auth-lang-bar">
          <button type="button" className="nav-btn-lang" onClick={handleToggleIdioma}>
            {textos[idioma].nav.idioma}
          </button>
        </div>

        <AuthFormTitulos overline={t.overline} title={t.titulo} description={t.descripcion} />

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={(e) => e.preventDefault()} className="auth-form">
          <CampoFormulario
            className="auth-field"
            label={t.email}
            type="email"
            name="email"
            placeholder="name@example.com"
            value={email}
            onChange={handleEmailChange}
          />
          <CampoFormulario
            className="auth-field"
            label={t.password}
            type="password"
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={handlePasswordChange}
          />

          <button type="submit" className="auth-btn-submit" onClick={handleClick}>
            {t.boton}
          </button>
        </form>

        <div className="auth-footer-links">
          <p>
            {t.nuevo}
            <Link to="/register">{t.crearCuenta}</Link>
          </p>
          <p className="auth-back-home">
            <Link to="/catalogo">{t.volver}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
