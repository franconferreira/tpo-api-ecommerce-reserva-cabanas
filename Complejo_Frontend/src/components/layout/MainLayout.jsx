import React from 'react'
import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'
import Footer from './Footer'
import CarritoDrawer from '../carrito/CarritoDrawer'
import BuzonDrawer from '../reservas/BuzonDrawer'

// Estructura común de las pantallas internas: barra, contenido de la ruta (Outlet), footer y paneles laterales.
// Login y registro no usan este layout, por eso no muestran barra ni footer.
function MainLayout({
  idioma,
  setIdioma,
  isLogged,
  rolUsuario,
  nombreUsuario,
  onLogout,
  carritoData,
  setCarritoData,
  isCartOpen,
  setIsCartOpen,
  mensajesNoLeidos,
  onDescartarNotificacion,
  isBuzonOpen,
  setIsBuzonOpen
}) {
  return (
    <>
      <Navigation
        idioma={idioma}
        setIdioma={setIdioma}
        isLogged={isLogged}
        rolUsuario={rolUsuario}
        nombreUsuario={nombreUsuario}
        onLogout={onLogout}
        onAbrirCarrito={() => setIsCartOpen(true)}
        cantidadCarrito={carritoData.items ? carritoData.items.length : 0}
        onAbrirBuzon={() => setIsBuzonOpen(true)}
        cantidadBuzon={mensajesNoLeidos.length}
      />

      <Outlet />

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
            mensajes={mensajesNoLeidos}
            onDescartar={onDescartarNotificacion}
            isOpen={isBuzonOpen}
            onClose={() => setIsBuzonOpen(false)}
          />
        </>
      )}
    </>
  )
}

export default MainLayout
