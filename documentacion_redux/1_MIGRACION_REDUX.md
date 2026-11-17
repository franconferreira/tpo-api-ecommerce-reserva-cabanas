# Migración del frontend a Redux Toolkit y axios

> Commit `da623f9` — *"feat: migrar el frontend a Redux Toolkit y axios"*.
> Sigue el modelo de las dos clases donde la profesora pasó todo lo hecho hasta ese momento a Redux:
> `createAsyncThunk` + `extraReducers`, `useSelector` / `useDispatch` y axios en lugar de fetch.

---

## 1. Qué cambió, en resumen

### Antes

- **El estado vivía en `App.jsx`**, con muchos `useState`: `token`, `isLogged`, `rolUsuario`, `nombreUsuario`, `cuentaDesactivada`, `isCartOpen`, `carritoData`, `mensajesBuzon`, `ocultasIds`, etc.
- **Ese estado bajaba por props.** A veces pasaba por 3 o 4 niveles solo para llegar a un componente. Por ejemplo, la cantidad del carrito iba `App → MainLayout → Navigation → NavCliente`.
- **Cada componente hacía sus llamadas al back** con `fetch`, a través de la función `apiFetch` de `utils/api.js`, y encadenaba `.then((res) => res.json())`.

### Ahora

- **Hay un store global de Redux Toolkit** en `src/Redux/store.js`. Está dividido en 7 *slices* (porciones del estado):

  | Slice | Se lee como | Para qué |
  |---|---|---|
  | `authSlice` | `state.auth` | sesión: token, rol, nombre, si está logueado y avisos de error |
  | `carritoSlice` | `state.carrito` | carrito, si el panel está abierto, errores y resultado del checkout |
  | `reservasSlice` | `state.reservas` | mis reservas, notificaciones del buzón y reservas ocultas |
  | `espaciosSlice` | `state.espacios` | catálogo y fechas ocupadas de un espacio |
  | `adminEspaciosSlice` | `state.adminEspacios` | espacios del panel de administración |
  | `adminReservasSlice` | `state.adminReservas` | reservas del panel de administración |
  | `adminUsuariosSlice` | `state.adminUsuarios` | usuarios del panel de administración |

- **Los componentes leen el estado global con `useSelector`** y piden cambios con `useDispatch`. Ya no lo reciben por props.
- **Las llamadas al back se hacen con axios dentro de los *thunks*** (`createAsyncThunk`). `utils/api.js` quedó solo con dos cosas:
  - `API_URL`: la dirección del back, `http://localhost:8080`.
  - `conToken()`: la configuración de axios que agrega el token JWT en el encabezado `Authorization`.
- **Lo que es de un solo componente quedó como estado local** (`useState`). Por ejemplo, los campos de un formulario, el precio que se está editando en una fila del admin o el motivo de una cancelación.
- **Cambios de paso:** el registro ya no envía el campo `rol` (lo decide el back).

---

## 2. Cómo funciona

1. **`main.jsx`** envuelve toda la app con `<Provider store={store}>`. Así cualquier componente, a cualquier profundidad, puede usar el store.
2. **`store.js`** junta los reducers de los 7 slices con `configureStore`. Cada clave es el nombre con que se lee el estado: `state.auth`, `state.carrito`, etc.
3. **Cada slice** (`createSlice`) tiene cuatro partes:
   - **`initialState`**: cómo arranca esa porción del estado.
   - **`reducers`**: cambios **sincrónicos**, que no van al back. Ejemplos: `abrirCarrito`, `logout`, `ocultarReserva`.
   - **Thunks** (`createAsyncThunk`): funciones **asincrónicas** que llaman al back con axios y devuelven los datos. Ejemplos: `fetchCarrito`, `login`, `crearEspacio`.
   - **`extraReducers`**: qué le pasa al estado en cada momento de un thunk:
     - `pending`: empezó el pedido (por ejemplo, `loading = true`);
     - `fulfilled`: salió bien, y los datos llegan en `action.payload`;
     - `rejected`: falló (por ejemplo, se marca un error para mostrar un mensaje).
4. **El componente** hace `dispatch(thunk(datos))`. Cuando el slice actualiza el estado, **todos** los componentes que lo leen con `useSelector` se vuelven a dibujar solos.

```
Componente ──dispatch(login(datos))──► thunk (axios.post al back)
                                            │
                     pending / fulfilled / rejected
                                            ▼
                                extraReducers del slice
                                            │ (cambia state.auth)
                                            ▼
             todos los componentes con useSelector(state => state.auth) se actualizan
```

---

## 3. Ejemplos

### Ejemplo 1: el inicio de sesión (`LoginForm.jsx` + `authSlice.js`)

**Antes**, `LoginForm` recibía por props `onLogin`, `cuentaDesactivada` y `onLimpiarAviso`, y hacía el pedido él mismo:

```js
apiFetch('/api/auth/login', { method: 'POST', body: datosAEnviar, auth: false })
  .then((res) => res.json())
  .then((data) => {
    localStorage.setItem('jwtToken', data.token)
    onLogin(data)
  })
```

**Ahora** solo recibe `idioma`, `setIdioma`, `tema` y `onToggleTema` (cosas de la interfaz, no de la sesión):

```js
const dispatch = useDispatch()
const { cuentaDesactivada, errorLogin } = useSelector((state) => state.auth)
...
dispatch(login(datosAEnviar))
```

Y en `authSlice.js` está el resto:

```js
export const login = createAsyncThunk('auth/login', async (datos) => {
  const { data } = await axios.post(`${API_URL}/api/auth/login`, datos)
  localStorage.setItem('jwtToken', data.token) // en el thunk, porque los reducers tienen que ser puros
  return data
})
...
.addCase(login.fulfilled, (state, action) => {
  state.token = action.payload.token
  state.rol = action.payload.rol
  state.isLogged = true
})
.addCase(login.rejected, (state, action) => {
  if (action.error.message.includes('403')) state.cuentaDesactivada = true // cuenta dada de baja
  else state.errorLogin = true // usuario o contraseña incorrectos
})
```

`App.jsx` tiene un `useEffect` que mira `isLogged` y `rol`. Cuando cambian, redirige: al catálogo si es cliente y al panel si es administrador. Hoy además muestra antes la pantalla de "Bienvenido".

### Ejemplo 2: el carrito (`carritoSlice.js`)

- **Agregar:** `ReservaWidgetForm`, en el detalle de un espacio, hace `dispatch(agregarAlCarrito({ espacioId, checkIn, checkOut }))`.
- **Respuesta del back:** `agregarAlCarrito.fulfilled` guarda en `state.data` el carrito que devolvió el back y abre el panel (`abierto = true`).
- **Quiénes se enteran:** sin que nadie les pase nada, se actualizan solos:
  - `Navigation`, que lee `state.carrito.data.items.length` para el número del ícono;
  - `CarritoDrawer`, que lee `abierto` y `data`;
  - `CheckoutResumen`.
- **Checkout:** `CheckoutResumen` hace `dispatch(confirmarCheckout())`. Si sale bien, el slice marca `checkoutExitoso` y la pantalla navega a Mis Reservas.

Más tarde se le agregaron dos cosas siguiendo el mismo esquema:
- **`abrirAlAgregar` y `avisoMapa`:** en el recorrido virtual el carrito no se abre al agregar; aparece un ícono de aviso.
- **Volver a pedir el carrito cada 20 segundos** (`MainLayout`): el back saca los ítems vencidos, así que desaparecen solos.

### Ejemplo 3: estado local contra estado global (`AdminEspacioRow.jsx`)

- El precio que el admin está escribiendo en una fila es estado **local** (`useState`), porque solo le importa a esa fila.
- Al tocar "Guardar", la fila avisa a `AdminEspacios`, que hace `dispatch(actualizarEspacio({ ...espacio, precioBase }))`.
- Cuando el `fulfilled` actualiza la lista en `state.adminEspacios.items`, la tabla se redibuja con el dato que confirmó el back y aparece el mensaje de éxito (`exito`).

---

## 4. Archivos modificados en la migración (35)

**Configuración**
- `package.json`, `package-lock.json`: se agregaron `@reduxjs/toolkit`, `react-redux` y `axios`.
- `src/main.jsx`: `<Provider store={store}>`.
- `src/utils/api.js`: se sacó `apiFetch`; quedaron `API_URL` y `conToken()`.
- `src/i18n/textos.js`: textos de error nuevos.

**App y estructura**
- `src/App.jsx`: perdió casi todo el `useState` global y las funciones que pasaba por props. Quedaron las redirecciones por rol, el idioma, el tema y el espacio seleccionado del modal.
- `components/layout/MainLayout.jsx`, `components/layout/Navigation.jsx`: leen sesión, carrito y buzón del store.

**Autenticación**
- `components/auth/LoginForm.jsx`, `components/auth/RegisterForm.jsx`: usan `login` y `register`.
- `views/LoginView.jsx`, `views/RegisterView.jsx`: dejan de pasar la sesión por props.

**Catálogo y detalle**
- `components/catalogo/EspacioList.jsx` y `EspacioList.css`: `fetchEspacios`.
- `components/detalle/CalendarioDisponibilidad.jsx`: `fetchFechasOcupadas`.
- `components/detalle/ReservaWidgetForm.jsx`: `agregarAlCarrito`.
- `components/detalle/DetalleEspacioModal.jsx`, `views/DetalleEspacioView.jsx`.

**Carrito y reservas**
- `components/carrito/CarritoDrawer.jsx`: `eliminarDelCarrito` y `cerrarCarrito`.
- `components/carrito/CheckoutResumen.jsx`, `views/CheckoutView.jsx`: `confirmarCheckout`.
- `components/reservas/MisReservasList.jsx`, `views/MisReservasView.jsx`: `fetchMisReservas`, `cancelarReserva` y `ocultarReserva`.
- `components/reservas/BuzonDrawer.jsx`: `leerNotificacion`.

**Administración**
- `components/admin/espacios/AdminEspacios.jsx`, `AdminEspacioForm.jsx`, `AdminEspacioRow.jsx`.
- `components/admin/reservas/AdminReservas.jsx`, `AdminReservaRow.jsx`.
- `components/admin/usuarios/AdminUsuarios.jsx`.
- `views/AdminEspaciosView.jsx`, `views/AdminReservasView.jsx`, `views/AdminUsuariosView.jsx`.

**Mapa**
- `views/Mapa3DView.jsx`, `views/AdminMapa3DView.jsx`: pasaron a leer los espacios del store. Después el primero se reemplazó por el recorrido virtual nuevo y el segundo se borró.

---

## 5. Archivos nuevos (8, todos en `src/Redux/`)

| Archivo | Qué guarda | Thunks (van al back) | Acciones sincrónicas |
|---|---|---|---|
| `store.js` | une los 7 slices | | |
| `authSlice.js` | `token`, `rol`, `nombreUsuario`, `isLogged`, `cuentaDesactivada`, `errorLogin`, `errorRegistro` | `login`, `register`, `fetchPerfil` | `logout`, `limpiarAvisos` |
| `carritoSlice.js` | `data` (el carrito), `abierto`, `errorAgregar`, `errorEliminar`, `errorCheckout`, `checkoutExitoso` (+ `abrirAlAgregar`, `avisoMapa`) | `fetchCarrito`, `agregarAlCarrito`, `eliminarDelCarrito`, `confirmarCheckout` | `abrirCarrito`, `cerrarCarrito`, `limpiarErroresCarrito`, `reiniciarCheckout`, `vaciarCarrito` (+ `setAbrirAlAgregar`) |
| `reservasSlice.js` | `items`, `notificaciones`, `ocultasIds`, `loading`, `errorCancelar` | `fetchMisReservas`, `cancelarReserva`, `leerNotificacion` | `ocultarReserva`, `limpiarReservas` |
| `espaciosSlice.js` | `items`, `loading`, `error`, `fechasOcupadas` | `fetchEspacios`, `fetchFechasOcupadas` | |
| `adminEspaciosSlice.js` | `items`, `loading`, `error`, `exito`, `guardadoId` | `fetchAdminEspacios`, `crearEspacio`, `actualizarEspacio`, `cambiarEstadoEspacio` (+ la función `subirImagen`) | |
| `adminReservasSlice.js` | `items`, `loading`, `errorCancelar` | `fetchAdminReservas`, `cancelarReservaAdmin` | |
| `adminUsuariosSlice.js` | `items`, `loading`, `error` | `fetchUsuarios`, `cambiarEstadoUsuario`, `cambiarRolUsuario` | |

Lo marcado con (+) se agregó después de la migración, con el mismo esquema.

---

## 6. Cómo se relacionan

```
main.jsx ──Provider──► store.js ──► authSlice, carritoSlice, reservasSlice, espaciosSlice,
                                     adminEspaciosSlice, adminReservasSlice, adminUsuariosSlice
                                                   │
                                     (todos usan axios + utils/api.js: API_URL, conToken)
                                                   │
                                              back (Spring Boot)
```

Qué componentes usan cada slice (con `useSelector` para leer y `dispatch` para pedir cambios):

- **`authSlice`**: `App` (redirecciones y cierre de sesión), `LoginForm`, `RegisterForm`, `Navigation`, `MainLayout`, `ReservaWidgetForm` (si hay sesión) y `Mapa3DView` (menú de pausa).
- **`carritoSlice`**: `ReservaWidgetForm` (agregar), `CarritoDrawer`, `CheckoutResumen`, `Navigation` (número del ícono), `MainLayout` (actualización periódica), `DetalleEspacioModal` y `Mapa3DView` (aviso del carrito).
- **`reservasSlice`**: `MisReservasList`, `BuzonDrawer`, `Navigation` (número del buzón) y `App` (las carga al iniciar sesión).
- **`espaciosSlice`**: `EspacioList` (catálogo), `CalendarioDisponibilidad` y `Mapa3DView` (nombre y precio de cada construcción).
- **Slices del admin**: cada uno con su panel. `adminEspaciosSlice` con `AdminEspacios`, `AdminEspacioForm` y `AdminEspacioRow`; `adminReservasSlice` con `AdminReservas`; `adminUsuariosSlice` con `AdminUsuarios`.

Algunos slices dependen de otros a través de `App`: al hacer `logout`, `App` también despacha `vaciarCarrito` y `limpiarReservas`. Así el siguiente usuario no ve los datos del anterior.
