# CLAUDE.md — Guía de trabajo del proyecto

Guía para implementar, analizar y revisar código en este repositorio. Se basa en los fundamentos de las clases 8, 9 y 10 (DOM, React, hooks, routing y fetch), aplicados con criterio profesional: **los principios se respetan; los ejemplos de clase son demostraciones, no plantillas obligatorias.**

---

## 1. Contexto del proyecto

- **Monorepo** con dos aplicaciones:
  - `Complejo_Backend/`: API REST en Spring Boot + MySQL, autenticación JWT, expuesta en `http://localhost:8080`.
  - `Complejo_Frontend/`: SPA en **Vite + React con JavaScript (`.jsx`)**, `react-router-dom` y **ESLint**.
- Dominio: complejo turístico (catálogo de espacios, detalle con disponibilidad, carrito, checkout, reservas del cliente, buzón de cancelaciones y paneles de administración). Interfaz bilingüe ES/EN.
- Es un trabajo práctico universitario que el equipo defiende oralmente: **cada decisión tiene que poder explicarse**. Ante dos soluciones correctas, preferí la más simple de explicar.
- Comandos del frontend (desde `Complejo_Frontend/`): `npm run dev`, `npm run lint`, `npm run build`.

---

## 2. Cómo trabajar antes de cambiar código

1. **Entender el problema real** y qué se pidió. No ampliar el alcance por iniciativa propia.
2. **Leer el código existente** de la zona afectada y seguir sus convenciones (nombres, estructura, estilo de componentes, idioma de los textos).
3. **Elegir la solución más simple que resuelva el problema.** Una abstracción nueva (componente, helper, módulo) se justifica cuando elimina duplicación real o separa responsabilidades distintas, no "por si acaso".
4. **No refactorizar lo que no se pidió.** Si se detecta un problema ajeno a la tarea, se informa; no se corrige de paso.
5. **No reestructurar una arquitectura que funciona** solo para que se parezca a un ejemplo de clase.
6. **Preguntar** cuando una decisión importante depende de un requisito ambiguo (cambios de contrato con el backend, cambios visibles en la UI, nuevas dependencias).
7. **Verificar** al terminar: `npm run lint` sin errores ni warnings, `npm run build` exitoso y, si el cambio es visible, probarlo en el navegador (Console sin errores, Network sin peticiones de más).

---

## 3. Principios fundamentales

Se respetan siempre salvo una justificación técnica explícita, porque protegen la corrección del programa.

### 3.1 Flujo de datos unidireccional
- **Los datos bajan por props; los eventos suben por funciones** que el padre le pasa al hijo.
- **El estado vive en el componente que lo necesita.** Si varios componentes lo comparten, sube al **ancestro común más cercano** (no más arriba). Solo ese componente lo modifica; los hijos piden cambios llamando a sus callbacks.
- Al pasar un handler con argumentos: `onClick={() => onEliminar(id)}`, nunca `onClick={onEliminar(id)}` (se ejecutaría al renderizar).

### 3.2 El estado es inmutable
- Nunca mutar el estado ni los objetos/arrays que contiene. Siempre se crea un valor nuevo y se pasa al `set`.
- Técnicas válidas: spread (`[...lista, nuevo]`, `{ ...obj, campo }`), `.map()` para editar un elemento, `.filter()` o copia + `.splice()` para quitar uno. Se elige la más clara para el caso.

### 3.3 Listas con `key` estable
- Todo `.map()` que renderiza elementos lleva `key`.
- Usar un **id único** (el de la base de datos). El índice como `key` solo es aceptable en listas estáticas que nunca se reordenan, filtran ni eliminan elementos.

### 3.4 Efectos (`useEffect`) usados para lo que son
- `useEffect` sirve para **sincronizar el componente con algo externo**: traer datos al montar, actualizar `document.title`, suscripciones, timers.
- **Array de dependencias correcto**: todo valor del componente que se use dentro del efecto va en el array (la regla `react-hooks/exhaustive-deps` de ESLint lo verifica). `[]` significa "solo al montar" y únicamente es correcto si el efecto no depende de props ni estado.
- Si el efecto crea algo que persiste (listener, intervalo, suscripción), **devuelve una función de limpieza**.
- **Nunca** hacer `setX(...)` dentro de un efecto que depende de `x` sin una condición de corte: genera un bucle infinito de renders y de peticiones.
- En desarrollo, `StrictMode` monta los componentes dos veces y los GET aparecen duplicados en Network. Es esperado; no se "arregla" quitando `StrictMode`.

### 3.5 Peticiones al backend
- **GET de carga inicial** → en un `useEffect` al montar (o cuando cambia el recurso del que depende, por ejemplo un id).
- **POST, PUT, PATCH, DELETE** → dentro del **handler del evento** que las dispara (submit, click), nunca en un efecto.
- **Después de una mutación exitosa, actualizar el estado local** con la respuesta del backend en lugar de volver a pedir toda la lista. Así se evitan peticiones innecesarias.
- **Manejar siempre el error** (`.catch()`) y dar feedback al usuario cuando corresponda; un `console.error` solo no alcanza para acciones del usuario.
- **`fetch` no rechaza la promesa ante respuestas 4xx/5xx.** Antes de tratar la respuesta como éxito hay que verificarlo (con `res.ok` o validando que los datos tengan la forma esperada). Una respuesta de error nunca debe terminar guardada en el estado como si fuera un dato válido.
- Requests con cuerpo: `headers` con `'Content-Type': 'application/json'` y `body: JSON.stringify(datos)`. Los nombres de las propiedades enviadas coinciden con el DTO del backend.
- Requests autenticadas: header `Authorization: \`Bearer ${token}\``.

### 3.6 Feedback al usuario sin `alert()`
- No usar `alert`, `confirm` ni `prompt`: bloquean la interfaz, no se pueden estilizar y rompen la experiencia.
- Patrón: estado `const [error, setError] = useState('')`, validación (por ejemplo `campo.trim() === ''`) y render condicional `{error && <p className="...">{error}</p>}`. Limpiar el error cuando la acción sale bien.

### 3.7 React maneja el DOM
- No manipular el DOM directamente (`getElementById`, `createElement`, `appendChild`, `addEventListener`) dentro de la app: React lo actualiza a partir del estado. Lo que cambia en pantalla tiene que salir del estado.
- Excepción razonable: efectos sobre partes del documento que React no controla (por ejemplo `document.title` dentro de un `useEffect`).

### 3.8 Fuente de verdad en el backend
- Los datos de negocio (espacios, reservas, carrito, usuarios) viven en el backend. El frontend tiene copias en estado.
- `localStorage` se usa solo para el **token JWT** (`jwtToken`) y para **preferencias locales del usuario** que no son datos de negocio (por ejemplo, notificaciones ya leídas). No se usa como base de datos.
- No duplicar en el frontend cálculos de negocio que hace el backend (precios, descuentos, totales del carrito): mostrar lo que devuelve la API.

---

## 4. Buenas prácticas recomendadas

Se siguen por defecto; se pueden adaptar con una razón concreta.

### 4.1 Vistas y componentes
- **Vista (`src/views/`)**: una por ruta. Compone y ubica los bloques de la pantalla (layout, encabezado, columnas). No hace `fetch` ni contiene lógica de negocio; sí puede tener lógica mínima de presentación (render condicional, navegar ante un click).
- **Componente con lógica**: dueño de un recurso o bloque funcional (estado, efecto de carga, handlers de mutación). Hace el `.map()` de su colección.
- **Componente de presentación**: recibe props y devuelve JSX (tarjeta, fila, ítem). Sin estado propio salvo estado puramente visual.
- **Cuándo la vista llama directo a varios componentes**: cuando son independientes (cada uno maneja sus propios datos). **Cuándo hace falta un componente intermedio**: cuando varios bloques comparten y modifican el mismo estado (por ejemplo, un formulario de alta y la tabla que muestra lo creado).
- **El tamaño es consecuencia, no objetivo**: se divide un componente cuando tiene más de una razón para cambiar o cuando un bloque se reutiliza. No se divide solo por cantidad de líneas.
- **Evitar componentes pasamanos** que solo reciben props para pasarlas a otro componente sin aportar estructura ni lógica, y evitar cadenas de componentes más profundas de lo necesario.
- Un componente por archivo, nombre en **PascalCase** igual al del archivo, `export default` al final. Mantener la forma de declarar componentes y handlers que ya usa el proyecto.
- Un componente devuelve un solo elemento raíz; usar fragmentos `<>...</>` cuando no hace falta un contenedor real.

### 4.2 Formularios
- **Controlados**: cada input tiene `value` (del estado) y `onChange`. Sin `value`, el formulario no se puede resetear desde el estado.
- `<form onSubmit={...}>` con `e.preventDefault()`; preferir manejar el envío en `onSubmit` (también funciona con Enter) antes que en el `onClick` del botón.
- El atributo `name` de cada input coincide con la propiedad que se envía al backend: hace trazable el mapeo formulario → DTO.
- Validar en el frontend lo obvio (campos vacíos, rangos, fechas) para dar feedback rápido; el backend sigue siendo el que valida en serio.

### 4.3 Navegación (react-router-dom)
- `<BrowserRouter>` envuelve a la app en `main.jsx`; las rutas se declaran con `<Routes>` y `<Route path element>` en `App.jsx`.
- Las pantallas internas son rutas hijas de `MainLayout` (barra, `<Outlet />`, footer y paneles). Login y registro quedan fuera de ese layout, por eso no muestran barra ni footer.
- **`<Link>`** para navegación que el usuario elige (menús, enlaces). **`useNavigate()`** para redirigir desde código tras un evento (login exitoso, envío de un formulario).
- **`useLocation()`** para leer la ruta actual (por ejemplo, marcar el link activo u ocultar la barra en pantallas de autenticación).
- Barra de navegación semántica: `<nav>` → `<ul>` → `<li>` → `<Link>`.

### 4.4 Estilos
- CSS en archivos `.css`. Estilar con **clases** (reutilizables y de especificidad baja); reservar los **IDs** para identificar elementos únicos, no para estilar.
- **Medidas relativas** (`em`, `rem`, `%`, `vh`/`vw`) para tamaños, espaciados y tipografías; `px` es razonable en bordes finos y detalles que no deben escalar. Lo que hace a una interfaz adaptable es el layout (flex, grid), no solo la unidad.
- Si el texto de un elemento cambia de largo (por ejemplo, al cambiar de idioma), darle un ancho mínimo para que el layout no se mueva.

### 4.5 Estructura de carpetas
- `public/`: archivos estáticos servidos tal cual (favicon/logo).
- `src/assets/`: imágenes fijas que se importan desde el código.
- `src/views/`: vistas (una por ruta) y el CSS del layout de cada pantalla (`CatalogoView.css`, `AdminView.css`, …).
- `src/components/`: componentes agrupados por funcionalidad:
  - `layout/`: lo común a todas las pantallas internas (`MainLayout`, `Navigation`, `Footer`, `PageHeader`).
  - `ui/`: piezas reutilizables sin dominio (`CampoFormulario`).
  - `auth/`, `catalogo/`, `detalle/`, `carrito/`, `reservas/`, `admin/{espacios,reservas,usuarios}/`: componentes de cada funcionalidad.
- `src/utils/`: lógica que no es de interfaz y se reutiliza: `api.js` (URL base y armado de la petición con el token), `fechas.js` (funciones puras de fechas), `constantes.js`.
- `src/i18n/textos.js`: todos los textos de la interfaz en español e inglés. Un texto nuevo se agrega en los dos idiomas.
- Cada componente importa su propio CSS. Las piezas chicas que solo existen dentro de un componente (una fila, un ítem) pueden compartir el CSS de ese componente.
- `index.html`: solo metadatos del documento (título, favicon). React monta todo en `<div id="root">`; no se agrega marcado ni lógica ahí.

---

## 5. Decisiones contextuales

Dependen del tamaño y la necesidad real; se deciden caso por caso.

- **Dónde vive el estado compartido entre vistas** (sesión, carrito, idioma): en `App.jsx`, el ancestro común, bajando por props. Si el pasaje de props se vuelve inmanejable, plantearlo antes de introducir otra solución.
- **Constantes y helpers compartidos** (URL base de la API, cálculos de fechas, imagen por defecto): extraerlos a un módulo común cuando la misma lógica se repite en varios archivos. Con uno o dos usos, una constante local es suficiente.
- **Organización por carpetas de funcionalidad** (`admin/`, `carrito/`, etc.): conveniente si `components/` sigue creciendo; no reorganizar sin que se pida, porque mueve muchos archivos.
- **Recargar desde el backend en vez de actualizar el estado local**: aceptable cuando reconstruir el estado en el frontend obligaría a duplicar lógica de negocio del backend.
- **Nuevas dependencias** (librerías de estado, de peticiones, de UI o de formularios): no se agregan sin consultarlo. El proyecto usa `useState`, `useEffect`, `fetch` y `react-router-dom`, y el equipo tiene que poder explicar todo lo que se usa.

---

## 6. Ejemplos de referencia (no obligatorios)

Los ejemplos de clase muestran conceptos y se usan como referencia de estilo, no como estructura a copiar:

- **Todo List (`Form` + `Todo`)**: estado en el padre, `deleteTodo` pasado por props, validación con estado de error.
- **`PostList` + `PostCard`**: GET al montar, guardado en estado, `.map()` hacia un componente tarjeta con `key={post.id}`.
- **`Products` con POST y token**: armado de `options`, `JSON.stringify`, header `Authorization` y actualización del estado local con `[...products, data]`. Junta formulario, lista y marcado en un solo componente para simplificar la demostración; en el proyecto se separa cuando las responsabilidades crecen.
- **Ejemplos de DOM API (`createElement`, `addEventListener`)**: explican qué hace React por debajo; no se usan dentro de la app.
