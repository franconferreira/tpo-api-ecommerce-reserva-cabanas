# Guion de presentación: el Recorrido virtual (mapa 3D)

> Mismo formato que el guion de Redux: para cada archivo, **qué hace**, qué **parámetros** recibe y qué **métodos** tiene.
> Va en el orden en que pasan las cosas: el clic en "Recorrido virtual", la vista de React, el motor 3D, la escena, y después las piezas de apoyo (cielo, sonido, póster, modelos).
> Al final hay una lista de **preguntas probables** con su respuesta corta.
>
> Las frases en *cursiva* son una sugerencia de lo que se puede decir en voz alta.

---

## Idea general (para arrancar la explicación)

*"El recorrido virtual es una pantalla más de React (`/mapa-3d`). React se encarga de lo que es interfaz: el menú, los avisos, los botones, el carrito y los datos de los espacios, que salen del store de Redux. El dibujo 3D lo hace la librería **Three.js**, que dibuja en un `<canvas>`. Para no mezclar las dos cosas, todo lo de Three.js está en la carpeta `src/mapa3d/`, en archivos de JavaScript común sin React, y la vista solo le habla a través de un objeto 'motor' con métodos."*

```
NavCliente / CatalogoView ──clic──> capturarPagina()   (copia la página que se estaba viendo)
        │
        ▼
App.jsx  ruta /mapa-3d ──> Mapa3DView.jsx   (React: estado, menú, avisos, Redux)
                               │  iniciarMapa(contenedor, opciones)
                               ▼
                           motorMapa.js     (cámara, teclado, mouse, choques, transiciones, día/noche)
                               │  crearMapa()
                               ▼
                           escenaMapa.js    (suelo, caminos, árboles, construcciones, viento, luces)
                               │
             ┌─────────────────┼──────────────────┬──────────────┐
          plano.js        relieve.js          modelos/*.js    fusion.js
        (dónde va cada   (altura del suelo)  (cabaña, galpón,  (juntar mallas
         cosa: datos)                         casa)            para que ande rápido)

  motorMapa también usa: cielo.js (sol, luna, nubes, estrellas) y sonido.js (Web Audio)
  Mapa3DView también usa: posterPagina.js (dibuja la página en el cartel) y utils/fundido.js
```

**Reparto de tareas en una frase:** `plano.js` dice *dónde* va cada cosa, `relieve.js` dice *a qué altura*, `escenaMapa.js` lo *construye*, `motorMapa.js` lo *hace andar* y `Mapa3DView.jsx` lo *conecta con el sitio*.

---

## Parte 0: Cómo se entra al recorrido

### `components/layout/NavCliente.jsx` y `views/CatalogoView.jsx`
- **Qué hacen (en esta parte):** tienen el `<Link to="/mapa-3d">` "Recorrido virtual" (en la barra es un botón flotante, `.nav-recorrido`).
- El `onClick` llama a **`capturarPagina()`** (de `posterPagina.js`) antes de cambiar de ruta: guarda una copia de lo que se estaba viendo, para que esa misma página sea la que aparece en el cartel de la entrada.
- *"Por eso, cuando entrás, la página parece achicarse y meterse en el cartel: es una copia de la página que estabas mirando."*

### `App.jsx`
- **Qué hace (en esta parte):** declara la ruta `/mapa-3d` y le pasa a `Mapa3DView` las props: `idioma`, `setIdioma`, `tema`, `onToggleTema`, `onLogout`, `onAbrirDetalle`, `detalleAbierto` (es `espacioSeleccionado !== null`).
- *"El detalle de una cabaña es el mismo modal que en el catálogo: el recorrido no tiene uno propio, llama a `onAbrirDetalle` igual que una tarjeta."*

### `components/layout/MainLayout.jsx`
- **Qué hace (en esta parte):** en `/mapa-3d` no muestra la barra ni el pie (`enMapa`), porque el mapa ocupa toda la ventana. Las opciones de la barra pasan al menú de Escape.

---

## Parte 1: La vista — `views/Mapa3DView.jsx`

*"Este es el único componente de React del recorrido. Arma el motor 3D cuando se monta, lo destruye cuando se desmonta y dibuja encima todo lo que es interfaz."*

### Parámetros (props)
| Prop | Para qué |
|---|---|
| `idioma`, `setIdioma` | textos en español o inglés; el menú tiene el botón de idioma |
| `tema`, `onToggleTema` | claro u oscuro. En el mapa, **oscuro = noche** |
| `onLogout` | botón "Cerrar sesión" del menú |
| `onAbrirDetalle(espacio)` | abre el modal de detalle de un espacio (el mismo del catálogo) |
| `detalleAbierto` | si el modal está abierto, el recorrido se pone en pausa |

### Lee del store (Redux)
- `state.auth.isLogged`: qué botones muestra el menú (Mis reservas y Cerrar sesión, o Iniciar sesión y Registrarse).
- `state.espacios.items`: los espacios del back, para saber el nombre y el precio de cada construcción.
- `state.carrito.avisoMapa`, `state.carrito.data.items.length`, `state.carrito.abierto`: el ícono de aviso y el carrito.

### Despacha
- `fetchEspacios()` al montar (`useEffect` con `[dispatch]`).
- `setAbrirAlAgregar(false)` al entrar y `setAbrirAlAgregar(true)` al salir (en el `return` del efecto, que es la **limpieza del desmontaje**). Así, en el recorrido, agregar al carrito no abre el panel encima del mapa: aparece un ícono con un punto (`avisoMapa`).
- `abrirCarrito()` desde el ícono o el botón del menú.

### Estado local (`useState`)
| Estado | Qué guarda |
|---|---|
| `fase` | `'poster'` (transición de entrada), `'libre'` (recorriendo) o `'vuelta'` (volviendo a la página) |
| `menu` | si el menú de pausa (Escape) está abierto |
| `aerea`, `aereaLista` | vista aérea pedida / la cámara ya llegó arriba (recién ahí se muestran los botones) |
| `silencio` | sonido apagado (tecla M) |
| `cerca` | la construcción en cuyo frente está la persona (para el aviso "E Ver detalle") |
| `verCasa` | panel con la lista de habitaciones de la casa principal |
| `captura` | la copia de la página tomada al hacer clic en "Recorrido virtual" |
| `[, setTamano]` | solo para volver a dibujar si cambia el tamaño de la ventana (reubica los botones de la vista aérea) |

### Referencias (`useRef`)
*"`useRef` guarda un valor que sobrevive entre renders pero que, al cambiar, **no** vuelve a dibujar el componente. También sirve para tener a mano un elemento del DOM, como el `<div>` donde Three.js pone su canvas."*
- `contenedorRef`: el `<div>` donde se monta el canvas 3D.
- `posterRef`: el `<div>` con la página que se ve durante las transiciones.
- `motorRef`: el objeto que devuelve `iniciarMapa` (para llamar a sus métodos desde los botones).
- `elegirRef`, `temaRef`: el motor guarda las funciones del primer render; con una ref siempre usa la versión actual.
- `liberandoRef`: marca que el mapa soltó el mouse a propósito (al inspeccionar o en la vista aérea), para no abrir el menú en ese caso.
- `menuAbiertoEn`, `temaAnterior`, `inspeccionAnterior`: valores anteriores para comparar.

### Efectos (`useEffect`)
1. **Armar y desarmar el motor** (`[]`, solo al montar): espera 120 ms para que primero se pinte la página, llama a `iniciarMapa(...)`, pone día o noche, dibuja el póster y arranca la transición de entrada. El `return` llama a `motor.destruir()`.
   *"Es el mismo patrón que vimos para el GET al montar, pero acá lo que se 'trae' es la escena 3D, y el desmontaje la libera para no dejar el canvas, los eventos y el sonido andando."*
2. **Cambio de tema** (`[tema, fase]`): `motor.setNoche(...)` y redibuja el póster del cartel con los colores nuevos (con fundido).
3. **Pausa** (`[pausa]`): `motor.setPausa(pausa)`. Hay pausa durante la transición, con el menú, inspeccionando o en la vista aérea.
4. **Volver a tomar el mouse al cerrar un detalle** (`[inspeccionando, aerea]`).
5. **Teclas de la vista** (Escape, C, F, M): se agrega el `keydown` y se saca en la limpieza.
6. **`blur`**: si se hace clic fuera de la ventana mientras se recorre, aparece el menú de pausa.
7. **`resize`**: actualiza `setTamano`.
8. **Vuelta a la página** (`[fase, captura, navigate]`): cuando `fase === 'vuelta'`, llama a `motor.empezarVuelta(...)` y al terminar navega a la ruta de la captura (o a `/catalogo`).

Además hay un **`useLayoutEffect`**: es como `useEffect`, pero corre **antes de que el navegador pinte**. Se usa para poner el fondo del sitio y la copia de la página en el `<div>` del póster sin que se vea un parpadeo.

### Métodos
- `nombreCorto(nombre)`: los nombres del back vienen "Español / English"; devuelve la parte del idioma elegido.
- `espacioDe(datos)`: busca el espacio del back que corresponde a una construcción del mapa (por tipo, y en las cabañas por una palabra del nombre: `CLAVE_CABANA`).
- `inspeccionar()`: suelta el mouse sin abrir el menú.
- `elegir(datos)`: lo que pasa al hacer clic (o E) sobre algo:
  - en el **cartel** → `volverAPagina()`;
  - en la **casa** → muestra el panel con sus habitaciones;
  - en una **cabaña o el galpón** → `onAbrirDetalle(espacio)`.
- `alCambiarBloqueo(tomado)`: el navegador avisa cuando toma o suelta el mouse; si lo soltó con Escape, abre el menú.
- `seguirExplorando()`: cierra el menú y vuelve a tomar el mouse.
- `volverAPagina()`: pone `fase = 'vuelta'`.
- `cambiarSonido()`, `cambiarAerea(valor)`, `aparecerEn(destino)`: sonido, vista aérea y aparecer frente al galpón, la casa o las cabañas (`DESTINOS`).
- `cerrarCasa()`: cierra el panel de la casa y sigue explorando.

### Lo que dibuja (JSX)
- `.mapa3d-lienzo`: el `<div>` del canvas.
- `.mapa3d-poster`: la página copiada (o el catálogo si se entró escribiendo la dirección).
- `.mapa3d-ayuda`: la lista de teclas.
- `.mapa3d-carrito`: el ícono de aviso del carrito.
- `.mapa3d-mira`: el puntito del centro de la pantalla (lo que está ahí es lo que se elige con el clic).
- Botones de la vista aérea, ubicados con `motor.proyectar(...)`.
- `.mapa3d-menu`: el menú de pausa (con los mismos botones de tema, idioma y carrito que la barra).
- `.mapa3d-aviso`: "nombre, precio, E Ver detalle" al llegar al frente de una construcción.
- `.mapa3d-panel`: las habitaciones de la casa principal (cada una abre su detalle).

*"Fíjense que todo es renderizado condicional con `&&`, como vimos: el menú solo existe si `menu` es true, el aviso solo si hay algo `cerca`, etcétera."*

### `views/Mapa3DView.css`
- Estilos de todo lo anterior. El mapa es `position: fixed` y ocupa la ventana; el resto va encima con `z-index`.

---

## Parte 2: El motor — `mapa3d/motorMapa.js`

*"Este archivo no es de React. Es una función que recibe un `<div>`, arma Three.js adentro y devuelve un objeto con métodos para que la vista lo maneje."*

### `iniciarMapa(contenedor, opciones)`
- **`contenedor`**: el `<div>` donde se pone el canvas.
- **`opciones`** (funciones que la vista le pasa para enterarse de lo que pasa):
  - `alElegir(datos)`: clic o E sobre una construcción o el cartel.
  - `alAcercarse(datos)`: al llegar al frente de una construcción (`null` al alejarse).
  - `alCambiarBloqueo(tomado)`: el navegador tomó o soltó el mouse.
  - `alVistaAerea(arriba)`: la cámara terminó de subir o bajar.
  - `camara`, `aerea`: solo para la página de prueba (`visor-mapa.html`).
- *"Son como las props de un hijo que avisa al padre: el motor 'sube' eventos llamando a estas funciones."*

**Qué arma al empezar:**
- El `WebGLRenderer` (el que dibuja en el canvas), con sombras.
- La escena, con `crearMapa()` de `escenaMapa.js`.
- Dos luces: una `HemisphereLight` (luz general del cielo) y una `DirectionalLight` (el sol, que hace las sombras).
- El cielo (`crearCielo`) y el sonido (`crearSonido`).
- La cámara en perspectiva, a **1,65 m** del suelo (la altura de los ojos), parada 4 m delante del cartel.

**Variables de estado internas (no son de React):** `jugador` (`x`, `z`, `giro`, `inclinacion`), `teclas` (qué teclas están apretadas), `cerca`, `pausado`, `transicion`, `vuelta`, `hora`, `vista`.

**Eventos que escucha:** `keydown`, `keyup`, `mousemove`, `resize`, `pointerlockchange` y `click` en el canvas. Todos se sacan en `destruir()`.

**Funciones internas:**
- `alBajar(e)` / `alSubir(e)`: guardan qué tecla está apretada. La E elige lo que está cerca.
- `alMover(e)`: con el movimiento del mouse cambia `giro` (izquierda/derecha) e `inclinacion` (arriba/abajo, con un límite).
- `bloquear()`: pide el **Pointer Lock** (el navegador esconde el cursor y lo deja girar sin salirse de la ventana; Escape lo suelta).
- `alHacerClic()`: si el mouse no está tomado, lo toma; si ya lo está, tira un **rayo** (`Raycaster`) desde el centro de la pantalla y se fija qué toca: el póster o una construcción.
- `rectPoster()`: calcula dónde está el póster en la pantalla (en píxeles), para que la página copiada lo acompañe en las transiciones.
- `moverTransicion(ahora)`: mueve la cámara desde pegada al póster hasta la persona, con una curva suave.
- **`cuadro(ahora)`**: el bucle principal. Se llama unas 60 veces por segundo con `requestAnimationFrame` y en cada vuelta:
  1. si hay transición o vuelta, solo mueve la cámara;
  2. avanza el cambio de hora si está en curso;
  3. mueve a la persona según las teclas (W A S D o flechas, Shift corre), **probando cada eje por separado** con `puedeEstar` (así se desliza contra las paredes en vez de frenarse);
  4. hace sonar un paso cada ~0,5 s (en piedra o en pasto);
  5. actualiza el viento y las hojas del sonido;
  6. ubica la cámara (mezclando con la vista aérea si hace falta);
  7. avisa si se llegó al frente de una construcción o del cartel;
  8. mueve árboles, humo, faroles, plantas y nubes, y dibuja.

### Métodos que devuelve (los que usa la vista)
| Método | Qué hace |
|---|---|
| `bloquear()` | toma el mouse |
| `liberar()` | lo suelta |
| `setPausa(valor)` | en pausa no se camina ni se mira; además suelta todas las teclas |
| `setSilencio(valor)` | apaga o prende el sonido |
| `setAerea(valor)` | sube a la vista aérea o vuelve a la persona |
| `irA(x, z, mira)` | aparece en ese lugar, mirando hacia el punto `mira` |
| `proyectar(x, y, z)` | posición en pantalla de un punto del mapa (para poner los botones encima) |
| `setPoster(lienzo, fundido)` | pone un canvas como imagen del póster; con `fundido`, el nuevo aparece de a poco encima del anterior |
| `empezarTransicion({ alMover, alTerminar })` | transición de entrada (del póster a la persona) |
| `empezarVuelta({ alMover, alTerminar })` | al revés, en dos etapas: se para frente al cartel y después se acerca al póster |
| `setNoche(noche)` | pasa al día o a la noche. La primera vez es directo; después el cielo gira siempre hacia adelante hasta la posición nueva (unos 2 s), pasando por el atardecer |
| `destruir()` | frena el bucle, cierra el sonido, saca los eventos y libera la memoria de la placa de video |

---

## Parte 3: La escena — `mapa3d/escenaMapa.js`

*"Este es el archivo más largo porque construye todo lo que se ve. Lo importante es que lee los datos de `plano.js` y las alturas de `relieve.js`; no tiene posiciones escritas a mano."*

### `crearMapa(opciones)`
- **Parámetro:** `opciones.anchoPoster` (el póster toma la proporción de la pantalla, así al arrancar la cubre justo).
- **Arma, en orden:**
  1. **El suelo:** una sola malla de triángulos cada 2,5 m. A cada vértice le pone la altura de `altura(x, z)` y un color (pasto, bosque u orilla).
  2. **Caminos, faroles, laguna, portal, cerca y cartel.**
  3. **Las construcciones:** por cada una de `CONSTRUCCIONES` llama a `crearCabana`, `crearGalpon` o `crearCasaPrincipal`, la ubica y la gira. Le agrega una **caja invisible** para el clic (`userData.construccion`).
  4. **Los árboles:** el bosque del borde, las arboledas, el bosque de las cabañas y algunos sueltos. Usa un sorteo **con semilla** (`azar()`), así el bosque sale igual en cada carga.
  5. **Arbustos, flores y pasto.**
  6. **Juntar mallas** (`fusionarEstaticos`): todo lo que no se mueve se junta en pocas mallas para que ande rápido.
- **Devuelve:** `{ escena, construcciones, arboles, luces, vivos, poster, humos, conViento, lamparas }`.

### Funciones exportadas (las usa el motor)
| Función | Parámetros | Qué hace |
|---|---|---|
| `puedeEstar(mapa, x, z)` | el mapa y un punto | **Choques.** `false` si el punto está fuera del terreno, en la laguna (salvo el muelle), en un árbol, dentro de una construcción, en la cerca (solo se pasa por el portal) o en el cartel |
| `alturaPiso(x, z)` | un punto | altura donde pisa la persona (el muelle o el suelo) |
| `aplicarHora(mapa, h, extras)` | `h` de 0 (día) a 1 (noche) | mezcla los colores del cielo, la niebla y las luces pasando por el atardecer, y prende de a poco ventanas, faroles y guirnaldas |
| `moverArboles(mapa, t, camara)` | tiempo en segundos y posición de la cámara | el **viento**: inclina los árboles, mueve el humo y los faroles, y corre los vértices de las plantas cercanas |
| `rafagaEn(t, x, z)` | | fuerza de la ráfaga en un punto (0 a 1), para el sonido |
| `sobrePiedra(x, z)` | | si el punto está sobre un camino (para el sonido de los pasos) |
| `bosqueCerca(mapa, x, z)` | | cuántos árboles hay cerca (0 a 1), para el sonido de las hojas |
| `VIENTO` | | dirección fija del viento `[0.94, -0.34]` |

### Funciones internas más importantes
- `curva(puntos)`: suaviza un recorrido (**Catmull-Rom**) para que los caminos doblen en curva.
- `libre(x, z, margen)`: si se puede poner un árbol ahí (no en un camino, una construcción o la laguna).
- `texturaPiedras()`: dibuja las piedras del camino en un `<canvas>` y lo usa como textura.
- `cinta(...)`, `disco(...)`, `losa(...)`, `explanada(...)`: arman los caminos, sus uniones, el patio de la casa y la explanada del galpón siguiendo el suelo.
- `farolesDe(r, luces)`: pone faroles cada 12 m a lo largo de un camino, alternando el lado.
- `laguna()`: el agua, las rocas de la orilla y el muelle.
- `letrero(texto)`: la tabla con el nombre del complejo (dibujada en un canvas).
- `cercaEntrada()`, `portal()`, `cartel(ancho)`: la entrada.
- `mallasPorZona(piezas)`: junta las plantas en zonas de 24 m; así el viento solo mueve las cercanas a la cámara.
- `chimenea(escena, base)`: las bocanadas de humo.

*"El viento no es física de verdad: es una onda (un seno) que avanza por el terreno en la dirección del viento. Donde la onda está alta, los árboles se inclinan más."*

---

## Parte 4: Los datos del lugar — `plano.js` y `relieve.js`

### `mapa3d/plano.js` (solo datos)
*"Es el 'plano' del complejo. Si quiero mover una cabaña, cambio un número acá y se mueven solos su camino, sus faroles y su zona plana."*
- **Coordenadas en metros:** X hacia el este, Z hacia el sur.
- **Constantes:**
  - `TERRENO`: los límites del mapa.
  - `CARTEL`, `ENTRADA`: dónde van.
  - `CONSTRUCCIONES`: id, tipo, nombre, posición y hacia dónde mira cada una.
  - `LAGO`: el contorno, el nivel del agua y el muelle.
  - `ARBOLEDAS`, `BOSQUE_CABANAS`: zonas de árboles.
  - `CAMINO`, `SENDEROS`, `ANCHO_SENDERO`, `SEPARACION_FAROLES`.
  - `HUELLAS`: el rectángulo que ocupa cada tipo de construcción.
  - `LLEGADA`: a qué distancia del centro está su frente.
- **Funciones:**
  - `rotacion(c)`: el ángulo para que la construcción mire a su punto `mira`.
  - `aTerreno(c, lx, lz)`: pasa un punto de las coordenadas del modelo a las del terreno.
  - `dentroLaguna(x, z)`: si el punto está dentro del contorno (prueba del rayo).
  - `distLaguna(x, z)`: distancia al borde de la laguna.

### `mapa3d/relieve.js` (la altura del suelo)
- `bosque(x, z)`: cuánto se mete un punto en el bosque del borde (positivo = bosque, negativo = claro).
- `altura(x, z)`: colinas hechas con sumas de senos, el bosque del borde que sube, **zonas planas** donde van las construcciones y la entrada, y la laguna hundida.
- `alturaSuelo(x, z)`: la altura **exacta sobre los triángulos dibujados** (no sobre la curva). Así la persona, los árboles y los caminos apoyan justo en el suelo y no flotan.
- `suave(t)`: curva suave de 0 a 1 (se usa para mezclar).
- `MALLA`: el tamaño de la grilla del suelo.

---

## Parte 5: Cielo y sonido

### `mapa3d/cielo.js`
- **`crearCielo(escena)`**: agrega el sol, la luna, 6 nubes y 500 estrellas, todo dentro de un grupo que **sigue a la cámara** (así parece infinitamente lejos).
- El sol y la luna usan los **mismos dibujos del sitio** (`public/ornamentos.svg`): se leen con `fetch` y se dibujan en un canvas.
- **Constantes:** `FASE_DIA = 60` y `FASE_NOCHE = 240`. El sol y la luna van en el mismo círculo, uno enfrente del otro; la "fase" es el ángulo y siempre avanza (sale por el este y se pone por el oeste).
- **Devuelve:**
  - `setFase(grados)`: ubica el sol y la luna y devuelve la hora `h` (0 día, 1 noche) según qué tan alto está el sol.
  - `direccionLuz()`: de dónde viene la luz (el sol o la luna), para la luz que hace las sombras.
  - `mover(t, posicionCamara, viento)`: sigue a la cámara y corre las nubes con el viento.

### `mapa3d/sonido.js`
*"No hay archivos de audio: todo se genera con la **Web Audio API** del navegador, a partir de ruido."*
- **`crearSonido()`** devuelve:
  - `iniciar()`: crea el `AudioContext`. El navegador solo deja sonar después de un clic o una tecla, por eso se llama recién ahí.
  - `actualizar(t, fuerza, bosque, noche)`: sube o baja el viento (ruido grave filtrado) y las hojas (ruido agudo) según la ráfaga y los árboles cercanos. De noche suenan grillos.
  - `paso(superficie)`: un paso en `'piedra'` o `'pasto'` (chasquidos cortos al azar).
  - `setSilencio(valor)`: la tecla M.
  - `cerrar()`: cierra el contexto (lo llama `destruir()`).

---

## Parte 6: El póster del cartel — `mapa3d/posterPagina.js`

*"El cartel de la entrada muestra la página desde la que entraste. Para eso hay que convertir el HTML en una imagen, porque Three.js solo puede pegar imágenes sobre una superficie."*
- `capturarPagina()`: se llama en el clic de "Recorrido virtual". Clona los hijos de `.app` (barra, página y pie) y guarda la ruta y cuánto se había bajado (`arriba`).
- `leerCaptura()` / `olvidarCaptura()`: la vista la lee una vez y la borra.
- `dibujarPoster(raiz)` (asíncrona): recorre los elementos de `raiz`, lee su posición con `getBoundingClientRect()` y su estilo con `getComputedStyle()`, y los vuelve a dibujar en un `<canvas>`:
  1. el fondo con el degradé del tema;
  2. las cajas (fondo y borde);
  3. las fotos;
  4. los ornamentos SVG;
  5. los textos, renglón por renglón.

  Devuelve el canvas, que el motor usa como textura (`setPoster`).
- Funciones de apoyo: `cargarImagen`, `dibujarCubriendo` (recorta como `object-fit: cover`), `recortador`, `contorno` (respeta el `border-radius`), `aDataUrl`, `svgSuelto`, `dibujarTexto`.

---

## Parte 7: Los modelos y las piezas

*"Las construcciones están hechas con cajas y prismas de Three.js, con las medidas en metros que fijamos en `disenos/REGLAS_MAPA_3D.md`."*
- **`modelos/cabana.js`**:
  - `CABANA`: las medidas.
  - `VARIANTES`: cedro, pinos, roble y arroyo (cambia el color de la chapa y un accesorio).
  - `crearCabana({ variante })`.
- **`modelos/galpon.js`**: `GALPON`, `crearGalpon()` (granero con pérgola).
- **`modelos/casaPrincipal.js`**: `CASA`, `crearCasaPrincipal()` (planta en U de piedra, con dos alas de 3 habitaciones).
- **`piezas.js`**: lo más básico:
  - `material(color)` (con caché);
  - `caja(...)`;
  - `hastial(...)` (el triángulo del techo);
  - `techoDosAguas(...)`;
  - `personaReferencia()` (solo para el visor de trabajo).
- **`aberturas.js`**:
  - `ventana`, `puerta`, `contraventanas`, `porton`, `ventanaRedonda`;
  - `paredConAberturas({...})`: arma una pared con huecos y revisa las reglas de distancia.
- **`detalles.js`**:
  - **De las construcciones:** troncos (`tronco`, `rellenoTroncos`, `hastialTroncos`), la chapa (`nervadurasChapa`), barandas, escaleras, humo.
  - **Exteriores:** farol, barril, cajón, cerco, pasto.
  - **Accesorios:** banco, leñero, parrilla, canoa, guirnalda, mesa larga.

  Algunas piezas llevan marcas en `userData` (`esVidrio`, `esLuz`, `esFarol`, `esLampara`, `esPasto`, `esHumo`) para que la escena las encuentre después (para prenderlas de noche, moverlas con el viento o sacarlas).
- **`fusion.js`**:
  - `juntar(piezas)`: junta muchas piezas chicas en una sola geometría con color por vértice. A las plantas les guarda un "peso" por vértice para el viento.
  - `fusionarEstaticos(raiz, saltear)`: junta todas las mallas quietas en **una malla por material**.

  *"Al principio el mapa tenía miles de mallas y andaba muy lento. La placa de video dibuja mucho más rápido pocas mallas grandes que miles de mallas chicas."*

---

## Parte 8: Transiciones del sitio (las usa el recorrido)

### `utils/fundido.js`
- `fundirYNavegar(navigate, ruta, antes, duracion = 420)`: una capa con el fondo del sitio aparece de a poco, se cambia de ruta por debajo y la capa se va. `antes` es una función opcional que corre justo antes de navegar (por ejemplo, cerrar el carrito). Se usa en los botones del menú del recorrido y para pasar al checkout.
- `cruzarYNavegar(navigate, ruta, duracion = 450)`: fundido cruzado. Copia lo que se ve, cambia de ruta enseguida y la copia se desvanece encima. Desde el recorrido no se usa, porque el canvas 3D no se puede copiar así.

### `components/ui/LinkFundido.jsx`
- **Props:** `to`, `onClick` y el resto (se le pasan al `<Link>`).
- **Método:** `alHacerClic(e)`: si es un clic normal, hace `e.preventDefault()` y usa `cruzarYNavegar`. Con Ctrl o Cmd (otra pestaña), o si ya se está en esa ruta, funciona como un `Link` común.

### `utils/pantallaMensaje.js`
- `mostrarMensaje(texto, accion)`: la pantalla de "Bienvenido" / "Hasta pronto". Aparece, ejecuta `accion` por debajo (el cambio de pantalla o el logout) y se desvanece. La variable `enCurso` evita que se arme dos veces.

### `components/carrito/CarritoDrawer.jsx` (en esta parte)
- En `handleIrACheckout`, si se está en `/mapa-3d`, va al checkout con `fundirYNavegar` y cierra el panel recién al cambiar de pantalla.

### `Redux/carritoSlice.js` (en esta parte)
- `abrirAlAgregar` (true por defecto) y `avisoMapa`. Al agregar al carrito (`fulfilled`): si `abrirAlAgregar` es true, abre el panel; si no, prende `avisoMapa`.
- `setAbrirAlAgregar(valor)`: lo cambia la vista del recorrido al entrar y al salir.

---

## Parte 9: Herramientas de trabajo (no son parte del sitio)

- `visor-modelos.html` + `mapa3d/visor.js`: muestra un modelo con 4 cámaras fijas, una grilla de 1 m y una persona de 1,75 m para comparar el tamaño. Se usó para revisar las medidas.
- `visor-plano.html` + `mapa3d/visorPlano.js`: dibuja el plano en SVG desde arriba y avisa si las distancias no cumplen las reglas.
- `visor-mapa.html` + `mapa3d/visorMapa.js`: el mapa solo, sin el resto del sitio.
- *"Son páginas aparte que Vite sirve en desarrollo. No hay ningún link a ellas desde el sitio."*

---

## Preguntas probables (y respuesta corta)

**¿Por qué el 3D no está hecho con componentes de React?**
Three.js dibuja en un canvas a 60 cuadros por segundo. Si cada movimiento pasara por el estado de React, se volvería a dibujar el componente 60 veces por segundo. Por eso la escena vive en archivos JS comunes y React solo maneja la interfaz de encima.

**¿Por qué usás `useRef` para el motor y no `useState`?**
Porque el motor no se muestra en el JSX: solo necesito tenerlo guardado para llamar a sus métodos. Cambiarlo no tiene que volver a dibujar nada, y eso es justo lo que hace `useRef`.

**¿Qué hace el `return` del `useEffect` del motor?**
Es la limpieza del desmontaje: al salir de `/mapa-3d` llama a `motor.destruir()`, que frena el bucle, saca los `addEventListener`, cierra el sonido y libera la memoria. Si no, seguiría corriendo de fondo.

**¿Cómo sabe a qué cabaña hiciste clic?**
Con un `Raycaster`: tira una línea desde el centro de la pantalla y devuelve lo primero que toca. Cada construcción tiene una caja invisible con sus datos en `userData.construccion`.

**¿Cómo funcionan los choques?**
`puedeEstar(x, z)` revisa el punto contra los árboles (círculos), las construcciones (rectángulos girados), la laguna, la cerca y el cartel. El motor prueba X y Z por separado: si una sola dirección choca, se sigue moviendo en la otra (por eso uno se desliza contra la pared).

**¿De dónde salen el nombre y el precio que aparecen en el aviso?**
Del store de Redux (`state.espacios.items`), los mismos datos del catálogo. `espacioDe()` busca qué espacio del back es cada construcción.

**¿Por qué en el recorrido no se abre el carrito al agregar?**
Porque taparía el mapa. Al entrar se despacha `setAbrirAlAgregar(false)` y, en vez del panel, aparece un ícono con un punto. Al salir se vuelve a `true`.

**¿Cómo cambia de día a noche?**
El tema oscuro del sitio es la noche del mapa. `setNoche` hace girar el cielo hacia adelante hasta la nueva posición, y en cada cuadro `aplicarHora` mezcla los colores (día → atardecer → noche) y prende las luces de a poco.

**¿Por qué el mouse desaparece?**
Es la Pointer Lock API del navegador: esconde el cursor y da el movimiento del mouse sin límite, para poder girar sin que se salga de la ventana. Escape lo suelta, y eso abre el menú de pausa.

**¿El sonido son archivos?**
No: se genera con la Web Audio API a partir de ruido filtrado. Por eso no hay que descargar nada.

**¿Por qué el código es tan largo / quién lo hizo?**
Se hizo con ayuda de IA, pero está separado por responsabilidad (datos, relieve, escena, motor, vista) y comentado. Conviene repasar sobre todo `Mapa3DView.jsx` y los métodos que devuelve `iniciarMapa`, que son la "frontera" entre React y el 3D.

---

## Orden sugerido para repasar

1. `Mapa3DView.jsx`: es React, lo más probable que pregunte.
2. Los métodos que devuelve `iniciarMapa` en `motorMapa.js` (la tabla de la Parte 2) y la función `cuadro`.
3. `plano.js`: es corto y explica cómo está organizado el mapa.
4. `puedeEstar`, `aplicarHora` y `moverArboles` en `escenaMapa.js`.
5. El resto, por arriba: con saber qué hace cada archivo alcanza.
