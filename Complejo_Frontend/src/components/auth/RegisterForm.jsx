import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import AuthFormTitulos from './AuthFormTitulos'
import CampoFormulario from '../ui/CampoFormulario'
import textos from '../../i18n/textos'
import { register, limpiarAvisos } from '../../Redux/authSlice'
import './AuthForm.css'
import { EsquinasPanel, BotonTema } from '../ornamentos/Ornamentos'

function RegisterForm({ idioma, setIdioma, tema, onToggleTema }) {
  const dispatch = useDispatch()
  const errorRegistro = useSelector((state) => state.auth.errorRegistro)
  const [username, setUsername] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const t = textos[idioma].registro

  // Al entrar a la pantalla no se tiene que ver el error de un registro anterior
  useEffect(() => {
    dispatch(limpiarAvisos())
  }, [dispatch])

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
      password: password
    }

    // Si sale bien, el slice marca al usuario como logueado y App lo manda al catálogo
    setError('')
    dispatch(register(datosAEnviar))
  }

  const mensajeError = error || (errorRegistro ? t.errorRegistro : '')

  const handleSubmit = (e) => {
    e.preventDefault()
    handleClick()
  }

  return (
    <div className="auth-panel-form">
      <div className="auth-form-box">
        <EsquinasPanel variante={0} />
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

          <button type="submit" className="auth-btn-submit">
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
