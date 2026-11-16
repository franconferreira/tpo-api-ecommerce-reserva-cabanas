import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCarrito } from '../../Redux/carritoSlice'
import Navigation from './Navigation'
import Footer from './Footer'
import CarritoDrawer from '../carrito/CarritoDrawer'
import BuzonDrawer from '../reservas/BuzonDrawer'
import DetalleEspacioModal from '../detalle/DetalleEspacioModal'

// Estructura común de las pantallas internas: barra, contenido de la ruta (Outlet), footer y paneles laterales.
// Login y registro no usan este layout, por eso no muestran barra ni footer.
// En el recorrido 3D tampoco: el mapa ocupa toda la ventana (las opciones van en su menú de Escape).
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
  const isLogged = useSelector((state) => state.auth.isLogged)
  const carritoAbierto = useSelector((state) => state.carrito.abierto)
  const dispatch = useDispatch()

  // Los espacios del carrito se reservan por 10 minutos: el back saca los vencidos cada vez que se pide el carrito,
  // así que se lo vuelve a pedir cada 20 segundos (y al abrir el panel) para que desaparezcan solos
  useEffect(() => {
    if (!isLogged || rolUsuario === 'ROLE_ADMIN') return
    if (carritoAbierto) dispatch(fetchCarrito())
    const intervalo = setInterval(() => dispatch(fetchCarrito()), 20000)
    return () => clearInterval(intervalo)
  }, [isLogged, rolUsuario, carritoAbierto, dispatch])
  const enMapa = useLocation().pathname === '/mapa-3d'

  return (
    <>
      {!enMapa && (
        <Navigation
          idioma={idioma}
          setIdioma={setIdioma}
          tema={tema}
          onToggleTema={onToggleTema}
          onLogout={onLogout}
          onAbrirBuzon={() => setIsBuzonOpen(true)}
        />
      )}

      <Outlet />

      {!enMapa && <Footer idioma={idioma} />}

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
