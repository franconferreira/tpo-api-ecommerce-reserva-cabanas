import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_URL, conToken } from '../utils/api'
import { CARRITO_VACIO } from '../utils/constantes'

const URL = `${API_URL}/api/carrito`

export const fetchCarrito = createAsyncThunk('carrito/fetchCarrito', async () => {
  const { data } = await axios.get(URL, conToken())
  return data
})

export const agregarAlCarrito = createAsyncThunk('carrito/agregarAlCarrito', async (nuevoItem) => {
  const { data } = await axios.post(`${URL}/items`, nuevoItem, conToken())
  return data
})

// Devuelve el carrito actualizado y el id eliminado, para sacarlo de la lista
export const eliminarDelCarrito = createAsyncThunk('carrito/eliminarDelCarrito', async (itemId) => {
  const { data } = await axios.delete(`${URL}/items/${itemId}`, conToken())
  return { carrito: data, itemId: itemId }
})

export const confirmarCheckout = createAsyncThunk('carrito/confirmarCheckout', async () => {
  const { data } = await axios.post(`${URL}/checkout`, null, conToken())
  return data
})

const carritoSlice = createSlice({
  name: 'carrito',
  initialState: {
    data: CARRITO_VACIO,
    abierto: false,
    errorAgregar: false,
    errorEliminar: false,
    errorCheckout: false,
    checkoutExitoso: false
  },
  reducers: {
    abrirCarrito: (state) => {
      state.abierto = true
    },
    cerrarCarrito: (state) => {
      state.abierto = false
    },
    limpiarErroresCarrito: (state) => {
      state.errorAgregar = false
      state.errorEliminar = false
      state.errorCheckout = false
    },
    reiniciarCheckout: (state) => {
      state.checkoutExitoso = false
    },
    // Al cerrar sesión el carrito vuelve a su estado inicial
    vaciarCarrito: (state) => {
      state.data = CARRITO_VACIO
      state.abierto = false
      state.errorAgregar = false
      state.errorEliminar = false
      state.errorCheckout = false
      state.checkoutExitoso = false
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCarrito.fulfilled, (state, action) => {
        if (action.payload && action.payload.items) {
          state.data = action.payload
        }
      })
      .addCase(agregarAlCarrito.pending, (state) => {
        state.errorAgregar = false
      })
      .addCase(agregarAlCarrito.fulfilled, (state, action) => {
        state.data = action.payload
        state.abierto = true
      })
      .addCase(agregarAlCarrito.rejected, (state) => {
        state.errorAgregar = true
      })
      .addCase(eliminarDelCarrito.pending, (state) => {
        state.errorEliminar = false
      })
      .addCase(eliminarDelCarrito.fulfilled, (state, action) => {
        state.data = {
          ...action.payload.carrito,
          items: state.data.items.filter((item) => item.id !== action.payload.itemId)
        }
      })
      .addCase(eliminarDelCarrito.rejected, (state) => {
        state.errorEliminar = true
      })
      .addCase(confirmarCheckout.pending, (state) => {
        state.errorCheckout = false
        state.checkoutExitoso = false
      })
      .addCase(confirmarCheckout.fulfilled, (state) => {
        state.data = CARRITO_VACIO
        state.checkoutExitoso = true
      })
      .addCase(confirmarCheckout.rejected, (state) => {
        state.data = CARRITO_VACIO
        state.errorCheckout = true
      })
  }
})

export const {
  abrirCarrito,
  cerrarCarrito,
  limpiarErroresCarrito,
  reiniciarCheckout,
  vaciarCarrito
} = carritoSlice.actions

export default carritoSlice.reducer
