import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
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
import Mapa3DView from './views/Mapa3DView'
import { fetchPerfil, logout } from './Redux/authSlice'
import { fetchCarrito, vaciarCarrito } from './Redux/carritoSlice'
import { fetchMisReservas, limpiarReservas } from './Redux/reservasSlice'
import { mostrarMensaje } from './utils/pantallaMensaje'
import textos from './i18n/textos'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { token, isLogged, rol: rolUsuario, cuentaDesactivada } = useSelector((state) => state.auth)

  // Estados de interfaz: quedan locales porque solo los maneja App y los pasa a pocos hijos
  const [idioma, setIdioma] = useState('es')
  // Modo claro (Vitral del Alba) u oscuro (Luz de Luna): la clase del tema va en el contenedor de toda la app
  const [tema, setTema] = useState('claro')
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null)
  const [isBuzonOpen, setIsBuzonOpen] = useState(false)

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
      if (location.pathname === '/login' || location.pathname === '/register') {
        // recién inicia sesión: pantalla de "Bienvenido" antes de entrar al panel
        mostrarMensaje(textos[idioma].comun.bienvenida, () => navigate('/admin/espacios'))
      } else if (
        location.pathname === '/' ||
        location.pathname === '/catalogo' ||
        location.pathname === '/detalle' ||
        location.pathname === '/checkout' ||
        location.pathname === '/mis-reservas'
      ) {
        navigate('/admin/espacios')
      }
    } else if (isLogged) {
      // Usuario normal logueado
      if (location.pathname === '/login' || location.pathname === '/register') {
        // recién inicia sesión: pantalla de "Bienvenido" antes de entrar al catálogo
        mostrarMensaje(textos[idioma].comun.bienvenida, () => navigate('/catalogo'))
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
  }, [isLogged, rolUsuario, location.pathname, navigate, idioma])

  // Verifica el perfil y estado activo del usuario al iniciar sesión o cambiar de pantalla
  useEffect(() => {
    if (token) {
      dispatch(fetchPerfil())
    }
  }, [token, location.pathname, dispatch])

  // Carga inicial del carrito y buzón cuando inicia sesión un cliente
  useEffect(() => {
    if (token && rolUsuario && rolUsuario !== 'ROLE_ADMIN') {
      dispatch(fetchCarrito())
      dispatch(fetchMisReservas())
    }
  }, [token, rolUsuario, dispatch])

  // Si el back avisó que la cuenta fue desactivada con la sesión abierta, se limpia la sesión y se vuelve al login.
  // Se mira si todavía hay token guardado para hacerlo una sola vez (y no cuando falla el login de una cuenta desactivada).
  useEffect(() => {
    if (cuentaDesactivada && localStorage.getItem('jwtToken')) {
      localStorage.removeItem('jwtToken')
      dispatch(vaciarCarrito())
      dispatch(limpiarReservas())
      setIsBuzonOpen(false)
      navigate('/login')
    }
  }, [cuentaDesactivada, dispatch, navigate])

  // Cerrar sesión: pantalla de "Hasta pronto" y, ya tapado todo, se limpia la sesión y se va al login
  const handleLogout = () => {
    mostrarMensaje(textos[idioma].comun.despedida, () => {
      localStorage.removeItem('jwtToken')
      dispatch(logout())
      dispatch(vaciarCarrito())
      dispatch(limpiarReservas())
      setIsBuzonOpen(false)
      navigate('/login')
    })
  }

  const handleToggleTema = () => {
    setTema(tema === 'claro' ? 'oscuro' : 'claro')
  }

  const handleAbrirDetalle = (espacio) => {
    setEspacioSeleccionado(espacio)
  }

  const handleCerrarDetalle = () => {
    setEspacioSeleccionado(null)
  }

  return (
    <div className={`app tema-${tema}`}>
    <Routes>
      <Route path="/login" element={<LoginView idioma={idioma} setIdioma={setIdioma} tema={tema} onToggleTema={handleToggleTema} />} />
      <Route path="/register" element={<RegisterView idioma={idioma} setIdioma={setIdioma} tema={tema} onToggleTema={handleToggleTema} />} />

      <Route
        element={
          <MainLayout
            idioma={idioma}
            setIdioma={setIdioma}
            tema={tema}
            onToggleTema={handleToggleTema}
            onLogout={handleLogout}
            isBuzonOpen={isBuzonOpen}
            setIsBuzonOpen={setIsBuzonOpen}
            espacioSeleccionado={espacioSeleccionado}
            onCerrarDetalle={handleCerrarDetalle}
          />
        }
      >
        <Route path="/" element={<CatalogoView idioma={idioma} onAbrirDetalle={handleAbrirDetalle} />} />
        <Route path="/catalogo" element={<CatalogoView idioma={idioma} onAbrirDetalle={handleAbrirDetalle} />} />
        <Route
          path="/mapa-3d"
          element={
            <Mapa3DView
              idioma={idioma}
              setIdioma={setIdioma}
              tema={tema}
              onToggleTema={handleToggleTema}
              onLogout={handleLogout}
              onAbrirDetalle={handleAbrirDetalle}
              detalleAbierto={espacioSeleccionado !== null}
            />
          }
        />
        <Route
          path="/detalle"
          element={
            <DetalleEspacioView
              idioma={idioma}
              espacio={espacioSeleccionado}
              onClose={handleCerrarDetalle}
            />
          }
        />
        <Route path="/checkout" element={<CheckoutView idioma={idioma} />} />
        <Route path="/mis-reservas" element={<MisReservasView idioma={idioma} />} />
        <Route path="/admin/espacios" element={<AdminEspaciosView idioma={idioma} />} />
        <Route path="/admin/reservas" element={<AdminReservasView idioma={idioma} />} />
        <Route path="/admin/usuarios" element={<AdminUsuariosView idioma={idioma} />} />
      </Route>
    </Routes>
    </div>
  )
}

export default App
