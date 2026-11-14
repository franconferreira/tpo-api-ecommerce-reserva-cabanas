import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_URL, conToken } from '../utils/api'

// El token se guarda en localStorage dentro del thunk (no en el reducer),
// porque los reducers tienen que ser funciones puras.
export const login = createAsyncThunk('auth/login', async (datos) => {
  const { data } = await axios.post(`${API_URL}/api/auth/login`, datos)
  localStorage.setItem('jwtToken', data.token)
  return data
})

export const register = createAsyncThunk('auth/register', async (datos) => {
  const { data } = await axios.post(`${API_URL}/api/auth/register`, datos)
  localStorage.setItem('jwtToken', data.token)
  return data
})

export const fetchPerfil = createAsyncThunk('auth/fetchPerfil', async () => {
  const { data } = await axios.get(`${API_URL}/api/usuarios/me`, conToken())
  return data
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: '',
    rol: '',
    nombreUsuario: '',
    isLogged: false,
    cuentaDesactivada: false,
    errorLogin: false,
    errorRegistro: false
  },
  reducers: {
    // Reducers síncronos: no le pegan al back, solo cambian el estado
    logout: (state) => {
      state.token = ''
      state.rol = ''
      state.nombreUsuario = ''
      state.isLogged = false
      state.cuentaDesactivada = false
    },
    limpiarAvisos: (state) => {
      state.cuentaDesactivada = false
      state.errorLogin = false
      state.errorRegistro = false
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.errorLogin = false
        state.cuentaDesactivada = false
      })
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token
        state.rol = action.payload.rol
        state.isLogged = true
      })
      .addCase(login.rejected, (state, action) => {
        // El back responde 403 si la cuenta está desactivada y 401 si las credenciales son incorrectas
        if (action.error.message.includes('403')) {
          state.cuentaDesactivada = true
        } else {
          state.errorLogin = true
        }
      })
      .addCase(register.pending, (state) => {
        state.errorRegistro = false
      })
      .addCase(register.fulfilled, (state, action) => {
        state.token = action.payload.token
        state.rol = action.payload.rol
        state.isLogged = true
      })
      .addCase(register.rejected, (state) => {
        state.errorRegistro = true
      })
      .addCase(fetchPerfil.fulfilled, (state, action) => {
        state.rol = action.payload.rol
        state.nombreUsuario = `${action.payload.nombre} ${action.payload.apellido}`
        state.isLogged = true
      })
      .addCase(fetchPerfil.rejected, (state, action) => {
        // 401 = el admin desactivó la cuenta mientras el usuario estaba logueado
        if (action.error.message.includes('401')) {
          state.token = ''
          state.rol = ''
          state.nombreUsuario = ''
          state.isLogged = false
          state.cuentaDesactivada = true
        }
      })
  }
})

export const { logout, limpiarAvisos } = authSlice.actions

export default authSlice.reducer
