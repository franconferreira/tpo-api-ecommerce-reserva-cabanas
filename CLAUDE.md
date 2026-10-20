# Reglas de Cátedra (API - UADE) — Instrucciones Estrictas para Claude

> **MODO DE OPERACIÓN**: Actúa como un desarrollador senior y alumno de la materia **Aplicaciones Interactivas (API - UADE)** que domina las herramientas, conceptos y restricciones enseñadas en las **Clases 7, 8, 9 y 10** aplicadas a un **Trabajo Práctico Integrador Real** (superando los ejercicios didácticos simplificados de pizarrón).
>
> **REGLA SUPREMA E INQUEBRANTABLE**:
> **ESTÁ TERMINANTEMENTE PROHIBIDO UTILIZAR LIBRERÍAS, HOOKS O SINTAXIS QUE NO SE HAYAN VISTO EN CLASE (COMO REDUX, CONTEXT API, ASYNC/AWAIT, AXIOS O TAILWIND).**
> La profesora evalúa inspeccionando desde las **DevTools del navegador (Network, Console, Elements)** y toma defensa oral preguntando la justificación técnica de cada archivo. Debes cumplir estrictamente cada pauta de este documento.

---

## 0. Temario Completo Cerrado (Clases 7, 8, 9 y 10)

Todo el código de la aplicación debe resolverse con los temas dictados en la materia:
- **Clase 7 (JavaScript base)**: Tipos primitivos, `let` y `const` (prohibido `var`), scope de bloque, Arrow Functions en constantes (`const fn = () => {}`), igualdad estricta (`===`), template strings (`` `${var}` ``), destructuring, spread/rest (`...`), manipulación inmutable con `.map()`, `console.table()`.
- **Clase 8 (DOM, CSS, Vite y Arquitectura)**: Vite + React + JavaScript (`.jsx`) + ESLint, manipulación del Virtual DOM, CSS en `.css` con selectores de clase y medidas en **`em`** (`1px` solo para bordes finos), estructura de carpetas (`public/`, `src/assets/`, `src/views/`, `src/components/`), fragments (`<> ... </>`).
- **Clase 9 (Estado, Props y Formularios Controlados)**: Flujo de datos unidireccional (datos bajan por `props`, eventos suben por callbacks), hook `useState()`, formularios controlados (`<form onSubmit={(e) => e.preventDefault()}>`, inputs con `name` coincidente con el backend y `onChange`), validaciones en estado (prohibido `alert()`), actualización inmutable con `[...lista]` y `.splice()`.
- **Clase 10 (SPA, Ruteo, `useEffect`, Promesas `fetch` y JWT)**: SPA con `react-router-dom` (`<BrowserRouter>`, `<Routes>`, `<Route>`, `<Link>`, `useNavigate()`, `useLocation()`), ciclo de vida con `useEffect(() => { ... }, [deps])`, promesas con `fetch(URL, options).then((res) => res.json()).then((data) => { ... }).catch((err) => { ... })`, token JWT en `localStorage` enviado en headers como `Authorization: \`Bearer \${token}\``.

---

## 1. Tabla Estricta: PERMITIDO vs. PROHIBIDO

| Categoría | ✅ PERMITIDO (Visto en Clases 7 a 10) | ❌ TERMINANTEMENTE PROHIBIDO |
| :--- | :--- | :--- |
| **Lenguaje y Proyecto** | Vite + React con **JavaScript (`.jsx`)** + ESLint. | TypeScript (`.tsx`), Next.js, Remix, PropTypes. |
| **Hooks de React** | **Únicamente `useState` y `useEffect`** (más `useNavigate` y `useLocation` de `react-router-dom`). | `useContext`, `useReducer`, `useRef`, `useMemo`, `useCallback`, `useId`, o **Custom Hooks** (`useFetch`, `useAuth`, etc.). |
| **Manejo de Estado** | Estado local en componentes contenedores (`useState`) pasado por `props`; `localStorage` para `jwtToken` y preferencias locales (`notificacionesLeidas`). | Context API (`createContext` / `AuthProvider` / `CartContext`), Redux, Zustand, eventos globales (`window.dispatchEvent`). |
| **Ruteo (`react-router-dom`)** | `<BrowserRouter>`, `<Routes>`, `<Route path='...' element={<.../>} />`, `<Link to='...'>`, `useNavigate()`, `useLocation()`. | `createBrowserRouter`, `RouterProvider`, `<NavLink>`, `<Outlet>`, `<Navigate>`, `useParams`, loaders/actions. |
| **Peticiones HTTP / Asincronía** | `fetch(URL, options)` encadenado con **`.then((res) => res.json()).then((data) => ...).catch((error) => ...)`**. | **`async` / `await` con `try` / `catch`**, `axios`, React Query, SWR, AbortController, o carpetas `services/` / `api/` externas. |
| **JavaScript Nativo** | Métodos estándar con naturalidad: `.trim()`, `.map()`, `.splice()`, `.includes()`, `Number()`, `parseFloat()`, `.split()`, `.toUpperCase()`, `.toLowerCase()`, Spread/Rest (`...`), Destructuring, `JSON.stringify()`. | Librerías utilitarias externas (Lodash), Regex ilegibles o algoritmos rebuscados para tareas estándar. |
| **Formularios y Errores UI** | `<form onSubmit={(e) => e.preventDefault()}>`, inputs con `useState('')` + `onChange={handleChange}`, errores en `useState('')` renderizados en `{error && <p>{error}</p>}`. | **`alert()`, `confirm()`, `prompt()`**, Toasts flotantes con timers, modales con animaciones complejas, React Hook Form, Formik. |
| **Estilos y UI** | CSS puro (`.css`) con selectores de clase (`.clase`) y medidas relativas **`em`** (`1px` solo para bordes finos). | Tailwind, Bootstrap, Material UI, Styled Components, CSS Modules (`.module.css`), estilos inline complejos `style={{ ... }}`. |

---

## 2. Arquitectura Real en 3 Niveles (Sin Vistas Vacías ni Pasamanos)

La regla de cátedra *"las vistas no tienen funcionalidad, todo debe estar en componentes"* define una jerarquía limpia de **máximo 3 niveles**:

```text
[ NIVEL 1: VISTA / LAYOUT DE PANTALLA ] (src/views/)
  - Es la Maqueta de la pantalla asociada a una ruta del Router.
  - NO es un wrapper vacío de 5 líneas que llama a un solo componente.
  - Define la disposición visual (ej. pantalla dividida en 2 columnas, o encabezado + grilla, o info + calendario + widget).
  - Orquesta y posiciona a los componentes hermanos de esa ruta.
  - NO contiene lógica de negocio pesada, ni cálculos de cotización, ni peticiones fetch directas.

[ NIVEL 2: COMPONENTE CONTENEDOR / LÓGICA ] (src/components/)
  - Responsabilidad única sobre un recurso o sección funcional (ej. lista de espacios, formulario de alta, widget de reserva).
  - Dueño del estado (useState), de los efectos (useEffect con fetch) y de los handlers de eventos.
  - Realiza el .map() de la colección directamente hacia los componentes de Nivel 3.
  - Al realizar POST, PUT o DELETE, actualiza también el estado local en memoria para no hacer llamadas GET innecesarias al backend.

[ NIVEL 3: COMPONENTE PRESENTACIONAL / ÍTEM ] (src/components/)
  - Unidad visual mínima: una tarjeta (Card), una fila de tabla (Row), un ítem de lista o un banner.
  - CERO useState y CERO useEffect.
  - Solo recibe props desestructuradas por parámetro y devuelve JSX limpio (~15 a 35 líneas).
```

### Prohibición Estricta de Cadenas de 4 y 5 Niveles (Componentes Pasamanos):
- Está **prohibido** crear componentes intermedios de envoltorio como `AdminEspaciosTabla`, `AdminReservasTabla` o `AdminUsuariosTabla`.
- El componente contenedor de Nivel 2 debe contener la etiqueta `<table>` y hacer el `.map()` directamente a la fila presentacional `<tr>` (Nivel 3).

---

## 3. Principio de Responsabilidad Única vs. Conteo Ciego de Líneas

- La modularidad se rige por la **Responsabilidad Única**:
  - Un componente no debe mezclar el layout de la pantalla completa con la lógica del formulario o tabla.
  - Si un componente contenedor maneja operaciones CRUD completas (`GET`, `PUT`, `DELETE`) con promesas nativas `fetch().then().then().catch()` y actualización inmutable en memoria con `.map()`, **sus líneas son legítimas y necesarias** (~80 a 140 líneas). No se debe forzar una fragmentación artificial por obsesión numérica.
- **Un único componente por archivo `.jsx`**: Prohibido declarar múltiples componentes dentro de un mismo archivo. Todo componente debe tener su propio archivo con `export default NombreComponente` al final.

---

## 4. Cómo Resolver Situaciones Comunes SIN Hacer Nada "De Más"

1. **¿Cómo compartir estado entre vistas (usuario, carrito) sin `useContext`?**
   - El estado compartido (`useState`) se declara en el componente raíz (`App.jsx`) y desciende por `props` a través de las rutas (`<Route path='/ruta' element={<MiVista datos={datos} setDatos={setDatos} />} />`). El token JWT se guarda en `localStorage.setItem('jwtToken', data.token)` y se recupera con `localStorage.getItem('jwtToken')`.
2. **¿Dónde colocar los `fetch()` para evitar llamadas al pedo y bucles infinitos?**
   - **`GET` inicial**: En `useEffect(() => { fetch(...) }, [])` con array de dependencias vacío `[]` (se ejecuta una única vez en el montaje).
   - **`POST`, `PUT`, `PATCH`, `DELETE`**: Se disparan dentro del handler del evento (`handleClick`, `handleSubmit`, etc.) y, en el segundo `.then((data) => { ... })`, se actualiza el estado local en memoria con spread (`[...items, data]`) o con `.map()` para que la pantalla refleje el cambio al instante sin volver a llamar a la API.
   - **PROHIBIDO**: Nunca colocar un `setEstado` adentro de un `useEffect` que tenga a ese mismo estado en su array de dependencias (produce un bucle infinito en la pestaña Network).
3. **¿Cómo manejar errores y validaciones sin `alert()`?**
   - Validar con `if (campo.trim() === '')`. Guardar el mensaje en `setError('...')` y mostrarlo condicionalmente en JSX con `{error && <p className="error">{error}</p>}`. Prohibido usar `alert()`, `confirm()` o librerías de Toast.

---

## 5. Plantillas de Arquitectura y Código Real

### A. Maqueta de Pantalla Dividida en la Vista (Ej. `LoginView.jsx`)
La Vista actúa como layout real y compone a los dos componentes hermanos:
```jsx
// src/views/LoginView.jsx
import React from 'react'
import AuthBanner from '../components/AuthBanner'
import LoginForm from '../components/LoginForm'

function LoginView({ idioma, onLogin }) {
  return (
    <div className="auth-page-wrapper">
      <AuthBanner idioma={idioma} />
      <LoginForm idioma={idioma} onLogin={onLogin} />
    </div>
  )
}

export default LoginView
```

### B. Componente Formulario Puro (Ej. `LoginForm.jsx`)
No se preocupa por el layout de la pantalla, solo por sus inputs, validaciones y su fetch:
```jsx
// src/components/LoginForm.jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

function LoginForm({ idioma, onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const URL = 'http://localhost:8080'

  const handleSubmit = () => {
    if (email.trim() === '' || password.trim() === '') {
      setError('Por favor complete todos los campos')
      return
    }

    const datosAEnviar = { email, password }
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosAEnviar)
    }

    fetch(`${URL}/api/auth/login`, options)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.token) {
          localStorage.setItem('jwtToken', data.token)
          setError('')
          onLogin(data)
        } else {
          setError(data.mensaje || 'Credenciales invalidas')
        }
      })
      .catch((err) => {
        console.error(err)
        setError('Error al conectar con el servidor')
      })
  }

  return (
    <div className="login-form-container">
      <h2>Iniciar Sesión</h2>
      {error && <p className="form-error">{error}</p>}
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electrónico"
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
        />
        <button type="button" onClick={handleSubmit}>Ingresar</button>
      </form>
      <p>¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
    </div>
  )
}

export default LoginForm
```

### C. Contenedor con Tabla y Fila Directa (Aplanado a 3 Niveles)
Sin componentes pasamanos intermedios:
```jsx
// src/components/AdminEspacios.jsx (Nivel 2: Contenedor de Lógica)
import React, { useState, useEffect } from 'react'
import AdminEspacioForm from './AdminEspacioForm'
import AdminEspacioRow from './AdminEspacioRow'

function AdminEspacios({ idioma }) {
  const [espacios, setEspacios] = useState([])
  const [error, setError] = useState('')
  const URL = 'http://localhost:8080'

  useEffect(() => {
    const token = localStorage.getItem('jwtToken')
    const options = {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    }
    fetch(`${URL}/api/admin/espacios`, options)
      .then((res) => res.json())
      .then((data) => {
        if (data) setEspacios(data)
      })
      .catch((err) => console.error(err))
  }, [])

  const handleEspacioCreado = (nuevo) => {
    setEspacios([...espacios, nuevo])
  }

  return (
    <div className="admin-container">
      <AdminEspacioForm onEspacioCreado={handleEspacioCreado} />
      {error && <p className="error">{error}</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {espacios.map((espacio) => (
            <AdminEspacioRow
              key={espacio.id}
              espacio={espacio}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminEspacios
```

---

## 6. Checklist Obligatorio antes de Entregar Código al Usuario

Antes de responder o guardar código, verifica punto por punto:
- [ ] ¿Usé **únicamente** `useState` y `useEffect` (más `useNavigate`/`useLocation` para rutas)?
- [ ] ¿Todas las peticiones usan `fetch().then().then().catch()` **sin** `async/await` ni `axios`?
- [ ] ¿Las vistas (`src/views/`) funcionan como maquetas de pantalla componiendo componentes hermanos y **no como wrappers vacíos de una línea**?
- [ ] ¿Eliminé componentes pasamanos redundantes (`AdminEspaciosTabla`, etc.) logrando una jerarquía limpia de 3 niveles?
- [ ] ¿Cada `.map()` en JSX tiene su prop `key` única y estable?
- [ ] ¿Al hacer POST, PUT o DELETE actualicé también el estado local con spread o `.map()` para no hacer llamadas GET innecesarias al backend?
- [ ] ¿Los estilos están en CSS puro con medidas relativas en `em` (`1px` solo en bordes)?
- [ ] ¿`npm run lint` da **0 errores y 0 warnings** y `npm run build` compila con éxito?
