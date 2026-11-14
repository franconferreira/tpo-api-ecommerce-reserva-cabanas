import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_URL, conToken } from '../utils/api'

const URL = `${API_URL}/api/admin/usuarios`

export const fetchUsuarios = createAsyncThunk('adminUsuarios/fetchUsuarios', async () => {
  const { data } = await axios.get(URL, conToken())
  return data
})

// Activo → se da de baja (DELETE). Desactivado → se restaura (PATCH).
export const cambiarEstadoUsuario = createAsyncThunk('adminUsuarios/cambiarEstadoUsuario', async (usuario) => {
  if (usuario.activo) {
    await axios.delete(`${URL}/${usuario.id}`, conToken())
  } else {
    await axios.patch(`${URL}/${usuario.id}/restaurar`, null, conToken())
  }
  return { id: usuario.id, activo: !usuario.activo }
})

// El back devuelve el usuario actualizado (sin la contraseña)
export const cambiarRolUsuario = createAsyncThunk('adminUsuarios/cambiarRolUsuario', async (usuario) => {
  const nuevoRol = usuario.rol === 'ROLE_ADMIN' ? 'ROLE_CLIENTE' : 'ROLE_ADMIN'
  const { data } = await axios.put(`${URL}/${usuario.id}/rol`, { rol: nuevoRol }, conToken())
  return data
})

const adminUsuariosSlice = createSlice({
  name: 'adminUsuarios',
  initialState: {
    items: [],
    loading: false,
    error: null // 'estado' | 'rol'
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsuarios.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsuarios.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchUsuarios.rejected, (state) => {
        state.loading = false
      })
      .addCase(cambiarEstadoUsuario.pending, (state) => {
        state.error = null
      })
      .addCase(cambiarEstadoUsuario.fulfilled, (state, action) => {
        const index = state.items.findIndex((usuario) => usuario.id === action.payload.id)
        if (index !== -1) {
          state.items[index].activo = action.payload.activo
        }
      })
      .addCase(cambiarEstadoUsuario.rejected, (state) => {
        state.error = 'estado'
      })
      .addCase(cambiarRolUsuario.pending, (state) => {
        state.error = null
      })
      .addCase(cambiarRolUsuario.fulfilled, (state, action) => {
        const index = state.items.findIndex((usuario) => usuario.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(cambiarRolUsuario.rejected, (state) => {
        state.error = 'rol'
      })
  }
})

export default adminUsuariosSlice.reducer
