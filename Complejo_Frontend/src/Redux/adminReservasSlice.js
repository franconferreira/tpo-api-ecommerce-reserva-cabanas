import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_URL, conToken } from '../utils/api'

const URL = `${API_URL}/api/admin/reservas`

export const fetchAdminReservas = createAsyncThunk('adminReservas/fetchAdminReservas', async () => {
  const { data } = await axios.get(URL, conToken())
  return data
})

// En axios, el body de un DELETE va dentro de la configuración, en la propiedad data
export const cancelarReservaAdmin = createAsyncThunk('adminReservas/cancelarReservaAdmin', async (cancelacion) => {
  const { id, mensajeCancelacion } = cancelacion
  await axios.delete(`${URL}/${id}`, { ...conToken(), data: { mensajeCancelacion } })
  return { id, mensajeCancelacion }
})

const adminReservasSlice = createSlice({
  name: 'adminReservas',
  initialState: {
    items: [],
    loading: false,
    errorCancelar: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminReservas.pending, (state) => {
        state.loading = true
        state.errorCancelar = false
      })
      .addCase(fetchAdminReservas.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchAdminReservas.rejected, (state) => {
        state.loading = false
      })
      .addCase(cancelarReservaAdmin.pending, (state) => {
        state.errorCancelar = false
      })
      .addCase(cancelarReservaAdmin.fulfilled, (state, action) => {
        const index = state.items.findIndex((reserva) => reserva.id === action.payload.id)
        if (index !== -1) {
          state.items[index].estado = 'CANCELADA'
          state.items[index].mensajeCancelacion = action.payload.mensajeCancelacion
        }
      })
      .addCase(cancelarReservaAdmin.rejected, (state) => {
        state.errorCancelar = true
      })
  }
})

export default adminReservasSlice.reducer
