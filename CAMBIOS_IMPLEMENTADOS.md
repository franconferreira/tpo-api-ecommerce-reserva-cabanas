# Documentación de Cambios Implementados — Complejo Turístico (TPO API)

Este documento detalla de forma exhaustiva todas las mejoras funcionales, correcciones de errores y adaptaciones arquitectónicas implementadas en el **Backend (Spring Boot 4 / Java 17)** y en el **Frontend (React 19 / Vite)** del proyecto **Whispering Pines (`Complejo La Herradura`)**, cumpliendo estrictamente los lineamientos de cátedra definidos en `CLAUDE.md`.

---

## 1. Cumplimiento de Reglas de Cátedra (`CLAUDE.md`)

Todas las modificaciones y componentes nuevos fueron desarrollados y auditados respetando sin excepción las restricciones académicas de las **Clases 7, 8, 9 y 10**:

1. **Asincronismo con Promesas Puras**: Todas las peticiones HTTP usan `fetch(url, opciones).then((res) => res.json()).then((data) => ...).catch((err) => ...)`. No se utiliza `async/await` ni `axios` en ningún archivo.
2. **Hooks Permitidos**: Únicamente se emplean `useState` y `useEffect` de React (junto con `useNavigate` y `useLocation` de `react-router-dom`). No se usa `useContext`, `createContext`, `useRef`, `useReducer`, `useMemo`, `useCallback` ni Custom Hooks.
3. **Elevación de Estado (*Lifting State Up*) y `localStorage` exclusivo para JWT**:
   - El estado compartido entre vistas y barras de navegación (`idioma`, `isLogged`, `rolUsuario`, `nombreUsuario`, `espacioSeleccionado`, `isCartOpen`, `isBuzonOpen`, `mensajesBuzon`, `leidasIds`, `ocultasIds`, `carritoData`) reside en `src/App.jsx` y se distribuye explícitamente mediante `props`.
   - `localStorage` (`setItem` / `getItem`) se utiliza **exclusivamente** para almacenar y leer `'jwtToken'`.
4. **Arquitectura Modular de 3 Niveles**:
   - **Nivel 1 — Vistas (`src/views/`)**: Contenedores de página asociados a cada ruta de `App.jsx` (entre 13 y 19 líneas, sin estados, efectos ni lógica).
   - **Nivel 2 — Contenedores / Formularios (`src/components/`)**: Gestionan estados locales (`useState`), ciclo de vida (`useEffect`), validaciones y llamadas `fetch`.
   - **Nivel 3 — Presentacionales (`src/components/`)**: Renderizan cada ítem individual. Ningún `.map()` en JSX devuelve etiquetas HTML sueltas (`<div>`, `<li>`, `<tr>`); todo `.map()` delega en un componente hijo con una prop `key` única basada en datos del ítem.
5. **Transformación Inmutable con `.map()`, Spread (`...`) y `.splice(indice, 1)`**:
   - Para agregar elementos a un array en estado o memoria se usa exclusivamente Spread (`[...lista, nuevoElemento]`), sin usar `.push()`.
   - Para quitar elementos de una lista en el estado se clona el arreglo con Spread (`const copia = [...array]`), se elimina con `copia.splice(indice, 1)` y se actualiza con `setEstado(copia)`.
   - Para transformar o recorrer colecciones se emplea `.map()` con condicionales estrictos (`===` / `!==`).
6. **Formularios Controlados y Validaciones en el DOM**: Todos los `<input>` y `<select>` usan `value` + `onChange`, todos los `<form>` previenen la recarga con `onSubmit={(e) => e.preventDefault()}` y los mensajes de error o éxito se renderizan en el DOM mediante estados de React (prohibido `alert()`, `confirm()` y `prompt()`).
7. **Estilos CSS Puros en `em`**: Hojas `.css` nativas con selectores de clase (`.clase`), unidades relativas `em` (`%`, `vh`) y `1px` únicamente en bordes finos (`border: 1px solid ...`), sin estilos inline (`style={{ ... }}`).

---

## 2. Detalle de los Puntos Implementados

### Punto 1: Validación de Fechas Pasadas (Frontend y Backend)

#### Problema
El usuario podía seleccionar fechas anteriores al día de hoy en los campos de *Check-In* y *Check-Out*, permitiendo enviar al carrito estadías en el pasado.

#### Solución Implementada
- **Frontend**:
  - En **`src/components/CampoFormulario.jsx`**: Se incorporó la prop `min` y se vinculó al atributo nativo `min={min}` del elemento `<input>`, bloqueando en el selector de calendario cualquier fecha anterior al mínimo permitido.
  - En **`src/components/ReservaWidgetForm.jsx`**:
    - Se calcula la fecha actual local en formato ISO (`YYYY-MM-DD`) utilizando `new Date()` y Template Strings (`const hoy = \`\${anio}-\${mesStr}-\${diaStr}\``).
    - El campo de **Check-In** recibe `min={hoy}` y el campo de **Check-Out** recibe `min={checkIn !== '' ? checkIn : hoy}`.
    - En `handleClick()`, antes de invocar el `fetch`, se valida:
      1. Que ambas fechas estén completas (`checkIn.trim() === '' || checkOut.trim() === ''`).
      2. Que `checkIn >= hoy` (no se permiten fechas pasadas).
      3. Que `checkOut > checkIn` (la fecha de salida debe ser posterior a la de entrada).
    - Si alguna validación falla, se actualiza el estado `setError(...)` mostrando el mensaje en el DOM (en español o inglés según `idioma`).
- **Backend**:
  - En **`CarritoServiceImpl.java`** (`agregarItem`): Se verifica explícitamente:
    - `request.getCheckIn().isBefore(LocalDate.now())` → lanza `RuntimeException("No se pueden reservar fechas anteriores al día de hoy")`.
    - `!request.getCheckOut().isAfter(request.getCheckIn())` → lanza `RuntimeException("La fecha de Check-out debe ser posterior a la fecha de Check-in")`.

---

### Punto 2: Selector de Idioma Español / Inglés (`ES | EN`) sin `useContext`

#### Problema
La interfaz mezclaba textos fijos en inglés y español, y se requería un botón en la esquina superior derecha para alternar toda la aplicación entre Español (`es`) e Inglés (`en`) sin utilizar Context API ni librerías externas (`i18next`).

#### Solución Implementada
- **Estado Central en `src/App.jsx`**:
  - Se declaró `const [idioma, setIdioma] = useState('es')`.
  - Se pasó `idioma` y `setIdioma` a `Navigation`, `LoginView` y `RegisterView`, e `idioma` como prop a `CarritoDrawer`, `BuzonDrawer`, `Footer` y todas las vistas (`CatalogoView`, `DetalleEspacioView`, `CheckoutView`, `MisReservasView`, `AdminEspaciosView`, `AdminReservasView`, `AdminUsuariosView`), que a su vez lo propagan a sus componentes hijos.
- **Botón Toggle en Barra Superior (`Navigation.jsx`, `NavCliente.jsx`, `NavAdmin.jsx`, `Navigation.css`)**:
  - Tanto en la barra de navegación de cliente/visitante (`NavCliente.jsx`) como en la de administrador (`NavAdmin.jsx`), se agregó arriba a la derecha un botón con clase `.nav-btn-lang` que muestra **`🌐 ES | EN`** y ejecuta:
    ```jsx
    const handleToggleIdioma = () => {
      setIdioma(idioma === 'es' ? 'en' : 'es')
    }
    ```
- **Traducción Integral de Vistas y Componentes**:
  - Se tradujeron dinámicamente mediante expresiones ternarias (`const es = idioma === 'es'`) todos los textos de navegación, catálogo, tarjetas de espacios, detalle de espacio, formulario de reserva, almanaque de disponibilidad, carrito lateral, checkout, historial de reservas, login, registro, buzón de notificaciones y paneles de administración.

---

### Punto 3: Imagen de "Salón Rústico para Eventos" y Respaldo de Imágenes

#### Problema
El espacio `"Salón Rústico para Eventos"` (`e3`) en `DataInitializer.java` tenía una URL de Unsplash que devolvía error 404, dejando la tarjeta sin foto.

#### Solución Implementada
- **Backend (`DataInitializer.java`)**:
  - Se reemplazó la URL rota del espacio `e3` (`"Salón Rústico para Eventos / Rustic Event Venue"`) por una URL pública válida y verificada de Unsplash (`https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800`).
- **Frontend (`EspacioCard.jsx`, `DetalleEspacio.jsx` y `AdminEspacioRow.jsx`)**:
  - Se definió la constante `imagenPorDefecto` para garantizar que cuando el arreglo `imagenes` venga vacío o con una cadena en blanco (`imagenes[0].trim() === ''`), se asigne automáticamente una imagen segura.

---

### Punto 4: Ícono de Pestaña (Favicon) y Título en `index.html`

#### Problema
El navegador mostraba el ícono genérico de Vite y un título por defecto.

#### Solución Implementada
- **`Complejo_Frontend/public/favicon.svg`**: Se diseñó un ícono vectorial SVG representativo del complejo (pino y cabaña sobre fondo verde bosque `#153c2b`).
- **`Complejo_Frontend/index.html`**: Respetando la regla de cátedra de modificar únicamente `<title>` en `<head>` manteniendo la estructura original de Vite (`<html lang="en">`), se actualizó a:
  ```html
  <title>Complejo Whispering Pines - Reservas</title>
  ```

---

### Punto 5: Motivo de Cancelación de Reserva por parte del Administrador

#### Problema
Cuando el administrador cancelaba una reserva desde el panel de gestión, no podía indicar el motivo de la cancelación ni el cliente podía conocer la razón por la cual su reserva fue cancelada.

#### Solución Implementada
- **Backend**:
  - **`Reserva.java`**: Se añadió el atributo `@Column(length = 500) private String mensajeCancelacion;` con su getter y setter.
  - **`ReservaResponseDTO.java`**: Se agregó el campo `private String mensajeCancelacion;` para exponerlo al Frontend.
  - **`ReservaService.java` y `ReservaServiceImpl.java`**:
    - `cancelarReservaAdmin(Long id, String mensajeCancelacion)` recibe el motivo opcional; si no se envía o viene vacío, asigna por defecto `"Cancelada por administración del complejo."` y lo guarda en la entidad `Reserva`.
    - `mapToDTO(Reserva r)` copia `r.getMensajeCancelacion()` al DTO de respuesta.
  - **`AdminGeneralController.java`**:
    - El endpoint `DELETE /api/admin/reservas/{id}` acepta `@RequestBody(required = false) Map<String, String> body` de donde extrae `mensajeCancelacion`.
- **Frontend**:
  - **`src/components/AdminCancelarForm.jsx` (Nuevo)**: Componente de formulario controlado (`<form onSubmit={(e) => e.preventDefault()}>`) que permite al administrador escribir el motivo de cancelación en un `<input type="text" name="mensajeCancelacion">` y confirmar con `<button type="submit">` sin usar `prompt()` ni `confirm()`.
  - **`src/components/AdminReservaRow.jsx` y `src/components/AdminReservas.jsx`**: En cada reserva activa se muestra `AdminCancelarForm` y se envía `DELETE /api/admin/reservas/${id}` con `{ mensajeCancelacion: mensajeCancelacion }` en el body JSON.
  - **`src/components/ReservaCard.jsx` y `src/components/MisReservasList.css`**: En la vista *Mis Reservas* del cliente, si la reserva tiene `estado === 'CANCELADA'` y posee `mensajeCancelacion`, se muestra un bloque destacado (`.mr-cancel-notice`) con el aviso del administrador.

---

### Punto 6: Sistema de Buzón / Notificaciones de Usuario para Cancelaciones

#### Problema
Aunque el motivo de cancelación aparecía dentro de la tarjeta en *Mis Reservas*, el usuario no recibía una notificación visible en la barra de navegación al ingresar a la aplicación.

#### Solución Implementada
1. **Botón del Buzón en la Barra del Cliente (`src/components/BuzonButton.jsx`, `NavCliente.jsx`, `Navigation.jsx`, `Navigation.css`)**:
   - Se creó el componente modular `BuzonButton.jsx` y se ubicó en `NavCliente.jsx` inmediatamente al lado del botón del Carrito (`nav-btn-cart`).
   - Muestra `📬 Buzón (N)` en español o `📬 Inbox (N)` en inglés, donde `N` es la cantidad de notificaciones no leídas (`mensajesNoLeidos.length`), aplicando la clase `.has-unread` cuando `N > 0`.
2. **Panel Desplegable y Tarjetas de Notificación (`src/components/BuzonDrawer.jsx`, `src/components/BuzonItem.jsx`, `src/components/BuzonDrawer.css`)**:
   - Siguiendo el patrón arquitectónico de 3 niveles de `CarritoDrawer.jsx`, `BuzonDrawer.jsx` recibe `idioma`, `mensajesBuzon`, `setMensajesBuzon`, `leidasIds`, `setLeidasIds`, `isOpen` y `onClose`.
   - Dentro de `BuzonDrawer.jsx`, el `.map()` delega exclusivamente en el componente hijo `BuzonItem.jsx`.
   - Cada `BuzonItem.jsx` muestra:
     - El código de reserva `#WP-{id}`.
     - Los espacios y fechas afectados (reutilizando `AdminReservaDetalleLine.jsx` dentro de su `.map()`).
     - El mensaje dejado por el administrador (`reserva.mensajeCancelacion`).
     - Un botón **"✓ Marcar como leído" / "✓ Mark as read"** que invoca `handleDescartar(indice)` en `BuzonDrawer.jsx`, el cual agrega el ID a `leidasIds` con Spread (`setLeidasIds([...leidasIds, reservaDescartada.id])`), clona el arreglo (`const nuevosMensajes = [...mensajes]`), elimina el elemento con `nuevosMensajes.splice(indice, 1)` y actualiza `setMensajesBuzon(nuevosMensajes)`.

---

### Punto 7: Corrección de Persistencia e Impacto al Modificar el Precio Base desde Admin

#### Problema
Al modificar el precio base de un espacio desde el panel de administración (`AdminEspacios.jsx` / `AdminPrecioForm.jsx`), el cambio podía no persistirse correctamente en la base de datos o no reflejarse de inmediato en el estado y en el catálogo.

#### Solución Implementada
1. **Frontend (`src/components/AdminPrecioForm.jsx`, `src/components/AdminEspacios.jsx` y `src/components/AdminEspacios.css`)**:
   - En **`AdminPrecioForm.jsx`**:
     - Se envolvió el control en un formulario controlado `<form onSubmit={(e) => e.preventDefault()} className="ad-td-rate">`.
     - Al confirmar en `handleGuardar()`, verifica `precioBase.trim() !== ''` y convierte el valor con `const valorNumerico = Number(precioBase)`, validando `valorNumerico > 0` antes de disparar `onModificarPrecio(espacio, valorNumerico)`.
   - En **`AdminEspacios.jsx`** (`handleModificarPrecio`):
     - Envía la petición `PUT /api/admin/espacios/${espacio.id}` incluyendo los headers `'Content-Type': 'application/json'` y `Authorization: \`Bearer \${token}\``, y el body completo requerido por `EspacioRequestDTO`.
     - En `.then((data) => ...)`, actualiza inmediatamente la fila en memoria con:
       ```js
       setEspacios(
         espacios.map((item) => (item.id === espacio.id ? data : item))
       )
       ```
       y muestra un mensaje de confirmación (`mensajeExito`).
2. **Backend (`EspacioServiceImpl.java`)**:
   - Se añadió la anotación `@Transactional` de Spring a los métodos de escritura `crearEspacio`, `modificarEspacio`, `eliminarEspacio` y `restaurarEspacio`.
   - En `modificarEspacio(Long id, EspacioRequestDTO request)`, se actualiza `espacio.setPrecioBase(request.getPrecioBase())` y se asigna una nueva instancia mutable `new ArrayList<>(request.getImagenes())` para la colección `@ElementCollection(fetch = FetchType.EAGER)` `imagenes`, garantizando que Hibernate ejecute el `UPDATE` en la tabla `espacios`.

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
  - De este modo, la interfaz pasa de inmediato al estado vacío (`checkout-empty`) junto con el aviso de expiración y el enlace `<Link to="/catalogo">` para volver al catálogo.

---

### Punto 9: Almanaque / Calendario Visual de Disponibilidad (`CalendarioDisponibilidad.jsx` y `CalendarioDia.jsx`)

#### Problema
Las fechas ocupadas en el detalle de un espacio se mostraban como una lista plana de texto en lugar de un almanaque mensual donde se distinguieran visualmente los días pasados, ocupados y disponibles.

#### Solución Implementada
- **`src/components/CalendarioDisponibilidad.jsx` (Nuevo)**:
  - Reemplaza a los antiguos componentes `FechasOcupadasLista.jsx` y `FechaOcupadaItem.jsx` dentro de `DetalleEspacio.jsx`.
  - Consume el listado `YYYY-MM-DD` devuelto por `GET /api/espacios/${espacioId}/fechas-ocupadas`.
  - Permite navegar entre el mes actual y los meses siguientes mediante el estado `offsetMes` (`useState(0)`).
  - Construye el arreglo `celdas` de manera inmutable con el operador Spread (`celdas = [...celdas, nuevaCelda]`), verifica si cada día está ocupado recorriendo `listaOcupadas.map(...)` con `===`, y delega el renderizado de cada celda en el componente hijo `CalendarioDia.jsx`.
- **`src/components/CalendarioDia.jsx` (Nuevo)**:
  - Renderiza cada día del mes con su estado visual:
    - `.dia-pasado`: fecha anterior a hoy (`fechaIso < hoyIso`), deshabilitada y tachada en gris.
    - `.dia-ocupado`: fecha ocupada, resaltada en rojo suave y tachada.
    - `.dia-disponible`: fecha libre para reservar, resaltada en verde suave.
- **`src/components/CalendarioDisponibilidad.css` (Nuevo)**:
  - Grilla de 7 columnas (`grid-template-columns: repeat(7, 1fr)`) diseñada íntegramente con unidades `em`.

---

### Punto 10: Estado Compartido de Notificaciones Leídas del Buzón (`leidasIds` en `App.jsx`)

#### Problema
Al descartar una notificación en el buzón o navegar entre vistas, era necesario conservar qué notificaciones ya habían sido marcadas como leídas sin utilizar `useContext` ni abusar de `localStorage` para datos ajenos al token JWT.

#### Solución Implementada
- Siguiendo la **Solución de cátedra #1 de `CLAUDE.md` (Sección 2.1)** (*"Si varias vistas necesitan el mismo estado, el estado (`useState`) se declara en el padre común (`App.jsx`) y se pasa por `props`"*):
  - En **`src/App.jsx`** se declaró `const [leidasIds, setLeidasIds] = useState([])`.
  - Al calcular `mensajesNoLeidos` en `App.jsx`, se recorren los mensajes con `.map()` excluyendo aquellos cuyo `id` ya esté en `leidasIds`.
  - En **`src/components/BuzonDrawer.jsx`** (`handleDescartar`), al pulsar *"Marcar como leído"*, se agrega el ID al estado padre con Spread (`setLeidasIds([...leidasIds, reservaDescartada.id])`) y se remueve de `mensajesBuzon` clonando con Spread y aplicando `.splice(indice, 1)`.

---

### Punto 11: Nombres y Descripciones Bilingües (`Español / English`) en Todos los Espacios (`DataInitializer.java`)

#### Problema
Los espacios alquilables tenían el nombre en un solo idioma y la descripción únicamente en español. Se requería mostrar ambos idiomas lado a lado (`"Español / English"`) sin alterar el esquema de la base de datos.

#### Solución Implementada
- En **`Complejo_Backend/src/main/java/com/uade/tpo/complejo/DataInitializer.java`**:
  - Se definieron el `nombre` y la `descripcion` de todos los espacios con el formato `"Español / English"` y se configuró la actualización automática al iniciar el Backend si la base de datos ya contaba con registros previos.

---

### Punto 12: Ocultar / Descartar Reservas Canceladas en "Mis Reservas" (`ReservaCard.jsx`, `MisReservasList.jsx` y `App.jsx`)

#### Problema
Las reservas canceladas permanecían indefinidamente en la vista *Mis Reservas* sin darle al cliente la opción de quitarlas de su pantalla.

#### Solución Implementada
- En **`src/App.jsx`** y **`src/views/MisReservasView.jsx`**:
  - Se declaró el estado compartido `const [ocultasIds, setOcultasIds] = useState([])` en `App.jsx` y se pasó por `props` a `MisReservasView` $\rightarrow$ `MisReservasList`.
- En **`src/components/ReservaCard.jsx`**:
  - Cuando `isCancelada === true`, en el pie de la tarjeta se muestra el botón **`✕ Ocultar de mi vista` / `✕ Dismiss / Remove`**, que invoca `onOcultarReserva(reserva.id, index)`.
- En **`src/components/MisReservasList.jsx`**:
  - Se construye `reservasVisibles` recorriendo `reservas.map(...)` y excluyendo los IDs presentes en `ocultasIds`.
  - En `handleOcultarReserva(id, indice)`, se agrega el `id` con Spread (`setOcultasIds([...ocultasIds, id])`), se clona el arreglo (`const nuevasReservas = [...reservasVisibles]`), se elimina el elemento con `nuevasReservas.splice(indice, 1)` y se actualiza `setReservas(nuevasReservas)`.

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
- En **`src/components/EspacioCard.jsx`**, **`src/components/EspacioCard.css`**, **`src/components/DetalleEspacio.jsx`** y **`src/components/DetalleEspacio.css`**:
  - Se quitaron los badges `<span className="ec-category-tag">{tipo}</span>` y `<span className="dh-tag">{espacio.tipo}</span>` (así como sus clases CSS en desuso) para evitar mostrar nombres internos del enum en mayúsculas al cliente.

---

### Punto 15: Corrección al Desactivar y Reactivar Espacios desde el Panel Admin (`AdminEspacios.jsx`, `AdminEspacioController.java`, `EspacioServiceImpl.java`)

#### Solución Implementada
- En **`src/components/AdminEspacios.jsx`** (`handleToggleEstado`):
  - Alterna entre `DELETE /api/admin/espacios/${espacio.id}` (cuando `espacio.activo === true`) y `PATCH /api/admin/espacios/${espacio.id}/restaurar` (cuando `espacio.activo === false`).
  - Verifica `if (data && data.mensaje)` antes de actualizar el estado local `espacios` con `activo: !espacio.activo` y muestra confirmación visual en pantalla.
- En **`AdminEspacioController.java`** y **`EspacioServiceImpl.java`**:
  - El endpoint `/{id}/restaurar` acepta `PATCH` y `PUT`, y `restaurarEspacio(Long id)` ejecuta `@Transactional`, `espacio.setActivo(true)` y `espacioRepository.save(espacio)` para que `GET /api/espacios` (`findByActivoTrue()`) devuelva inmediatamente el espacio restaurado en el catálogo.

---

### Punto 16: Auditoría Integral y Adecuación Estricta a `CLAUDE.md` en `Complejo_Frontend`

Se realizó una revisión línea por línea de todos los archivos de `Complejo_Frontend` contrastándolos con la tabla de **PERMITIDO vs. PROHIBIDO** y las plantillas de código de `CLAUDE.md`, aplicando las siguientes correcciones:

1. **Uso de `localStorage` exclusivamente para `'jwtToken'` y eliminación de `JSON.parse()`**:
   - Se eliminó el uso de `localStorage.getItem('notificacionesLeidas')`, `localStorage.setItem('notificacionesLeidas', ...)`, `localStorage.getItem('reservasOcultas')` y `JSON.parse(...)` en `App.jsx`, `BuzonDrawer.jsx` y `MisReservasList.jsx`.
   - En su lugar, se implementó la solución de cátedra (`CLAUDE.md`, Sección 2.1): estados `leidasIds` y `ocultasIds` con `useState([])` en `App.jsx` pasados hacia abajo por `props`.
2. **Reemplazo de métodos JS no incluidos en el temario (`.push()`, `.filter()`, `.includes()`, `parseFloat()`, `isNaN()`, `.toISOString().split()`)**:
   - Se reemplazaron todos los `.push()`, `.filter()` e `.includes()` en `App.jsx`, `BuzonDrawer.jsx`, `MisReservasList.jsx` y `CalendarioDisponibilidad.jsx` por `.map()`, condicionales con `===` y el operador Spread (`[...lista, nuevo]`).
   - En `AdminPrecioForm.jsx` se reemplazó `parseFloat(precioBase)` e `isNaN(...)` por `Number(precioBase)` y se eliminó el `useEffect` redundante.
   - En `ReservaWidgetForm.jsx` se reemplazó `new Date().toISOString().split('T')[0]` por el armado de la fecha local con `new Date()` y Template Strings (`${anio}-${mesStr}-${diaStr}`).
3. **Eliminación de mutación directa del DOM (`onError` en `<img>`)**:
   - En `EspacioCard.jsx`, `DetalleEspacio.jsx` y `AdminEspacioRow.jsx` se eliminó el handler `onError={(e) => { e.target.src = ... }}` (no visto en las Clases 7 a 10), manteniendo la selección condicional de `imagenPrincipal` con `imagenPorDefecto`.
4. **Eliminación de estilos inline (`style={{ ... }}`)**:
   - En `LoginForm.jsx` y `RegisterForm.jsx` se reemplazó el atributo inline `style={{ justifyContent: 'flex-end', marginBottom: '1em' }}` por las clases `.login-lang-bar` (`LoginForm.css`) y `.register-lang-bar` (`RegisterForm.css`).
5. **Formulario controlado en `AdminCancelarForm.jsx` y Navbar semántica (`<nav>` $\rightarrow$ `<ul>` $\rightarrow$ `<li>` $\rightarrow$ `<Link>`)**:
   - En `AdminCancelarForm.jsx` se reemplazó el `<div className="admin-cancel-form">` y `<button type="button">` por `<form onSubmit={(e) => e.preventDefault()} className="admin-cancel-form">` y `<button type="submit">`.
   - En `NavCliente.jsx` y `NavAdmin.jsx` se envolvió el bloque de marca dentro de `<ul className="nav-list nav-brand"><li>...</li></ul>` para respetar estrictamente la jerarquía `<nav>` $\rightarrow$ `<ul>` $\rightarrow$ `<li>` $\rightarrow$ `<Link>` de la Clase 10 (`CLAUDE.md`, Sección 5.B).
6. **Claves `key` únicas en todos los `.map()` y limpieza de archivos huérfanos**:
   - En `AdminReservaRow.jsx`, `BuzonItem.jsx` y `ReservaCard.jsx` se reemplazó el índice del arreglo (`key={idx}`) por una clave única compuesta por datos del ítem (`key={`${det.nombreEspacio}-${det.checkIn}`}`).
   - Se eliminaron los componentes huérfanos `src/components/FechasOcupadasLista.jsx` y `src/components/FechaOcupadaItem.jsx` y sus reglas CSS en desuso en `DetalleEspacio.css`.
   - Se verificó con `npm run lint` (**0 errores y 0 warnings**) y `npm run build` (**compilación limpia**).

---

## 3. Resumen de Archivos Creados, Modificados y Eliminados

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
| `index.html` y `public/favicon.svg` | Modificado | Nuevo ícono SVG del complejo y actualización exclusiva de `<title>`. |
| `src/App.jsx` | Modificado | Estados elevados `idioma`, `mensajesBuzon`, `isBuzonOpen`, `leidasIds` y `ocultasIds` distribuidos por `props`; `localStorage` exclusivo para `jwtToken`. |
| `src/components/BuzonButton.jsx` | **Nuevo** | Botón `📬 Buzón (N)` / `📬 Inbox (N)` ubicado en la barra del cliente junto al carrito. |
| `src/components/BuzonDrawer.jsx` | **Nuevo** | Drawer lateral para visualizar y descartar notificaciones con Spread + `.splice(indice, 1)`. |
| `src/components/BuzonItem.jsx` | **Nuevo** | Componente presentacional de cada notificación de cancelación dentro de `BuzonDrawer`. |
| `src/components/BuzonDrawer.css` | **Nuevo** | Estilos en `em` para el panel lateral y las tarjetas del buzón. |
| `src/components/CalendarioDisponibilidad.jsx` | **Nuevo** | Almanaque mensual de disponibilidad con navegación por mes, `.map()` y Spread (`...`). |
| `src/components/CalendarioDia.jsx` | **Nuevo** | Componente presentacional de cada día del almanaque (`.dia-pasado`, `.dia-ocupado`, `.dia-disponible`). |
| `src/components/CalendarioDisponibilidad.css` | **Nuevo** | Estilos CSS Grid (`repeat(7, 1fr)`) en unidades `em` para el almanaque. |
| `src/components/AdminCancelarForm.jsx` | **Nuevo** | Formulario controlado (`<form onSubmit={(e) => e.preventDefault()}>`) para ingresar el motivo de cancelación en Admin. |
| `src/components/FechasOcupadasLista.jsx` y `FechaOcupadaItem.jsx` | **Eliminado** | Componentes huérfanos reemplazados por `CalendarioDisponibilidad.jsx` y `CalendarioDia.jsx`. |
| `src/components/CheckoutResumen.jsx` | Modificado | Limpieza automática del estado `carritoData` cuando el carrito expira al intentar pagar. |
| `src/components/Navigation.jsx`, `NavCliente.jsx`, `NavAdmin.jsx`, `Navigation.css` | Modificado | Estructura semántica `<nav>` $\rightarrow$ `<ul>` $\rightarrow$ `<li>` $\rightarrow$ `<Link>`, integración de `BuzonButton` y selector de idioma `ES \| EN`. |
| `src/components/LoginForm.jsx`, `LoginForm.css`, `RegisterForm.jsx`, `RegisterForm.css` | Modificado | Traducción `ES / EN` y reemplazo de estilos inline por clases `.login-lang-bar` y `.register-lang-bar`. |
| `src/components/CampoFormulario.jsx` y `ReservaWidgetForm.jsx` | Modificado | Atributo `min` en inputs de fecha y validación de fechas pasadas con fecha local en Template Strings. |
| `src/components/EspacioCard.jsx`, `EspacioCard.css`, `DetalleEspacio.jsx`, `DetalleEspacio.css`, `AdminEspacioRow.jsx` | Modificado | Eliminación de tags crudos de enum, limpieza de CSS en desuso e integración de `CalendarioDisponibilidad`. |
| `src/components/AdminPrecioForm.jsx`, `AdminEspacios.jsx`, `AdminEspacios.css` | Modificado | Conversión con `Number(precioBase)`, persistencia y feedback al modificar precios y al desactivar/reactivar espacios. |
| `src/components/AdminReservas.jsx`, `AdminReservasTabla.jsx`, `AdminReservaRow.jsx`, `AdminReservas.css` | Modificado | Flujo de cancelación con motivo personalizado y `key` única en `.map()`. |
| `src/views/MisReservasView.jsx`, `src/components/ReservaCard.jsx`, `MisReservasList.jsx`, `MisReservasList.css` | Modificado | Ocultamiento de reservas canceladas mediante `ocultasIds` por `props`, `.splice(indice, 1)` y aviso de cancelación. |
| Resto de vistas (`src/views/*.jsx`) y componentes (`src/components/*.jsx`) | Modificado | Soporte bilingüe completo (`es` / `en`) recibido por `props` desde `App.jsx`. |
