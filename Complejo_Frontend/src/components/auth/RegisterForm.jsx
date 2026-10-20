import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthFormTitulos from './AuthFormTitulos'
import CampoFormulario from '../ui/CampoFormulario'
import textos from '../../i18n/textos'
import { apiFetch } from '../../utils/api'
import './AuthForm.css'

function RegisterForm({ idioma, setIdioma, onLogin }) {
  const [username, setUsername] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const t = textos[idioma].registro

  const handleUsernameChange = (e) => setUsername(e.target.value)
  const handleNombreChange = (e) => setNombre(e.target.value)
  const handleApellidoChange = (e) => setApellido(e.target.value)
  const handleEmailChange = (e) => setEmail(e.target.value)
  const handlePasswordChange = (e) => setPassword(e.target.value)
  const handleToggleIdioma = () => setIdioma(idioma === 'es' ? 'en' : 'es')

  const handleClick = () => {
    if (
      username.trim() === '' ||
      nombre.trim() === '' ||
      apellido.trim() === '' ||
      email.trim() === '' ||
      password.trim() === ''
    ) {
      setError(t.errorVacios)
      return
    }

    const datosAEnviar = {
      username: username,
      nombre: nombre,
      apellido: apellido,
      email: email,
      password: password,
      rol: 'ROLE_CLIENTE'
    }

    apiFetch('/api/auth/register', { method: 'POST', body: datosAEnviar, auth: false })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.token) {
          localStorage.setItem('jwtToken', data.token)
          setError('')
          onLogin(data)
        } else {
          console.error('Error al registrar: ', data)
          setError(t.errorRegistro)
        }
      })
      .catch((err) => {
        console.error('Error al registrar: ', err)
        setError(t.errorRegistro)
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
            label={t.usuario}
            type="text"
            name="username"
            placeholder="eleanor_v"
            value={username}
            onChange={handleUsernameChange}
          />

          <div className="auth-row">
            <CampoFormulario
              className="auth-field"
              label={t.nombre}
              type="text"
              name="nombre"
              placeholder="Eleanor"
              value={nombre}
              onChange={handleNombreChange}
            />
            <CampoFormulario
              className="auth-field"
              label={t.apellido}
              type="text"
              name="apellido"
              placeholder="Vance"
              value={apellido}
              onChange={handleApellidoChange}
            />
          </div>

          <CampoFormulario
            className="auth-field"
            label={t.email}
            type="email"
            name="email"
            placeholder="eleanor.vance@haven.com"
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
            {t.yaTenesCuenta}
            <Link to="/login">{t.iniciarSesion}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterForm
