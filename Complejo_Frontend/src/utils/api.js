export const API_URL = 'http://localhost:8080'

// Configuración que se le pasa a axios en los endpoints protegidos: agrega el token JWT.
// Los endpoints públicos (catálogo, login, registro) se llaman sin esta configuración.
export const conToken = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
  }
})
