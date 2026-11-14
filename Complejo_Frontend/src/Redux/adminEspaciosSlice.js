import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_URL, conToken } from '../utils/api'

const URL = `${API_URL}/api/admin/espacios`

export const fetchAdminEspacios = createAsyncThunk('adminEspacios/fetchAdminEspacios', async () => {
  const { data } = await axios.get(URL, conToken())
  return data
})

export const crearEspacio = createAsyncThunk('adminEspacios/crearEspacio', async (nuevoEspacio) => {
  const { data } = await axios.post(URL, nuevoEspacio, conToken())
  return data
})

export const actualizarEspacio = createAsyncThunk('adminEspacios/actualizarEspacio', async (espacioEditado) => {
  const { id, nombre, precioBase, tipo, descripcion, imagenes } = espacioEditado
  const { data } = await axios.put(`${URL}/${id}`, { nombre, precioBase, tipo, descripcion, imagenes }, conToken())
  return data
})

// Activo → se da de baja (DELETE). En mantenimiento → se restaura (PATCH).
export const cambiarEstadoEspacio = createAsyncThunk('adminEspacios/cambiarEstadoEspacio', async (espacio) => {
  if (espacio.activo) {
    await axios.delete(`${URL}/${espacio.id}`, conToken())
  } else {
    await axios.patch(`${URL}/${espacio.id}/restaurar`, null, conToken())
  }
  return { id: espacio.id, nombre: espacio.nombre, activo: !espacio.activo }
})

const adminEspaciosSlice = createSlice({
  name: 'adminEspacios',
  initialState: {
    items: [],
    loading: false,
    error: null, // 'crear' | 'precio' | 'estado'
    exito: null, // último cambio que salió bien, para mostrar el mensaje
    guardadoId: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminEspacios.pending, (state) => {
        state.loading = true
        // Al entrar a la pantalla se borran los mensajes de la visita anterior
        state.error = null
        state.exito = null
        state.guardadoId = null
      })
      .addCase(fetchAdminEspacios.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchAdminEspacios.rejected, (state) => {
        state.loading = false
      })
      .addCase(crearEspacio.pending, (state) => {
        state.error = null
      })
      .addCase(crearEspacio.fulfilled, (state, action) => {
        state.items = [...state.items, action.payload]
      })
      .addCase(crearEspacio.rejected, (state) => {
        state.error = 'crear'
      })
      .addCase(actualizarEspacio.pending, (state) => {
        state.error = null
        state.guardadoId = null
      })
      .addCase(actualizarEspacio.fulfilled, (state, action) => {
        const index = state.items.findIndex((espacio) => espacio.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        state.guardadoId = action.payload.id
        state.exito = { tipo: 'precio', nombre: action.payload.nombre, precioBase: action.payload.precioBase }
      })
      .addCase(actualizarEspacio.rejected, (state) => {
        state.error = 'precio'
      })
      .addCase(cambiarEstadoEspacio.pending, (state) => {
        state.error = null
      })
      .addCase(cambiarEstadoEspacio.fulfilled, (state, action) => {
        const index = state.items.findIndex((espacio) => espacio.id === action.payload.id)
        if (index !== -1) {
          state.items[index].activo = action.payload.activo
        }
        state.exito = { tipo: 'estado', nombre: action.payload.nombre, activo: action.payload.activo }
      })
      .addCase(cambiarEstadoEspacio.rejected, (state) => {
        state.error = 'estado'
      })
  }
})

export default adminEspaciosSlice.reducer
