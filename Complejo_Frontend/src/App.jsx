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
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isBuzonOpen, setIsBuzonOpen] = useState(false)
  const [mensajesBuzon, setMensajesBuzon] = useState([])
  const [leidasIds, setLeidasIds] = useState(() => {
    const guardadas = localStorage.getItem('notificacionesLeidas')
    return guardadas ? JSON.parse(guardadas) : []
  })
  const [ocultasIds, setOcultasIds] = useState([])
  const [carritoData, setCarritoData] = useState(CARRITO_VACIO)

  // Al levantar la app, aseguramos arrancar sin usuario logueado previo
  useEffect(() => {
    localStorage.removeItem('jwtToken')
    localStorage.removeItem('rolUsuario')
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

  // Se ejecuta al cambiar el token (login / logout)
  useEffect(() => {
    if (token) {
      apiFetch('/api/usuarios/me')
        .then((res) => res.json())
        .then((user) => {
          if (user && user.email) {
            setIsLogged(true)
            setRolUsuario(user.rol)
            localStorage.setItem('rolUsuario', user.rol)
            setNombreUsuario(`${user.nombre} ${user.apellido}`)

            if (user.rol !== 'ROLE_ADMIN') {
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
                  if (reservas) {
                    setMensajesBuzon(
                      reservas.filter((r) => r.estado === 'CANCELADA' && r.mensajeCancelacion)
                    )
                  }
                })
                .catch((err) => {
                  console.error('Error al obtener buzón: ', err)
                })
            }
          }
        })
        .catch((err) => {
          console.error('Error al verificar sesion: ', err)
        })
    }
  }, [token])

  const handleLoginSuccess = (data) => {
    setToken(data.token)
    setRolUsuario(data.rol || '')
    setIsLogged(true)
    localStorage.setItem('jwtToken', data.token)
    localStorage.setItem('rolUsuario', data.rol || '')
    navigate(data.rol === 'ROLE_ADMIN' ? '/admin/espacios' : '/catalogo')
  }

  const handleLogout = () => {
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

  const handleDescartarNotificacion = (id) => {
    const nuevasLeidas = [...leidasIds, id]
    setLeidasIds(nuevasLeidas)
    localStorage.setItem('notificacionesLeidas', JSON.stringify(nuevasLeidas))
  }

  const handleAbrirDetalle = (espacio) => {
    setEspacioSeleccionado(espacio)
    navigate('/detalle')
  }

  const mensajesNoLeidos = mensajesBuzon.filter((m) => !leidasIds.includes(m.id))

  return (
    <Routes>
      <Route path="/login" element={<LoginView idioma={idioma} setIdioma={setIdioma} onLogin={handleLoginSuccess} />} />
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
            carritoData={carritoData}
            setCarritoData={setCarritoData}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            mensajesNoLeidos={mensajesNoLeidos}
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
            />
          }
        />
        <Route
          path="/checkout"
          element={<CheckoutView idioma={idioma} carritoData={carritoData} setCarritoData={setCarritoData} />}
        />
        <Route
          path="/mis-reservas"
          element={<MisReservasView idioma={idioma} ocultasIds={ocultasIds} setOcultasIds={setOcultasIds} />}
        />
        <Route path="/admin/espacios" element={<AdminEspaciosView idioma={idioma} />} />
        <Route path="/admin/reservas" element={<AdminReservasView idioma={idioma} />} />
        <Route path="/admin/usuarios" element={<AdminUsuariosView idioma={idioma} />} />
      </Route>
    </Routes>
  )
}

export default App
