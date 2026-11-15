import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import AuthFormTitulos from './AuthFormTitulos'
import CampoFormulario from '../ui/CampoFormulario'
import textos from '../../i18n/textos'
import { login, limpiarAvisos } from '../../Redux/authSlice'
import './AuthForm.css'
import { EsquinasPanel, BotonTema } from '../ornamentos/Ornamentos'

function LoginForm({ idioma, setIdioma, tema, onToggleTema }) {
  const dispatch = useDispatch()
  const { cuentaDesactivada, errorLogin } = useSelector((state) => state.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const t = textos[idioma].login

  // Al volver a escribir se borran los avisos del intento anterior
  const limpiarMensajes = () => {
    setError('')
    if (cuentaDesactivada || errorLogin) {
      dispatch(limpiarAvisos())
    }
  }

  const handleEmailChange = (e) => {
    limpiarMensajes()
    setEmail(e.target.value)
  }

  const handlePasswordChange = (e) => {
    limpiarMensajes()
    setPassword(e.target.value)
  }

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

    // Si sale bien, el slice marca al usuario como logueado y App lo redirige según su rol
    setError('')
    dispatch(login(datosAEnviar))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleClick()
  }

  let mensajeError = error
  if (!mensajeError && cuentaDesactivada) {
    mensajeError = t.errorCuentaDesactivada
  } else if (!mensajeError && errorLogin) {
    mensajeError = t.errorCredenciales
  }

  return (
    <div className="auth-panel-form">
      <div className="auth-form-box">
        <EsquinasPanel variante={2} />
        <div className="auth-lang-bar">
          <BotonTema tema={tema} onToggle={onToggleTema} idioma={idioma} />
          <button type="button" className="nav-btn-lang" onClick={handleToggleIdioma}>
            {textos[idioma].nav.idioma}
          </button>
        </div>

        <AuthFormTitulos overline={t.overline} title={t.titulo} description={t.descripcion} />

        {mensajeError && <p className="auth-error">{mensajeError}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
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

          <button type="submit" className="auth-btn-submit">
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
