import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import CarritoDrawer from './components/CarritoDrawer'
import LoginView from './views/LoginView'
import RegisterView from './views/RegisterView'
import CatalogoView from './views/CatalogoView'
import DetalleEspacioView from './views/DetalleEspacioView'
import CheckoutView from './views/CheckoutView'
import MisReservasView from './views/MisReservasView'
import AdminEspaciosView from './views/AdminEspaciosView'
import AdminReservasView from './views/AdminReservasView'
import AdminUsuariosView from './views/AdminUsuariosView'

function App() {
  const navigate = useNavigate()
  const [isLogged, setIsLogged] = useState(false)
  const [rolUsuario, setRolUsuario] = useState('')
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const carritoVacio = {
    id: null,
    totalSinDescuento: 0,
    descuentoPackPorcentaje: 0,
    total: 0,
    items: []
  }
  const [carritoData, setCarritoData] = useState(carritoVacio)

  const URL = 'http://localhost:8080'

  const cargarDatosUsuario = (token, desdeLogin) => {
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    fetch(`${URL}/api/usuarios/me`, options)
      .then((res) => res.json())
      .then((user) => {
        if (user && user.email) {
          setIsLogged(true)
          setRolUsuario(user.rol)
          setNombreUsuario(`${user.nombre} ${user.apellido}`)

          if (user.rol === 'ROLE_ADMIN') {
            if (desdeLogin) {
              navigate('/admin/espacios')
            }
          } else {
            fetch(`${URL}/api/carrito`, options)
              .then((res) => res.json())
              .then((cart) => {
                if (cart && cart.items) {
                  setCarritoData(cart)
                }
                if (desdeLogin) {
                  navigate('/catalogo')
                }
              })
              .catch((err) => {
                console.error('Error al obtener carrito: ', err)
                if (desdeLogin) {
                  navigate('/catalogo')
                }
              })
          }
        }
      })
      .catch((err) => {
        console.error('Error al verificar sesion: ', err)
      })
  }

  useEffect(() => {
    const token = localStorage.getItem('jwtToken')
    if (token) {
      cargarDatosUsuario(token, false)
    }
  }, [])

  const handleLoginSuccess = (token) => {
    cargarDatosUsuario(token, true)
  }

  const handleLogout = () => {
    localStorage.setItem('jwtToken', '')
    setIsLogged(false)
    setRolUsuario('')
    setNombreUsuario('')
    setIsCartOpen(false)
    setCarritoData(carritoVacio)
  }

  const handleAbrirDetalle = (espacio) => {
    setEspacioSeleccionado(espacio)
    navigate('/detalle')
  }

  return (
    <>
      <Navigation
        isLogged={isLogged}
        rolUsuario={rolUsuario}
        nombreUsuario={nombreUsuario}
        onLogout={handleLogout}
        onAbrirCarrito={() => setIsCartOpen(true)}
        cantidadCarrito={carritoData.items ? carritoData.items.length : 0}
      />

      <Routes>
        <Route path="/" element={<CatalogoView onAbrirDetalle={handleAbrirDetalle} />} />
        <Route path="/catalogo" element={<CatalogoView onAbrirDetalle={handleAbrirDetalle} />} />
        <Route path="/login" element={<LoginView onLogin={handleLoginSuccess} />} />
        <Route path="/register" element={<RegisterView onLogin={handleLoginSuccess} />} />
        <Route
          path="/detalle"
          element={
            <DetalleEspacioView
              espacio={espacioSeleccionado}
              isLogged={isLogged}
              setCarritoData={setCarritoData}
              onAbrirCarrito={() => setIsCartOpen(true)}
            />
          }
        />
        <Route
          path="/checkout"
          element={<CheckoutView carritoData={carritoData} setCarritoData={setCarritoData} />}
        />
        <Route path="/mis-reservas" element={<MisReservasView />} />
        <Route path="/admin/espacios" element={<AdminEspaciosView />} />
        <Route path="/admin/reservas" element={<AdminReservasView />} />
        <Route path="/admin/usuarios" element={<AdminUsuariosView />} />
      </Routes>

      <Footer />

      {rolUsuario !== 'ROLE_ADMIN' && (
        <CarritoDrawer
          carritoData={carritoData}
          setCarritoData={setCarritoData}
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
        />
      )}
    </>
  )
}

export default App
