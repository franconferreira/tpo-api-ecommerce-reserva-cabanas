export const API_URL = 'http://localhost:8080'

// Arma la petición al backend: URL base, JSON y token JWT.
// Devuelve la promesa de fetch para encadenar .then((res) => res.json()) en cada componente.
// Los endpoints públicos (catálogo, login, registro) se llaman con auth: false.
export const apiFetch = (ruta, { method = 'GET', body, auth = true } = {}) => {
  const headers = {}

  if (body) {
    headers['Content-Type'] = 'application/json'
  }

  if (auth) {
    headers.Authorization = `Bearer ${localStorage.getItem('jwtToken')}`
  }

  return fetch(`${API_URL}${ruta}`, {
    method: method,
    headers: headers,
    body: body ? JSON.stringify(body) : undefined
  })
}
