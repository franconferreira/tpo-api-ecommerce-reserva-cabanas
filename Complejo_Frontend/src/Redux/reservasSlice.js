import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_URL, conToken } from '../utils/api'

const URL = `${API_URL}/api/reservas`

export const fetchMisReservas = createAsyncThunk('reservas/fetchMisReservas', async () => {
  const { data } = await axios.get(`${URL}/mis-reservas`, conToken())
  return data
})

export const cancelarReserva = createAsyncThunk('reservas/cancelarReserva', async (id) => {
  await axios.delete(`${URL}/${id}`, conToken())
  return id
})

export const leerNotificacion = createAsyncThunk('reservas/leerNotificacion', async (id) => {
  await axios.patch(`${URL}/${id}/leer-notificacion`, null, conToken())
  return id
})

const reservasSlice = createSlice({
  name: 'reservas',
  initialState: {
    items: [],
    notificaciones: [],
    ocultasIds: [],
    loading: false,
    errorCancelar: false
  },
  reducers: {
    // Oculta una reserva cancelada de la lista (solo en el front, no se borra en el back)
    ocultarReserva: (state, action) => {
      state.ocultasIds.push(action.payload)
    },
    limpiarReservas: (state) => {
      state.items = []
      state.notificaciones = []
      state.ocultasIds = []
      state.errorCancelar = false
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMisReservas.pending, (state) => {
        state.loading = true
        state.errorCancelar = false
      })
      .addCase(fetchMisReservas.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        // El buzón muestra las reservas que canceló el admin y que el cliente todavía no leyó
        state.notificaciones = action.payload.filter(
          (r) => r.estado === 'CANCELADA' && r.mensajeCancelacion && !r.notificacionLeida
        )
      })
      .addCase(fetchMisReservas.rejected, (state) => {
        state.loading = false
      })
      .addCase(cancelarReserva.pending, (state) => {
        state.errorCancelar = false
      })
      .addCase(cancelarReserva.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload)
      })
      .addCase(cancelarReserva.rejected, (state) => {
        state.errorCancelar = true
      })
      .addCase(leerNotificacion.fulfilled, (state, action) => {
        state.notificaciones = state.notificaciones.filter((m) => m.id !== action.payload)
      })
  }
})

export const { ocultarReserva, limpiarReservas } = reservasSlice.actions

export default reservasSlice.reducer
