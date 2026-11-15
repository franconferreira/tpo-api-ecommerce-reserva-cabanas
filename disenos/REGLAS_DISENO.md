# Reglas de diseño — Whispering Pines (Art Nouveau élfico)

Este documento reúne todas las decisiones de diseño acordadas. **Antes de cambiar cualquier cosa visual, revisar que no se rompa ninguna regla.**

- Mockup de referencia: [tema-claro-y-oscuro.html](tema-claro-y-oscuro.html), última captura `temas-v8.png`.
- Generador de ornamentos: [generador/](generador/). Se ejecuta con `python generador/gen4.py generador/plantilla3.html tema-claro-y-oscuro.html`.

**Cómo está aplicado en el TPO (`Complejo_Frontend`):**
- **Variables de cada tema:** en `src/index.css` (`.tema-claro` / `.tema-oscuro`). El estado `tema` vive en `App.jsx`, junto al idioma, y pone la clase en `<div className="app tema-...">`.
- **Ornamentos:** `public/ornamentos.svg` es un sprite generado con `python disenos/generador/gen_tpo.py Complejo_Frontend/public/ornamentos.svg`. No se edita a mano.
- **Componentes:** están en `src/components/ornamentos/Ornamentos.jsx`: `MarcoVentana`, `RinceauTarjeta`, `EsquinasPanel`, `Friso`, `Divisor`, `TituloSeccion`, `IconoTema`, `Medallon`, `BotonTema` y `Voluta`.
- **Botón principal del tema:** clase `.boton-tema`. Los botones existentes toman la forma de cada tema con `--boton-radio`, `--boton-fondo` y `--boton-sombra`.
- **Tarjeta del catálogo:** tiene medida fija (309 × 472) porque sus rinceaux están dibujados para esa forma. Si cambia el tamaño, hay que regenerar el sprite.
- **Mapas 3D:** mantienen su propia interfaz sobre el canvas y no tomaron los colores del tema.

---

## 1. Restricciones del TPO (no negociables)

1. **Solo lo visto en clase.** No introducir técnicas, librerías ni APIs nuevas sin avisar antes. Lo que ya existe en el código fue aprobado por la profesora.
2. **CSS común + SVG inline.** Nada de Tailwind, styled-components ni librerías de UI.
3. **Fuentes desde Google Fonts** con un `<link>` en `index.html`. Es el único agregado externo.
4. **El cambio de tema** se hace con un `useState` en `App` (igual que el idioma), que pone o saca la clase del tema. Los colores van en variables CSS.
5. **Inspiración "élfica" genérica.** No usar nada de *El Señor de los Anillos*: nombres, escritura élfica (tengwar), personajes ni imágenes de las películas.

---

## 2. Dos temas, una sola maqueta

1. **Modo oscuro = "Luz de Luna"; modo claro = "Vitral del Alba".** Al usuario le gusta un poco más el claro.
2. **Misma maqueta para los dos.** El HTML es uno solo y los componentes tienen exactamente el mismo tamaño y la misma ubicación en ambos temas. Solo cambian:
   - los colores (variables CSS);
   - el estilo de algunos elementos puntuales (ver 2.4 y 2.5).
3. **Ningún elemento puede existir en un solo tema.** Por ejemplo, no puede haber una franja, un friso o un adorno que esté en el claro y falte en el oscuro.
4. **Símbolos:** el modo oscuro usa **lunas** y el modo claro usa **soles**, siempre en los mismos lugares:
   - arriba de la ventana principal;
   - en los medallones de las tarjetas;
   - en el centro del separador;
   - a los lados del título de sección;
   - debajo del link activo de la barra.
5. **Los botones principales ("Ingresar", "Ver espacios") tienen forma propia en cada tema**, para distinguir los modos:
   - **Oscuro:** forma de hoja (`border-radius: 40px 4px 40px 4px`), dorado, con aros finos.
   - **Claro:** forma de arco (`border-radius: 30px 30px 6px 6px`), verde salvia, con borde marrón y aro dorado.
   - Mismo tamaño y misma ubicación en los dos.
6. **La ventana principal es simple:** un arco con marco doble y la foto adentro. **Sin vidrio ni vitral** en ningún tema; se probó y no quedó bien.

---

## 3. Paletas

**Usar pocos colores.** Nada de franjas tipo arcoíris (rojo, amarillo, verde, azul…).

### Modo claro (tonos cálidos)
| Uso | Color |
|---|---|
| Fondo | crema durazno `#fcf0db` → `#f3dfbf`, con resplandor dorado arriba y rayos de sol suaves |
| Texto | `#45331f` |
| Títulos | `#33261a` |
| Ornamentos y marcos | oro `#b4853a` |
| Acento principal | verde salvia `#5f7d43` (degradé `#7e9c5c` → `#3e5429`) |
| Acento chico | terracota `#b86a50`, solo en letra manuscrita y links secundarios |

### Modo oscuro
| Uso | Color |
|---|---|
| Fondo | verde noche `#0e1b1e` → `#0a1416`, con estrellas y un resplandor verde azulado arriba |
| Texto | `#c9d6d2` |
| Títulos | `#d6e0dd` |
| Ornamentos y marcos | plata `#c3d2ce` |
| Acento | oro pálido `#f3e7bf` → `#c9b26e` |
| Manuscrita | jade `#8cc4b4` |

---

## 4. Tipografía (igual en los dos temas)

| Elemento | Fuente |
|---|---|
| Logo, títulos (`h1`) y título de sección | **Cinzel Decorative** |
| Barra, botones y títulos de tarjetas | **Marcellus SC** |
| Frases manuscritas ("bienvenidos al bosque", tipo de espacio) | **Tangerine** |
| Texto corrido | **Cormorant Garamond** (itálica en las bajadas) |

---

## 5. Luna y sol "tallados"

1. **No tienen que resaltar.** Se ven como tallados en la misma piedra: **mismo color que los ornamentos**, sin relleno de otro color.
2. **Se dibujan solo con líneas** (contorno doble), con un relieve sutil de luz y sombra (`filter: var(--tallado)`).
3. Las enredaderas pueden **abrazarlos** (enroscarse alrededor).

---

## 6. Rinceaux y coup de fouet (lo más importante)

### 6.1 Generales
1. **Van en los dos temas**: plata en el oscuro, oro en el claro.
2. **Rinceau:** tallo ondulado con volutas, hojas, zarcillos y bayas. **Coup de fouet (latigazo):** curva en S asimétrica que toma impulso y se vuelve sobre sí misma.
3. **Más rinceaux que latigazos**, aunque los dos tienen que estar.

### 6.2 Integración con los componentes
1. **Son parte del componente, no un adorno pegado al costado.** La enredadera **se entrelaza con el borde**: lo cruza pasando por delante y por detrás. Donde pasa por detrás, se corta el trazo.
2. **Tienen que parecer plantas vivas** que nacen de las esquinas y bases y se enredan en el componente. Llevan hojas a los dos lados, brotes laterales, zarcillos y pimpollos.
3. **Abundantes pero no excesivos:** deben verse integrales al componente. Que no queden "dos rinceaux sueltos" y que ningún lado quede vacío. Pero tampoco pueden cubrir el componente entero: tiene que quedar espacio libre.
4. **Se concentran en las esquinas y bases** (los bordes "duros"), pero no exclusivamente: también trepan por los lados, bajan desde el medallón o el símbolo, etc.
5. **Las bases también llevan rinceau:** una enredadera corre desde cada esquina hacia el centro, crece hacia abajo (afuera) y **compensa la asimetría**. El lado con menos planta arriba tiene la enredadera de la base más larga, para que ningún lado se sienta más pesado que el otro.

### 6.3 Forma y dirección
1. **En los costados respetan la silueta del borde:** el tallo va pegado a la línea, sin espirales grandes que rompan la forma del componente.
2. **En las esquinas son más pronunciados:** ahí "brotan" plantas con tallos en latigazo, espirales, brotes y hojas grandes en la base.
3. **Crecen principalmente hacia AFUERA del componente.** Un poco hacia adentro está bien, pero no deben meterse sobre la foto ni sobre el contenido de las tarjetas.

### 6.4 Asimetría y variedad
1. **Composición asimétrica pero equilibrada:** las dos mitades nunca son iguales. Un lado es más tupido que el otro; por ejemplo, la ventana pesa abajo a la izquierda y se aliviana arriba a la derecha.
2. **Cada esquina tiene una planta distinta** (enredadera trepadora, mata, lirio de tallo largo en latigazo, helecho enroscado). No copiar la misma esquina espejada.
3. **Cada tarjeta tiene su propia combinación** de plantas.
4. **No pueden superponerse** las plantas de componentes vecinos (por ejemplo, entre tarjetas). Hay que limitar el alcance lateral.

### 6.5 Sin repetición visible
1. **No se tiene que notar un patrón que se repite**, ni dentro de un mismo componente ni en los frisos.
2. Los tallos ondulan con **ritmo irregular**: la longitud de onda y la amplitud varían, y las hojas, brotes y zarcillos aparecen a intervalos al azar.
3. **Los frisos largos** (debajo de la barra y al pie) se generan de punta a punta sin repetirse. Nada de un patrón chico en mosaico.

---

## 7. Composición general (principios Art Nouveau)

1. **El borde es parte de la obra**, no un simple límite.
2. **Latigazo dominante:** una curva principal que guía la vista; las demás la acompañan.
3. **Las plantas tienen raíz:** nacen gruesas en una esquina o base y se afinan al crecer.
4. **Espacio vacío:** el ornamento enmarca, no tapa.

Referencias:
- [V&A — The whiplash](https://www.vam.ac.uk/articles/the-whiplash)
- [Art Nouveau Explained](https://blog.fineartamerica.com/art-nouveau-explained/)
- [Art Nouveau Graphic Design](https://madegooddesigns.com/art-nouveau-graphic-design/)
- [Grasset, *Méthode de composition ornementale*](https://archive.org/download/methodedecomposi01gras_0/methodedecomposi01gras_0.pdf)

---

## 8. Checklist antes de dar por terminado un cambio visual

- [ ] ¿Usa solo cosas vistas en clase o ya existentes en el proyecto?
- [ ] ¿El componente mide lo mismo y está en el mismo lugar en los dos temas?
- [ ] ¿No hay ningún elemento que exista en un solo tema?
- [ ] ¿Lunas en oscuro y soles en claro, del mismo color que los ornamentos?
- [ ] ¿Pocos colores, dentro de la paleta del tema?
- [ ] ¿Los rinceaux se entrelazan con el borde y crecen hacia afuera?
- [ ] ¿Las esquinas son distintas entre sí y la composición es asimétrica?
- [ ] ¿Ningún lado quedó vacío (incluida la base) y nada quedó cubierto de más?
- [ ] ¿La base compensa al lado más liviano?
- [ ] ¿No se nota un patrón repetido?
- [ ] ¿No se superponen las plantas de componentes vecinos?
- [ ] ¿Nada de propiedad intelectual de *El Señor de los Anillos*?
