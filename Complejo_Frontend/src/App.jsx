import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import LoginView from './views/LoginView'
import RegisterView from './views/RegisterView'
import CatalogoView from './views/CatalogoView'
import DetalleEspacioView from './views/DetalleEspacioView'
import CheckoutView from './views/CheckoutView'
import MisReservasView from './views/MisReservasView'
import AdminEspaciosView from './views/AdminEspaciosView'
import AdminReservasView from './views/AdminReservasView'
import AdminUsuariosView from './views/AdminUsuariosView'
import { apiFetch } from './utils/api'
import { CARRITO_VACIO } from './utils/constantes'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [idioma, setIdioma] = useState('es')
  const [token, setToken] = useState('')
  const [isLogged, setIsLogged] = useState(false)
  const [rolUsuario, setRolUsuario] = useState('')
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [cuentaDesactivada, setCuentaDesactivada] = useState(false)
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isBuzonOpen, setIsBuzonOpen] = useState(false)
  const [mensajesBuzon, setMensajesBuzon] = useState([])
  const [ocultasIds, setOcultasIds] = useState([])
  const [carritoData, setCarritoData] = useState(CARRITO_VACIO)

  // Al levantar la app, aseguramos arrancar sin usuario logueado previo
  useEffect(() => {
    localStorage.removeItem('jwtToken')
    localStorage.removeItem('rolUsuario')
    localStorage.removeItem('notificacionesLeidas')
  }, [])

  // Redirección de rutas según rol y autenticación usando useNavigate y useLocation (visto en Clase 10)
  useEffect(() => {
    if (rolUsuario === 'ROLE_ADMIN') {
      // El administrador no debe ver el catálogo ni pantallas de cliente/auth
      if (
        location.pathname === '/' ||
        location.pathname === '/catalogo' ||
        location.pathname === '/login' ||
        location.pathname === '/register' ||
        location.pathname === '/detalle' ||
        location.pathname === '/checkout' ||
        location.pathname === '/mis-reservas'
      ) {
        navigate('/admin/espacios')
      }
    } else if (isLogged) {
      // Usuario normal logueado
      if (location.pathname === '/login' || location.pathname === '/register') {
        navigate('/catalogo')
      } else if (
        location.pathname === '/admin/espacios' ||
        location.pathname === '/admin/reservas' ||
        location.pathname === '/admin/usuarios'
      ) {
        navigate('/catalogo')
      }
    } else {
      // Usuario no logueado (visitante)
      // Si intenta acceder a rutas privadas (admin, checkout o mis-reservas), enviarlo al login
      if (
        location.pathname === '/admin/espacios' ||
        location.pathname === '/admin/reservas' ||
        location.pathname === '/admin/usuarios' ||
        location.pathname === '/checkout' ||
        location.pathname === '/mis-reservas'
      ) {
        navigate('/login')
      }
    }
  }, [isLogged, rolUsuario, location.pathname, navigate])

  // Verifica el perfil y estado activo del usuario al iniciar sesión o cambiar de pantalla
  useEffect(() => {
    if (token) {
      apiFetch('/api/usuarios/me')
        .then((res) => res.json())
        .then((user) => {
          if (user && user.error === 'CUENTA_DESACTIVADA') {
            localStorage.removeItem('jwtToken')
            localStorage.removeItem('rolUsuario')
            setToken('')
            setIsLogged(false)
            setRolUsuario('')
            setNombreUsuario('')
            setIsCartOpen(false)
            setIsBuzonOpen(false)
            setMensajesBuzon([])
            setCarritoData(CARRITO_VACIO)
            setCuentaDesactivada(true)
            navigate('/login')
          } else if (user && user.email) {
            setIsLogged(true)
            setRolUsuario(user.rol)
            localStorage.setItem('rolUsuario', user.rol)
            setNombreUsuario(`${user.nombre} ${user.apellido}`)
          }
        })
        .catch((err) => {
          console.error('Error al verificar sesion: ', err)
        })
    }
  }, [token, location.pathname, navigate])

  // Carga inicial del carrito y buzón cuando inicia sesión un cliente
  useEffect(() => {
    if (token && rolUsuario && rolUsuario !== 'ROLE_ADMIN') {
      apiFetch('/api/carrito')
        .then((res) => res.json())
        .then((cart) => {
          if (cart && cart.items) {
            setCarritoData(cart)
          }
        })
        .catch((err) => {
          console.error('Error al obtener carrito: ', err)
        })

      apiFetch('/api/reservas/mis-reservas')
        .then((res) => res.json())
        .then((reservas) => {
          if (reservas && !reservas.error) {
            setMensajesBuzon(
              reservas.filter(
                (r) => r.estado === 'CANCELADA' && r.mensajeCancelacion && !r.notificacionLeida
              )
            )
          }
        })
        .catch((err) => {
          console.error('Error al obtener buzón: ', err)
        })
    }
  }, [token, rolUsuario])

  const handleLoginSuccess = (data) => {
    setCuentaDesactivada(false)
    setToken(data.token)
    setRolUsuario(data.rol || '')
    setIsLogged(true)
    localStorage.setItem('jwtToken', data.token)
    localStorage.setItem('rolUsuario', data.rol || '')
    navigate(data.rol === 'ROLE_ADMIN' ? '/admin/espacios' : '/catalogo')
  }

  const handleLogout = () => {
    setCuentaDesactivada(false)
    localStorage.removeItem('jwtToken')
    localStorage.removeItem('rolUsuario')
    setToken('')
    setIsLogged(false)
    setRolUsuario('')
    setNombreUsuario('')
    setIsCartOpen(false)
    setIsBuzonOpen(false)
    setMensajesBuzon([])
    setCarritoData(CARRITO_VACIO)
    navigate('/login')
  }

  const handleCuentaDesactivada = () => {
    localStorage.removeItem('jwtToken')
    localStorage.removeItem('rolUsuario')
    setToken('')
    setIsLogged(false)
    setRolUsuario('')
    setNombreUsuario('')
    setIsCartOpen(false)
    setIsBuzonOpen(false)
    setMensajesBuzon([])
    setCarritoData(CARRITO_VACIO)
    setCuentaDesactivada(true)
    navigate('/login')
  }

  const handleDescartarNotificacion = (id) => {
    apiFetch(`/api/reservas/${id}/leer-notificacion`, { method: 'PATCH' })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.error === 'CUENTA_DESACTIVADA') {
          handleCuentaDesactivada()
          return
        }
        if (data && data.mensaje) {
          setMensajesBuzon(mensajesBuzon.filter((m) => m.id !== id))
        }
      })
      .catch((err) => {
        console.error('Error al marcar notificación como leída: ', err)
      })
  }

  const handleAbrirDetalle = (espacio) => {
    setEspacioSeleccionado(espacio)
    navigate('/detalle')
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginView
            idioma={idioma}
            setIdioma={setIdioma}
            onLogin={handleLoginSuccess}
            cuentaDesactivada={cuentaDesactivada}
            onLimpiarAviso={() => setCuentaDesactivada(false)}
          />
        }
      />
      <Route path="/register" element={<RegisterView idioma={idioma} setIdioma={setIdioma} onLogin={handleLoginSuccess} />} />

      <Route
        element={
          <MainLayout
            idioma={idioma}
            setIdioma={setIdioma}
            isLogged={isLogged}
            rolUsuario={rolUsuario}
            nombreUsuario={nombreUsuario}
            onLogout={handleLogout}
            onCuentaDesactivada={handleCuentaDesactivada}
            carritoData={carritoData}
            setCarritoData={setCarritoData}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            mensajesNoLeidos={mensajesBuzon}
            onDescartarNotificacion={handleDescartarNotificacion}
            isBuzonOpen={isBuzonOpen}
            setIsBuzonOpen={setIsBuzonOpen}
          />
        }
      >
        <Route path="/" element={<CatalogoView idioma={idioma} onAbrirDetalle={handleAbrirDetalle} />} />
        <Route path="/catalogo" element={<CatalogoView idioma={idioma} onAbrirDetalle={handleAbrirDetalle} />} />
        <Route
          path="/detalle"
          element={
            <DetalleEspacioView
              idioma={idioma}
              espacio={espacioSeleccionado}
              isLogged={isLogged}
              setCarritoData={setCarritoData}
              onAbrirCarrito={() => setIsCartOpen(true)}
              onCuentaDesactivada={handleCuentaDesactivada}
            />
          }
        />
        <Route
          path="/checkout"
          element={
            <CheckoutView
              idioma={idioma}
              carritoData={carritoData}
              setCarritoData={setCarritoData}
              onCuentaDesactivada={handleCuentaDesactivada}
            />
          }
        />
        <Route
          path="/mis-reservas"
          element={
            <MisReservasView
              idioma={idioma}
              ocultasIds={ocultasIds}
              setOcultasIds={setOcultasIds}
              onCuentaDesactivada={handleCuentaDesactivada}
            />
          }
        />
        <Route
          path="/admin/espacios"
          element={<AdminEspaciosView idioma={idioma} onCuentaDesactivada={handleCuentaDesactivada} />}
        />
        <Route
          path="/admin/reservas"
          element={<AdminReservasView idioma={idioma} onCuentaDesactivada={handleCuentaDesactivada} />}
        />
        <Route
          path="/admin/usuarios"
          element={<AdminUsuariosView idioma={idioma} onCuentaDesactivada={handleCuentaDesactivada} />}
        />
      </Route>
    </Routes>
  )
}

export default App
