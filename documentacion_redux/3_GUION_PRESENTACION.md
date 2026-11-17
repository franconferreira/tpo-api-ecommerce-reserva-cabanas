# Guion de presentación: Redux en el frontend, pantalla por pantalla

> Para cada pantalla: qué archivos intervienen, qué hace cada uno, qué **parámetros** (props) recibe y qué **métodos** tiene.
> Primero se presenta la base, que comparten todas las pantallas. Después se recorre cada pantalla en el orden en que la usa un cliente y, al final, las del administrador.
>
> Las frases en *cursiva* son una sugerencia de lo que se puede decir en voz alta.

---

## Parte 0: La base (la usan todas las pantallas)

*"Antes, todo el estado de la app vivía en `App.jsx` y bajaba por props. Lo pasamos a un store global de Redux Toolkit. Les muestro primero la base y después cómo lo usa cada pantalla."*

### `src/main.jsx`
- **Qué hace:** es el punto de entrada. Monta `<App />` dentro de `<Provider store={store}>` y `<BrowserRouter>`.
- **Parámetros:** ninguno.
- **Métodos:** ninguno propio; usa `createRoot(...).render(...)`.
- *"El `Provider` es lo que permite que cualquier componente, sin importar lo profundo que esté, lea el store."*

### `src/Redux/store.js`
- **Qué hace:** crea el store con `configureStore` y registra los 7 reducers: `auth`, `carrito`, `reservas`, `espacios`, `adminEspacios`, `adminReservas` y `adminUsuarios`.
- **Exporta:** `store`.
- *"Cada clave es el nombre con el que después leemos el estado: `state.auth`, `state.carrito`, etcétera."*

### `src/utils/api.js`
- **Qué hace:** centraliza la configuración de las llamadas al back.
- **Exporta:**
  - `API_URL`: `'http://localhost:8080'`.
  - `conToken()`: devuelve `{ headers: { Authorization: 'Bearer <token>' } }`, leyendo el token de `localStorage`. Se pasa como último argumento a axios en los endpoints protegidos.
- *"Antes acá había un `apiFetch` con fetch. Con axios ya no hace falta convertir a JSON ni armar el body a mano."*

### `src/App.jsx`
- **Qué hace:** arma las rutas y se encarga de la lógica que es de toda la app:
  - redirige según la sesión y el rol;
  - carga el perfil, el carrito y las reservas al iniciar sesión;
  - cierra la sesión.
- **Estado local que conserva:** `idioma`, `tema`, `isBuzonOpen`, `espacioSeleccionado` (el espacio que muestra el modal de detalle).
- **Lee del store:** `state.auth` (`token`, `isLogged`, `rol`, `cuentaDesactivada`).
- **Efectos (`useEffect`):**
  - **Redirección por rol:** el admin no puede ver pantallas de cliente; el cliente logueado sale de `/login`; el visitante no entra a rutas privadas. Al iniciar sesión muestra antes la pantalla de "Bienvenido".
  - `dispatch(fetchPerfil())` cuando hay token y cambia la pantalla, para verificar que la cuenta siga activa.
  - `dispatch(fetchCarrito())` y `dispatch(fetchMisReservas())` cuando inicia sesión un cliente.
  - Si el back avisó que la cuenta fue desactivada: limpia la sesión y vuelve al login.
- **Métodos:**
  - `handleLogout()`: muestra "Hasta pronto" y despacha `logout()`, `vaciarCarrito()` y `limpiarReservas()`.
  - `handleToggleTema()`: cambia entre claro y oscuro.
  - `handleAbrirDetalle(espacio)` y `handleCerrarDetalle()`: abren y cierran el modal de detalle.

### `src/components/layout/MainLayout.jsx`
- **Qué hace:** estructura de las pantallas internas: barra, contenido de la ruta (`<Outlet />`), pie y paneles laterales (carrito, buzón, modal de detalle).
- **Parámetros:** `idioma`, `setIdioma`, `tema`, `onToggleTema`, `onLogout`, `isBuzonOpen`, `setIsBuzonOpen`, `espacioSeleccionado`, `onCerrarDetalle`.
- **Lee del store:** `state.auth.rol`, `state.auth.isLogged`, `state.carrito.abierto`.
- **Efecto:** mientras hay un cliente logueado, `dispatch(fetchCarrito())` cada 20 segundos y al abrir el carrito. El back saca los ítems vencidos, así que desaparecen solos.

### `src/components/layout/Navigation.jsx`
- **Qué hace:** elige la barra de cliente (`NavCliente`) o la de administrador (`NavAdmin`) y les pasa los datos que lee del store.
- **Parámetros:** `idioma`, `setIdioma`, `tema`, `onToggleTema`, `onLogout`, `onAbrirBuzon`.
- **Lee del store:** `isLogged`, `rol` y `nombreUsuario` (de `state.auth`); la cantidad de ítems del carrito; la cantidad de notificaciones (de `state.reservas`).
- **Métodos:**
  - `onAbrirCarrito()`: `dispatch(abrirCarrito())`.
  - `handleSignOut()`: llama a `onLogout()` y navega al login.
  - `handleToggleIdioma()`: cambia entre español e inglés.
- *"Antes la cantidad del carrito bajaba por cuatro niveles de props. Ahora `Navigation` la lee directo del store."*

---

## Parte 1: Inicio de sesión y registro (`/login`, `/register`)

*"Empecemos por la entrada. Acá se ve el patrón completo: un formulario despacha un thunk, el slice guarda el resultado y `App` reacciona."*

### `src/Redux/authSlice.js`
- **Estado inicial:** `token`, `rol`, `nombreUsuario`, `isLogged`, `cuentaDesactivada`, `errorLogin`, `errorRegistro`.
- **Thunks:**
  - `login(datos)`: `datos = { email, password }`. Hace `POST /api/auth/login`, guarda el token en `localStorage` y devuelve `{ token, rol }`.
  - `register(datos)`: `datos = { username, nombre, apellido, email, password }`. Hace `POST /api/auth/register` y guarda el token.
  - `fetchPerfil()`: `GET /api/usuarios/me` con token. Devuelve `rol`, `nombre` y `apellido`.
- **Reducers sincrónicos:**
  - `logout()`: borra los datos de la sesión.
  - `limpiarAvisos()`: borra los errores y el aviso de cuenta desactivada.
- **`extraReducers`:**
  - `login.fulfilled` y `register.fulfilled`: guardan `token` y `rol`, y ponen `isLogged = true`.
  - `login.rejected`: si el error es 403 marca `cuentaDesactivada`; si no, `errorLogin`.
  - `fetchPerfil.fulfilled`: arma `nombreUsuario`.
  - `fetchPerfil.rejected` con 401: cierra la sesión y marca `cuentaDesactivada` (el admin dio de baja la cuenta mientras estaba conectada).

### `src/views/LoginView.jsx` y `src/views/RegisterView.jsx`
- **Qué hacen:** arman la pantalla (banner a la izquierda y formulario a la derecha).
- **Parámetros:** `idioma`, `setIdioma`, `tema`, `onToggleTema`.
- *"Ya no reciben ni pasan nada de la sesión: eso lo resuelve el formulario con Redux."*

### `src/components/auth/LoginForm.jsx`
- **Parámetros:** `idioma`, `setIdioma`, `tema`, `onToggleTema`.
- **Estado local:** `email`, `password`, `error` (errores de validación del propio formulario).
- **Lee del store:** `cuentaDesactivada` y `errorLogin`.
- **Métodos:**
  - `limpiarMensajes()`: borra el error local y, si había avisos del store, despacha `limpiarAvisos()`.
  - `handleEmailChange(e)` y `handlePasswordChange(e)`: actualizan el campo y limpian los mensajes.
  - `handleClick()`: valida que no haya campos vacíos y hace `dispatch(login({ email, password }))`.
  - `handleSubmit(e)`: evita que se recargue la página y llama a `handleClick()`.
- *"No navega: cuando `isLogged` pasa a verdadero, `App` hace la redirección."*

### `src/components/auth/RegisterForm.jsx`
- **Parámetros:** `idioma`, `setIdioma`, `tema`, `onToggleTema`.
- **Estado local:** `username`, `nombre`, `apellido`, `email`, `password`, `error`.
- **Lee del store:** `errorRegistro`.
- **Efecto:** al entrar, `dispatch(limpiarAvisos())`.
- **Métodos:**
  - Un `handle...Change(e)` por cada campo.
  - `handleClick()`: valida y hace `dispatch(register(datos))`. Ya no envía el rol.
  - `handleSubmit(e)`.

---

## Parte 2: Catálogo (`/catalogo`)

*"Una vez adentro, el catálogo pide los espacios al back una sola vez y los guarda en el store."*

### `src/Redux/espaciosSlice.js`
- **Estado inicial:** `items`, `loading`, `error`, `fechasOcupadas`.
- **Thunks** (endpoints públicos, sin token):
  - `fetchEspacios()`: `GET /api/espacios`.
  - `fetchFechasOcupadas(espacioId)`: `GET /api/espacios/:id/fechas-ocupadas`.
- **`extraReducers`:**
  - `fetchEspacios`: `pending` prende `loading`; `fulfilled` guarda `items`; `rejected` guarda el mensaje de `error`.
  - `fetchFechasOcupadas`: `pending` vacía las fechas (para no mostrar las del espacio anterior); `fulfilled` las guarda.

### `src/views/CatalogoView.jsx`
- **Parámetros:** `idioma`, `onAbrirDetalle`.
- **Qué hace:** muestra la portada (título, ventana con foto y botones) y la sección "Nuestros refugios" con la lista.
- **Métodos:** `irAEspacios(e)`, que baja con desplazamiento suave hasta las tarjetas.

### `src/components/catalogo/EspacioList.jsx`
- **Parámetros:** `idioma`, `onAbrirDetalle`.
- **Lee del store:** `items`, `loading` y `error` de `state.espacios`.
- **Efecto:** al montarse, `dispatch(fetchEspacios())`.
- **Qué muestra:** un mensaje de carga, uno de error o la grilla de `EspacioCard`.

### `src/components/catalogo/EspacioCard.jsx`
- **Parámetros:** `idioma`, `id`, `nombre`, `descripcion`, `precioBase`, `tipo`, `imagenes`, `variante`, `onVerDetalle`.
- **Métodos:**
  - `handleClick()`: llama a `onVerDetalle` con los datos del espacio.
  - `renderBadgeCapacidad()`: muestra la capacidad según el tipo.
- *"Es un componente de presentación: no usa Redux, recibe todo por props."*

---

## Parte 3: Detalle de un espacio (modal) y agregar al carrito

*"Al tocar una tarjeta se abre el detalle. Acá trabajan juntos dos slices: `espacios` para las fechas ocupadas y `carrito` para agregar."*

### `src/components/detalle/DetalleEspacioModal.jsx`
- **Parámetros:** `idioma`, `espacio`, `onClose`.
- **Lee del store:** `state.carrito.abierto`.
- **Efectos:**
  - Si se abre el carrito (porque se agregó algo), cierra el modal llamando a `onClose()`.
  - Con la tecla Escape, también cierra.

### `src/views/DetalleEspacioView.jsx`
- **Parámetros:** `idioma`, `espacio`, `onClose`.
- **Qué hace:** arma el contenido del detalle: galería, descripción y el widget de reserva.

### `src/components/detalle/CalendarioDisponibilidad.jsx`
- **Parámetros:** `idioma`, `espacioId`, `fechasSeleccionadas`, `setFechasSeleccionadas`.
- **Lee del store:** `state.espacios.fechasOcupadas`.
- **Efecto:** `dispatch(fetchFechasOcupadas(espacioId))` cada vez que cambia el espacio.
- **Métodos:**
  - `handleMesAnterior()` y `handleMesSiguiente()`: cambian el mes que se ve.
  - `handleSeleccionarDia(fechaIso)`: agrega o quita una noche de la selección.
- **Usa:** `armarCeldasMes(anio, mes, fechasOcupadas)` (de `utils/fechas.js`), que marca cada día como pasado, ocupado o disponible.

### `src/components/detalle/ReservaWidgetForm.jsx`
- **Parámetros:** `idioma`, `espacio`.
- **Estado local:** `fechasSeleccionadas`, `error`.
- **Lee del store:** `state.auth.isLogged` y `state.carrito.errorAgregar`.
- **Efecto:** al abrirse, `dispatch(limpiarErroresCarrito())`, para no mostrar el error de otro espacio.
- **Métodos:** `handleClick()`:
  1. Si no hay sesión, manda al login.
  2. Valida que haya noches elegidas y que sean consecutivas.
  3. Calcula `checkIn` (la primera noche) y `checkOut` (el día después de la última).
  4. Hace `dispatch(agregarAlCarrito({ espacioId, checkIn, checkOut }))`.
- **Caso especial:** si el espacio es el salón comunal, no se reserva: muestra un aviso y un botón para ver las habitaciones.

---

## Parte 4: Carrito (panel lateral) y checkout (`/checkout`)

*"El carrito es el mejor ejemplo de por qué conviene Redux: lo leen la barra, el panel, el checkout y el recorrido virtual, y ninguno se lo pasa al otro."*

### `src/Redux/carritoSlice.js`
- **Estado inicial:**
  - `data`: el carrito, con `items`, `total`, `totalSinDescuento` y `descuentoPackPorcentaje`.
  - `abierto`: si el panel está abierto.
  - Errores: `errorAgregar`, `errorEliminar`, `errorCheckout`.
  - `checkoutExitoso`.
  - `abrirAlAgregar` y `avisoMapa`: se agregaron para el recorrido virtual.
- **Thunks** (todos con token):
  - `fetchCarrito()`: `GET /api/carrito`.
  - `agregarAlCarrito(nuevoItem)`: `POST /api/carrito/items`, con `nuevoItem = { espacioId, checkIn, checkOut }`.
  - `eliminarDelCarrito(itemId)`: `DELETE /api/carrito/items/:id`. Devuelve `{ carrito, itemId }`.
  - `confirmarCheckout()`: `POST /api/carrito/checkout`.
- **Reducers sincrónicos:**
  - `abrirCarrito()` y `cerrarCarrito()`.
  - `setAbrirAlAgregar(bool)`.
  - `limpiarErroresCarrito()`, `reiniciarCheckout()`.
  - `vaciarCarrito()`: se usa al cerrar sesión.
- **`extraReducers` destacados:**
  - `agregarAlCarrito.fulfilled`: guarda el carrito nuevo y abre el panel. En el recorrido virtual, en cambio, prende `avisoMapa`.
  - `eliminarDelCarrito.fulfilled`: actualiza los totales y saca el ítem de la lista.
  - `confirmarCheckout.fulfilled`: vacía el carrito y marca `checkoutExitoso`.
  - `confirmarCheckout.rejected`: marca el error. La pantalla vuelve a pedir el carrito.

### `src/components/carrito/CarritoDrawer.jsx`
- **Parámetros:** `idioma`.
- **Lee del store:** `data`, `abierto` y `errorEliminar`.
- **Métodos:**
  - `handleCerrar()`: `dispatch(cerrarCarrito())`.
  - `handleEliminar(itemId)`: `dispatch(eliminarDelCarrito(itemId))`.
  - `handleIrACheckout()`: cierra el panel y navega a `/checkout`. Desde el recorrido virtual lo hace con un fundido.
- **Hijos:**
  - `CarritoItem`, con `idioma`, `item`, `index` y `onEliminar`.
  - `CarritoFooter`, con `idioma`, `totalSinDescuento`, `descuentoPack`, `total`, `mostrarCheckout` y `onIrACheckout`.

### `src/views/CheckoutView.jsx`
- **Parámetros:** `idioma`.
- **Qué hace:** arma la pantalla del checkout con `CheckoutResumen`.

### `src/components/carrito/CheckoutResumen.jsx`
- **Parámetros:** `idioma`.
- **Estado local:** `error`, `medioPago` (tarjeta, billetera, transferencia o recepción) y `datosPago` (número de tarjeta, titular, vencimiento, CVV, cuotas, etc.).
- **Lee del store:** `data`, `errorCheckout` y `checkoutExitoso`.
- **Efectos:**
  - Al entrar, `dispatch(limpiarErroresCarrito())`.
  - Si el checkout falló, `dispatch(fetchCarrito())` para mostrar lo que quedó de verdad.
  - Si salió bien, `dispatch(reiniciarCheckout())` y navega a Mis Reservas.
- **Métodos:**
  - `actualizarDato(campo, valor)`: cambia un dato del medio de pago.
  - `handleConfirmarCheckout()`: valida que el carrito no esté vacío y los datos del medio de pago elegido (por ejemplo, 16 dígitos de tarjeta, titular, vencimiento y CVV). Después hace `dispatch(confirmarCheckout())`.

---

## Parte 5: Mis reservas (`/mis-reservas`) y buzón de notificaciones

*"Con un solo pedido al back llenamos dos cosas: la lista de reservas y el buzón de avisos."*

### `src/Redux/reservasSlice.js`
- **Estado inicial:** `items`, `notificaciones`, `ocultasIds`, `loading`, `errorCancelar`.
- **Thunks:**
  - `fetchMisReservas()`: `GET /api/reservas/mis-reservas`.
  - `cancelarReserva(id)`: `DELETE /api/reservas/:id`.
  - `leerNotificacion(id)`: `PATCH /api/reservas/:id/leer-notificacion`.
- **Reducers sincrónicos:**
  - `ocultarReserva(id)`: la saca de la vista solo en el front.
  - `limpiarReservas()`: se usa al cerrar sesión.
- **`extraReducers`:**
  - `fetchMisReservas.fulfilled`: guarda `items` y arma `notificaciones` filtrando las reservas canceladas por el admin con mensaje y todavía no leídas.
  - `cancelarReserva.fulfilled`: saca la reserva de `items`.
  - `leerNotificacion.fulfilled`: saca el aviso de `notificaciones`.

### `src/views/MisReservasView.jsx`
- **Parámetros:** `idioma`.
- **Qué hace:** encabezado de la pantalla y `MisReservasList`.

### `src/components/reservas/MisReservasList.jsx`
- **Parámetros:** `idioma`.
- **Lee del store:** `items`, `ocultasIds` y `errorCancelar`.
- **Efecto:** al montarse, `dispatch(fetchMisReservas())`.
- **Métodos:**
  - `handleOcultarReserva(id)`: `dispatch(ocultarReserva(id))`.
  - `handleCancelar(id)`: `dispatch(cancelarReserva(id))`.
- **Hijo:** `ReservaCard`, con `idioma`, `reserva`, `index`, `onCancelar` y `onOcultarReserva`.

### `src/components/reservas/BuzonDrawer.jsx`
- **Parámetros:** `idioma`, `isOpen`, `onClose`.
- **Lee del store:** `state.reservas.notificaciones`.
- **Métodos:** `handleDescartar(id)`, que hace `dispatch(leerNotificacion(id))`.
- **Hijo:** `BuzonItem`, con `idioma`, `reserva` y `onDescartar`.
- *"El número del sobre en la barra sale del mismo `state.reservas.notificaciones`: cuando se descarta un aviso, baja solo."*

---

## Parte 6: Recorrido virtual (`/mapa-3d`)

*"El recorrido virtual también se conecta a Redux. Del store toma los datos de los espacios, si hay sesión y el carrito."*

### `src/views/Mapa3DView.jsx`
- **Parámetros:** `idioma`, `setIdioma`, `tema`, `onToggleTema`, `onLogout`, `onAbrirDetalle`, `detalleAbierto`.
- **Lee del store:**
  - `state.espacios.items`: nombre y precio de cada construcción.
  - `state.auth.isLogged`: qué opciones muestra el menú de pausa.
  - `state.carrito`: `avisoMapa`, `abierto` y la cantidad de ítems.
- **Efectos con Redux:**
  - `dispatch(fetchEspacios())` al entrar.
  - `dispatch(setAbrirAlAgregar(false))` al entrar y `(true)` al salir, para que agregar al carrito no abra el panel mientras se recorre.
- **Métodos principales:**
  - `espacioDe(datos)`: busca en el store el espacio que corresponde a una construcción del mapa.
  - `elegir(datos)`: abre el detalle con `onAbrirDetalle(espacio)`, o la lista de habitaciones si es la casa.
  - `cambiarAerea(valor)`, `aparecerEn(destino)`, `cambiarSonido()`, `volverAPagina()`: controles del recorrido.
  - El botón de carrito del menú de pausa hace `dispatch(abrirCarrito())`.
- *"La parte 3D (cámara, terreno, sonido) vive en `src/mapa3d/` y no usa Redux. Esta pantalla es el puente entre el 3D y el resto del sitio."*

---

## Parte 7: Administración, espacios (`/admin/espacios`)

*"En el panel de administración cada sección tiene su propio slice. Además, mostramos cuándo conviene estado local."*

### `src/Redux/adminEspaciosSlice.js`
- **Estado inicial:**
  - `items`, `loading`.
  - `error`: puede ser `'crear'`, `'precio'` o `'estado'`.
  - `exito`: el último cambio que salió bien, para mostrar el mensaje.
  - `guardadoId`: qué fila muestra el ✓ de guardado.
- **Thunks** (con token):
  - `fetchAdminEspacios()`: `GET /api/admin/espacios`.
  - `crearEspacio(nuevoEspacio)`: `POST`, con `nuevoEspacio = { nombre, precioBase, tipo, descripcion, imagenes }`.
  - `actualizarEspacio(espacioEditado)`: `PUT /:id`.
  - `cambiarEstadoEspacio(espacio)`: si está activo, `DELETE` (lo pone en mantenimiento); si no, `PATCH /:id/restaurar`.
- **Función auxiliar:** `subirImagen(archivo)`. No es un thunk: es una función async que hace `POST /api/admin/imagenes` con un `FormData` y devuelve la URL.
- **`extraReducers`:**
  - `crearEspacio.fulfilled`: agrega el espacio a `items`.
  - `actualizarEspacio.fulfilled`: reemplaza el espacio y guarda `exito` y `guardadoId`.
  - `cambiarEstadoEspacio.fulfilled`: cambia `activo`.

### `src/views/AdminEspaciosView.jsx`
- **Parámetros:** `idioma`.
- **Qué hace:** encabezado, formulario de alta y tabla.

### `src/components/admin/espacios/AdminEspacioForm.jsx`
- **Parámetros:** `idioma`.
- **Estado local:** `nombre`, `precioBase`, `tipo`, `descripcion`, `imagenes` (la URL escrita), `subidas` (las URLs de imágenes subidas desde la computadora), `subiendo` y `error`.
- **Lee del store:** `state.adminEspacios.error`.
- **Métodos:**
  - Un `handle...Change(e)` por cada campo.
  - `handleArchivos(e)`: sube cada imagen elegida con `subirImagen` y la agrega a `subidas`.
  - `quitarSubida(url)`: quita una imagen subida.
  - `handleAgregarEspacio()`: valida, arma `datosAEnviar` y hace `dispatch(crearEspacio(datosAEnviar))`.

### `src/components/admin/espacios/AdminEspacios.jsx`
- **Parámetros:** `idioma`.
- **Lee del store:** `items`, `error`, `exito` y `guardadoId`.
- **Efecto:** `dispatch(fetchAdminEspacios())`.
- **Métodos:**
  - `handleGuardarPrecio(espacio, precioEscrito)`: valida el precio y hace `dispatch(actualizarEspacio({ ...espacio, precioBase }))`.
  - `handleToggleEstado(espacio)`: `dispatch(cambiarEstadoEspacio(espacio))`.

### `src/components/admin/espacios/AdminEspacioRow.jsx`
- **Parámetros:** `idioma`, `espacio`, `guardado`, `onGuardarPrecio`, `onToggleEstado`.
- **Estado local:** `precio`, el precio que se está escribiendo.
- *"El precio a medio escribir no le importa a nadie más que a esta fila, por eso es estado local. Recién al guardar pasa por Redux."*

---

## Parte 8: Administración, reservas (`/admin/reservas`)

### `src/Redux/adminReservasSlice.js`
- **Estado inicial:** `items`, `loading`, `errorCancelar`.
- **Thunks:**
  - `fetchAdminReservas()`: `GET /api/admin/reservas`.
  - `cancelarReservaAdmin({ id, mensajeCancelacion })`: `DELETE /:id`, con el motivo en el body. En axios, el body de un DELETE va en `config.data`.
- **`extraReducers`:** `cancelarReservaAdmin.fulfilled` marca la reserva como `CANCELADA` y guarda el motivo. Ese motivo es el que después ve el cliente en su buzón.

### `src/views/AdminReservasView.jsx`
- **Parámetros:** `idioma`.

### `src/components/admin/reservas/AdminReservas.jsx`
- **Parámetros:** `idioma`.
- **Lee del store:** `items` y `errorCancelar`.
- **Efecto:** `dispatch(fetchAdminReservas())`.
- **Métodos:** `handleCancelarReserva(reserva, motivoEscrito)`, que hace `dispatch(cancelarReservaAdmin({ id, mensajeCancelacion }))`.

### `src/components/admin/reservas/AdminReservaRow.jsx`
- **Parámetros:** `idioma`, `reserva`, `onCancelar`.
- **Estado local:** `motivo`, el texto de la cancelación.

---

## Parte 9: Administración, usuarios (`/admin/usuarios`)

### `src/Redux/adminUsuariosSlice.js`
- **Estado inicial:** `items`, `loading`, `error` (`'estado'` o `'rol'`).
- **Thunks:**
  - `fetchUsuarios()`: `GET /api/admin/usuarios`.
  - `cambiarEstadoUsuario(usuario)`: si está activo, `DELETE` (lo da de baja); si no, `PATCH /:id/restaurar`. Devuelve `{ id, activo }`.
  - `cambiarRolUsuario(usuario)`: `PUT /:id/rol`, alternando entre `ROLE_ADMIN` y `ROLE_CLIENTE`. Devuelve el usuario actualizado.
- **`extraReducers`:** actualizan el usuario en `items`; si algo falla, marcan `error`.

### `src/views/AdminUsuariosView.jsx`
- **Parámetros:** `idioma`.

### `src/components/admin/usuarios/AdminUsuarios.jsx`
- **Parámetros:** `idioma`.
- **Lee del store:** `items` y `error`.
- **Efecto:** `dispatch(fetchUsuarios())`.
- **Métodos:**
  - `handleToggleEstado(usuario)`: `dispatch(cambiarEstadoUsuario(usuario))`.
  - `handleToggleRol(usuario)`: `dispatch(cambiarRolUsuario(usuario))`.

### `src/components/admin/usuarios/AdminUsuarioRow.jsx`
- **Parámetros:** `idioma`, `usuario`, `onToggleRol`, `onToggleEstado`.
- *"Si el admin da de baja una cuenta que está conectada, en su próximo cambio de pantalla `fetchPerfil` recibe un 401 y `authSlice` cierra la sesión: los dos lados quedan conectados a través del back."*

---

## Cierre

*"En resumen:*
- *un solo store con siete slices, uno por tema;*
- *los componentes leen con `useSelector` y piden cambios con `dispatch`;*
- *todo lo que va al back pasa por thunks con axios, que manejan los estados de carga, éxito y error en un solo lugar;*
- *y el estado que es de un solo componente quedó local.*

*Así, agregar una pantalla nueva que use el carrito o la sesión no obliga a tocar `App` ni a pasar props por varios niveles."*
