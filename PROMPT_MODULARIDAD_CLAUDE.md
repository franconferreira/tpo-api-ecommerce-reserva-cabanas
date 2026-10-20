# Master Prompt para Claude: Refactorización Completa de Arquitectura, Modularidad y Mejoras de UI/UX (API - UADE)

> **CÓMO USAR ESTE ARCHIVO**: Copia y pega todo el contenido a partir de la siguiente línea de separación y envíaselo directamente a Claude en una nueva conversación o en Claude Code. 
> Este documento contiene el 100% del contexto de la cátedra, las restricciones técnicas inviolables, el diagnóstico de cada pantalla, las 4 mejoras funcionales y de UI obligatorias, y la guía exacta archivo por archivo para ejecutar toda la refactorización de punta a punta.

---

```markdown
# Directiva Integral: Arquitectura, Modularidad y Mejoras Funcionales (API - UADE)

Actúa como un desarrollador senior y alumno de la materia **Aplicaciones Interactivas (API - UADE)**.
Tu objetivo es refactorizar integralmente la arquitectura de componentes y vistas, y solucionar 4 problemas de funcionalidad y UI en el proyecto ubicado en:
`F:\Escritorio\UADE\2026\Segundo_Cuatrimestre\API\Repositorio_TPO\Complejo_Frontend`
(y datos iniciales en `F:\Escritorio\UADE\2026\Segundo_Cuatrimestre\API\Repositorio_TPO\Complejo_Backend`).

Debes transformar el código hacia una **arquitectura de software limpia, modular en 3 niveles y 100% defendible ante la cátedra**, manteniendo intactas todas las funcionalidades y corrigiendo los 4 puntos críticos detallados en la Sección 3.

---

## 1. CONTEXTO Y REGLAS TÉCNICAS INQUEBRANTABLES (CÁTEDRA UADE)

La profesora evalúa abriendo las **DevTools del navegador (Network, Console, Elements)** e interrogando línea por línea.
Cualquier patrón ajeno a lo enseñado en las Clases 7, 8, 9 y 10 delata uso descuidado de IA y reprobará el trabajo.

### A. Lo PERMITIDO vs. Lo PROHIBIDO
| Área | ✅ PERMITIDO (Visto en Clases 7, 8, 9 y 10) | ❌ TERMINANTEMENTE PROHIBIDO |
|---|---|---|
| **Hooks de React** | **Únicamente `useState` y `useEffect`** (más `useNavigate` y `useLocation` de `react-router-dom`). | `useContext`, `useReducer`, `useMemo`, `useCallback`, `useRef`, `useId`, o Custom Hooks (`useFetch`, etc.). |
| **Peticiones HTTP** | `fetch(URL, options).then((res) => res.json()).then((data) => { ... }).catch((err) => { ... })`. | **`async / await`**, `axios`, React Query, SWR, AbortController, o carpetas `services/` / `api/` externas. |
| **Manejo de Estado** | Estado local en componentes contenedores pasado por `props` hacia abajo; `localStorage` para `jwtToken` y persistencia de `notificacionesLeidas`. | Context API (`createContext`), Redux, Zustand, eventos globales (`window.dispatchEvent`). |
| **Validaciones y UI** | Estados en React (`const [error, setError] = useState('')`) renderizados en JSX (`{error && <p>{error}</p>}`). | **`alert()`, `confirm()`, `prompt()`**, librerías de Toast, modales flotantes con timers o animaciones complejas. |
| **JavaScript Nativo** | Métodos estándar con naturalidad: `.trim()`, `.map()`, `.splice()`, `.includes()`, `Number()`, `parseFloat()`, `.split()`, `.toUpperCase()`, `.toLowerCase()`, Spread/Rest (`...`), Destructuring, `JSON.stringify()`, `JSON.parse()`. | Librerías utilitarias externas (Lodash), Regex ilegibles o algoritmos rebuscados para tareas estándar. |
| **Estilos y CSS** | CSS puro en archivos `.css` con selectores de clase (`.clase`) y medidas relativas en **`em`** (`1px` solo para bordes finos `1px solid ...`). | Tailwind CSS, Bootstrap, Material UI, Styled Components, CSS Modules (`.module.css`), estilos inline complejos `style={{ ... }}`. |

---

## 2. EL MODELO DE ARQUITECTURA: 3 NIVELES REALES

La profesora enseñó que *"las vistas no tienen funcionalidad, todo debe estar en componentes"*.
En el proyecto final, esto **NO significa** que una vista deba ser un archivo fantasma de 5 líneas que solo importa un componente y le pasa las props de largo (*antipatrón de wrapper pasamanos*).
Significa lo siguiente:

```text
[ NIVEL 1: VISTA / LAYOUT ] (src/views/)
  - Es la Maqueta de Pantalla asociada a una ruta del Router.
  - Define la disposición visual (ej. pantalla dividida en 2 columnas, o encabezado + grilla, o info + calendario + widget).
  - Orquesta y posiciona a los componentes hermanos de esa pantalla.
  - NO tiene lógica de negocio pesada, ni peticiones fetch directas, ni cálculos de cotización.

[ NIVEL 2: COMPONENTE CONTENEDOR / LÓGICA ] (src/components/)
  - Tiene una sola responsabilidad funcional sobre un recurso o bloque.
  - Es el dueño del estado (useState), de los efectos (useEffect con fetch) y de los handlers de eventos.
  - Realiza el .map() de la colección directamente hacia los componentes de Nivel 3.
  - Aplica la regla de oro: al hacer POST, PUT o DELETE, actualiza también el estado local en memoria para no hacer peticiones GET innecesarias al backend.

[ NIVEL 3: COMPONENTE PRESENTACIONAL / ÍTEM ] (src/components/)
  - Unidad visual mínima: una tarjeta (Card), una fila de tabla (Row), un ítem de lista o un banner.
  - CERO useState y CERO useEffect.
  - Solo recibe props desestructuradas por parámetro y devuelve JSX limpio (~15 a 35 líneas).
```

### Regla contra las cadenas de 4 y 5 niveles:
Queda **estrictamente prohibido** tener componentes pasamanos intermedios.
Se deben eliminar las tablas intermedias (`AdminEspaciosTabla`, `AdminReservasTabla`, `AdminUsuariosTabla`). El contenedor de Nivel 2 debe tener la etiqueta `<table>` y hacer el `.map()` directo a la fila `<tr>` (Nivel 3).

---

## 3. MEJORAS FUNCIONALES Y CORRECCIONES DE UI OBLIGATORIAS

Además de la refactorización arquitectónica, debes implementar obligatoriamente las siguientes 4 soluciones:

### 1. Galería de Mínimo 6 Fotos por Alojamiento en la Pantalla de Detalle
* **Backend (`DataInitializer.java`)**:
  * Actualmente cada espacio tiene una sola foto (`.imagenes(List.of(imgE1))`).
  * Para cada uno de los 8 espacios (`e1` a `e8`), carga una lista de **al menos 6 URLs reales de Unsplash de alta resolución** representando: exterior, sala/living, dormitorio, baño, deck/patio y detalles naturales/entorno.
* **Frontend (`src/components/DetalleEspacio.jsx` o componente de galería)**:
  * Implementa un estado `const [fotoSeleccionada, setFotoSeleccionada] = useState(0)`.
  * Muestra una imagen principal grande arriba (`espacio.imagenes[fotoSeleccionada]`).
  * Abajo muestra una tira horizontal o grilla de miniaturas (`espacio.imagenes.map((img, idx) => ...)`).
  * Al hacer click en cualquier miniatura, se actualiza `setFotoSeleccionada(idx)` y la miniatura activa resalta con un borde visible (`.foto-thumb-activa`).

### 2. Persistencia de Notificaciones Canceladas Descartadas (`localStorage`)
* **Problema actual**: Al descartar una notificación en el buzón, el ID solo se guardaba en un `useState([])` volátil en `App.jsx`. Al recargar o cerrar el navegador, la notificación cancelada volvía a aparecer.
* **Solución**:
  * En `src/App.jsx`, inicializa `leidasIds` leyendo desde `localStorage`:
    ```javascript
    const [leidasIds, setLeidasIds] = useState(() => {
      const guardadas = localStorage.getItem('notificacionesLeidas')
      return guardadas ? JSON.parse(guardadas) : []
    })
    ```
  * En `handleDescartarNotificacion` (o cuando el usuario marque como leída una notificación):
    * Agrega el ID al arreglo: `const nuevoLeidas = [...leidasIds, id]`
    * Actualiza el estado: `setLeidasIds(nuevoLeidas)`
    * Persiste en `localStorage`: `localStorage.setItem('notificacionesLeidas', JSON.stringify(nuevoLeidas))`
  * De esta forma, al cerrar y reabrir el proyecto, las notificaciones descartadas **nunca vuelven a molestar al usuario**.

### 3. Eliminación de Saltos de Componentes al Navegar (Cumulative Layout Shift)
* **Problema actual**: Al cambiar entre pantallas cortas (Login) y largas (Catálogo), la barra de scroll vertical de Windows (17px) aparece y desaparece, desplazando horizontalmente todo el contenido. Además, mientras el `fetch` carga, los contenedores colapsan a 0px y pegan el footer arriba.
* **Solución**:
  * En `src/index.css`:
    ```css
    html {
      overflow-y: scroll; /* Bloquea permanentemente el canal del scrollbar para evitar saltos horizontales */
    }
    ```
  * En los contenedores principales de pantalla (`.auth-page-wrapper`, `.catalogo-wrapper`, `.detalle-wrapper`, `.checkout-wrapper`, etc.):
    * Establece `min-height: 80vh;` para que la página mantenga su altura estable mientras se reciben los datos del backend.

### 4. Eliminación de Saltos de Componentes al Cambiar de Idioma (`ES | EN`)
* **Problema actual**: La diferencia de caracteres entre español e inglés ("Volver al Catálogo" vs "Back to Catalog", "Iniciar Sesión" vs "Sign In") cambia el ancho de botones, enlaces del menú y columnas de tablas, haciendo vibrar la interfaz.
* **Solución**:
  * **Barra de navegación (`Navigation.css`)**:
    * Asigna un `min-width` adecuado a los enlaces y botones con texto alternante para que su caja no cambie de tamaño al alternar el idioma.
    * Mantén el botón de idioma con ancho fijo (`min-width: 6.5em; text-align: center;`).
  * **Botones de acción (ej. "Volver al Catálogo")**:
    * Aplica `min-width: 12em; text-align: center;` para absorber la diferencia de longitud en ambas lenguas.
  * **Tablas de administración (`AdminEspacios.css`, `AdminReservas.css`, `AdminUsuarios.css`)**:
    * Aplica `table-layout: fixed; width: 100%;` a las tablas y define anchos porcentuales fijos en las columnas del encabezado (`th:nth-child(1) { width: 30%; }`, etc.) para que la tabla no recalcule anchos al cambiar el idioma.

---

## 4. INVENTARIO Y PLAN DE REFACTORIZACIÓN PANTALLA POR PANTALLA

Aplica exactamente la siguiente estructura en las 9 vistas y sus componentes:

### 1. Pantalla de Login (`LoginView.jsx`)
* `src/views/LoginView.jsx`: Maqueta de pantalla dividida con dos componentes hermanos:
  ```jsx
  <div className="auth-page-wrapper">
    <AuthBanner idioma={idioma} />
    <LoginForm idioma={idioma} onLogin={onLogin} />
  </div>
  ```
* `src/components/LoginForm.jsx`: Elimina `AuthBanner` de su interior. Se concentra exclusivamente en sus inputs controlados (`email`, `password`), validaciones, `fetch` POST a `/api/auth/login` y link a `/register`.

### 2. Pantalla de Registro (`RegisterView.jsx`)
* `src/views/RegisterView.jsx`: Maqueta de pantalla dividida con `<AuthBanner />` y `<RegisterForm />`.
* `src/components/RegisterForm.jsx`: Se limpia del layout de pantalla completa; maneja únicamente los campos de registro (nombre, email, password, teléfono), validaciones y `fetch` POST a `/api/auth/register`.

### 3. Pantalla de Catálogo (`CatalogoView.jsx`)
* `src/views/CatalogoView.jsx` (Nivel 1): Estructura la página del catálogo (encabezado con título/subtítulo y el contenedor del catálogo).
* `src/components/EspacioList.jsx` (Nivel 2): Contenedor principal:
  * `useState` de espacios traídos de la API.
  * `useState` de filtro seleccionado.
  * `useEffect` con `fetch` GET a `/api/espacios`.
  * Barra de filtros.
  * `{espaciosFiltrados.map((espacio) => <EspacioCard key={espacio.id} espacio={espacio} ... />)}`.
* `src/components/EspacioCard.jsx` (Nivel 3): Presentacional puro. Recibe props desestructuradas, muestra imagen, nombre, precio base en `em` y botón "Ver Detalle".

### 4. Pantalla de Detalle de Alojamiento (`DetalleEspacioView.jsx`)
* `src/views/DetalleEspacioView.jsx` (Nivel 1): Maqueta la pantalla en dos columnas:
  * Cabecera con título del espacio y botón `navigate('/catalogo')` con ancho estable.
  * Columna izquierda (`<DetalleEspacio />` con la galería de 6 fotos interactiva + `<CalendarioDisponibilidad />`).
  * Columna derecha (`<ReservaWidgetForm />`).
* `src/components/DetalleEspacio.jsx`: Presenta la información del espacio y contiene la galería interactiva con foto principal grande y tira de 6 miniaturas con `useState`.
* `src/components/CalendarioDisponibilidad.jsx`: Trae fechas ocupadas con `fetch` GET a `/api/espacios/${id}/fechas-ocupadas` y mapea los días con `<CalendarioDia />`.
* `src/components/ReservaWidgetForm.jsx`: Formulario de reserva con validación de fechas (mínimo hoy, check-out > check-in), cálculo de estadía y `fetch` POST a `/api/carrito/items`.

### 5. Pantalla de Carrito y Checkout (`CheckoutView.jsx`)
* `src/views/CheckoutView.jsx` (Nivel 1): Maqueta de dos columnas:
  * Columna izquierda: Desglose de alojamientos (`<CheckoutResumen />`).
  * Columna derecha: Formulario de pago y confirmación.
* `src/components/CheckoutResumen.jsx` (Nivel 2): Mapea los ítems delegando en `<CheckoutItem />` y `<CheckoutTotales />`.
* `src/components/CheckoutItem.jsx` (Nivel 3): Fila presentacional del carrito con botón de eliminar.

### 6. Pantalla de Mis Reservas (`MisReservasView.jsx`)
* `src/views/MisReservasView.jsx` (Nivel 1): Maqueta el historial de reservas.
* `src/components/MisReservasList.jsx` (Nivel 2): Contenedor con `useEffect` que hace `fetch` GET a `/api/reservas/mis-reservas` y mapea las tarjetas.
* `src/components/ReservaCard.jsx` (Nivel 3): Tarjeta presentacional con fecha, estado, código y aviso de cancelación si aplica.

### 7. Panel Admin: Gestión de Espacios (`AdminEspaciosView.jsx`)
* **ELIMINAR `AdminEspaciosTabla.jsx`** (pasamanos redundante).
* `src/views/AdminEspaciosView.jsx` (Nivel 1): Maqueta el panel con encabezado y `<AdminEspacios />`.
* `src/components/AdminEspacios.jsx` (Nivel 2): Contenedor maestro:
  * `useState` de la lista de espacios.
  * `useEffect` con `fetch` GET a `/api/admin/espacios`.
  * Formulario `<AdminEspacioForm onEspacioCreado={handleEspacioCreado} />`.
  * Etiqueta `<table>` con `table-layout: fixed; width: 100%;` que ejecuta directamente `{espacios.map((espacio) => <AdminEspacioRow key={espacio.id} espacio={espacio} onModificarPrecio={handleModificarPrecio} onToggleEstado={handleToggleEstado} />)}`.
* `src/components/AdminEspacioRow.jsx` (Nivel 3): Fila `<tr>` presentacional con edición directa de precio sin requerir componentes intermedios de nivel 5.

### 8. Panel Admin: Gestión de Reservas (`AdminReservasView.jsx`)
* **ELIMINAR `AdminReservasTabla.jsx`**.
* `src/views/AdminReservasView.jsx` (Nivel 1): Maqueta la vista de control de reservas.
* `src/components/AdminReservas.jsx` (Nivel 2): Contenedor con `fetch` GET a `/api/admin/reservas`, handlers y la `<table>` que mapea directamente a `<AdminReservaRow />`.
* `src/components/AdminReservaRow.jsx` (Nivel 3): Fila `<tr>` presentacional.

### 9. Panel Admin: Gestión de Usuarios (`AdminUsuariosView.jsx`)
* **ELIMINAR `AdminUsuariosTabla.jsx`**.
* `src/views/AdminUsuariosView.jsx` (Nivel 1): Maqueta la vista de usuarios.
* `src/components/AdminUsuarios.jsx` (Nivel 2): Contenedor con `fetch` GET a `/api/admin/usuarios`, handlers y la `<table>` que mapea a `<AdminUsuarioRow />`.
* `src/components/AdminUsuarioRow.jsx` (Nivel 3): Fila `<tr>` presentacional.

### 10. Raíz de la Aplicación (`src/App.jsx`)
* Unificar la carga de sesión y carrito en una función compacta `sincronizarSesion()`.
* Persistir y leer `leidasIds` de notificaciones con `localStorage`.

---

## 5. PROTOCOLO DE EJECUCIÓN PASO A PASO

Procede en el siguiente orden estricto:

1. **Fase 1: Backend (`DataInitializer.java`)**:
   - Cargar al menos 6 fotos reales de Unsplash por cada uno de los 8 espacios.
2. **Fase 2: Estabilidad Global de UI (`index.css` y `Navigation.css`)**:
   - Bloquear la barra de scroll con `overflow-y: scroll` en `html`.
   - Fijar `min-width` en botones y links de idioma para erradicar los saltos de interfaz.
3. **Fase 3: Autenticación**:
   - Refactorizar `LoginView.jsx` y `LoginForm.jsx`.
   - Refactorizar `RegisterView.jsx` y `RegisterForm.jsx`.
4. **Fase 4: Catálogo y Detalle con Galería Interactiva**:
   - Refactorizar `CatalogoView.jsx`, `EspacioList.jsx` y `EspacioCard.jsx`.
   - Refactorizar `DetalleEspacioView.jsx` y crear la galería interactiva en `DetalleEspacio.jsx`.
5. **Fase 5: Paneles de Administración (Aplanamiento de Tablas)**:
   - Eliminar `AdminEspaciosTabla.jsx` y conectar `AdminEspacios.jsx` $\rightarrow$ `AdminEspacioRow.jsx`.
   - Eliminar `AdminReservasTabla.jsx` y conectar `AdminReservas.jsx` $\rightarrow$ `AdminReservaRow.jsx`.
   - Eliminar `AdminUsuariosTabla.jsx` y conectar `AdminUsuarios.jsx` $\rightarrow$ `AdminUsuarioRow.jsx`.
6. **Fase 6: Checkout, Mis Reservas y Persistencia en `App.jsx`**:
   - Ajustar `CheckoutView.jsx`, `MisReservasView.jsx` y `App.jsx` con persistencia de notificaciones en `localStorage`.

---

## 6. VERIFICACIÓN FINAL OBLIGATORIA

Al finalizar:
1. Ejecutar en terminal: `npm run lint` en `Complejo_Frontend`. Debe arrojar **0 errores y 0 warnings**.
2. Ejecutar en terminal: `npm run build`. El build debe completarse con éxito sin fallos de importación.
3. Verificar visualmente que al cambiar de pantalla o de idioma los componentes permanezcan completamente inmóviles.
```
