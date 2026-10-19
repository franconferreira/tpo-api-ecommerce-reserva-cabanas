# Documentación de Cambios Implementados — Complejo Turístico (TPO API)

Este documento detalla de forma exhaustiva todas las mejoras funcionales, correcciones de errores y adaptaciones arquitectónicas implementadas en el **Backend (Spring Boot 4 / Java 17)** y en el **Frontend (React 19 / Vite)** del proyecto **Whispering Pines (`Complejo La Herradura`)**, cumpliendo estrictamente los lineamientos de cátedra definidos en `CLAUDE.md`.

---

## 1. Cumplimiento de Reglas de Cátedra (`CLAUDE.md`)

Todas las modificaciones y componentes nuevos fueron desarrollados respetando sin excepción las restricciones académicas:

1. **Asincronismo con Promesas Puras**: Todas las peticiones HTTP usan `fetch(url, opciones).then((res) => ...).then((data) => ...).catch((err) => ...)`. No se utiliza `async/await` ni `axios` en ningún archivo.
2. **Hooks Permitidos**: Únicamente se emplean `useState` y `useEffect` de React (junto con `useNavigate` y `useLocation` de `react-router-dom`). No se usa `useContext`, `createContext`, `useRef`, `useReducer`, `useMemo` ni `useCallback`.
3. **Elevación de Estado (*Lifting State Up*)**: El estado compartido entre vistas y barras de navegación (`token`, `rol`, `nombre`, `idioma`, `isCartOpen`, `isBuzonOpen`, `mensajesBuzon`) reside en `src/App.jsx` y se distribuye explícitamente mediante `props`.
4. **Arquitectura Modular de 3 Niveles**:
   - **Nivel 1 — Vistas (`src/views/`)**: Contenedores de página asociados a cada ruta de `App.jsx`.
   - **Nivel 2 — Contenedores / Formularios (`src/components/`)**: Gestionan estados locales, validaciones y llamadas `fetch`.
   - **Nivel 3 — Presentacionales (`src/components/`)**: Renderizan cada ítem individual. Ningún `.map()` en JSX devuelve etiquetas HTML crudas (`<div>`, `<li>`, `<tr>`); todo `.map()` delega en un componente hijo con `key`.
5. **Eliminación Inmutable con `splice`**: Para quitar elementos de un arreglo en el estado (como descartar notificaciones del buzón), se clona el arreglo con Spread (`const copia = [...array]`), se elimina con `copia.splice(indice, 1)` y se actualiza el estado con `setEstado(copia)`.
6. **Formularios Controlados y Validaciones en el DOM**: Todos los `<input>` y `<select>` usan `value` + `onChange`, los `<form>` previenen la recarga con `onSubmit={(e) => e.preventDefault()}` y los mensajes de error o éxito se renderizan en el DOM mediante estados de React (prohibido `alert()`, `confirm()` y `prompt()`).
7. **Estilos CSS Puros en `em`**: Hojas `.css` nativas con unidades relativas `em` (`rem`, `%`, `vh`, `vw`) y `1px` únicamente en bordes finos (`border: 1px solid ...`).

---

## 2. Detalle de los 7 Puntos Implementados

### Punto 1: Validación de Fechas Pasadas (Frontend y Backend)

#### Problema
El usuario podía seleccionar fechas anteriores al día de hoy en los campos de *Check-In* y *Check-Out*, permitiendo enviar al carrito estadías en el pasado.

#### Solución Implementada
- **Frontend**:
  - En **`src/components/CampoFormulario.jsx`**: Se incorporó la prop `min` y se vinculó al atributo nativo `min={min}` del elemento `<input>`, bloqueando en el selector de calendario cualquier fecha anterior al mínimo permitido.
  - En **`src/components/ReservaWidgetForm.jsx`**:
    - Se calcula la fecha actual en formato ISO (`YYYY-MM-DD`) mediante `const hoy = new Date().toISOString().split('T')[0]`.
    - El campo de **Check-In** recibe `min={hoy}` y el campo de **Check-Out** recibe `min={checkIn || hoy}`.
    - En `handleReserva()`, antes de invocar el `fetch`, se valida:
      1. Que ambas fechas estén completas.
      2. Que `checkIn >= hoy` (no se permiten fechas pasadas).
      3. Que `checkOut > checkIn` (la fecha de salida debe ser posterior a la de entrada).
    - Si alguna validación falla, se actualiza el estado `setError(...)` mostrando el mensaje en el DOM (en español o inglés según `idioma`).
- **Backend**:
  - En **`CarritoServiceImpl.java`** (`agregarItem`): Se verifica explícitamente:
    - `request.getFechaInicio().isBefore(LocalDate.now())` → lanza `RuntimeException("No se permite reservar en fechas pasadas")`.
    - `!request.getFechaFin().isAfter(request.getFechaInicio())` → lanza `RuntimeException("La fecha de Check-Out debe ser posterior a la fecha de Check-In")`.

---

### Punto 2: Selector de Idioma Español / Inglés (`ES | EN`) sin `useContext`

#### Problema
La interfaz mezclaba textos fijos en inglés y español, y se requería un botón en la esquina superior derecha para alternar toda la aplicación entre Español (`es`) e Inglés (`en`) sin utilizar Context API ni librerías externas (`i18next`).

#### Solución Implementada
- **Estado Central en `src/App.jsx`**:
  - Se declaró `const [idioma, setIdioma] = useState('es')`.
  - Se pasó `idioma` y `setIdioma` a `Navigation`, y `idioma` como prop a `CarritoDrawer`, `BuzonDrawer`, `Footer` y todas las vistas (`CatalogoView`, `DetalleEspacioView`, `CheckoutView`, `MisReservasView`, `LoginView`, `RegisterView`, `AdminEspaciosView`, `AdminReservasView`, `AdminUsuariosView`), que a su vez lo propagan a sus componentes hijos.
- **Botón Toggle en Barra Superior (`Navigation.jsx`, `NavCliente.jsx`, `NavAdmin.jsx`, `Navigation.css`)**:
  - Tanto en la barra de navegación de cliente/visitante (`NavCliente.jsx`) como en la de administrador (`NavAdmin.jsx`), se agregó arriba a la derecha un botón con clase `.nav-btn-lang` que muestra **`ES | EN`** y ejecuta:
    ```jsx
    onClick={() => setIdioma(idioma === 'es' ? 'en' : 'es')}
    ```
- **Traducción Integral de Vistas y Componentes**:
  - Se tradujeron dinámicamente mediante expresiones ternarias (`idioma === 'en' ? '...' : '...'`) todos los textos de navegación, catálogo, tarjetas de espacios, detalle de espacio, formulario de reserva, fechas ocupadas, carrito lateral, checkout, historial de reservas, login, registro, buzón de notificaciones y paneles de administración.

---

### Punto 3: Imagen de "Salón Rústico para Eventos" y Fallback de Imágenes

#### Problema
El espacio `"Salón Rústico para Eventos"` (`e3`) en `DataInitializer.java` tenía una URL de Unsplash que devolvía error 404, dejando la tarjeta sin foto.

#### Solución Implementada
- **Backend (`DataInitializer.java`)**:
  - Se reemplazó la URL rota del espacio `e3` (`"Salón Rústico para Eventos"`) por una URL pública válida y verificada de Unsplash (`https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80`).
- **Frontend (`EspacioCard.jsx`, `DetalleEspacio.jsx` y `AdminEspacioRow.jsx`)**:
  - Se definió una constante `IMAGEN_POR_DEFECTO` con una imagen segura para cuando el arreglo `espacio.imagenes` venga vacío o nulo.
  - Se añadió el manejador `onError={(e) => { e.target.onerror = null; e.target.src = IMAGEN_POR_DEFECTO; }}` en las etiquetas `<img>` para garantizar que, ante cualquier fallo de red o URL inválida cargada por un administrador, se muestre automáticamente la imagen de respaldo.

---

### Punto 4: Ícono de Pestaña (Favicon) y Título en `index.html`

#### Problema
El navegador mostraba el ícono genérico de Vite y un título por defecto.

#### Solución Implementada
- **`Complejo_Frontend/public/favicon.svg`**: Se diseñó un ícono vectorial SVG representativo del complejo (pino y cabaña sobre fondo verde bosque `#233d2c`).
- **`Complejo_Frontend/index.html`**: Respetando la regla de cátedra de modificar únicamente `<link rel="icon">` y `<title>`, se actualizó a:
  ```html
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <title>Complejo La Herradura - Reservas</title>
  ```

---

### Punto 5: Motivo de Cancelación de Reserva por parte del Administrador

#### Problema
Cuando el administrador cancelaba una reserva desde el panel de gestión, no podía indicar el motivo de la cancelación ni el cliente podía conocer la razón por la cual su reserva fue cancelada.

#### Solución Implementada
- **Backend**:
  - **`Reserva.java`**: Se añadió el atributo opcional `@Column(length = 500) private String mensajeCancelacion;` con su getter y setter.
  - **`ReservaResponseDTO.java`**: Se agregó el campo `private String mensajeCancelacion;` para exponerlo al Frontend.
  - **`ReservaService.java` y `ReservaServiceImpl.java`**:
    - `cancelarReserva(Long id, String mensajeCancelacion)` recibe el motivo opcional; si no se envía o viene vacío, asigna por defecto `"Cancelada por la administración del complejo."` y lo guarda en la entidad `Reserva`.
    - `mapToDTO(Reserva r)` copia `r.getMensajeCancelacion()` al DTO de respuesta.
  - **`AdminGeneralController.java`**:
    - El endpoint `PUT /api/admin/reservas/{id}/cancelar` acepta un body JSON opcional `@RequestBody(required = false) Map<String, String> body` de donde extrae `mensajeCancelacion`.
- **Frontend**:
  - **`src/components/AdminCancelarForm.jsx` (Nuevo)**: Componente de formulario controlado que permite al administrador escribir el motivo de cancelación en un `<input type="text">` y confirmar o cerrar sin usar `prompt()` ni `confirm()`.
  - **`src/components/AdminReservaRow.jsx` y `src/components/AdminReservas.jsx`**: Al pulsar *Cancelar* en una reserva activa, se despliega `AdminCancelarForm` y se envía `PUT /api/admin/reservas/{id}/cancelar` con `{ mensajeCancelacion: motivo }` en el body JSON.
  - **`src/components/ReservaCard.jsx` y `src/components/MisReservasList.css`**: En la vista *Mis Reservas* del cliente, si la reserva tiene `estado === 'CANCELADA'` y posee `mensajeCancelacion`, se muestra un bloque destacado (`.reserva-cancelacion-msg`) con el aviso del administrador.

---

### Punto 6: Sistema de Buzón / Notificaciones de Usuario para Cancelaciones

#### Problema
Aunque el motivo de cancelación aparecía dentro de la tarjeta en *Mis Reservas*, el usuario no recibía una notificación visible en la barra de navegación al ingresar a la aplicación.

#### Solución Implementada
1. **Botón del Buzón en la Barra del Cliente (`src/components/BuzonButton.jsx`, `NavCliente.jsx`, `Navigation.jsx`, `Navigation.css`)**:
   - Se creó el componente modular `BuzonButton.jsx` y se ubicó en `NavCliente.jsx` inmediatamente al lado del botón del Carrito (`nav-btn-cart`).
   - Muestra `📬 Buzón (N)` en español o `📬 Inbox (N)` en inglés, donde `N` es la cantidad de notificaciones no descartadas (`mensajesBuzon.length`), aplicando la clase `.nav-btn-buzon-unread` cuando `N > 0`.
2. **Panel Desplegable y Tarjetas de Notificación (`src/components/BuzonDrawer.jsx`, `src/components/BuzonItem.jsx`, `src/components/BuzonDrawer.css`)**:
   - Siguiendo el mismo patrón arquitectónico de 3 niveles que `CarritoDrawer.jsx`, `BuzonDrawer.jsx` recibe `isOpen`, `onClose`, `mensajes`, `onActualizarMensajes` e `idioma`.
   - Dentro de `BuzonDrawer.jsx`, el `.map()` delega exclusivamente en el componente hijo `BuzonItem.jsx`.
   - Cada `BuzonItem.jsx` muestra:
     - El código de reserva `#WP-{id}` y la fecha.
     - Los espacios y fechas afectados (reutilizando `AdminReservaDetalleLine.jsx` dentro de su `.map()`).
     - El mensaje dejado por el administrador (`reserva.mensajeCancelacion`).
     - Un botón **"Marcar como leído" / "Mark as read"** que invoca `handleDescartarMensaje(indice)` en `BuzonDrawer.jsx`, el cual clona el arreglo (`const nuevosMensajes = [...mensajes]`), elimina el elemento con `nuevosMensajes.splice(indice, 1)` y actualiza el estado en `App.jsx`.
3. **Flujo de Datos en `src/App.jsx` y `src/components/MisReservasList.jsx`**:
   - `App.jsx` administra `mensajesBuzon` y `isBuzonOpen` con `useState`.
   - Al iniciar sesión o restaurar la sesión de un cliente, `App.jsx` consulta `GET /api/reservas/mis-reservas` con `.then().catch()`, filtra las reservas con `estado === 'CANCELADA'` y `mensajeCancelacion` no vacío, y las carga en `mensajesBuzon`.
   - Cuando el cliente visita *Mis Reservas* (`MisReservasList.jsx`), también se sincroniza `onActualizarBuzon(canceladasConMensaje)`.

---

### Punto 7: Corrección de Persistencia e Impacto al Modificar el Precio Base desde Admin

#### Problema
Al modificar el precio base de un espacio desde el panel de administración (`AdminEspacios.jsx` / `AdminPrecioForm.jsx`), el cambio podía no persistirse correctamente en la base de datos o no reflejarse de inmediato en el estado y en el catálogo.

#### Solución Implementada
1. **Frontend (`src/components/AdminPrecioForm.jsx`, `src/components/AdminEspacios.jsx` y `src/components/AdminEspacios.css`)**:
   - En **`AdminPrecioForm.jsx`**:
     - Se agregó un `useEffect` sincronizado con `espacio.precioBase` para que el input refleje siempre el valor actualizado del servidor.
     - Se envolvió el control en un `<form onSubmit={handleSubmit}>` con `e.preventDefault()`.
     - Al confirmar, convierte explícitamente el valor con `const precioNumerico = parseFloat(precioBase)` y verifica `!isNaN(precioNumerico) && precioNumerico > 0` antes de disparar `onModificarPrecio(espacio, precioNumerico)`.
   - En **`AdminEspacios.jsx`** (`handleModificarPrecio`):
     - Convierte y valida `const nuevoValor = Number(nuevoPrecio)`.
     - Envía la petición `PUT /api/admin/espacios/{id}` incluyendo los headers `'Content-Type': 'application/json'` y `'Authorization': 'Bearer ' + token`, y el body completo requerido por `EspacioRequestDTO`:
       ```js
       body: JSON.stringify({
         nombre: espacio.nombre,
         precioBase: nuevoValor,
         tipo: espacio.tipo,
         descripcion: espacio.descripcion,
         imagenes: espacio.imagenes || []
       })
       ```
     - Verifica `if (!res.ok)` para capturar cualquier error HTTP (400/403/500) y mostrarlo en pantalla.
     - En `.then((data) => ...)`, actualiza inmediatamente la fila en memoria con:
       ```js
       setEspacios(espacios.map((item) => (item.id === espacio.id ? data : item)));
       ```
       y muestra un banner de confirmación (`mensajeExito`).
2. **Backend (`EspacioServiceImpl.java`)**:
   - Se añadió la anotación `@Transactional` de Spring a los métodos de escritura `crearEspacio`, `modificarEspacio`, `eliminarEspacio` y `restaurarEspacio`.
   - En `modificarEspacio(Long id, EspacioRequestDTO request)`, se actualiza `espacio.setPrecioBase(request.getPrecioBase())` y se asigna una nueva instancia mutable `new ArrayList<>(request.getImagenes())` para la colección `@ElementCollection(fetch = FetchType.EAGER)` `imagenes`, garantizando que Hibernate ejecute el `UPDATE` en la tabla `espacios` sin conflictos de sesión.
   - Al regresar a `/catalogo`, `EspacioList.jsx` ejecuta `GET /api/espacios` y obtiene los datos frescos con el nuevo `precioBase` persistido.

---

### Punto 8: Limpieza del Carrito cuando Expira al Intentar Pagar (`CheckoutResumen.jsx`)

#### Problema
Si el bloqueo temporal de 10 minutos de los ítems del carrito expiraba y el usuario intentaba confirmar el pago en la vista de Checkout, el backend devolvía error pero los ítems seguían mostrándose en el estado visual del carrito.

#### Solución Implementada
- En **`src/components/CheckoutResumen.jsx`** (`handleConfirmarCheckout`):
  - Tanto en el bloque `else` de `.then((data) => ...)` como en `.catch((err) => ...)`, además de mostrar el mensaje de error con `setError(...)`, se vacía inmediatamente el estado del carrito:
    ```js
    setCarritoData({
      id: null,
      totalSinDescuento: 0,
      descuentoPackPorcentaje: 0,
      total: 0,
      items: []
    })
    ```
  - De este modo, la interfaz pasa de inmediato al estado vacío (`checkout-empty`) junto con la alerta de expiración y el enlace para volver al catálogo.

---

### Punto 9: Almanaque / Calendario Visual de Disponibilidad (`CalendarioDisponibilidad.jsx` y `CalendarioDia.jsx`)

#### Problema
Las fechas ocupadas en el detalle de un espacio se mostraban como una lista plana de texto en lugar de un almanaque mensual donde se distinguieran visualmente los días pasados, ocupados y disponibles.

#### Solución Implementada
- **`src/components/CalendarioDisponibilidad.jsx` (Nuevo)**:
  - Reemplaza a `FechasOcupadasLista.jsx` dentro de `DetalleEspacio.jsx`.
  - Consume el listado `YYYY-MM-DD` devuelto por `GET /api/espacios/{id}/fechas-ocupadas` (cuando una reserva se cancela, el backend libera automáticamente esas fechas).
  - Permite navegar entre el mes actual y los meses siguientes mediante un estado `offsetMes` (`useState`).
  - Calcula los días del mes y delega el renderizado de cada celda en el componente hijo `CalendarioDia.jsx`.
- **`src/components/CalendarioDia.jsx` (Nuevo)**:
  - Renderiza cada día del mes con su estado visual:
    - `.dia-pasado`: fecha anterior a hoy (`fechaIso < hoyIso`), deshabilitada y tachada en gris.
    - `.dia-ocupado`: fecha incluida en `fechasOcupadas`, resaltada en rojo suave y tachada.
    - `.dia-disponible`: fecha libre para reservar, resaltada en verde suave.
- **`src/components/CalendarioDisponibilidad.css` (Nuevo)**:
  - Grilla de 7 columnas (`grid-template-columns: repeat(7, 1fr)`) diseñada íntegramente con unidades `em`.

---

### Punto 10: Persistencia de Notificaciones Leídas del Buzón (`notificacionesLeidas`)

#### Problema
Cada vez que el usuario ingresaba a la vista *Mis Reservas*, `MisReservasList.jsx` volvía a consultar `GET /api/reservas/mis-reservas` y cargaba nuevamente en `mensajesBuzon` todas las reservas canceladas históricas, haciendo reaparecer avisos que el usuario ya había marcado como leídos.

#### Solución Implementada
- En **`src/components/BuzonDrawer.jsx`** (`handleDescartar`):
  - Al descartar o marcar como leída una notificación, se guarda su `id` en `localStorage` bajo la clave `'notificacionesLeidas'` (arreglo JSON de IDs) antes de quitarla del estado con Spread + `.splice(indice, 1)`.
- En **`src/App.jsx`** y **`src/components/MisReservasList.jsx`**:
  - Al filtrar las reservas con `estado === 'CANCELADA'` y `mensajeCancelacion`, se excluyen aquellas cuyo `id` ya figure en `notificacionesLeidas`:
    ```js
    const leidas = JSON.parse(localStorage.getItem('notificacionesLeidas') || '[]')
    const nuevasNotificaciones = data.filter(
      (r) => r.estado === 'CANCELADA' && r.mensajeCancelacion && !leidas.includes(r.id)
    )
    setMensajesBuzon(nuevasNotificaciones)
    ```

---

### Punto 11: Nombres y Descripciones Bilingües (`Español / English`) en Todos los Espacios (`DataInitializer.java`)

#### Problema
Los espacios alquilables tenían el nombre en un solo idioma y la descripción únicamente en español. Se requería mostrar ambos idiomas lado a lado (`"Español / English"`) sin alterar el esquema de la base de datos.

#### Solución Implementada
- En **`Complejo_Backend/src/main/java/com/uade/tpo/complejo/DataInitializer.java`**:
  - Se definieron el `nombre` y la `descripcion` de los 4 espacios iniciales con el formato `"Español / English"`:
    1. **`"Cabaña del Cedro / Cedar Hollow Cabin"`**
       - `"Cabaña independiente de pino y roble rústico frente a la laguna, con deck y parrilla propia. / Standalone rustic pine and oak cabin facing the lagoon, featuring a private deck and grill."`
    2. **`"Refugio de Troncos Los Pinos / Whispering Pines Timber Lodge"`**
       - `"Cabaña de troncos amplia ideal para grupos familiares rodeada de bosque nativo. / Spacious timber lodge ideal for family groups surrounded by native forest."`
    3. **`"Salón Rústico para Eventos / Rustic Event Venue"`**
       - `"Galpón rústico para eventos con parrillas integradas y guirnaldas de iluminación cálida. / Rustic event barn with built-in grills and strings of warm-toned lights."`
    4. **`"Embarcadero Laguna Plateada / Silver Lake Boathouse"`**
       - `"Espejo de agua natural con embarcadero, kayaks y espacio para actividades náuticas. / Natural body of water with a boathouse, kayaks, and space for water activities."`
  - Además, en el bloque `else` de `DataInitializer.java` (cuando la base de datos ya contiene registros previos), se actualizan automáticamente los espacios existentes al iniciar el Backend para que adopten el formato bilingüe sin necesidad de borrar la base de datos.

---

### Punto 12: Ocultar / Descartar Reservas Canceladas en "Mis Reservas" (`ReservaCard.jsx` y `MisReservasList.jsx`)

#### Problema
Las reservas canceladas permanecían indefinidamente en la vista *Mis Reservas* sin darle al cliente la opción de quitarlas de su pantalla.

#### Solución Implementada
- En **`src/components/ReservaCard.jsx`**:
  - Cuando `isCancelada === true`, en el pie de la tarjeta se muestra el botón **`✕ Ocultar de mi vista` / `✕ Dismiss / Remove`**, que invoca `onOcultarReserva(reserva.id, index)`.
- En **`src/components/MisReservasList.jsx`**:
  - Se almacena en `localStorage` bajo la clave `'reservasOcultas'` el arreglo JSON con los IDs de las reservas ocultadas por el usuario.
  - Al cargar `GET /api/reservas/mis-reservas`, se filtran las reservas con `!ocultas.includes(r.id)`.
  - En `handleOcultarReserva(id, indice)`, se registra el `id` en `localStorage` y se elimina del estado local clonando el arreglo (`const nuevasReservas = [...reservas]`) y aplicando `nuevasReservas.splice(indice, 1)`.

---

### Punto 13: Poblado Completo de Datos de Prueba en Base de Datos (`DataInitializer.java`)

#### Solución Implementada
- **8 Espacios bilingües (`Español / English`)** con imágenes reales verificadas de Unsplash y tarifas variadas:
  1. *Cabaña del Cedro / Cedar Hollow Cabin* (`CABANA`, `$220`)
  2. *Refugio de Troncos Los Pinos / Whispering Pines Timber Lodge* (`CABANA`, `$180`)
  3. *Salón Rústico para Eventos / Rustic Event Venue* (`GALPON_FIESTAS`, `$450`)
  4. *Embarcadero Laguna Plateada / Silver Lake Boathouse* (`LAGUNA_RECREATIVA`, `$80`)
  5. *Cabaña El Roble / The Oak Sanctuary Cabin* (`CABANA`, `$150`)
  6. *Refugio del Arroyo / Creekside Mountain Chalet* (`CABANA`, `$260`)
  7. *Galpón Campestre Las Acacias / Las Acacias Country Barn* (`GALPON_FIESTAS`, `$380`)
  8. *Sector Domos & Fogón / Geodesic Domes & Fire Pit Lounge* (`LAGUNA_RECREATIVA`, `$110`)
- **3 Usuarios de prueba**:
  - `admin@gmail.com` / `admin` (`ROLE_ADMIN`, Sarah Chen)
  - `cliente@gmail.com` / `1234` (`ROLE_CLIENTE`, Eleanor Vance)
  - `juan@gmail.com` / `1234` (`ROLE_CLIENTE`, Juan Pérez)
- **Reservas precargadas**:
  - 1 reserva `CONFIRMADA` futura con descuento de Pack Multi-Espacio (`15% OFF`) para `cliente@gmail.com`.
  - 1 reserva `CANCELADA` por el administrador con su respectivo `mensajeCancelacion` para `cliente@gmail.com`.
  - 1 reserva `CONFIRMADA` futura para `juan@gmail.com`.

---

### Punto 14: Eliminación de Insignias Crudas de Categoría (`CABANA`, `GALPON_FIESTAS`, `LAGUNA_RECREATIVA`)

#### Solución Implementada
- En **`src/components/EspacioCard.jsx`** y **`src/components/DetalleEspacio.jsx`**:
  - Se quitaron los badges `<span className="ec-category-tag">{tipo}</span>` y `<span className="dh-tag">{espacio.tipo}</span>` para evitar mostrar nombres internos del enum en mayúsculas al cliente.

---

### Punto 15: Corrección al Desactivar y Reactivar Espacios desde el Panel Admin (`AdminEspacios.jsx`, `AdminEspacioController.java`, `EspacioServiceImpl.java`)

#### Solución Implementada
- En **`src/components/AdminEspacios.jsx`** (`handleToggleEstado`):
  - Alterna entre `DELETE /api/admin/espacios/{id}` (cuando `espacio.activo === true`) y `PATCH /api/admin/espacios/{id}/restaurar` (cuando `espacio.activo === false`).
  - Verifica `if (data && data.mensaje)` antes de actualizar el estado local `espacios` con `activo: !espacio.activo` y muestra confirmación visual en pantalla.
- En **`AdminEspacioController.java`** y **`EspacioServiceImpl.java`**:
  - El endpoint `/{id}/restaurar` acepta `PATCH` y `PUT`, y `restaurarEspacio(Long id)` ejecuta `@Transactional`, `espacio.setActivo(true)` y `espacioRepository.save(espacio)` para que `GET /api/espacios` (`findByActivoTrue()`) devuelva inmediatamente el espacio restaurado en el catálogo.

---

## 3. Resumen de Archivos Creados y Modificados

### Backend (`Complejo_Backend`)

| Archivo | Tipo de Cambio | Descripción |
| :--- | :---: | :--- |
| `src/main/java/com/uade/tpo/complejo/DataInitializer.java` | Modificado | Poblado de 8 espacios bilingües (`ES / EN`), 3 usuarios de prueba y reservas activas/canceladas. |
| `src/main/java/com/uade/tpo/complejo/controller/AdminEspacioController.java` | Modificado | Endpoint `/{id}/restaurar` compatible con `PATCH` y `PUT`. |
| `src/main/java/com/uade/tpo/complejo/entity/Reserva.java` | Modificado | Nuevo campo `mensajeCancelacion` (`String`, hasta 500 caracteres) con getter/setter. |
| `src/main/java/com/uade/tpo/complejo/dto/response/ReservaResponseDTO.java` | Modificado | Inclusión de `mensajeCancelacion` en el DTO de respuesta de reservas. |
| `src/main/java/com/uade/tpo/complejo/controller/AdminGeneralController.java` | Modificado | `DELETE /api/admin/reservas/{id}` ahora recibe `mensajeCancelacion` opcional. |
| `src/main/java/com/uade/tpo/complejo/service/ReservaService.java` | Modificado | Firma de `cancelarReservaAdmin(Long id, String mensajeCancelacion)`. |
| `src/main/java/com/uade/tpo/complejo/service/impl/ReservaServiceImpl.java` | Modificado | Guardado del motivo de cancelación y mapeo en `mapToDTO`. |
| `src/main/java/com/uade/tpo/complejo/service/impl/CarritoServiceImpl.java` | Modificado | Validación de fechas para rechazar reservas con `checkIn < LocalDate.now()`. |
| `src/main/java/com/uade/tpo/complejo/service/impl/EspacioServiceImpl.java` | Modificado | `@Transactional` en métodos de escritura/restauración y persistencia de `precioBase` e `imagenes`. |

### Frontend (`Complejo_Frontend`)

| Archivo | Tipo de Cambio | Descripción |
| :--- | :---: | :--- |
| `index.html` y `public/favicon.svg` | Modificado | Nuevo ícono SVG del complejo y título `"Complejo La Herradura - Reservas"`. |
| `src/App.jsx` | Modificado | Estados globales `idioma`, `mensajesBuzon` e `isBuzonOpen`; filtrado de notificaciones no leídas con `localStorage`. |
| `src/components/BuzonButton.jsx` | **Nuevo** | Botón `📬 Buzón (N)` / `📬 Inbox (N)` ubicado en la barra del cliente junto al carrito. |
| `src/components/BuzonDrawer.jsx` | **Nuevo** | Drawer lateral para visualizar y descartar notificaciones persistiendo IDs en `notificacionesLeidas`. |
| `src/components/BuzonItem.jsx` | **Nuevo** | Componente presentacional de cada notificación de cancelación dentro de `BuzonDrawer`. |
| `src/components/BuzonDrawer.css` | **Nuevo** | Estilos en `em` para el panel lateral y las tarjetas del buzón. |
| `src/components/CalendarioDisponibilidad.jsx` | **Nuevo** | Almanaque mensual de disponibilidad con navegación por mes y leyenda bilingüe. |
| `src/components/CalendarioDia.jsx` | **Nuevo** | Componente presentacional de cada día del almanaque (`.dia-pasado`, `.dia-ocupado`, `.dia-disponible`). |
| `src/components/CalendarioDisponibilidad.css` | **Nuevo** | Estilos CSS Grid (`repeat(7, 1fr)`) en unidades `em` para el almanaque. |
| `src/components/AdminCancelarForm.jsx` | **Nuevo** | Formulario controlado para ingresar el motivo de cancelación desde el panel Admin. |
| `src/components/CheckoutResumen.jsx` | Modificado | Limpieza automática del estado `carritoData` cuando el carrito expira al intentar pagar. |
| `src/components/Navigation.jsx`, `NavCliente.jsx`, `NavAdmin.jsx`, `Navigation.css` | Modificado | Integración de `BuzonButton` y del botón selector de idioma `ES \| EN`. |
| `src/components/CampoFormulario.jsx` y `ReservaWidgetForm.jsx` | Modificado | Atributo `min` en inputs de fecha y validación de fechas pasadas en cliente. |
| `src/components/EspacioCard.jsx`, `DetalleEspacio.jsx`, `AdminEspacioRow.jsx` | Modificado | Eliminación de tags crudos de enum, fallback `onError` e integración de `CalendarioDisponibilidad`. |
| `src/components/AdminPrecioForm.jsx`, `AdminEspacios.jsx`, `AdminEspacios.css` | Modificado | Persistencia y feedback al modificar precios y al desactivar/reactivar espacios. |
| `src/components/AdminReservas.jsx`, `AdminReservasTabla.jsx`, `AdminReservaRow.jsx`, `AdminReservas.css` | Modificado | Flujo de cancelación con motivo personalizado en el panel Admin. |
| `src/components/ReservaCard.jsx`, `MisReservasList.jsx`, `MisReservasList.css` | Modificado | Botón para ocultar reservas canceladas (`reservasOcultas`) y aviso de cancelación. |
| Resto de vistas (`src/views/*.jsx`) y componentes (`src/components/*.jsx`) | Modificado | Soporte bilingüe completo (`es` / `en`) recibido por props desde `App.jsx`. |


