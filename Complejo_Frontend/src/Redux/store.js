import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import carritoReducer from './carritoSlice'
import reservasReducer from './reservasSlice'
import espaciosReducer from './espaciosSlice'
import adminEspaciosReducer from './adminEspaciosSlice'
import adminReservasReducer from './adminReservasSlice'
import adminUsuariosReducer from './adminUsuariosSlice'

// Cada clave es el nombre con el que se lee el estado en los componentes: state.auth, state.carrito, etc.
export const store = configureStore({
  reducer: {
    auth: authReducer,
    carrito: carritoReducer,
    reservas: reservasReducer,
    espacios: espaciosReducer,
    adminEspacios: adminEspaciosReducer,
    adminReservas: adminReservasReducer,
    adminUsuarios: adminUsuariosReducer
  }
})
