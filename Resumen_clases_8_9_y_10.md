# Resumen Clases 8, 9 y 10 — JavaScript, DOM, React, Hooks, Routing, Fetch y Redux

> Transcripción en texto del documento original. Todo el código que estaba en capturas de pantalla está pasado a bloques de código, tomando las imágenes como referencia.
> Lenguaje del proyecto: **JavaScript** (archivos `.jsx`).

---

## Índice

- [Antes de React: JavaScript básico](#antes-de-react-javascript-básico)
- [Clase 8](#clase-8)
  - [DOM, CSSOM y Render Tree](#dom-cssom-y-render-tree)
  - [Ejemplo de DOM](#ejemplo-de-dom)
  - [DOM API y selectores CSS](#dom-api-y-selectores-css)
  - [Ejemplo con estilos: el cuadrado rojo](#ejemplo-con-estilos-el-cuadrado-rojo)
  - [Eventos: botón que agrega cuadrados](#eventos-botón-que-agrega-cuadrados)
  - [Eventos: borrar un cuadrado al hacerle click](#eventos-borrar-un-cuadrado-al-hacerle-click)
  - [Introducción a React](#introducción-a-react)
  - [Crear el proyecto con Vite](#crear-el-proyecto-con-vite)
  - [Estructura del proyecto](#estructura-del-proyecto)
  - [Cómo arranca una app de React (index.html → main → App)](#cómo-arranca-una-app-de-react-indexhtml--main--app)
  - [Primer componente: MyComponent](#primer-componente-mycomponent)
  - [Varios componentes en una vista: Card y CardList](#varios-componentes-en-una-vista-card-y-cardlist)
- [Clase 9](#clase-9)
  - [Componentes padres e hijos](#componentes-padres-e-hijos)
  - [Estados y Hooks: useState](#estados-y-hooks-usestate)
  - [Props](#props)
  - [Ejemplo: Todo List](#ejemplo-todo-list)
- [Clase 10](#clase-10)
  - [Single Page Application (SPA)](#single-page-application-spa)
  - [Enrutado (React Router)](#enrutado-react-router)
  - [Navbar con Link](#navbar-con-link)
  - [Routes y Route en App.jsx](#routes-y-route-en-appjsx)
  - [useNavigate](#usenavigate)
  - [useLocation](#uselocation)
  - [Ciclo de vida de los componentes y useEffect](#ciclo-de-vida-de-los-componentes-y-useeffect)
  - [Ejemplo de useEffect: contador en el título](#ejemplo-de-useeffect-contador-en-el-título)
  - [Asincronía y Promesas](#asincronía-y-promesas)
  - [fetch con .then() y .catch()](#fetch-con-then-y-catch)
  - [Ejemplo: PostCard y PostList con JSONPlaceholder](#ejemplo-postcard-y-postlist-con-jsonplaceholder)
  - [Ejemplo orientado al proyecto: POST con token](#ejemplo-orientado-al-proyecto-post-con-token)
- [Después: Redux Toolkit y axios](#después-redux-toolkit-y-axios)
- [Cómo evalúa la profe](#cómo-evalúa-la-profe)
- [Puntos importantes para el proyecto](#puntos-importantes-para-el-proyecto)

---

# Antes de React: JavaScript básico

> Tomado de las notas de la clase de JavaScript (con los ejemplos corregidos).

Para trabajar hay que tener instalado **Node.js** (con su variable de entorno) y **npm**.

- JavaScript **no es de tipado estricto** como Java, sino **dinámico**: no hay que decirle el tipo de una variable, lo toma del valor que se le guarda.
- Las **funciones también se guardan en variables** (por eso existen las funciones flecha dentro de un `const`).

## Tipos de datos

JavaScript tiene **8 tipos**: 7 **primitivos** y los **objetos**.

| Tipo | Ejemplo |
|---|---|
| String (texto) | `'UADE'` |
| Number (enteros y decimales: no hay "float" aparte) | `8`, `-7`, `0.12` |
| Boolean | `true`, `false` |
| Undefined (no tiene nada guardado) | `let cajon` |
| Null (vacío **a propósito**) | `let sinNada = null` |
| BigInt (enteros muy grandes) | `10n` |
| Symbol (identificadores únicos) | `Symbol('id')` |
| Object (incluye arrays, fechas, etc.) | `{ nombre: 'Ana' }`, `[1, 2]`, `new Date()` |

Los primeros cinco son los que más se usan. Un **dato primitivo** no se puede modificar "por dentro": solo se puede **reemplazar** por otro valor.

## `var`, `let` y `const`

Antes se usaba **`var`**, que permite declarar dos veces la misma variable y que la segunda **pise** a la primera sin avisar:

```js
var a = 5
var b = 10
var a = 10     // pisa al primer a sin error
var suma = a + b // 20, no 15
```

Hoy se usan **`let`** y **`const`**:

- **`let`** no deja declarar dos veces la misma variable (da error), pero sí **cambiarle el valor**:

  ```js
  let a = 5
  a = 10   // permitido
  ```

- **`const`** no deja **reasignar** la variable:

  ```js
  const a = 5
  a = 10   // error
  ```

  Ojo: si un `const` guarda un **objeto o un array**, su contenido sí se puede cambiar (`const lista = []; lista.push(1)` funciona). Lo que no se puede es apuntarlo a otra cosa. Por eso en React, para cambiar un estado, se hace una **copia** y se le pasa al `set`, en vez de modificar el original.

**Alcance por bloque:** una variable creada con `let` dentro de un bloque (`if`, `for`, `{ }`) solo existe ahí adentro, aunque afuera haya otra con el mismo nombre:

```js
let a
if (true) {
  let a = 10
  console.log(a) // 10
}
console.log(a)   // undefined (es la de afuera)
```

**Tipado dinámico en la práctica:** si a una variable que tenía un número le guardo un texto, pasa a ser texto:

```js
let a = 5
let b = 10
a = '10'
let suma = a + b // '1010' (con un texto, + concatena en vez de sumar)
```

## Funciones

Dos formas de escribirlas:

```js
function sumaTres(x) {
  return x + 3
}

const sumaTres = (x) => { return x + 3 } // función flecha
```

## Condicionales y `===`

```js
const viajar = (destino) => {
  if (destino === 'Brasil') {
    console.log('Gire a la derecha')
  } else if (destino === 'Espania') {
    console.log('Gire a la izquierda')
  } else {
    console.log('Nos perdimos')
  }
}
```

**`===`** compara el **valor y el tipo** (`7 === '7'` es falso). Además, los textos distinguen mayúsculas: `'Brasil' === 'BRASIL'` es falso.

## Arrays de objetos (formato JSON) y `map`

Para enviar y recibir información vamos a usar **JSON**: arrays de objetos.

```js
let users = [
  { firstName: 'Dante', lastName: 'Perez', age: 65 },
  { firstName: 'Alicia', lastName: 'Perez', age: 32 }
]
```

**`.map()`** recorre el array elemento por elemento y devuelve un **array nuevo** con lo que retorna la función, **sin tocar el original**:

```js
let usersConNombre = users.map((user) => {
  return {
    Nombre: user.firstName.toUpperCase(),
    Apellido: user.lastName.toLowerCase()
  }
})
console.table(usersConNombre) // como console.log, pero muestra una tabla
```

`Nombre` y `Apellido` son los nombres nuevos de las propiedades.

**Template strings** (con comillas invertidas): permiten meter valores dentro de un texto.

```js
const fullName = `${user.firstName} ${user.lastName}`
```

**Rest (`...`) para sacar un campo:** "de cada usuario, separá `age` y devolveme el resto":

```js
let usersSinEdad = users.map(({ age, ...rest }) => rest)
```

**Spread (`...`) para agregar un elemento:** "todo lo que había, más el nuevo":

```js
let nuevosUsers = [...users, newUser]
```

---

# Clase 8

## DOM, CSSOM y Render Tree

- **DOM** (Document Object Model): es un **objeto de JavaScript** que adentro tiene una representación estructurada del **código HTML** (los estilos no están en el DOM, sino en el CSSOM).
- El DOM es el responsable de mostrar por pantalla lo modelado.
- Tiene una serie de etiquetas que **se leen de arriba hacia abajo** y con eso se arma el objeto.
- **CSSOM**: otro objeto, que tiene todos los estilos.
- **RENDER TREE = DOM + CSSOM**

## Ejemplo de DOM

Un documento HTML tiene un `html` y, sí o sí, adentro un `head` y un `body`.

- Dentro del `head` tenemos un **título** y un **meta viewport**, que define la escala con la que se renderiza la página.
- En el `body` tenemos 2 elementos: un `h1` y un `h2`.

`dom.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Martes</title>
</head>
<body>
    <h1>Clase de DOM</h1>
    <h2>Vamos a aprender React</h2>
</body>
</html>
```

> ⚠️ **IMPORTANTE:** No vamos a tener persistencia en el frontend (los datos viven en el backend). La única excepción que mostró la profe es el **token**, que se guarda en `localStorage` para no perder la sesión al recargar.

## DOM API y selectores CSS

- **DOM API:** interfaces y métodos para que el código interactúe con el DOM.
- **Selector CSS:** métodos o propiedades que permiten seleccionar elementos específicos de una web, sin afectar a otros.

### Diferencia entre selector de ID (`#`) y de clase (`.`)

| Característica | `#spacer` (ID) | `.spacer` (Clase) |
|---|---|---|
| **Símbolo** | Se define con un numeral / almohadilla (`#`). | Se define con un punto (`.`). |
| **Uso en HTML** | Se vincula con el atributo `id="spacer"`. | Se vincula con el atributo `class="spacer"`. |
| **Frecuencia** | **Solo puede usarse una vez** por página. | **Se puede reutilizar** en múltiples elementos. |
| **Prioridad (especificidad)** | **Muy alta.** Le gana a las clases si hay conflicto. | **Media/Baja.** Pierde frente a los ID. |

## Ejemplo con estilos: el cuadrado rojo

En este otro documento HTML (`eventos.html`) la profesora agregó **2 clases** a los estilos:

```html
<style>
  .cuadrado {
    border: 1px solid black;
    width: 5em;
    height: 5em;
  }
  .rojo {
    background-color: red;
  }
</style>
```

- En `.cuadrado` el **borde** está definido en píxeles (`1px`), que es una **medida absoluta**: no se ajusta a distintas pantallas. Por eso para el ancho y el alto usamos **`em`**, una medida **relativa al tamaño de letra** del elemento (si cambia la letra, cambia la medida), que se adapta mejor a distintos dispositivos.
- En `.rojo` solo está definido que el color de fondo es rojo.

Después tenemos un `div` que aplica estos 2 estilos a la vez:

```html
<div class="cuadrado rojo"></div>
```

Archivo completo `eventos.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .cuadrado {
        border: 1px solid black;
        width: 5em;
        height: 5em;
      }
      .rojo {
        background-color: red;
      }
    </style>
  </head>
  <body>
    <h1>Clase de DOM</h1>
    <h2>Estamos viendo un ejemplo</h2>
    <div class="cuadrado rojo"></div>
  </body>
</html>
```

**Resultado en el navegador:** se ve el título "Clase de DOM", el subtítulo "Estamos viendo un ejemplo" y debajo un **cuadrado rojo con borde negro**.

## Eventos: botón que agrega cuadrados

Ahora queremos un **botón que cree más cuadrados**. Para esto usamos **eventos**.

### 1. Crear el botón en la pantalla

```html
<body>
  <h1>Clase de DOM</h1>
  <h2>Estamos viendo un ejemplo</h2>
  <button id="agregar">Agregar</button>
  <div class="cuadrado rojo"></div>
</body>
```

### 2. Seleccionar el botón desde el script

Creamos la constante `agregar`, que toma el elemento con id `"agregar"` (el botón):

```js
const agregar = document.getElementById("agregar")
```

### 3. Función que crea el nuevo div

```js
const cb = () => {
  const nuevoDiv = document.createElement("div")
  nuevoDiv.classList.add("cuadrado", "rojo")
  console.log(nuevoDiv);
}
```

- Crea un nuevo objeto llamado `nuevoDiv`, que es un elemento `div` creado en el documento.
- A ese objeto le asignamos las clases `cuadrado` y `rojo`.
- El `console.log` está solo para verificar que funciona.

### 4. Agregar los divs al documento

Lo anterior crea divs, **pero todavía no los pone en el documento**. Para agregarlos, primero obtenemos el `body` del documento:

```js
const body = document.getElementsByTagName("body")[0]
```

`getElementsByTagName("body")` busca los elementos cuya **etiqueta** es `body` y devuelve una colección; con `[0]` nos quedamos con el primero (el único `body` del documento).

Y a ese `body` le agregamos los divs que vamos creando (esto va dentro de la función `cb`):

```js
body.appendChild(nuevoDiv)
```

### 5. El evento del botón

Por último, hacemos que el botón reaccione al click y ejecute la función que crea el cuadrado rojo:

```js
agregar.addEventListener("click", cb)
```

### Todo junto

```html
<script>
  const agregar = document.getElementById("agregar")
  const body = document.getElementsByTagName("body")[0]

  const cb = () => {
    const nuevoDiv = document.createElement("div")
    nuevoDiv.classList.add("cuadrado", "rojo")
    body.appendChild(nuevoDiv)
  }

  agregar.addEventListener("click", cb)
</script>
```

**Resultado:** cada vez que se hace click en "Agregar", aparece un nuevo cuadrado rojo debajo de los anteriores (se van apilando en columna).

## Eventos: borrar un cuadrado al hacerle click

Nueva funcionalidad: **cuando le hago click a un cuadrado, se elimina**. Esto se agrega **dentro de la función que crea el cuadrado**.

Primero le agregamos un `addEventListener` al `nuevoDiv` para que reaccione a los clicks:

```js
nuevoDiv.addEventListener("click", (event) => {})
```

A la función le pasamos como parámetro **el evento en sí**. ¿Para qué sirve? Porque el evento tiene la propiedad **`target`**, que es **el objetivo del evento** (en este caso, el `nuevoDiv` clickeado), y le podemos decir que se borre:

```js
nuevoDiv.addEventListener("click", (event) => {
  event.target.remove()
})
```

### Todo junto

```html
<script>
  const agregar = document.getElementById("agregar")
  const body = document.getElementsByTagName("body")[0]

  const cb = () => {
    const nuevoDiv = document.createElement("div")
    nuevoDiv.classList.add("cuadrado", "rojo")
    nuevoDiv.addEventListener("click", (event) => {
      event.target.remove()
    })
    body.appendChild(nuevoDiv)
  }

  agregar.addEventListener("click", cb)
</script>
```

## Introducción a React

**React** es una **librería** para crear interfaces de usuario.

- **Vistas:** pantallas de la web.
- **Componentes:** las piezas que componen una vista.
- El componente tiene que intentar ser **lo más chico posible**. Cada uno debe tener **una sola funcionalidad**.
- El nombre del componente siempre va en **PascalCase**, es decir, empezando con **mayúscula** (ej: `MyComponent`, `Card`). Si empieza con minúscula, React lo toma como una etiqueta HTML y no como un componente.
- **Vite** es la **herramienta de construcción y servidor de desarrollo** con la que creamos y levantamos el proyecto (en clase se lo mencionó como framework; técnicamente es un *build tool*). **React** es una **librería**.
- Vamos a trabajar con **JavaScript**: todos los componentes son archivos **`.jsx`**.

> 📝 En las notas originales quedó anotado "solo vamos a trabajar con TypeScript sí o sí", pero en la captura del menú de Vite la opción elegida es **JavaScript** y el proyecto está hecho en `.jsx`. Conviene confirmarlo con la profe.

## Crear el proyecto con Vite

En la consola (bash):

```bash
npm create vite@latest
```

1. Definimos el nombre del proyecto (la profe usó `client`).
2. Seleccionamos el framework:

```
◆ Select a framework:
  ○ Vanilla
  ○ Vue
  ● React
  ○ Preact
  ...
```

3. Seleccionamos la variante/lenguaje: **JavaScript**.

```
  ○ TypeScript
  ○ TypeScript + React Compiler
  ● JavaScript          ← la que usamos
  ○ JavaScript + React Compiler
  ○ RSC
  ○ React Router v7 ↗ https://reactrouter.com
  ○ TanStack Router ↗ https://tanstack.com/router
  ...
```

4. Elegimos qué linter usar: **ESLint**.

Para levantar el proyecto:

```bash
cd client
npm install
npm run dev
```

Se abre en `http://localhost:5173`.

## Estructura del proyecto

- **`public/`**: solo vamos a tener el logo.
- **`src/`** (recursos):
  - **`assets/`**: imágenes que nunca cambian (por ejemplo, banners).
  - **`components/`**: los componentes.
  - **`views/`**: las vistas.
  - `App.jsx`, `App.css`, `index.css`, `main.jsx`.
- **`index.html`**: de este archivo **solo podemos tocar el título** (en el `head`).

Reglas:

- Las **vistas** tienen que tener casi **nada de funcionalidad**; todo eso va en los **componentes**.
- Los **componentes** tienen código, pero no mucho: tienen que ser **bien modulares**.
- React **no nos deja interactuar con el DOM real**, sino que crea un **DOM virtual** para que nosotros toquemos.

### Archivos `.jsx`

Los archivos `.jsx` son "JavaScript XML" y son **componentes**. Siempre se arman de la misma manera:

1. Una **función** con código JavaScript.
2. Que **retorna código HTML** (si pongo **llaves `{ }`** adentro del HTML, puedo usar código JavaScript).
3. Al final se **exporta**: `export default NombreComponente`.

## Cómo arranca una app de React (index.html → main → App)

Diagrama del flujo:

```
1. index.html  (Esqueleto vacío con un contenedor)
        │   <div id="root"></div>
        ▼
2. main.js / index.js  (Punto de entrada de JS)
        │   Busca el contenedor con el DOM y monta
        ▼
3. App.js / App.jsx  (Componente principal / Lógica raíz)
        │   Genera el contenido visual
        ▼
DOM Real del Navegador  (Lo que ve e interactúa el usuario)
```

| Elemento | ¿Qué es? | Relación con el DOM |
|---|---|---|
| `index.html` | Archivo estático inicial | Provee el nodo físico del DOM (`<div id="root">`) donde existirá todo. |
| `main.js` | Punto de montaje | Hace de **puente**: toma el control del nodo en el DOM y le inyecta la app. |
| `App.js` | Raíz de la interfaz | Describe qué elementos, estilos y eventos debe contener ese árbol de la app. |

El navegador carga `index.html`, este ejecuta `main.js`, `main.js` "engancha" a `App` en el `<div id="root">`, y `App` se encarga de crear y actualizar dinámicamente todo el árbol de nodos del DOM.

## Primer componente: MyComponent

`src/components/MyComponent.jsx`:

```jsx
const MyComponent = () => {
    return(
        <h1>Hola! Soy un componente funcional</h1>
    )
}

export default MyComponent
```

Y lo usamos en `App.jsx`:

```jsx
import './App.css'
import MyComponent from './components/MyComponent'

function App() {

  return (
    <MyComponent />
  )
}

export default App
```

## Varios componentes en una vista: Card y CardList

Primero se crea el componente `Card`. Para que retorne bien varios elementos (`h2`, `h3` y `p`), **hay que envolverlos en un fragmento vacío `<> </>`**, porque un componente solo puede retornar **un único elemento raíz**.

`src/components/Card.jsx`:

```jsx
const Card = () => {
  return (
    <>
      <h2>Tarjeta</h2>
      <h3>Nombre: Gisele</h3>
      <p>Mail: gi@mail.com</p>
    </>
  );
};

export default Card;
```

Ahora se crea la **vista**, que muestra 3 veces el componente `Card`.

`src/views/CardList.jsx`:

```jsx
import Card from "../components/Card"

const CardList = () => {
    return(
        <>
        <Card/>
        <Card/>
        <Card/>
        </>
    )
}

export default CardList
```

Y se llama a esa vista en `App.jsx`:

```jsx
import './App.css'
// eslint-disable-next-line no-unused-vars
import MyComponent from './components/MyComponent'
import CardList from './views/CardList'

function App() {

  return (
    // <MyComponent />
    <CardList/>
  )
}

export default App
```

**Resultado en `localhost:5173`:** la tarjeta aparece 3 veces seguidas:

```
Tarjeta
Nombre: Gisele
Mail: gi@mail.com
Tarjeta
Nombre: Gisele
Mail: gi@mail.com
Tarjeta
Nombre: Gisele
Mail: gi@mail.com
```

---

# Clase 9

## Componentes padres e hijos

Los componentes padres pueden tener hijos. Diagrama de la clase:

```
                 Component
                /         \
         Component       Component
                         /        \
                  Component     Component

  DATA  ↓  (los datos bajan de padres a hijos)
  EVENTS ↑ (los eventos suben de hijos a padres)
```

- Los **datos** fluyen **hacia abajo** (padre → hijo, mediante props).
- Los **eventos** fluyen **hacia arriba** (el hijo avisa al padre, por ejemplo llamando a una función que el padre le pasó).

## Estados y Hooks: useState

- Los datos los vamos a guardar en **estados** dentro de los componentes.
- Vamos a usar **hooks**: funciones propias (innatas) de la librería React.
- **Solo el componente que tiene el estado** puede decidir qué hace con la información que guarda.
- **Hook `useState`:** permite definir qué información guardo dentro de un componente (función).

Ejemplos de uso de `useState`:

```jsx
// Ayuda a llevar la cuenta de un valor y actualizar el número
const [count, setCount] = useState(0);

// Usado para gestionar el valor de un campo de entrada de usuario
const [inputValue, setInputValue] = useState('');

// Permite cambiar la visibilidad de un elemento de la interfaz del usuario
const [isVisible, setIsVisible] = useState(true);

// Se utiliza para almacenar y actualizar la información proveniente de un formulario
const [formData, setFormData] = useState({ username: '', password: '' });
```

Estructura: `const [valor, setValor] = useState(valorInicial)` → `valor` es el dato actual, `setValor` es la función para cambiarlo.

## Props

- **Props:** objetos que permiten la **comunicación entre componentes padres e hijos**.
- El componente hijo las recibe **a través de los parámetros de la función**.

## Ejemplo: Todo List

(Proyecto "React Hooks Demo", carpeta `client/marketplace`.)

### Componente `Todo`

`src/components/Todo.jsx`:

```jsx
import React from 'react'

function Todo() {
  return (
    <>
      <h1>Todo component</h1>
    </>
  )
}

export default Todo
```

### Componente `Form` (que además retorna `Todo`)

`src/components/Form.jsx`:

```jsx
import React from 'react'
import Todo from './Todo'

function Form() {
  return (
    <>
      <h2>Form Component</h2>
      <Todo />
    </>
  )
}

export default Form
```

### Vista `Home` que renderiza `Form`

`src/views/Home.jsx`:

```jsx
import React from 'react'
import Form from '../components/Form'

function Home() {
  return (
    <>
      <h1>Home view</h1>
      <Form />
    </>
  )
}

export default Home
```

### Lo agregamos en `App.jsx`

```jsx
import './App.css'
import Home from './views/Home'

function App() {

  return (
    <>
      <p>Aqui haremos una todo list</p>
      <Home />
    </>
  )
}

export default App
```

### Usando un hook: lista de tareas con `useState`

Modificamos `Form.jsx` para que invoque varias veces a `Todo`. Creamos el estado `todos`, con su función `setTodos`, usando `useState` para guardar un **array de objetos** (cada uno con una propiedad `todo`):

```jsx
function Form() {

    const [todos, setTodos] = useState([
        {todo: 'Tarea 1'},
        {todo: 'Tarea 2'},
        {todo: 'Tarea 3'}
    ])

  return (
    <>
    {
        todos.map((value, index)=>(
            <Todo tarea={value.todo}/>
        ))
    }
    </>
  )
}

export default Form
```

Arriba del archivo hay que importar el hook: `import React, { useState } from 'react'`.

Después **mapea** `todos`: por cada elemento crea una instancia de `Todo` y le pasa la propiedad `value.todo` como prop llamada `tarea`.

Esa información llega **por props** a `Todo.jsx`, que la recibe desestructurada como parámetro y la muestra en un `h3` ("Tarea 1", "Tarea 2", etc.):

```jsx
import React from 'react'

function Todo({tarea}) {
  return (
    <>
      <h3>{tarea}</h3>
    </>
  )
}

export default Todo
```

### Agregar un formulario para que el usuario ingrese tareas

- Para enviar un formulario necesitamos la etiqueta **`form`**. Adentro va un **`input` de tipo texto** para que el usuario escriba.
- El input debe tener un **`name`**, que tiene que **coincidir con el nombre de la propiedad del objeto** (y esta, a su vez, con el atributo de la entidad en la base de datos). Esto es porque con el input vamos a formar el objeto `todo`.

```jsx
<form>
    <input type="text"
    name='todo' />
</form>
```

Además agregamos un botón y un `label` (este último es decorativo):

```jsx
<form>
    <label>Agregar tarea</label> <br />
    <input type="text"
    name='todo' />
    <button>Agregar</button>
</form>
```

### Formulario controlado: guardar lo que escribe el usuario en un estado

Hay que meter la tarea del input dentro del estado. Para esto usamos **formularios controlados** de React. Creamos un estado que guarda un string:

```jsx
const [todo, setTodo] = useState('')
```

Ahora necesitamos que el input guarde lo que va escribiendo el usuario en ese estado. Para eso usamos un **evento `onChange`**, que llama a una función que vamos a crear:

```jsx
<form>
    <label>Agregar tarea</label> <br />
    <input type="text"
    name='todo'
    onChange={handleChange}/>
    <button>Agregar</button>
</form>
```

La función toma el evento (`e`) y hace que `setTodo` guarde el valor de `e.target` (el elemento al que apunta el evento, o sea el input):

```jsx
const handleChange = (e)=> setTodo(e.target.value)
```

### Botón "Agregar": pasar el texto del input al array `todos`

Ya guardamos lo que el usuario escribió. Ahora queremos tomar esa información y ponerla dentro de `todos`. Para eso, cuando el usuario hace click en el botón se dispara un evento:

```jsx
    onChange={handleChange}/>
    <button onClick={handleClick}>Agregar</button>
</form>
```

Creamos la función `handleClick`. Primero, una validación por si el usuario hace click sin escribir nada:

```jsx
const handleClick = ()=>{
    if(todo.trim() === ''){
        alert('el campo no puede estar vacio')
        return
    }

}
```

> ⚠️ **IMPORTANTE:** la profe dijo que **en el proyecto NO hay que hacer esto con `alert`**, está mal porque toca el DOM.

Después se agrega la funcionalidad de "guardate el array de objetos `todos` + el nuevo objeto `todo`":

```jsx
const handleClick = ()=>{
    if(todo.trim() === ''){
        alert('el campo no puede estar vacio')
        return
    }
    setTodos([...todos, {todo}])
}
```

`[...todos, {todo}]` crea un **array nuevo** con todos los elementos anteriores (operador spread `...`) y al final el objeto nuevo. `{todo}` es la forma corta de escribir `{todo: todo}`, así que queda `{todo: 'lo que escribió el usuario'}`, con la misma forma que los objetos iniciales.

### Evitar que la página se recargue: `preventDefault`

Si probamos esto, al hacer click en el botón **la página se recarga y perdemos toda la información**. Eso pasa por la etiqueta `form`, que por defecto envía y recarga la página. Para evitarlo, le decimos al form que cuando ocurra el evento `submit` **no haga su comportamiento por defecto**:

```jsx
return (
  <>
  <form onSubmit={(e)=>e.preventDefault()}>
      <label>Agregar tarea</label> <br />
      <input type="text"
      name='todo'
      ...
```

### Botón para borrar una tarea

Queremos un botón de borrar por si nos equivocamos al cargar una tarea. Como queremos **un botón por tarea**, va dentro de `Todo`. Primer intento:

```jsx
import React from 'react'

function Todo({tarea, nombre}) {
  return (
    <>
      <h3>{tarea}</h3>
      <p>{nombre}</p>
      <button onClick={}>X</button>
    </>
  )
}

export default Todo
```

Pero, ¿cómo borramos si `Todo` **no tiene el array** de `todos`? Recordemos que **el componente padre es el que tiene el estado**. Entonces la profe cambia varias cosas:

1. Saca la prop `nombre` porque estaba de más.
2. En el `onClick` del botón usa una función que vamos a crear, **`deleteTodo`**, que recibe el **`index`** para saber cuál borrar.
3. Esa función y el index se reciben **por props**.

`Todo.jsx` final:

```jsx
import React from 'react'

function Todo({tarea, index, deleteTodo }) {
  return (
    <>
      <h3>{tarea}</h3>
      <button onClick={()=>deleteTodo(index)}>X</button>
    </>
  )
}

export default Todo
```

**¿Por qué `deleteTodo` se crea en `Form` y no en `Todo`?** Porque **el estado `todos` vive en `Form`**, y solo el componente dueño del estado puede modificarlo (`setTodos` existe solo ahí). `Todo` es un hijo que no conoce la lista completa. Entonces el padre define la función que modifica su estado y se la pasa al hijo por props; el hijo solo la "dispara" con su índice. Es el patrón del diagrama: **los datos bajan (props) y los eventos suben (el hijo llama a la función del padre)**.

Ojo: se escribe `onClick={()=>deleteTodo(index)}` (con una función flecha) y no `onClick={deleteTodo(index)}`, porque esto último ejecutaría la función inmediatamente al renderizar en vez de al hacer click.

### La función `deleteTodo` en `Form.jsx`

Recibe el índice, crea una **copia** del array `todos`, le borra el elemento de ese índice y setea el nuevo array (sin esa tarea) como el estado:

```jsx
const deleteTodo = (indice)=>{
    const newTodos = [...todos]
    newTodos.splice(indice, 1)
    setTodos(newTodos)
}
```

- **`.splice(indice, cantidad)`**: necesita el índice desde donde borrar y la **cantidad de elementos a borrar** (acá, 1).
- Se hace una copia (`[...todos]`) porque en React **no hay que modificar el estado directamente**; siempre se le pasa un valor nuevo al `set`.

### Pasar todo por props en el `map`

Por último, en el mapeo agregamos los campos **`key`**, **`index`** y **`deleteTodo`**:

```jsx
return (
  <>
  <form onSubmit={(e)=>e.preventDefault()}>
      <label>Agregar tarea</label> <br />
      <input type="text"
      name='todo'
      onChange={handleChange}/>
      <button onClick={handleClick}>Agregar</button>
  </form>
  {
      todos.map((value, index)=>(
          <Todo tarea={value.todo}
          key={index}
          index={index}
          deleteTodo={deleteTodo}/>
      ))
  }
  </>
)
```

Qué hace cada prop:

- **`key`**: prop especial que React necesita en cada elemento de una lista generada con `map`, para identificar cuál es cuál cuando la lista cambia. **No llega al componente hijo** como prop normal; por eso además se pasa **`index`** aparte.
- **`index`**: la posición de la tarea, para que `Todo` sepa cuál pedir que se borre.
- **`deleteTodo={deleteTodo}`**: pasa la función del padre al hijo.
- Usar el índice como `key` funciona para este ejemplo, pero lo recomendable es usar un **id único** (por ejemplo el id que viene de la base de datos), porque al borrar elementos los índices cambian.

### `Form.jsx` completo

Versión final, con la validación hecha **sin `alert`** (como pidió la profe para el proyecto): el mensaje de error se guarda en un estado y se muestra en el JSX.

```jsx
import React, { useState } from 'react'
import Todo from './Todo'

function Form() {

    const [todos, setTodos] = useState([
        {todo: 'Tarea 1'},
        {todo: 'Tarea 2'},
        {todo: 'Tarea 3'}
    ])
    const [todo, setTodo] = useState('')
    const [error, setError] = useState('')

    const handleChange = (e)=> setTodo(e.target.value)

    const handleClick = ()=>{
        if(todo.trim() === ''){
            setError('El campo no puede estar vacío')
            return
        }
        setError('')
        setTodos([...todos, {todo}])
    }

    const deleteTodo = (indice)=>{
        const newTodos = [...todos]
        newTodos.splice(indice, 1)
        setTodos(newTodos)
    }

  return (
    <>
    <form onSubmit={(e)=>e.preventDefault()}>
        <label>Agregar tarea</label> <br />
        <input type="text"
        name='todo'
        onChange={handleChange}/>
        <button onClick={handleClick}>Agregar</button>
    </form>
    {error && <p>{error}</p>}
    {
        todos.map((value, index)=>(
            <Todo tarea={value.todo}
            key={index}
            index={index}
            deleteTodo={deleteTodo}/>
        ))
    }
    </>
  )
}

export default Form
```

`{error && <p>{error}</p>}` significa: si `error` tiene texto, mostrá el párrafo; si está vacío, no muestres nada.

---

# Clase 10

En esta clase vamos a **conectar front y back**.

Algo importante: **NO** vamos a estar cambiando de páginas y cargando nuevas, sino que vamos a estar siempre **en una misma página** y vamos a cambiar de *templates* (vistas) dentro de ella.

## Single Page Application (SPA)

- En el navegador se carga **una sola página HTML**.
- **Página web tradicional:** hay varias páginas (Page 1, Page 2, Page 3) y cada cambio **recarga** la página completa.
- **SPA:** hay una sola página con un área de "Templates View" donde se van alternando las vistas (View 1, View 2, View 3).
- En lugar de recargar la página una y otra vez cuando hay un cambio, alterna la aparición de distintos elementos llamados **Views**, que se renderizan **según la ruta** en la que esté el usuario.
- Su contenido se actualiza de forma dinámica mientras el usuario interactúa con la aplicación.

Esto se hace con **routing**.

## Enrutado (React Router)

El enrutamiento puede representarse como una especie de **árbol**. El componente `App` es el **nodo raíz** y los demás componentes, junto con sus rutas, son los nodos del árbol:

```
<Router />
    │
  <App />
   ├── <Route path='messages' />
   │       └── <Messenger />
   │             ├── MENU
   │             └── CHAT
   └── <Route path='login' />
           └── <Login />
                 ├── BUTTON
                 └── FORM
```

### Instalación y configuración en `main.jsx`

Se instala la librería:

```bash
npm install react-router-dom
```

Una vez instalado `react-router-dom`, vamos a `main.jsx` para configurarlo. La profe usa **`BrowserRouter`**: agrega el import y **envuelve (wrappea) a `App`** con él:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {BrowserRouter} from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <StrictMode>
    <App />
  </StrictMode>
  </BrowserRouter>
)
```

### Vista `Contact`

Para demostrar, la profe crea una nueva vista `src/views/Contact.jsx` (usa el atajo **`rfce`** para crearla al instante). Lo único que hace es mostrar cómo contactarte:

```jsx
import React from 'react'

function Contact() {
  return (
    <div>
      <p>Contactanos en: mail@mail.com</p>
    </div>
  )
}

export default Contact
```

`rfce` es un snippet de la extensión *ES7+ React/Redux/React-Native snippets* de VS Code: significa **R**eact **F**unctional **C**omponent with **E**xport, y genera el esqueleto `function X() { return (...) } export default X`.

Como es una vista, va en la carpeta `views/` (y desde ahí se importa en `App.jsx`: `import Contact from './views/Contact'`).

### Vista `Home`

`src/views/Home.jsx`:

```jsx
export const Home = () =>{
    return(
        <>
        <h3>Bienvenidos a nuestra pagina!</h3>
        </>
    )
}
```

Acá `Home` se exporta como **export nombrado** (`export const Home`), por eso después se importa **con llaves**: `import { Home } from './views/Home'`. Con `export default` se importa **sin llaves** (ej: `import Contact from './views/Contact'`).

## Navbar con Link

Se crea un componente para la barra de navegación, `Navigation.jsx`. Usa la etiqueta **`nav`** y, para hacer una lista adentro, las etiquetas **`ul`** y **`li`**:

```jsx
import React from 'react'

function Navigation() {
  return (
    <nav>
        <ul>
            <li>Inicio</li>
        </ul>
    </nav>
  )
}

export default Navigation
```

`<ul>` (*unordered list*) es una **lista sin numerar** y cada `<li>` (*list item*) es **un elemento de esa lista**. En una navbar cada opción del menú es un `li`. Es la forma semántica recomendada para menús; con CSS después se les saca el punto (`list-style: none`) y se ponen en fila.

Para que se vea por pantalla, en `App` en vez de llamar a `Home` llamamos a `Navigation`:

```jsx
import './App.css'
import Navigation from './components/Navigation'

function App() {

  return (
    <>
    <Navigation />
    </>
  )
}

export default App
```

Ahora cambiamos la navbar para que, en vez de ser solo texto, sea un **`Link`** que nos lleve a la pantalla home:

```jsx
import React from 'react'
import {Link} from 'react-router-dom'

function Navigation() {
  return (
    <nav>
        <ul>
            <li>
                <Link to='/home'>Inicio</Link>
            </li>
        </ul>
    </nav>
  )
}

export default Navigation
```

Y la profe agregó otro para la pantalla de contacto:

```jsx
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

## Routes y Route en App.jsx

Por ahora esto solo **cambia la URL**, pero esas URLs no están conectadas a nada. Para solucionarlo, agregamos la funcionalidad de router en `App.jsx`: importamos `Routes`, `Route` y `Contact`, y debajo de la navbar agregamos la etiqueta **`Routes`**, donde **relacionamos cada ruta con su vista**:

```jsx
import './App.css'
import { Home } from './views/Home'
import Navigation from './components/Navigation'
import {Routes, Route} from 'react-router-dom'
import Contact from './views/Contact'

function App() {

  return (
    <>
    <Navigation />
    <Routes>
      <Route path='/home' element={<Home/>}/>
      <Route path='/contact' element={<Contact />}/>
    </Routes>
    </>
  )
}

export default App
```

La `Navigation` queda siempre visible (está fuera de `Routes`), y debajo se renderiza la vista que corresponda a la URL.

## useNavigate

Ahora creamos un **botón** que nos lleve a la pantalla de contacto:

```jsx
<Navigation />
<Routes>
  <Route path='/home' element={<Home/>}/>
  <Route path='/contact' element={<Contact />}/>
</Routes>
<button onClick={handleClick}>Contacto</button>
```

Y creamos dos cosas: `navigate` y `handleClick`.

- **`useNavigate`** es un hook que **devuelve otra función**, la cual recibe por parámetro **la URL a la que quiero redireccionar**.
- Permite hacer redirecciones a otras vistas **de manera programática** (desde código).
- **Cada vez que tengamos que redirigir a otra URL en respuesta a un evento, vamos a usarlo.**

```jsx
function App() {
  const navigate = useNavigate()

  const handleClick = ()=>{
    navigate('/contact')
  }
  // ...
```

`useNavigate` se importa de `react-router-dom`: `import { Routes, Route, useNavigate } from 'react-router-dom'`.

**Navegación programática** significa que la navegación la dispara **el código** (por ejemplo, después de un click, de enviar un formulario o de un login exitoso), en lugar de que el usuario haga click en un `<Link>`:

- `Link` → navegación **declarativa** (un enlace en el HTML).
- `useNavigate` → navegación **programática** (una función que llamás cuando quieras).

## useLocation

Otro hook similar que enseñó la profe: **`useLocation`**. En vez de devolver una función, **devuelve un objeto** con información de la URL actual:

```jsx
const location = useLocation()
```

Se puede usar para obtener cualquiera de las propiedades de ese objeto: `hash`, `key`, `pathname`, `search`, `state`. Por ejemplo:

```jsx
<p>La ruta actual es: {location.pathname}</p>
```

### `App.jsx` completo con rutas, `useNavigate` y `useLocation`

```jsx
import './App.css'
import { Home } from './views/Home'
import Navigation from './components/Navigation'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Contact from './views/Contact'

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleClick = ()=>{
    navigate('/contact')
  }

  return (
    <>
    <Navigation />
    <Routes>
      <Route path='/home' element={<Home/>}/>
      <Route path='/contact' element={<Contact />}/>
    </Routes>
    <button onClick={handleClick}>Contacto</button>
    <p>La ruta actual es: {location.pathname}</p>
    </>
  )
}

export default App
```

Esto se podría usar con la propiedad **`pathname`** para, por ejemplo, hacer botones de "adelante" y "atrás" en una página que tiene varios temas.

## Ciclo de vida de los componentes y useEffect

Los componentes tienen un **ciclo de vida de 3 fases**:

- **Montaje:** cuando se renderiza por primera vez en pantalla.
- **Actualización:** cuando sufre algún cambio.
- **Desmontaje:** cuando se deja de renderizar (se quita de la pantalla).

Dentro de estas fases, además de la función principal, vamos a querer **traer información del backend**. Esto es un **efecto secundario**.

Para manejar los efectos secundarios usamos **`useEffect`**, que siempre recibe **2 parámetros: una callback y un array**.

### Montaje

Cuando hablamos de efectos secundarios en la etapa de montaje, normalmente nos referimos a **solicitudes GET**. Para hacerlo, llamamos a la API **dentro de la callback** del `useEffect`:

```jsx
useEffect(()=>{
  // código - API
}, [])
```

### Desmontaje

De manera inversa, en el desmontaje lo que hacemos es **retornar** el código (una función de limpieza):

```jsx
useEffect(()=>{
  // ... lo que se hace al montar
  return () => { /* limpieza: cancelar un temporizador, una escucha de eventos, etc. */ }
}, [])
```

La función que se retorna es la **limpieza**: se ejecuta cuando el componente se desmonta. Sirve para "apagar" lo que el efecto dejó andando (por ejemplo un `setInterval` o un `addEventListener`), no para llamar a la API.

### Actualización

En la fase de actualización usamos todos los demás tipos de solicitudes (**POST, PUT, PATCH, DELETE**), y hacemos ambas cosas:

1. Guardar lo cambiado en el **backend**.
2. Guardar lo cambiado en el **estado local** — esto para **evitar hacer llamadas al backend innecesarias** (⚠️ **SÚPER IMPORTANTE**).

Estas solicitudes las dispara el usuario (un click, enviar un formulario), así que van **dentro de la función del evento** (`handleClick`, `handleSubmit`), **no dentro de un `useEffect`** (ver el ejemplo del POST más abajo).

### El array de dependencias

El segundo parámetro del `useEffect` se llama **array de dependencias**. No guarda datos: indica **cuándo se vuelve a ejecutar el efecto**.

- Si está **vacío** (`[]`), el `useEffect` **solo se ejecuta cuando el componente se monta**.
- Si ponemos algo adentro (por ejemplo `[count]`), el efecto se vuelve a ejecutar **cada vez que eso cambia**.
- Si no ponemos el array, se ejecuta después de **cada** render (casi nunca es lo que queremos).

```jsx
useEffect(()=>{
  // código - API
}, [dependencias])
```

## Ejemplo de useEffect: contador en el título

La profe crea un componente `ExampleComponent.jsx` con un botón que, al hacer click, **aumenta en 1 un contador**:

```jsx
import React, { useState } from 'react'

function ExampleComponent() {
    const [count, setCount] = useState(0)
  return (
    <div>
        <p>Contador: {count}</p>
      <button onClick={()=>{setCount(count + 1)}}>Incrementar</button>
    </div>
  )
}

export default ExampleComponent
```

Ahora quiere que **el título del documento** (la pestaña del navegador) muestre el contador. Para esto usa `useEffect`. Ojo: **`useEffect` no se guarda en un `const`**, se llama directamente:

```jsx
import React, { useEffect, useState } from 'react'

function ExampleComponent() {
    const [count, setCount] = useState(0)

    useEffect(()=>{
        document.title = `Contador: ${count}`
    },[])

  return (
    <div>
        <p>Contador: {count}</p>
      <button onClick={()=>{setCount(count + 1)}}>Incrementar</button>
    </div>
  )
}

export default ExampleComponent
```

Pero si lo probamos **no funciona**: el contador del título se queda en 0. Es porque **no pusimos `count` en el array de dependencias** (con `[]` solo se ejecuta al montar). La corrección:

```jsx
useEffect(()=>{
    document.title = `Contador: ${count}`
},[count])
```

Ahora, cada vez que `count` cambia, el efecto se vuelve a ejecutar y el título se actualiza (en la captura del navegador se ve una pestaña con el título "Contador: 24").

## Asincronía y Promesas

- JavaScript es un lenguaje **síncrono** (ejecuta una cosa después de la otra), pero nosotros vamos a trabajar de manera **asíncrona**.
- Para eso usamos **PROMESAS**: un objeto que va a contener el **eventual resultado de una operación asíncrona**.
- Siempre existe la posibilidad de que la respuesta **se resuelva** o que **tire error**, así que hay que prepararse para ambas.

Una promesa tiene **3 estados**:

| Estado | Significado |
|---|---|
| **Pending** | Valor no definido todavía (`undefined`). |
| **Fulfilled** | Devuelve el valor de resolución. |
| **Rejected** | Devuelve la razón del rechazo. |

Mientras la promesa está en *pending*, el dato todavía **no llegó**. Por eso:

- El resultado se usa **dentro del `.then()`**, que se ejecuta recién cuando la promesa se resuelve.
- El estado donde lo vamos a guardar tiene que arrancar con un valor que se pueda usar mientras tanto. Por ejemplo, `useState([])`: mientras llega la respuesta, el `map` recorre un array vacío y no muestra nada. Si arrancara en `undefined`, `undefined.map(...)` **tiraría error**.

## fetch con .then() y .catch()

- Para trabajar con promesas asíncronas usamos el método **`fetch()`**.
- Normalmente el `fetch` va **dentro del `useEffect`** (no siempre).
- El fetch tiene dos métodos, uno para cada resultado de la promesa:
  - **Fulfilled → `.then()`**
  - **Rejected → `.catch()`**

## Ejemplo: PostCard y PostList con JSONPlaceholder

Como la profe no tiene backend, usa uno falso (*mock*): **`jsonplaceholder.typicode.com`**. Tiene un endpoint **`/posts`** con publicaciones de usuarios. Cada post tiene esta forma:

```json
[
  {
    "userId": 1,
    "id": 1,
    "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
    "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
  },
  {
    "userId": 1,
    "id": 2,
    "title": "qui est esse",
    "body": "est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla"
  }
]
```

Se crean 2 componentes:

- **`PostCard.jsx`**: tiene la estructura de cada publicación.
- **`PostList.jsx`**: trae los datos del backend, los guarda localmente (en su estado) y renderiza los `PostCard`.

`PostList` se renderiza en `Home`, y `Home` en `App`.

### PostCard

Recibe `id`, `title` y `body` por props y los renderiza así:

```jsx
import React from 'react'

function PostCard({id, title, body}) {
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

### PostList: traer los datos y guardarlos en el estado

Necesitamos un `useState` y un `useEffect` con el `fetch` adentro. Además, para no escribir la misma URL muchas veces, la profe crea una constante:

```jsx
function PostList() {
    const [posts, setPosts] = useState([])

    const URL = 'https://jsonplaceholder.typicode.com' //localhost:8080

    useEffect(()=>{
        fetch(`${URL}/posts`)
        .then((response)=> response.json())
        .then((data)=>{
            setPosts(data)
        })

    }, [])
```

- El primer `.then` convierte la respuesta a JSON (`response.json()` también devuelve una promesa).
- El segundo `.then` recibe los datos ya convertidos y los guarda en el estado con `setPosts`.
- El comentario `//localhost:8080` indica que en el proyecto real ahí iría la URL de nuestro backend.

### Manejar el error con `.catch()`

Lo anterior es solo para cuando la promesa sale bien; hay que manejar también cuando sale mal:

```jsx
useEffect(()=>{
    fetch(`${URL}/posts`)
    .then((response)=> response.json())
    .then((data)=>{
        setPosts(data)
    })
    .catch((error)=>{
        console.error('Error al mostrar las publicaciones: ', error)
    })
}, [])
```

### Renderizar los datos con `map`

Mapeamos `posts` y usamos `PostCard` para mostrar cada uno:

```jsx
return (
  <div>
    <h1>Publicaciones</h1>
    {
      posts.map((post)=>(
          <PostCard
          id={post.id}
          title={post.title}
          body={post.body}
          key={post.id}/>
      ))
    }
  </div>
)
```

> Acá sí se usa un **id único** (`post.id`) como `key`, que es lo recomendable.

### `PostList.jsx` completo

```jsx
import React, { useEffect, useState } from 'react'
import PostCard from './PostCard'

function PostList() {
    const [posts, setPosts] = useState([])

    const URL = 'https://jsonplaceholder.typicode.com' //localhost:8080

    useEffect(()=>{
        fetch(`${URL}/posts`)
        .then((response)=> response.json())
        .then((data)=>{
            setPosts(data)
        })
        .catch((error)=>{
            console.error('Error al mostrar las publicaciones: ', error)
        })
    }, [])

  return (
    <div>
      <h1>Publicaciones</h1>
      {
        posts.map((post)=>(
            <PostCard
            id={post.id}
            title={post.title}
            body={post.body}
            key={post.id}/>
        ))
      }
    </div>
  )
}

export default PostList
```


## Ejemplo orientado al proyecto: POST con token

La profe dio ejemplos de cómo sería con nuestro backend real: **tokens** (JWT), los estados que necesitaría un producto, y cómo hacer un **POST**. Acá está la versión corregida y funcionando.

### Guardar y leer el token

Después de hacer login, el backend devuelve un token. Se guarda en el `localStorage` del navegador:

```jsx
localStorage.setItem('jwtToken', data.token)
```

Y se lee cuando lo necesitamos para las siguientes peticiones:

```jsx
const token = localStorage.getItem('jwtToken')
```

### Estados y URL

```jsx
const [name, setName] = useState('')
const [description, setDescription] = useState('')
const [products, setProducts] = useState([])
const URL = 'http://localhost:8080/products'
```

- `name` y `description`: los campos del producto que escribe el usuario.
- `products`: la lista de productos (estado local).
- `URL`: el endpoint de nuestro backend (con `http://` adelante).
- El token se lee una sola vez del `localStorage` (no hace falta otro estado `token`).

### Datos y opciones del request

```jsx
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
```

- `datosAEnviar`: el objeto que se manda al backend (con los mismos nombres de propiedades que la entidad).
- `method: 'POST'`: tipo de solicitud.
- `headers` (en plural): `Content-Type: application/json` le dice al backend que mandamos JSON, y `Authorization: Bearer <token>` le dice que estamos autenticados.
- `body: JSON.stringify(datosAEnviar)`: convierte el objeto a texto JSON para enviarlo.

### El fetch del POST

El POST es una acción de **actualización** que hace el usuario (por ejemplo, al enviar el formulario), así que va **dentro de la función del evento** y no en un `useEffect`. Si lo pusiéramos en un `useEffect` con `[products]` como dependencia y adentro hiciéramos `setProducts`, se generaría un **loop infinito** (cada cambio de `products` volvería a disparar el POST).

Con la respuesta del backend, actualizamos el **estado local** agregando el producto nuevo, para **no tener que volver a pedir toda la lista al backend**:

```jsx
const handleSubmit = (e)=>{
    e.preventDefault()

    fetch(URL, options)
    .then((res)=> res.json())
    .then((data)=>{
        setProducts([...products, data])
    })
    .catch((error)=>{
        console.error(error)
    })
}
```

- `setProducts([...products, data])`: agrega el producto que devolvió el backend tal cual (sin envolverlo en otro objeto).

### Componente completo de ejemplo

Junta todo: el **GET** al montar (en `useEffect` con `[]`) y el **POST** al enviar el formulario.

```jsx
import React, { useEffect, useState } from 'react'

function Products() {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [products, setProducts] = useState([])

    const URL = 'http://localhost:8080/products'
    const token = localStorage.getItem('jwtToken')

    // Montaje: traer los productos (GET)
    useEffect(()=>{
        fetch(URL, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then((res)=> res.json())
        .then((data)=>{
            setProducts(data)
        })
        .catch((error)=>{
            console.error('Error al traer los productos: ', error)
        })
    }, [])

    // Actualización: crear un producto (POST)
    const handleSubmit = (e)=>{
        e.preventDefault()

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
        .then((res)=> res.json())
        .then((data)=>{
            setProducts([...products, data])  // actualizo el estado local
            setName('')
            setDescription('')
        })
        .catch((error)=>{
            console.error('Error al crear el producto: ', error)
        })
    }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" name='name' value={name}
          onChange={(e)=> setName(e.target.value)} />
        <input type="text" name='description' value={description}
          onChange={(e)=> setDescription(e.target.value)} />
        <button>Agregar producto</button>
      </form>

      {
        products.map((product)=>(
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
          </div>
        ))
      }
    </div>
  )
}

export default Products
```

---

# Después: Redux Toolkit y axios

> Las clases siguientes pasaron todo lo hecho hasta acá a **Redux**. La explicación completa, con diagramas y un guion por pantalla, está en la carpeta [`documentacion_redux/`](documentacion_redux/). Acá va solo el resumen.

- **Problema que resuelve:** cuando muchos componentes necesitan el mismo dato (la sesión, el carrito), pasarlo por props de padre en hijo se vuelve largo. Redux lo guarda en un **store global** que cualquier componente puede leer.
- **`<Provider store={store}>`** en `main.jsx`: deja el store disponible para toda la app.
- **`configureStore`** (`store.js`): junta los **slices**.
- **`createSlice`**: cada slice tiene su `initialState`, sus `reducers` (cambios sincrónicos) y sus `extraReducers`.
- **`createAsyncThunk`**: funciones asincrónicas que llaman al back (con **axios**) y devuelven los datos.
- **`extraReducers`**: qué hacer en cada estado de la promesa del thunk: `pending`, `fulfilled` (los datos llegan en `action.payload`) y `rejected`. Son los mismos 3 estados de las promesas vistos arriba.
- **`useSelector((state) => state.algo)`**: lee el estado; el componente se vuelve a dibujar cuando ese dato cambia.
- **`useDispatch()`**: devuelve `dispatch`, para ejecutar acciones y thunks: `dispatch(fetchEspacios())`.
- **axios** reemplaza a `fetch`: convierte la respuesta a JSON solo (los datos vienen en `data`), y los encabezados se pasan como configuración: `axios.get(URL, { headers: { Authorization: 'Bearer ' + token } })`.
- Los reducers tienen que ser **funciones puras**: nada de llamar a la API ni tocar `localStorage` ahí (eso va en el thunk).
- Lo que es de **un solo componente** (un campo de formulario, un mensaje de error) sigue siendo **estado local** con `useState`.

---

# Cómo evalúa la profe

- **No** va a mirar la estructura general del código.
- Va a **abrir el navegador e inspeccionar**, mirar **un par de componentes** y preguntar **por qué** está hecho de esa manera.
- Sobre el código hecho con IA: tiene que estar **bien estructurado y sin "cosas de IA"**. La profe dijo que la IA suele duplicar lógica dentro de funciones y meter llamadas que no deberían estar. **Hay que saber muy bien qué hace cada cosa, porque va a preguntar todo.**
- Para el diseño de la página sugirió **Google Stitch**.
- Para repasar el recorrido virtual (mapa 3D) archivo por archivo: [`documentacion_redux/4_GUION_RECORRIDO_VIRTUAL.md`](documentacion_redux/4_GUION_RECORRIDO_VIRTUAL.md).

## Puntos importantes para el proyecto

1. **JavaScript**, componentes en archivos **`.jsx`** con nombre en **PascalCase**.
2. **Vistas** con casi nada de lógica; la funcionalidad va en **componentes** chicos y modulares (`src/views/` y `src/components/`).
3. **No usar `alert`** para validaciones (toca el DOM): guardar el mensaje en un estado y mostrarlo en el JSX.
4. Los **datos bajan** por props y los **eventos suben** (el hijo llama a una función que le pasó el padre). El estado **de un solo componente** vive ahí (`useState`); el estado **compartido** por muchas pantallas (sesión, carrito, reservas) vive en el **store de Redux**.
5. En los `map`, siempre poner una **`key`**, idealmente un **id único**.
6. **Nunca modificar el estado directamente**: hacer una copia (`[...array]`) y pasarla al `set` (en Redux Toolkit, el reducer lo resuelve por dentro).
7. **`useEffect` con `[]`** → GET al montar. Las acciones del usuario (POST, PUT, PATCH, DELETE) van en la **función del evento**, no en un `useEffect`.
8. Después de cada cambio en el backend, **actualizar también el estado** (local o del store) para no hacer llamadas innecesarias.
9. Siempre manejar los dos resultados de la promesa: con `fetch`, **`.then()`** y **`.catch()`**; con Redux, los casos **`fulfilled`** y **`rejected`** del thunk.
10. El token va en los encabezados como `Authorization: Bearer <token>`: en `fetch` dentro de **`headers`** (plural); en axios, en la configuración (`{ headers: { ... } }`).
11. Poder **explicar cada componente**: la profe va a preguntar el porqué de lo que vea en el navegador.
