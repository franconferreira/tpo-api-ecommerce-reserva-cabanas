# Diagramas de Redux por pantalla

Los diagramas están en **Mermaid**: GitHub, VS Code (con la extensión *Markdown Preview Mermaid Support*) y la mayoría de los visores de Markdown los dibujan solos.

**Cómo leerlos**
- **Rectángulos**: archivos (pantallas `views/` y componentes `components/`).
- **Hexágonos**: slices de Redux (`src/Redux/`).
- **Cilindro**: el back (Spring Boot).
- **Flecha llena** (`-->`): `dispatch(...)`, es decir, el componente pide un cambio.
- **Flecha punteada** (`-.->`): `useSelector(...)`, es decir, el componente lee el estado.
- **Flecha gruesa** (`==>`): pedido HTTP con axios.

---

## 0. Vista general: el store y sus slices

```mermaid
flowchart LR
    main["main.jsx<br/>&lt;Provider store&gt;"] --> store{{"store.js<br/>configureStore"}}
    store --> auth{{"authSlice<br/>state.auth"}}
    store --> carrito{{"carritoSlice<br/>state.carrito"}}
    store --> reservas{{"reservasSlice<br/>state.reservas"}}
    store --> espacios{{"espaciosSlice<br/>state.espacios"}}
    store --> aEsp{{"adminEspaciosSlice<br/>state.adminEspacios"}}
    store --> aRes{{"adminReservasSlice<br/>state.adminReservas"}}
    store --> aUsu{{"adminUsuariosSlice<br/>state.adminUsuarios"}}
    api["utils/api.js<br/>API_URL + conToken()"]
    auth & carrito & reservas & espacios & aEsp & aRes & aUsu --> api
    api ==> back[("Back Spring Boot<br/>localhost:8080")]
```

## 0.1 Ciclo de vida de un thunk (ejemplo: `login`)

```mermaid
sequenceDiagram
    participant C as LoginForm
    participant T as thunk login (authSlice)
    participant B as Back /api/auth/login
    participant R as extraReducers (authSlice)
    participant A as App y Navigation (useSelector)
    C->>T: dispatch(login({ email, password }))
    T->>R: login.pending (se borran errores anteriores)
    T->>B: axios.post(datos)
    B-->>T: { token, rol }
    T->>T: localStorage.setItem('jwtToken', token)
    T->>R: login.fulfilled (payload = { token, rol })
    R->>R: state.isLogged = true, state.rol = rol
    R-->>A: el estado cambió: se vuelven a dibujar
    A->>A: App redirige según el rol
```

## 0.2 Cosas que comparten todas las pantallas (App y layout)

```mermaid
flowchart TB
    App["App.jsx<br/>redirecciones, cerrar sesión"]
    ML["MainLayout.jsx<br/>barra, pie, paneles"]
    Nav["Navigation.jsx"]
    NC["NavCliente.jsx"]
    NA["NavAdmin.jsx"]
    auth{{authSlice}}
    carrito{{carritoSlice}}
    reservas{{reservasSlice}}

    App -.-> auth
    App -->|"fetchPerfil, logout"| auth
    App -->|"fetchCarrito, vaciarCarrito"| carrito
    App -->|"fetchMisReservas, limpiarReservas"| reservas
    ML -.-> auth
    ML -.->|"abierto"| carrito
    ML -->|"fetchCarrito cada 20 s"| carrito
    Nav -.->|"isLogged, rol, nombreUsuario"| auth
    Nav -.->|"cantidad de ítems"| carrito
    Nav -.->|"cantidad de notificaciones"| reservas
    Nav -->|"abrirCarrito"| carrito
    Nav --> NC
    Nav --> NA
    ML --> Nav
```

---

## 1. Inicio de sesión y registro (`/login`, `/register`)

```mermaid
flowchart TB
    LV["views/LoginView.jsx"] --> LF["components/auth/LoginForm.jsx"]
    RV["views/RegisterView.jsx"] --> RF["components/auth/RegisterForm.jsx"]
    auth{{authSlice}}
    LF -->|"login(datos), limpiarAvisos()"| auth
    LF -.->|"cuentaDesactivada, errorLogin"| auth
    RF -->|"register(datos), limpiarAvisos()"| auth
    RF -.->|"errorRegistro"| auth
    auth ==>|"POST /api/auth/login<br/>POST /api/auth/register"| back[(Back)]
    auth -.->|"isLogged / rol"| App["App.jsx<br/>redirige y muestra 'Bienvenido'"]
```

## 2. Catálogo (`/catalogo`)

```mermaid
flowchart TB
    CV["views/CatalogoView.jsx"] --> EL["components/catalogo/EspacioList.jsx"]
    EL --> EC["components/catalogo/EspacioCard.jsx"]
    espacios{{espaciosSlice}}
    EL -->|"fetchEspacios()"| espacios
    EL -.->|"items, loading, error"| espacios
    espacios ==>|"GET /api/espacios"| back[(Back)]
    EC -->|"onVerDetalle(espacio) por props"| App["App.jsx<br/>abre el modal de detalle"]
```

## 3. Detalle de un espacio (modal) y agregar al carrito

```mermaid
flowchart TB
    ML["MainLayout.jsx"] --> DM["components/detalle/DetalleEspacioModal.jsx"]
    DM --> DV["views/DetalleEspacioView.jsx"]
    DV --> CAL["components/detalle/CalendarioDisponibilidad.jsx"]
    DV --> RW["components/detalle/ReservaWidgetForm.jsx"]
    espacios{{espaciosSlice}}
    carrito{{carritoSlice}}
    auth{{authSlice}}
    CAL -->|"fetchFechasOcupadas(espacioId)"| espacios
    CAL -.->|"fechasOcupadas"| espacios
    RW -->|"agregarAlCarrito({espacioId, checkIn, checkOut})"| carrito
    RW -->|"limpiarErroresCarrito()"| carrito
    RW -.->|"errorAgregar"| carrito
    RW -.->|"isLogged"| auth
    DM -.->|"abierto"| carrito
    espacios ==>|"GET /api/espacios/:id/fechas-ocupadas"| back[(Back)]
    carrito ==>|"POST /api/carrito/items"| back
```

## 4. Carrito (panel lateral) y checkout (`/checkout`)

```mermaid
flowchart TB
    ML["MainLayout.jsx"] --> CD["components/carrito/CarritoDrawer.jsx"]
    CD --> CI["CarritoItem.jsx"]
    CD --> CF["CarritoFooter.jsx"]
    CKV["views/CheckoutView.jsx"] --> CR["components/carrito/CheckoutResumen.jsx"]
    CR --> MP["MediosDePago.jsx"]
    carrito{{carritoSlice}}
    CD -.->|"data, abierto, errorEliminar"| carrito
    CD -->|"cerrarCarrito(), eliminarDelCarrito(itemId)"| carrito
    CR -.->|"data, errorCheckout, checkoutExitoso"| carrito
    CR -->|"confirmarCheckout(), fetchCarrito()"| carrito
    CR -->|"limpiarErroresCarrito(), reiniciarCheckout()"| carrito
    carrito ==>|"GET /api/carrito<br/>DELETE /api/carrito/items/:id<br/>POST /api/carrito/checkout"| back[(Back)]
    CR -->|"si salió bien: navega"| MR["/mis-reservas"]
```

## 5. Mis reservas (`/mis-reservas`) y buzón de notificaciones

```mermaid
flowchart TB
    MRV["views/MisReservasView.jsx"] --> MRL["components/reservas/MisReservasList.jsx"]
    MRL --> RC["ReservaCard.jsx"]
    ML["MainLayout.jsx"] --> BD["components/reservas/BuzonDrawer.jsx"]
    BD --> BI["BuzonItem.jsx"]
    reservas{{reservasSlice}}
    MRL -->|"fetchMisReservas(), cancelarReserva(id), ocultarReserva(id)"| reservas
    MRL -.->|"items, ocultasIds, errorCancelar"| reservas
    BD -->|"leerNotificacion(id)"| reservas
    BD -.->|"notificaciones"| reservas
    reservas ==>|"GET /api/reservas/mis-reservas<br/>DELETE /api/reservas/:id<br/>PATCH /api/reservas/:id/leer-notificacion"| back[(Back)]
```

> `notificaciones` no viene del back por separado: el `fulfilled` de `fetchMisReservas` filtra las reservas canceladas por el admin que el cliente todavía no leyó.

## 6. Recorrido virtual (`/mapa-3d`)

```mermaid
flowchart TB
    MV["views/Mapa3DView.jsx"]
    espacios{{espaciosSlice}}
    carrito{{carritoSlice}}
    auth{{authSlice}}
    MV -->|"fetchEspacios()"| espacios
    MV -.->|"items: nombre y precio de cada construcción"| espacios
    MV -.->|"isLogged: opciones del menú de pausa"| auth
    MV -->|"setAbrirAlAgregar(false) al entrar, (true) al salir"| carrito
    MV -.->|"avisoMapa, abierto, cantidad"| carrito
    MV -->|"abrirCarrito()"| carrito
    MV -->|"onAbrirDetalle(espacio) por props"| App["App.jsx<br/>abre el modal de detalle"]
```

---

## 7. Admin: espacios (`/admin/espacios`)

```mermaid
flowchart TB
    AEV["views/AdminEspaciosView.jsx"] --> AE["components/admin/espacios/AdminEspacios.jsx"]
    AEV --> AEF["AdminEspacioForm.jsx"]
    AE --> AER["AdminEspacioRow.jsx<br/>(precio en estado local)"]
    aEsp{{adminEspaciosSlice}}
    AE -->|"fetchAdminEspacios(), actualizarEspacio(), cambiarEstadoEspacio()"| aEsp
    AE -.->|"items, error, exito, guardadoId"| aEsp
    AER -->|"onGuardarPrecio, onToggleEstado por props"| AE
    AEF -->|"crearEspacio(datos)"| aEsp
    AEF -->|"subirImagen(archivo)"| aEsp
    AEF -.->|"error"| aEsp
    aEsp ==>|"GET/POST/PUT/DELETE/PATCH /api/admin/espacios<br/>POST /api/admin/imagenes"| back[(Back)]
```

## 8. Admin: reservas (`/admin/reservas`)

```mermaid
flowchart TB
    ARV["views/AdminReservasView.jsx"] --> AR["components/admin/reservas/AdminReservas.jsx"]
    AR --> ARR["AdminReservaRow.jsx<br/>(motivo en estado local)"]
    aRes{{adminReservasSlice}}
    AR -->|"fetchAdminReservas(), cancelarReservaAdmin({id, mensajeCancelacion})"| aRes
    AR -.->|"items, errorCancelar"| aRes
    ARR -->|"onCancelar(reserva, motivo) por props"| AR
    aRes ==>|"GET /api/admin/reservas<br/>DELETE /api/admin/reservas/:id"| back[(Back)]
```

## 9. Admin: usuarios (`/admin/usuarios`)

```mermaid
flowchart TB
    AUV["views/AdminUsuariosView.jsx"] --> AU["components/admin/usuarios/AdminUsuarios.jsx"]
    AU --> AUR["AdminUsuarioRow.jsx"]
    aUsu{{adminUsuariosSlice}}
    AU -->|"fetchUsuarios(), cambiarEstadoUsuario(u), cambiarRolUsuario(u)"| aUsu
    AU -.->|"items, error"| aUsu
    AUR -->|"onToggleRol, onToggleEstado por props"| AU
    aUsu ==>|"GET /api/admin/usuarios<br/>DELETE, PATCH .../restaurar, PUT .../rol"| back[(Back)]
```

---

## 10. Tabla resumen: qué pantalla usa qué slice

| Pantalla | auth | carrito | reservas | espacios | adminEspacios | adminReservas | adminUsuarios |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Todas (App, barra, layout) | ✓ | ✓ | ✓ | | | | |
| Login / Registro | ✓ | | | | | | |
| Catálogo | | | | ✓ | | | |
| Detalle (modal) | ✓ | ✓ | | ✓ | | | |
| Carrito y checkout | | ✓ | | | | | |
| Mis reservas y buzón | | | ✓ | | | | |
| Recorrido virtual | ✓ | ✓ | | ✓ | | | |
| Admin: espacios | | | | | ✓ | | |
| Admin: reservas | | | | | | ✓ | |
| Admin: usuarios | | | | | | | ✓ |
