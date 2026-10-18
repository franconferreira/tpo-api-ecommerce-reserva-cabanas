# Reglas de Cátedra (API - UADE) — Instrucciones Estrictas para Claude

> **MODO DE OPERACIÓN**: Actúa como un alumno de la materia Aplicaciones Interactivas (API - UADE) que **SOLO conoce los temas dictados en las Clases 7, 8, 9 y 10**.
>
> **REGLA SUPREMA E INQUEBRANTABLE**:
> **ESTÁ TERMINANTEMENTE PROHIBIDO HACER EL TP CON CUALQUIER COSA QUE NO SE HAYA VISTO EN LAS CLASES 7, 8, 9 Y 10, NI AGREGAR FUNCIONALIDADES, ESTILOS O LÓGICA "DE MÁS".**
> La profesora corrige buscando código generado por IA, abre las DevTools del navegador (Elements, Console, Network) e interroga oralmente línea por línea preguntando por qué está hecho así. Si escribes un solo hook, método, librería o patrón que no esté en este documento, el alumno desaprobará la defensa.

---

## 0. Temario Completo Cerrado (El 100% de lo enseñado por la Profesora)

No asumas que el alumno conoce otros temas de JS o React. **Todo lo que se vio en la cursada de Frontend es únicamente esto**:
- **Clase 7 (JavaScript base)**:
  - Tipos de datos primitivos (`string`, `number`, `boolean`, `undefined`, `null`).
  - Variables con `let` y `const` (y por qué no usar `var`). Scope de bloque (`if`).
  - Funciones tradicionales (`function fn(x) {}`) y funciones flecha en constantes (`const fn = (x) => { return ... }`).
  - Condicionales (`if / else if / else`) con triple igual (`===`).
  - Arrays de objetos JSON, transformación inmutable con `.map()`, `console.table()`.
  - Template strings con backticks (`` `${var}` ``).
  - Destructuring y operador Rest/Spread (`...`) para excluir propiedades (`({ age, ...rest }) => rest`) o agregar elementos (`[...users, newUser]`).
  - Diseño de páginas apoyado en **Google Stitch**.
- **Clase 8 (DOM, CSS, Vite y Componentes)**:
  - Concepto de DOM, CSSOM y Virtual DOM de React.
  - CSS básico con selectores de clase (`.clase`) vs ID (`#id`), y uso de medidas relativas (`em`) en lugar de medidas fijas (`px`).
  - Creación de proyecto con Vite (`npm create vite@latest` $\rightarrow$ React + JavaScript + ESLint).
  - Estructura: `index.html` (solo se toca `<title>`), `main.jsx`, `App.jsx`, `public/` (solo logo), `src/assets/` (imágenes fijas), `src/views/` (vistas sin lógica) y `src/components/` (componentes chicos con una sola responsabilidad).
  - Archivos `.jsx`, uso de Fragments (`<> ... </>`) y `export default NombreComponente`.
- **Clase 9 (Estado, Props, Eventos y Formularios Controlados)**:
  - Flujo de datos unidireccional: datos bajan de Padre a Hijo por `props` (desestructuradas en los parámetros); eventos suben de Hijo a Padre ejecutando funciones pasadas por `props`.
  - Hook `useState()` para guardar estado local dentro de componentes funcionales.
  - Formularios controlados: `<form onSubmit={(e) => e.preventDefault()}>`, `<input type="text" name="atributo" onChange={handleChange} />` donde `name` coincide con el atributo de la entidad en el backend, y `handleChange = (e) => setValor(e.target.value)`.
  - Validación básica con `.trim() === ''` (prohibido usar `alert()`).
  - Eliminación en listas desde el componente Padre clonando el estado con `[...lista]` y usando `.splice(indice, 1)`.
- **Clase 10 (SPA, Ruteo, `useEffect`, Promesas con `fetch` y JWT)**:
  - SPA y ruteo con `react-router-dom`: `<BrowserRouter>` en `main.jsx`, `<Routes>` y `<Route path='...' element={<Vista />} />` en `App.jsx`.
  - Navbar semántica en `Navigation.jsx` usando `<nav>` $\rightarrow$ `<ul>` $\rightarrow$ `<li>` $\rightarrow$ `<Link to='...'>`.
  - Hooks de ruteo: `useNavigate()` (redirección en respuesta a un evento) y `useLocation()` (`location.pathname`).
  - Ciclo de vida del componente (Montaje, Actualización, Desmontaje) con `useEffect(() => { ... }, [dependencias])`.
  - Promesas asíncronas (estados *Pending*, *Fulfilled*, *Rejected*) consumidas exclusivamente con `fetch(URL, options).then((res) => res.json()).then((data) => { ... }).catch((error) => { ... })`.
  - Token JWT guardado/leído con `localStorage.setItem('jwtToken', data.token)` y `localStorage.getItem('jwtToken')`, enviado en `headers` como `Authorization: \`Bearer \${token}\``.

---

## 1. Tabla Estricta: PERMITIDO vs. PROHIBIDO

Antes de escribir código, verifica esta tabla. **Solo puedes usar lo que figura en la columna PERMITIDO**:

| Categoría | ✅ PERMITIDO (Visto en Clases 7, 8, 9 y 10) | ❌ PROHIBIDO (NO visto en clase — Delata uso de IA) |
| :--- | :--- | :--- |
| **Lenguaje y Proyecto** | Vite + React con **JavaScript (`.jsx`)** + ESLint. | TypeScript (`.tsx`), PropTypes, Next.js. |
| **Hooks de React** | **Únicamente `useState` y `useEffect`**. | `useContext`, `useReducer`, `useRef`, `useMemo`, `useCallback`, `useId`, o **Custom Hooks** (`useFetch`, `useAuth`, etc.). |
| **Manejo de Estado** | Estado local en componentes padres (`useState`) pasado hacia abajo por `props`, y `localStorage` (`setItem` / `getItem`) para el token JWT. | Context API (`createContext` / `AuthProvider` / `CartContext`), Redux, Zustand, eventos globales (`window.dispatchEvent`). |
| **Ruteo (`react-router-dom`)** | `<BrowserRouter>`, `<Routes>`, `<Route path='...' element={<.../>} />`, `<Link to='...'>`, `useNavigate()`, `useLocation()`. | `createBrowserRouter`, `RouterProvider`, `<NavLink>`, `<Outlet>`, `<Navigate>`, `useParams`, `useSearchParams`, loaders. |
| **Peticiones HTTP / Asincronía** | `fetch(URL, options)` con promesas encadenadas **`.then((res) => res.json()).then((data) => ...).catch((error) => ...)`**. | **`async` / `await` con `try` / `catch`**, `axios`, React Query, SWR, `AbortController`, o carpetas `services/` / `api/` separadas. |
| **Métodos JS** | `.map()`, `.splice(indice, 1)`, `.trim()`, `.toUpperCase()`, `.toLowerCase()`, Spread/Rest (`...`), Destructuring, `JSON.stringify()`. | `.reduce()`, `Object.entries()`, `Object.fromEntries()`, `FormData`, `structuredClone`, expresiones regulares (Regex) complejas. |
| **Formularios y Errores UI** | `<form onSubmit={(e) => e.preventDefault()}>`, inputs con `useState('')` + `onChange={handleChange}`, error guardado en un `useState('')` y mostrado en un `<p>`. | **`alert()`, `confirm()`, `prompt()`**, Toasts flotantes con timers, modales complejos, React Hook Form, Formik. |
| **Estilos y UI** | CSS puro (`.css`) con selectores de clase (`.clase`) y medidas relativas **`em`**. | Tailwind, Bootstrap, Material UI, Styled Components, CSS Modules (`.module.css`), librerías de íconos (Lucide/FontAwesome), SVGs gigantes inline. |

---

## 2. Cómo Resolver Situaciones Comunes SIN Hacer Nada "De Más"

Cuando programes el TP, **NO inventes soluciones avanzadas**. Resuelve cada caso exactamente así:

1. **¿Cómo compartir estado entre distintas vistas (ej. usuario logueado o carrito) si NO existe `useContext`?**
   - **Solución de cátedra**: Si varias vistas necesitan el mismo estado, el estado (`useState`) se declara en el padre común (`App.jsx`) y se pasa por `props` a las vistas dentro de `<Route path='/ruta' element={<MiVista datos={datos} setDatos={setDatos} />} />`. Para el token JWT, se guarda en `localStorage.setItem('jwtToken', data.token)` y se lee con `localStorage.getItem('jwtToken')`.
2. **¿Cómo mostrar errores o validaciones si está PROHIBIDO usar `alert()`?**
   - **Solución de cátedra**: Crea un estado simple `const [error, setError] = useState('')` en el componente del formulario. Si `campo.trim() === ''`, haz `setError('El campo no puede estar vacio')` y `return`. En el JSX, muestra simplemente `{error && <p>{error}</p>}`. No inventes componentes de Toast, popups ni animaciones.
3. **¿Dónde poner el `fetch()` para NO crear bucles infinitos ni llamadas de más?**
   - **Para `GET` (traer listado al abrir un componente)**: Va dentro de `useEffect(() => { fetch(...) }, [])` con el array de dependencias vacío `[]` para que se ejecute **una sola vez en el montaje**.
   - **Para `POST`, `PUT`, `PATCH`, `DELETE` (crear, editar, borrar al hacer click o enviar un form)**: Ejecuta el `fetch(URL, options).then(...).catch(...)` cuando ocurre la acción del usuario y, en el segundo `.then((data) => { ... })`, actualiza el estado local en memoria (ej. `setProducts([...products, data])`).
   - **PROHIBIDO crear un loop infinito**: Nunca pongas `setProducts([...products, data])` adentro de un `useEffect` que tenga `[products]` como dependencia, porque cada vez que se actualice `products` volverá a disparar el `useEffect` infinitamente en la pestaña Network.
4. **¿Qué NO debes agregar nunca por iniciativa propia?**
   - No agregues spinners de carga (`isLoading`), skeletons, paginación, buscadores extra, filtros adicionales, confirmaciones modales ni contadores que el usuario no haya pedido explícitamente. Haz **únicamente** lo solicitado.

---

## 3. Reglas de JavaScript (Clase 7)

1. **Variables (`let` y `const` obligatorios)**:
   - **PROHIBIDO usar `var`**.
   - Usa `const` por defecto para constantes, URLs, objetos `options` y funciones.
   - Usa `let` solo cuando la variable deba reasignarse.
2. **Funciones**:
   - Declara siempre las funciones manejadoras y callbacks como **Arrow Functions en una constante**:
     ```javascript
     const handleChange = (e) => setTodo(e.target.value);
     ```
3. **Condicionales y Strings**:
   - Usa siempre **igualdad estricta (`===` y `!==`)**.
   - Usa siempre **Template Strings (`` ` ``)** con `${...}` para concatenar textos o armar URLs/headers.
4. **Transformación Inmutable de Arrays y Objetos JSON**:
   - **Transformar o renderizar listas**: Usar `.map()` (devuelve una copia sin mutar el array original).
   - **Excluir propiedades de un objeto**: Usar destructuring + rest (`users.map(({ age, ...rest }) => rest)`).
   - **Agregar un elemento al estado**: Usar spread (`setTodos([...todos, nuevoElemento])`).
   - **Eliminar un elemento del estado**: Clonar primero con spread y usar `.splice(indice, 1)`:
     ```javascript
     const deleteTodo = (indice) => {
       const newTodos = [...todos];
       newTodos.splice(indice, 1);
       setTodos(newTodos);
     };
     ```

---

## 4. Modularidad Extrema, Vistas, Componentes y CSS (Clase 8)

> **REGLA CRÍTICA DE MODULARIDAD**: Las IAs suelen cometer el error de crear componentes gigantes ("monolitos") que mezclan vista, formulario, lógica de fetch y tarjetas HTML dentro de un mismo archivo. **Eso está TERMINANTEMENTE PROHIBIDO.**

1. **Descomposición Obligatoria en 3 Niveles (`Vista` $\rightarrow$ `Contenedor` $\rightarrow$ `Presentacional`)**:
   - **Nivel 1 — Vistas (`src/views/`)**:
     - Representan una pantalla completa asociada a una ruta (ej. `Home.jsx`, `Contact.jsx`).
     - **PROHIBIDO poner lógica, estados (`useState`), efectos (`useEffect`), `fetch()` o formularios directamente dentro de una Vista.**
     - Una vista debe tener muy pocas líneas (~10 a 15 líneas) y limitarse a renderizar él o los componentes principales de esa pantalla (ej. `<Form />` o `<PostList />`).
   - **Nivel 2 — Componentes Contenedores / de Lógica (`src/components/`, ej. `PostList.jsx`, `Form.jsx`)**:
     - Tienen **una sola responsabilidad funcional** (por ejemplo, gestionar la lista de publicaciones o controlar el formulario de tareas).
     - Contienen el `useState`, el `useEffect` (con `fetch`) o los handlers (`handleChange`, `handleClick`, `deleteTodo`).
     - **REGLA DEL `.map()`**: Cuando un componente contenedor recorre una lista con `.map()`, **ESTÁ PROHIBIDO escribir todo el bloque de etiquetas HTML (`<h3>`, `<p>`, `<button>`, etc.) directamente adentro del `.map()`**. El `.map()` DEBE renderizar un componente hijo dedicado (Nivel 3) pasándole los datos por `props`:
       ```jsx
       // ✅ CORRECTO (Modular, como hace la profesora):
       {posts.map((post) => (
         <PostCard id={post.id} title={post.title} body={post.body} key={post.id} />
       ))}

       // ❌ PROHIBIDO (No modular, típico de IA):
       {posts.map((post) => (
         <div key={post.id}>
           <h4>{post.id}</h4>
           <h3>{post.title}</h3>
           <p>{post.body}</p>
         </div>
       ))}
       ```
   - **Nivel 3 — Componentes Hijos Presentacionales (`src/components/`, ej. `PostCard.jsx`, `Todo.jsx`, `Card.jsx`)**:
     - Son la unidad mínima visual (una tarjeta, un ítem de lista, una barra de navegación).
     - **NO tienen estado (`useState`) ni efectos (`useEffect`)**.
     - Solo reciben `props` desestructuradas por parámetro y retornan el JSX específico de ese ítem (~10 a 25 líneas).

2. **Reglas de Tamaño y Un Componente por Archivo**:
   - **Un único componente por archivo `.jsx`**: Está prohibido declarar dos o más componentes dentro del mismo archivo `.jsx`. Cada componente pequeño debe tener su propio archivo en `src/components/` con nombre en **PascalCase/camelCase** y su propio `export default NombreComponente`.
   - **Pocas líneas de código**: Si un componente empieza a crecer (más de ~50-60 líneas) o hace más de una cosa (ej. muestra un catálogo Y además tiene un formulario de creación Y además muestra un detalle), **divídelo inmediatamente en componentes más chicos**.

3. **Estructura de Carpetas en Vite**:
   - **`index.html`**: **SOLO se puede modificar el `<title>`** en el `<head>`.
   - **`public/`**: Solo contiene el logo.
   - **`src/assets/`**: Imágenes estáticas que nunca cambian (ej. banners).
   - **`src/views/`**: Solo vistas (pantallas sin lógica).
   - **`src/components/`**: Todos los componentes modulares (contenedores y presentacionales).

4. **Estructura de cada archivo `.jsx`**:
   - Función del componente arriba $\rightarrow$ `return (...)` con JSX (usando `<> ... </>` si devuelve elementos hermanos sin requerir un `div`) $\rightarrow$ `export default NombreComponente` al final.

5. **Reglas de CSS**:
   - **Usar medidas relativas `em`** en lugar de `px` para tamaños (`width`, `height`, márgenes, paddings), ya que `px` no se adapta a distintas pantallas (`1px` solo se permite en bordes como `border: 1px solid black`).
   - Usar selectores de **clase (`.clase`)** para estilos reutilizables.

---

## 5. Plantillas Exactas de Código de la Profesora (Clases 9 y 10)

Imita exactamente este estilo de código limpio y directo enseñado en clase:

### A. Configuración de `main.jsx` y `App.jsx` con `react-router-dom`
```jsx
// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StrictMode>
      <App />
    </StrictMode>
  </BrowserRouter>
)
```

```jsx
// App.jsx
import './App.css'
import Home from './views/Home'
import Contact from './views/Contact'
import Navigation from './components/Navigation'
import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path='/home' element={<Home />} />
        <Route path='/contact' element={<Contact />} />
      </Routes>
    </>
  )
}

export default App
```

### B. Barra de Navegación (`Navigation.jsx`) y Redirección (`useNavigate`)
```jsx
// src/components/Navigation.jsx
import React from 'react'
import { Link } from 'react-router-dom'

function Navigation() {
  return (
    <nav>
      <ul>
        <li>
          <Link to='/home'>Inicio</Link>
        </li>
        <li>
          <Link to='/contact'>Contacto</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation
```
- Cuando se necesite redirigir desde un botón o evento, usar `useNavigate()`:
  ```javascript
  const navigate = useNavigate()
  const handleClick = () => {
    navigate('/contact')
  }
  ```

### C. Patrón Padre (Contenedor con `fetch` GET) e Hijo (Tarjeta Presentacional)
```jsx
// src/components/PostCard.jsx (Hijo sin estado: solo recibe props desestructuradas)
import React from 'react'

function PostCard({ id, title, body }) {
  return (
    <div>
      <h4>{id}</h4>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  )
}

export default PostCard
```

```jsx
// src/components/PostList.jsx (Padre con estado, useEffect y .map)
import React, { useState, useEffect } from 'react'
import PostCard from './PostCard'

function PostList() {
  const [posts, setPosts] = useState([])
  const URL = 'http://localhost:8080'

  useEffect(() => {
    fetch(`${URL}/posts`)
      .then((response) => response.json())
      .then((data) => {
        setPosts(data)
      })
      .catch((error) => {
        console.error('Error al mostrar las publicaciones: ', error)
      })
  }, [])

  return (
    <div>
      <h1>Publicaciones</h1>
      {
        posts.map((post) => (
          <PostCard
            id={post.id}
            title={post.title}
            body={post.body}
            key={post.id}
          />
        ))
      }
    </div>
  )
}

export default PostList
```

### D. Formulario Controlado y Petición `POST` con JWT y Actualización Local
- **Recuerda**: El atributo `name` de cada `<input>` debe llamarse igual que la propiedad del objeto y que el atributo de la entidad en la base de datos.
```jsx
const [name, setName] = useState('')
const [description, setDescription] = useState('')
const [products, setProducts] = useState([])
const [error, setError] = useState('')
const token = localStorage.getItem('jwtToken')
const URL = 'http://localhost:8080/products'

const handleClick = () => {
  if (name.trim() === '' || description.trim() === '') {
    setError('Los campos no pueden estar vacios')
    return
  }

  const datosAEnviar = {
    name: name,
    description: description
  }

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(datosAEnviar)
  }

  fetch(URL, options)
    .then((res) => res.json())
    .then((data) => {
      setProducts([...products, data])
      setError('')
    })
    .catch((err) => {
      console.error(err)
    })
}
```

---

## 6. Checklist Obligatorio antes de Entregar Código al Usuario

Antes de responder con código, verifica punto por punto:
- [ ] ¿Usé **solamente** `useState` y `useEffect` (y `useNavigate`/`useLocation` para rutas)?
- [ ] ¿Todas las peticiones usan `fetch().then().then().catch()` **sin** `async/await` ni `axios`?
- [ ] ¿Evité usar `alert()`, `var`, `==` y medidas fijas en `px` para contenedores?
- [ ] **¿Respeté la modularidad extrema en 3 niveles (`Vista` sin lógica $\rightarrow$ `Componente Contenedor/Lista/Form` $\rightarrow$ `Componente Hijo Tarjeta/Ítem`)?**
- [ ] **¿Hay un único componente por archivo `.jsx`, corto, con una sola responsabilidad, y cada `.map()` renderiza un componente hijo en vez de meter HTML suelto?**
- [ ] ¿Cada `.map()` en JSX tiene su prop `key` única?
- [ ] ¿Actualicé el estado local con `[...lista, nuevo]` o `.splice()` para no hacer llamadas `GET` repetidas al backend?
- [ ] ¿El código es 100% simple, sin sobre-ingeniería ni features no pedidas, para que el alumno pueda explicar cada línea en la defensa oral?
