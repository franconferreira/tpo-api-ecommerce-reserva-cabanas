import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
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
  const [idioma, setIdioma] = useState('es')
  const [token, setToken] = useState(localStorage.getItem('jwtToken'))
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

  // Se ejecuta al montar la app y cada vez que cambia el token (login / logout)
  useEffect(() => {
    if (token) {
      apiFetch('/api/usuarios/me')
        .then((res) => res.json())
        .then((user) => {
          if (user && user.email) {
            setIsLogged(true)
            setRolUsuario(user.rol)
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
    navigate(data.rol === 'ROLE_ADMIN' ? '/admin/espacios' : '/catalogo')
  }

  const handleLogout = () => {
    localStorage.setItem('jwtToken', '')
    setToken('')
    setIsLogged(false)
    setRolUsuario('')
    setNombreUsuario('')
    setIsCartOpen(false)
    setIsBuzonOpen(false)
    setMensajesBuzon([])
    setCarritoData(CARRITO_VACIO)
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
