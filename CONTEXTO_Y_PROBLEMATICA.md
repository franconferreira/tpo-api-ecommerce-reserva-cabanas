# Contexto, Arquitectura y Problemática del Proyecto — TPO (API - UADE)

> **PROPÓSITO DE ESTE DOCUMENTO**: Este archivo no es una lista de órdenes paso a paso, sino un **documento de contexto integral**. 
> Explica la situación del proyecto, el marco académico de la universidad, cómo se llegó al estado actual del código, los dilemas arquitectónicos que existen y los problemas concretos que se necesitan resolver, para que puedas **analizar, razonar y diseñar la mejor solución técnica** respetando todas las restricciones.

---

## 1. El Marco Académico y Criterios de Evaluación

Estamos trabajando en el Trabajo Práctico Obligatorio (TPO) de la materia **Aplicaciones Interactivas (API)** de la **Universidad Argentina de la Empresa (UADE)**.

### ¿Cómo evalúa la profesora?
1. **Inspección en vivo con DevTools del navegador**:
   - **Pestaña Network**: Verifica que no haya llamadas duplicadas a la API, llamadas en bucle infinito ni peticiones innecesarias. La regla de oro que repitió en clase es: *"El backend gestiona recursos; una vez que traes los datos al frontend, trabaja sobre el estado local en memoria, no le pidas datos al backend al pedo ante cada acción"*.
   - **Pestaña Console**: Cero errores y cero warnings de React (por ejemplo, todo `.map()` en JSX debe tener su prop `key` única).
   - **Pestaña Elements**: Estructura DOM limpia, sin anidamientos absurdos de `<div>` sin sentido ("div soup").
2. **Defensa oral línea por línea**:
   - La profesora elige componentes al azar y pregunta: *"¿Por qué hiciste esto así?", "¿Dónde vive este estado?", "¿Por qué esta función está en este componente y no en su hijo?"*.
   - Por esto, **el código debe ser 100% simple, justificable y explicable**. Cualquier sobre-ingeniería innecesaria, hook rebuscado o abstracción mágica delata uso descuidado de IA y perjudica la nota.

### Las Restricciones Técnicas Inviolables de la Cátedra
El temario de frontend abarcó únicamente las **Clases 7, 8, 9 y 10**:
- **Tecnologías base**: Vite + React con **JavaScript plano (`.jsx`)** y CSS puro (`.css`). No se vio TypeScript ni frameworks de UI como Tailwind, Bootstrap o Material UI.
- **Hooks permitidos**: **Exclusivamente `useState` y `useEffect`** (junto con `useNavigate` y `useLocation` de `react-router-dom`).
  - *No se vio ni se permite*: `useContext`, `useReducer`, `useRef`, `useMemo`, `useCallback`, `useId`, ni Custom Hooks (`useFetch`, etc.).
- **Asincronía y API**: Exclusivamente promesas nativas encadenadas con **`fetch(URL, options).then((res) => res.json()).then((data) => ...).catch((err) => ...)`**.
  - *No se vio ni se permite*: `async / await` con `try / catch`, ni librerías como `axios` o React Query.
- **Manejo de estado**: Estado local en componentes contenedores (`useState`) descendiendo por `props` (*Lifting State Up*). 
- **Persistencia en el navegador (`localStorage`)**: Se utiliza para el `jwtToken` y para guardar preferencias locales de usuario (como notificaciones descartadas). No se usa para simular bases de datos.
- **JavaScript estándar**: Se utilizan con total naturalidad todos los métodos nativos del lenguaje (`.trim()`, `.map()`, `.splice()`, `.includes()`, `Number()`, `parseFloat()`, `.split()`, `.toUpperCase()`, `.toLowerCase()`, Spread `...`, Destructuring, `JSON.stringify()`, `JSON.parse()`). No existen prohibiciones absurdas sobre funciones básicas de JS.
- **Estilos**: Archivos `.css` con selectores de clase y medidas relativas en **`em`** (las medidas fijas en `px` están restringidas a bordes finos como `border: 1px solid ...`).

---

## 2. Historia del Repositorio: Cómo se llegó al código actual

Para entender por qué el código está como está, es fundamental conocer su historia:

1. **El TP Original**: El alumno desarrolló la base funcional del proyecto (un sistema de e-commerce y reserva de cabanas/espacios para un complejo turístico llamado *Whispering Pines*).
2. **La primera intervención con IA (Claude)**:
   - Un compañero ayudó a refactorizar el código con un prompt anterior de Claude.
   - **El error de esa intervención**: Ese prompt tomó de forma demasiado literal y dogmática los "ejemplos de pizarrón de 5 minutos" de la profesora. Por ejemplo:
     - Como la profesora hizo un ejemplo introductorio donde una vista `Home` solo llamaba a `Form`, la IA interpretó que *todas las vistas debían medir 10 líneas y llamar a un único componente*.
     - Prohibió métodos nativos como `.includes()` o `.split()` creyendo falsamente que eran "ilegales", obligando a hacer malabares innecesarios.
     - Forzó un límite numérico ciego de "menos de 60 líneas por componente", lo que provocó una hiper-fragmentación con cadenas de hasta 5 niveles de profundidad (ej. `AdminEspaciosView` $\rightarrow$ `AdminEspacios` $\rightarrow$ `AdminEspaciosTabla` $\rightarrow$ `AdminEspacioRow` $\rightarrow$ `AdminPrecioForm`).
3. **Nuevas funcionalidades agregadas por el alumno**:
   - Posteriormente, el alumno agregó por su cuenta mejoras importantes (documentadas en `CAMBIOS_IMPLEMENTADOS.md`): validación de fechas pasadas, bilingüismo `ES | EN`, buzón de cancelaciones para clientes, etc.
4. **La situación actual**:
   - La aplicación funciona, pero arrastra una deuda técnica en la arquitectura de componentes y vistas, sumado a 4 problemas concretos de usabilidad y UI que necesitan solución.

---

## 3. El Problema de la Modularidad: Vistas vs. Componentes

El punto central que requiere análisis y criterio arquitectónico es la relación entre **Vistas (`src/views/`)** y **Componentes (`src/components/`)**.

### El Antipatrón Actual: La "Vista Pasamanos Vacía"
Actualmente existen vistas como `DetalleEspacioView.jsx` que tienen literalmente este código:
```jsx
function DetalleEspacioView({ idioma, espacio, isLogged, setCarritoData, onAbrirCarrito }) {
  return (
    <>
      <DetalleEspacio
        idioma={idioma}
        espacio={espacio}
        isLogged={isLogged}
        setCarritoData={setCarritoData}
        onAbrirCarrito={onAbrirCarrito}
      />
    </>
  )
}
```
**¿Por qué esto es una mala práctica?**
- La vista no aporta absolutamente nada: es un simple pasamanos de 5 props (*prop drilling* redundante).
- Obliga a que el componente hijo (`DetalleEspacio.jsx`) tenga que asumir toda la responsabilidad visual de la pantalla (layout, columnas, imágenes, calendario, widget de reserva).
- Lo mismo ocurre en `LoginView` y `RegisterView`: la vista solo llama a `LoginForm`, obligando a que `LoginForm` tenga adentro la foto del complejo, el banner y el formulario todo apretado en el mismo archivo.

### Lo que la Profesora Realmente Quiso Decir
Cuando la profesora enseñó en la Clase 8 que *"las vistas casi no tienen funcionalidad y todo debe estar en componentes"*, no se refería a crear envoltorios vacíos e inútiles.

En una arquitectura de software limpia y defendible:
1. **La Vista (`src/views/`) es la Maqueta / Layout de Pantalla**:
   - Representa la pantalla entera vinculada a una ruta (`/login`, `/catalogo`, `/detalle`).
   - Su responsabilidad es **estructurar la disposición visual** (por ejemplo, definir una pantalla dividida en dos columnas, o una cabecera con botón de retorno y dos paneles principales).
   - **Orquesta a los componentes hermanos** que conforman esa pantalla.
   - *Lo que NO debe tener*: Lógica de negocio pesada, llamadas `fetch()` directas ni cálculos complejos.
2. **El Componente Contenedor (`src/components/`, Nivel 2)**:
   - Tiene responsabilidad única sobre un recurso o bloque funcional (la lista del catálogo, el formulario de login, el panel de administración).
   - Maneja su estado (`useState`), sus efectos (`useEffect`) y su comunicación con la API.
3. **El Componente Presentacional (`src/components/`, Nivel 3)**:
   - Unidad mínima visual (una tarjeta, una fila `<tr>`, un ítem de lista).
   - No tiene estados ni efectos; solo recibe props desestructuradas y renderiza JSX.

### El Problema de las Cadenas de 5 Niveles
En los paneles de administración (`AdminEspacios`, `AdminReservas`, `AdminUsuarios`) se crearon componentes intermedios redundantes como `AdminEspaciosTabla.jsx`. Este componente no tiene estado, no hace fetch y no agrega valor: solo recibe la lista y mapea hacia `AdminEspacioRow.jsx`.
- Esto genera una cadena de 5 niveles: `Vista` $\rightarrow$ `Contenedor` $\rightarrow$ `Tabla` $\rightarrow$ `Fila` $\rightarrow$ `FormularioInline`.
- Lo natural y defendible es aplanarlo a **3 niveles limpios**: el componente contenedor tiene la etiqueta `<table>` y ejecuta directamente el `.map()` hacia la fila `<tr>`.

---

## 4. Los 4 Problemas Específicos que Requieren Solución

Además de ordenar la modularidad de las vistas y componentes, existen 4 problemas puntuales que el alumno identificó y necesita resolver:

---

### Problema 1: Galería de Mínimo 6 Fotos por Alojamiento en la Pantalla de Detalle
* **Situación actual**:
  - En el backend (`DataInitializer.java`), cada uno de los 8 espacios solo tiene cargada **una sola foto** (`.imagenes(List.of(imgE1))`).
  - En el frontend, la pantalla de detalle muestra únicamente una imagen fija grande.
* **Qué se necesita**:
  - Cada espacio debe contar con **al menos 6 imágenes de alta calidad** (URLs reales de Unsplash) que representen distintos ambientes del alojamiento (fachada exterior, living/sala, dormitorio principal, baño, terraza/deck, entorno natural o comodidades).
  - En la pantalla de detalle, el usuario debe poder interactuar con una **galería de fotos**: visualizar una imagen principal destacada y tener una tira/grilla de miniaturas donde al hacer click en cualquier miniatura, esta pase a ser la imagen principal visible.

---

### Problema 2: Persistencia de Notificaciones de Cancelación Descartadas
* **Situación actual**:
  - Cuando un administrador cancela una reserva desde su panel, el sistema genera una notificación para el cliente con el motivo de cancelación.
  - El cliente puede abrir su buzón de notificaciones y pulsar *"Marcar como leído"* o descartar la notificación.
  - **El bug**: Al cerrar la pestaña o recargar el proyecto, **la notificación descartada vuelve a aparecer**.
* **Causa técnica**:
  - Debido a la regla dogmática anterior de *"no usar localStorage para nada que no sea el token"*, los IDs de notificaciones leídas (`leidasIds`) se guardaron únicamente en un estado en memoria (`useState([])`) en `App.jsx`.
  - Como el backend sigue teniendo la reserva en estado `CANCELADA` con su mensaje, al recargar la página la memoria RAM se reinicia en `[]` y la notificación vuelve a mostrarse como no leída.
* **Qué se necesita**:
  - Que la acción del usuario de descartar/leer una notificación sea **persistente**. Al cerrar el navegador y volver a entrar, las notificaciones ya descartadas no deben volver a mostrarse.

---

### Problema 3: Saltos de Componentes al Cambiar de Pantalla (Layout Shift)
* **Situación actual**:
  - Al navegar entre distintas pantallas (por ejemplo, de Login a Catálogo, o de Catálogo a Detalle), durante una fracción de segundo todos los componentes "saltan" o se mueven de lugar.
* **Causas técnicas detectadas**:
  1. **La barra de desplazamiento vertical de Windows**: Pantallas cortas (como Login) no tienen barra de scroll; pantallas largas (como Catálogo) sí la tienen. La barra de scroll de Windows ocupa entre 15 y 17 píxeles de ancho. Al entrar o salir, el navegador agrega o quita la barra, empujando todo el contenido horizontalmente de golpe.
  2. **Colapso de altura durante la carga**: Mientras la petición `fetch` está en vuelo (estado *pending*), los contenedores de datos pueden medir temporalmente 0 píxeles de alto, haciendo que el footer o los elementos inferiores suban hasta arriba de la pantalla y luego bajen bruscamente cuando los datos se renderizan.
* **Qué se necesita**:
  - Una navegación suave y estable, donde el layout no sufra desplazamientos horizontales ni colapsos verticales al cambiar de ruta.

---

### Problema 4: Saltos de Componentes al Cambiar de Idioma (`ES | EN`)
* **Situación actual**:
  - La aplicación cuenta con un botón en la barra superior para alternar entre Español e Inglés.
  - Al hacer click en `ES | EN`, los botones, enlaces del menú de navegación y columnas de tablas se reacomodan bruscamente, haciendo que la interfaz "vibre" o se desplace.
* **Causas técnicas detectadas**:
  - Diferencia de longitud de texto: por ejemplo, *"Volver al Catálogo"* (19 caracteres) vs *"Back to Catalog"* (15 caracteres), o *"Iniciar Sesión"* (14 caracteres) vs *"Sign In"* (7 caracteres).
  - Al no tener anchos mínimos (`min-width`) o estructuras flexbox estables, los elementos reducen o expanden su caja dinámicamente según el texto del momento, empujando a los elementos contiguos.
  - En las tablas de administración, si el `<table>` no tiene un layout fijo, el navegador recalcula el ancho de cada columna según el largo de las palabras del encabezado en cada idioma.
* **Qué se necesita**:
  - Que alternar el idioma sea una experiencia visualmente limpia: el texto cambia, pero la estructura, las posiciones de los botones, los menús y las columnas de las tablas permanecen completamente firmes en su lugar.

---

## 5. El Objetivo Esperado

El resultado deseado es un proyecto donde:
1. **La arquitectura sea intuitiva y lógica**: Las Vistas actúan como maquetas de pantalla que orquestan componentes; los Contenedores manejan los datos y la API; los Presentacionales son componentes puros y simples.
2. **Las cadenas redundantes desaparezcan**: Máximo 3 niveles de profundidad, sin archivos intermedios innecesarios.
3. **Las 4 problemáticas estén resueltas**: Galería de fotos rica e interactiva, notificaciones persistentes, navegación fluida sin saltos de scroll y cambio de idioma estable sin movimiento de componentes.
4. **Cumplimiento estricto de UADE**: 0 errores de ESLint, build limpio, promesas nativas con `fetch().then().catch()`, CSS relativo en `em`, solo `useState`/`useEffect`, y un código transparente que el alumno pueda defender con orgullo y solvencia técnica ante la profesora.
