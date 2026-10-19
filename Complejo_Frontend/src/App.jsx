import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import CarritoDrawer from './components/CarritoDrawer'
import BuzonDrawer from './components/BuzonDrawer'
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
  const [idioma, setIdioma] = useState('es')
  const [isLogged, setIsLogged] = useState(false)
  const [rolUsuario, setRolUsuario] = useState('')
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isBuzonOpen, setIsBuzonOpen] = useState(false)
  const [mensajesBuzon, setMensajesBuzon] = useState([])
  const [leidasIds, setLeidasIds] = useState([])
  const [ocultasIds, setOcultasIds] = useState([])
  const carritoVacio = {
    id: null,
    totalSinDescuento: 0,
    descuentoPackPorcentaje: 0,
    total: 0,
    items: []
  }
  const [carritoData, setCarritoData] = useState(carritoVacio)
  const URL = 'http://localhost:8080'

  const extraerCanceladas = (reservas) => {
    let canceladas = []
    reservas.map((r) => {
      if (r.estado === 'CANCELADA' && r.mensajeCancelacion) {
        canceladas = [...canceladas, r]
      }
    })
    return canceladas
  }

  useEffect(() => {
    const token = localStorage.getItem('jwtToken')
    if (token) {
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

            if (user.rol !== 'ROLE_ADMIN') {
              fetch(`${URL}/api/carrito`, options)
                .then((res) => res.json())
                .then((cart) => {
                  if (cart && cart.items) {
                    setCarritoData(cart)
                  }
                })
                .catch((err) => {
                  console.error('Error al obtener carrito: ', err)
                })

              fetch(`${URL}/api/reservas/mis-reservas`, options)
                .then((res) => res.json())
                .then((reservas) => {
                  if (reservas) {
                    setMensajesBuzon(extraerCanceladas(reservas))
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
  }, [])

  const handleLoginSuccess = (token) => {
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
            navigate('/admin/espacios')
          } else {
            fetch(`${URL}/api/reservas/mis-reservas`, options)
              .then((res) => res.json())
              .then((reservas) => {
                if (reservas) {
                  setMensajesBuzon(extraerCanceladas(reservas))
                }
              })
              .catch((err) => {
                console.error('Error al obtener buzón: ', err)
              })

            fetch(`${URL}/api/carrito`, options)
              .then((res) => res.json())
              .then((cart) => {
                if (cart && cart.items) {
                  setCarritoData(cart)
                }
                navigate('/catalogo')
              })
              .catch((err) => {
                console.error('Error al obtener carrito: ', err)
                navigate('/catalogo')
              })
          }
        }
      })
      .catch((err) => {
        console.error('Error al verificar sesion: ', err)
      })
  }

  const handleLogout = () => {
    localStorage.setItem('jwtToken', '')
    setIsLogged(false)
    setRolUsuario('')
    setNombreUsuario('')
    setIsCartOpen(false)
    setIsBuzonOpen(false)
    setMensajesBuzon([])
    setCarritoData(carritoVacio)
  }

  const handleAbrirDetalle = (espacio) => {
    setEspacioSeleccionado(espacio)
    navigate('/detalle')
  }

  let mensajesNoLeidos = []
  mensajesBuzon.map((m) => {
    let yaLeido = false
    leidasIds.map((idLeido) => {
      if (idLeido === m.id) {
        yaLeido = true
      }
    })
    if (!yaLeido) {
      mensajesNoLeidos = [...mensajesNoLeidos, m]
    }
  })

  return (
    <>
      <Navigation
        idioma={idioma}
        setIdioma={setIdioma}
        isLogged={isLogged}
        rolUsuario={rolUsuario}
        nombreUsuario={nombreUsuario}
        onLogout={handleLogout}
        onAbrirCarrito={() => setIsCartOpen(true)}
        cantidadCarrito={carritoData.items ? carritoData.items.length : 0}
        onAbrirBuzon={() => setIsBuzonOpen(true)}
        cantidadBuzon={mensajesNoLeidos.length}
      />

      <Routes>
        <Route path="/" element={<CatalogoView idioma={idioma} onAbrirDetalle={handleAbrirDetalle} />} />
        <Route path="/catalogo" element={<CatalogoView idioma={idioma} onAbrirDetalle={handleAbrirDetalle} />} />
        <Route path="/login" element={<LoginView idioma={idioma} setIdioma={setIdioma} onLogin={handleLoginSuccess} />} />
        <Route path="/register" element={<RegisterView idioma={idioma} setIdioma={setIdioma} onLogin={handleLoginSuccess} />} />
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
          element={
            <MisReservasView
              idioma={idioma}
              ocultasIds={ocultasIds}
              setOcultasIds={setOcultasIds}
            />
          }
        />
        <Route path="/admin/espacios" element={<AdminEspaciosView idioma={idioma} />} />
        <Route path="/admin/reservas" element={<AdminReservasView idioma={idioma} />} />
        <Route path="/admin/usuarios" element={<AdminUsuariosView idioma={idioma} />} />
      </Routes>

      <Footer idioma={idioma} />

      {rolUsuario !== 'ROLE_ADMIN' && (
        <>
          <CarritoDrawer
            idioma={idioma}
            carritoData={carritoData}
            setCarritoData={setCarritoData}
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
          />
          <BuzonDrawer
            idioma={idioma}
            mensajesBuzon={mensajesNoLeidos}
            setMensajesBuzon={setMensajesBuzon}
            leidasIds={leidasIds}
            setLeidasIds={setLeidasIds}
            isOpen={isBuzonOpen}
            onClose={() => setIsBuzonOpen(false)}
          />
        </>
      )}
    </>
  )
}

export default App
