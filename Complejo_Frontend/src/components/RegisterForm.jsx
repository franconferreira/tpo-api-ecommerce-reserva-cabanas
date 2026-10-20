import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthFormTitulos from './AuthFormTitulos'
import CampoFormulario from './CampoFormulario'
import './RegisterForm.css'

function RegisterForm({ idioma, setIdioma, onLogin }) {
  const [username, setUsername] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const URL = 'http://localhost:8080/api/auth/register'
  const es = idioma === 'es'

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
      setError(es ? 'Todos los campos son obligatorios' : 'All fields are required')
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
          onLogin(data)
        } else {
          console.error('Error al registrar: ', data)
          setError(
            es
              ? 'El usuario o email ya se encuentra registrado'
              : 'Username or email is already registered'
          )
        }
      })
      .catch((err) => {
        console.error('Error al registrar: ', err)
        setError(
          es
            ? 'El usuario o email ya se encuentra registrado'
            : 'Username or email is already registered'
        )
      })
  }

  return (
    <div className="register-right-panel">
      <div className="register-form-box">
        <div className="register-lang-bar">
          <button type="button" className="nav-btn-lang" onClick={handleToggleIdioma}>
            {es ? '🌐 ES | EN' : '🌐 EN | ES'}
          </button>
        </div>

        <AuthFormTitulos
          titlesClass="register-header-titles"
          overlineClass="register-overline"
          overline={es ? 'REGISTRO DE NUEVO HUÉSPED' : 'NEW GUEST REGISTRATION'}
          title={es ? 'Crear Cuenta' : 'Create Your Account'}
          description={
            es
              ? 'Completa tus datos para reservar estadías en el complejo.'
              : 'Complete your details to reserve stays across the sanctuary.'
          }
        />

        {error && <p className="register-error">{error}</p>}

        <form onSubmit={(e) => e.preventDefault()} className="register-form">
          <CampoFormulario
            className="register-field"
            label={es ? 'Usuario' : 'Username'}
            type="text"
            name="username"
            placeholder="eleanor_v"
            value={username}
            onChange={handleUsernameChange}
          />

          <div className="register-row">
            <CampoFormulario
              className="register-field"
              label={es ? 'Nombre' : 'First Name'}
              type="text"
              name="nombre"
              placeholder="Eleanor"
              value={nombre}
              onChange={handleNombreChange}
            />
            <CampoFormulario
              className="register-field"
              label={es ? 'Apellido' : 'Last Name'}
              type="text"
              name="apellido"
              placeholder="Vance"
              value={apellido}
              onChange={handleApellidoChange}
            />
          </div>

          <CampoFormulario
            className="register-field"
            label={es ? 'Correo Electrónico' : 'Email Address'}
            type="email"
            name="email"
            placeholder="eleanor.vance@haven.com"
            value={email}
            onChange={handleEmailChange}
          />
          <CampoFormulario
            className="register-field"
            label={es ? 'Contraseña' : 'Password'}
            type="password"
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={handlePasswordChange}
          />

          <button type="submit" className="register-btn-submit" onClick={handleClick}>
            {es ? 'Crear Cuenta ➔' : 'Create Account ➔'}
          </button>
        </form>

        <div className="register-footer-links">
          <p>
            {es ? '¿Ya tienes una cuenta? ' : 'Already have an account? '}
            <Link to="/login">{es ? 'Iniciar sesión' : 'Sign in'}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterForm
