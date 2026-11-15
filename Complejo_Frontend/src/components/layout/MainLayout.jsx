import React from 'react'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Navigation from './Navigation'
import Footer from './Footer'
import CarritoDrawer from '../carrito/CarritoDrawer'
import BuzonDrawer from '../reservas/BuzonDrawer'
import DetalleEspacioModal from '../detalle/DetalleEspacioModal'

// Estructura común de las pantallas internas: barra, contenido de la ruta (Outlet), footer y paneles laterales.
// Login y registro no usan este layout, por eso no muestran barra ni footer.
function MainLayout({
  idioma,
  setIdioma,
  tema,
  onToggleTema,
  onLogout,
  isBuzonOpen,
  setIsBuzonOpen,
  espacioSeleccionado,
  onCerrarDetalle
}) {
  const rolUsuario = useSelector((state) => state.auth.rol)

  return (
    <>
      <Navigation
        idioma={idioma}
        setIdioma={setIdioma}
        tema={tema}
        onToggleTema={onToggleTema}
        onLogout={onLogout}
        onAbrirBuzon={() => setIsBuzonOpen(true)}
      />

      <Outlet />

      <Footer idioma={idioma} />

      {rolUsuario !== 'ROLE_ADMIN' && (
        <>
          <CarritoDrawer idioma={idioma} />
          <BuzonDrawer
            idioma={idioma}
            isOpen={isBuzonOpen}
            onClose={() => setIsBuzonOpen(false)}
          />
          {espacioSeleccionado && (
            <DetalleEspacioModal
              idioma={idioma}
              espacio={espacioSeleccionado}
              onClose={onCerrarDetalle}
            />
          )}
        </>
      )}
    </>
  )
}

export default MainLayout
