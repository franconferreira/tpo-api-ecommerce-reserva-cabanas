import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_URL } from '../utils/api'

const URL = `${API_URL}/api/espacios`

// Endpoints públicos: no llevan token
export const fetchEspacios = createAsyncThunk('espacios/fetchEspacios', async () => {
  const { data } = await axios.get(URL)
  return data
})

export const fetchFechasOcupadas = createAsyncThunk('espacios/fetchFechasOcupadas', async (espacioId) => {
  const { data } = await axios.get(`${URL}/${espacioId}/fechas-ocupadas`)
  return data
})

const espaciosSlice = createSlice({
  name: 'espacios',
  initialState: {
    items: [],
    loading: false,
    error: null,
    fechasOcupadas: []
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEspacios.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEspacios.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchEspacios.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchFechasOcupadas.pending, (state) => {
        state.fechasOcupadas = []
      })
      .addCase(fetchFechasOcupadas.fulfilled, (state, action) => {
        state.fechasOcupadas = action.payload
      })
  }
})

export default espaciosSlice.reducer
