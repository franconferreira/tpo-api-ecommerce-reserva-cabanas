import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthBanner from './AuthBanner'
import './RegisterForm.css'

function RegisterForm({ onLogin }) {
  const [username, setUsername] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const URL = 'http://localhost:8080/api/auth/register'

  const handleUsernameChange = (e) => setUsername(e.target.value)
  const handleNombreChange = (e) => setNombre(e.target.value)
  const handleApellidoChange = (e) => setApellido(e.target.value)
  const handleEmailChange = (e) => setEmail(e.target.value)
  const handlePasswordChange = (e) => setPassword(e.target.value)

  const handleClick = () => {
    if (
      username.trim() === '' ||
      nombre.trim() === '' ||
      apellido.trim() === '' ||
      email.trim() === '' ||
      password.trim() === ''
    ) {
      setError('Todos los campos son obligatorios')
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
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error al registrar usuario')
        }
        return res.json()
      })
      .then((data) => {
        if (data && data.token) {
          localStorage.setItem('jwtToken', data.token)
          setError('')
          onLogin(data.token)
        } else {
          setError('No se pudo completar el registro')
        }
      })
      .catch((err) => {
        console.error('Error al registrar: ', err)
        setError('El usuario o email ya se encuentra registrado')
      })
  }

  return (
    <div className="register-container">
      <AuthBanner
        panelClass="register-left-panel"
        headerClass="register-left-header"
        brandClass="register-brand"
        heroClass="register-left-hero"
        badgeClass="register-badge"
        footerClass="register-left-footer"
        badge="🏕️ JOIN THE SANCTUARY"
        title="Begin your woodland tradition."
        description="Create your guest profile to reserve cabins, event barns, and lakeside activities with member benefits."
        footerText="🌲 Whispering Pines Sanctuary & Retreats"
      />

      <div className="register-right-panel">
        <div className="register-form-box">
          <div className="register-header-titles">
            <span className="register-overline">NEW GUEST REGISTRATION</span>
            <h2>Create Your Account</h2>
            <p>Complete your details to reserve stays across the sanctuary.</p>
          </div>

          {error && <p className="register-error">{error}</p>}

          <form onSubmit={(e) => e.preventDefault()} className="register-form">
            <div className="register-field">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="eleanor_v"
                value={username}
                onChange={handleUsernameChange}
              />
            </div>

            <div className="register-row">
              <div className="register-field">
                <label>First Name (Nombre)</label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Eleanor"
                  value={nombre}
                  onChange={handleNombreChange}
                />
              </div>

              <div className="register-field">
                <label>Last Name (Apellido)</label>
                <input
                  type="text"
                  name="apellido"
                  placeholder="Vance"
                  value={apellido}
                  onChange={handleApellidoChange}
                />
              </div>
            </div>

            <div className="register-field">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="eleanor.vance@haven.com"
                value={email}
                onChange={handleEmailChange}
              />
            </div>

            <div className="register-field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
              />
            </div>

            <button type="submit" className="register-btn-submit" onClick={handleClick}>
              Create Account ➔
            </button>
          </form>

          <div className="register-footer-links">
            <p>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterForm
