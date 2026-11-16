# Ficha técnica del mapa 3D — Whispering Pines (retro low poly)

> **Estado: v2, con las correcciones del usuario.** Es la referencia obligatoria: **cada modelo se revisa contra esta ficha antes de mostrarlo.** Lo marcado con ❓ falta confirmar.

**Referencia de estilo:** cabaña de troncos low poly sobre pilotes, con techo de chapa marrón acanalada, porche bajo el techo con cruz de vigas en el hastial, escalera de madera, faroles, barriles, cajones, cercos y piedras de paso (imagen del usuario, firmada "Skaior Designs"). Se toma como guía de estilo, no se copia.

---

## 0. Qué se modela

En el mapa hay **3 tipos de construcción**:

| Tipo | Cantidad | Notas |
|---|---|---|
| **Cabaña** (4 a 5 personas) | 4 | Mismo modelo para las cuatro, con variantes de color y accesorios. Ninguna es de dos plantas. |
| **Galpón de fiestas** | 1 | |
| **Casa principal** | 1 | Una sola planta en forma de U: las 6 habitaciones en las alas y la cocina, el comedor y los baños comunales en el centro. |

(En el sistema, la casa principal aparece como 6 habitaciones más el salón común, pero en el mapa es **una sola construcción**.)

---

## 1. Reglas generales

### 1.1 Escala
- **1 unidad = 1 metro.**
- Personaje de referencia: **1,75 m**. Ojos de la cámara a **1,65 m**.
- Caminar a 3,5 m/s y correr a 6 m/s. Con colisiones contra paredes, decks y árboles.

### 1.2 Estilo
- **Sombreado plano, colores planos, sin texturas.** Poca cantidad de lados: troncos y postes de 6 a 8, copas de 5 a 7.
- **Mismo nivel de detalle en todo el mapa.**
- **Iluminación:** de día, luz cálida con sombras suaves. De noche, ventanas encendidas en amarillo, faroles y humo en las chimeneas.
- **El día sigue al modo claro del sitio y la noche al modo oscuro.**
- **Ahorro:** detalle medio. Accesorios (barriles, cajones, cercos) solo donde suman. Los modelos se arman con piezas reutilizables, no con geometría única por construcción.

### 1.3 Paleta
| Uso | Color |
|---|---|
| Troncos y tablas | `#c47a3c` (cara iluminada `#d98f4e`) |
| Vigas, postes, cercos | `#7a4a2a` |
| Chapa del techo de las cabañas | `#8a5230` |
| Techo del galpón | rojo óxido `#9c4a32` |
| Techo de la casa principal | pizarra `#4a5a6a` |
| Piedra (casa, chimeneas, zócalos) | `#8d8a82` / `#6f6c66` |
| Contraventanas | verde musgo `#4f6b3a` |
| Marcos de ventana | `#f2e6cc` |
| Vidrio de día / de noche | `#9fc7d6` / `#ffd27a` |
| Pasto | `#6e9a4a` · Senderos y piedras de paso: `#cfcabd` |
| Agua `#4a8fb0` · Pinos `#2f5a3a` / `#3f7048` | |

Máximo **6 colores** por construcción.

### 1.4 Piezas comunes
Todas las construcciones se arman con las mismas piezas, con las reglas incorporadas.

**Pared con aberturas:** reparte las aberturas sola.
- Mínimo **0,6 m** a la esquina y **0,8 m** entre aberturas.
- Simétricas si no se indica otra cosa.
- Nunca cortan una esquina, una viga ni el techo.
- En los troncos cortan hiladas completas.

**Ventanas:**
| Tipo | Ancho × alto | Antepecho |
|---|---|---|
| Normal | 1,0 × 1,2 | 0,9 |
| Chica | 0,7 × 0,7 | 1,4 |
| Ventanal | 1,8 × 1,6 | 0,6 |
| Angosta de hastial (como la de la referencia) | 0,5 × 1,1 | centrada |

- **En construcciones de troncos** los huecos van por hiladas completas: la ventana normal arranca a **0,75 m** y mide **1,25 m** de alto, y la chica arranca a 1,25 m y mide 0,75 m (las dos terminan a 2,0 m). Las puertas miden 2,25 m.
- **Ninguna ventana puede quedar por encima de la línea del alero** (no tiene que tapar el techo).
- Siempre llevan **marco** (0,08 m, sobresale 0,04 m), **alféizar** y **cruz**.
- **Contraventanas** solo en la casa principal: dos hojas abiertas a los costados.

**Puertas:**
- Normal: 0,9 × 2,1.
- Doble: 1,6 × 2,2.
- Portón corredizo: 4,0 × 3,5.

**Techos:**
- Alero de **0,5 m** y espesor visible de **0,15 m**.
- La chapa de las cabañas lleva **nervaduras verticales cada 0,35 m**.

**Troncos:**
- Hiladas de **0,25 m**, de 8 lados.
- En las esquinas sobresalen **0,3 m** (encastre en cruz).

**Escalones:**
- Huella de 0,3 m y contrahuella de 0,18 m, con pasamanos si son más de 3.

**Barandas:**
- 0,9 m de alto, con postes cada 1,2 m y balaustres verticales cada 0,15 m (como en la referencia).

---

## 2. Cabaña (4 a 5 personas) — 4 unidades

Siguiendo la referencia: cabaña de troncos alta y angosta, sobre pilotes, con el techo muy inclinado que cubre también el porche.

| Parte | Medida |
|---|---|
| Planta cerrada | **6,5 × 6,0 m** (frente × fondo) |
| Pilotes | **0,9 m** de alto, de madera, 6 a 8 en total, con una cruz de refuerzo entre los delanteros |
| Muros | troncos, **2,75 m** (11 hiladas) hasta el arranque del techo |
| Techo | dos aguas de **55°**, chapa acanalada, cumbrera a ≈ 8,3 m del suelo. Se prolonga **2,2 m hacia el frente** para cubrir el porche |
| Altillo | bajo el techo (camas para 2 personas), con la ventana angosta del hastial |
| Porche | **6,5 × 2,2 m** bajo el techo, con baranda de balaustres en 3 lados y **cruz de vigas** en el triángulo del frente |
| Escalera | frontal y centrada, de 5 escalones con pasamanos |
| Chimenea | de piedra, en el faldón trasero, **0,8 × 0,8 m**, asoma 1 m por encima del techo, con humo low poly |
| Accesorios | farol en un poste junto al sendero, 2 barriles, 2 o 3 cajones, piedras de paso hacia el sendero y un tramo de cerco |

**Aberturas:**
- **Frente** (dentro del porche): puerta normal descentrada hacia un lado y 1 ventana normal del otro. En el hastial, la ventana angosta.
- **Laterales:** 1 ventana normal cada uno, centrada.
- **Fondo:** 1 ventana chica.

**Variantes** (mismo modelo; cambian el color de la chapa y un accesorio). Aprobado en la etapa de colores:
| Cabaña | Chapa | Accesorio propio |
|---|---|---|
| Cabaña del Cedro | marrón `#8a5230` | banco en el porche |
| Refugio Los Pinos | verde musgo `#4f6b3a` | leñero con techito al costado |
| Cabaña El Roble | rojo óxido `#9c4a32` | parrilla de ladrillo junto al sendero |
| Chalet del Arroyo | pizarra `#4a5a6a` | canoa apoyada al costado (en el mapa, cerca del agua) |

**De noche:** los vidrios se encienden en amarillo cálido, el farol se prende con luz propia y la escena pasa a luz de luna azulada.

---|---|---|
| Cabaña del Cedro | marrón `#8a5230` | escalera y porche hacia el lago |
| Refugio Los Pinos | verde musgo `#4f6b3a` | escalera lateral al costado del pilote (como en la referencia) |
| Cabaña El Roble | rojo óxido `#9c4a32` | parrilla de ladrillo junto a la escalera |
| Chalet del Arroyo | pizarra `#4a5a6a` | muelle chico hacia el agua |

❓ ¿Te sirven estas variantes, o preferís que las cuatro sean idénticas y solo cambie el color?

---

## 3. Galpón de fiestas (hasta 120 personas) — 1 unidad

| Parte | Medida |
|---|---|
| Planta | **12 × 22 m** |
| Muros | **4,5 m**, de tablas verticales con listones, color madera |
| Techo | **dos aguas simple de 30°, chapa rojo óxido** con nervaduras, cumbrera a ≈ 8 m |
| Zócalo | de piedra, **0,5 m** |
| Anexo de cocina | **5 × 6 m** en el fondo, de 3 m, con techo de una pendiente |
| Pérgola | **12 × 4 m** al frente, con guirnaldas de luces que se encienden de noche |

**Aberturas:**
- **Frente:** portón corredizo al centro y 1 ventana grande (1,2 × 1,5, antepecho 1,0) a cada lado. En el hastial, una ventana redonda de 1,2 m.
- **Laterales:** 4 ventanas grandes cada 4,5 m.
- **Fondo:** puerta normal hacia la cocina.

---

**Aprobado (modelo terminado):**
- **Accesorios:** dos bancos y dos mesas largas bajo la pérgola, dos faroles en el acceso, barriles y cajones junto al anexo, y una rampa de madera frente al portón para salvar el zócalo.
- **De noche:** se encienden las ventanas y el ojo de buey, las guirnaldas de la pérgola y los faroles.

## 4. Casa principal — 1 unidad, una planta en U

Toda de **piedra**, con techo de pizarra y **contraventanas** verdes.

**Planta en U, abierta hacia el sur** (proporciones aprobadas para que las 6 habitaciones den a la galería):
```
              N
 ┌───────────────────────────┐
 │  Cocina + comedor + baños │  bloque central 23 × 7
 ├─────┬───────────────┬─────┤
 │ H1  │               │ H4  │
 ├─────┤     patio     ├─────┤   alas 5,5 × 13,5
 │ H2  │   12 × 13,5   │ H5  │   (3 habitaciones de 4,5 × 5,5)
 ├─────┤   (galería)   ├─────┤
 │ H3  │               │ H6  │
 └─────┘               └─────┘
              S  ← entrada
```

| Parte | Medida |
|---|---|
| Bloque central (cocina, comedor y baños) | **23 × 7 m**, ocupa todo el ancho al fondo |
| Alas | **2**, de **5,5 × 13,5 m**, cada una con **3 habitaciones de 4,5 × 5,5 m** |
| Medida total | **23 × 20,5 m**, con un patio de **12 × 13,5 m** |
| Muros | piedra, **3,0 m**, sobre un zócalo de piedra más oscura de 0,5 m. Esquineros de sillares en las esquinas exteriores |
| Techos | dos aguas de **35°**, pizarra. El del bloque central con la cumbrera a lo largo, el de cada ala entra en el central. Cumbrera a ≈ 6 m |
| Galería | techada, de **2 m**, en los tres lados del patio, con columnas de madera y piso a la altura del zócalo |
| Chimenea | grande, de piedra, sobre el comedor |

**Aberturas:**
- **Habitaciones:** cada una tiene **1 puerta** hacia la galería y **1 ventana normal con contraventanas** hacia afuera. Las de las puntas de las alas suman 1 ventana en la cara sur.
- **Bloque central:** puerta doble hacia el patio y 2 ventanales a los lados. Hacia el norte, 2 ventanas chicas (baños) y 1 puerta normal (cocina).

---

## 5. El mapa

**Aprobado.** Los datos están en `Complejo_Frontend/src/mapa3d/plano.js`, que comparten el plano 2D (`visor-plano.html`) y el mapa 3D. Coordenadas: X al este, Z al sur (norte = −Z).

| Elemento | Aprobado |
|---|---|
| Terreno | **163 × 156 m** (x −75…88, z −98…58), con una franja de bosque denso de 12 m en el perímetro |
| Cartel con póster | 2,5 m de alto (el ancho sigue la proporción de la pantalla), **afuera**, al costado derecho del camino en (4,5; 52), **girado 45°** hacia quien llega. Ahí arranca la transición |
| Portal de entrada | de troncos, 5 m, en z 46, **detrás** del cartel |
| Camino principal | de tierra, 3 m, de sur a norte hasta el frente de la casa. Senderos de 1,5 m y faroles cada 12 m |
| Casa principal | **centro**, en (0, −22), con la U abierta hacia el sur |
| Galpón | **oeste**, en (−45, −14), con la entrada y la pérgola hacia el **sur**. Sendero recto desde el camino |
| Cabañas | **este**, alrededor de un cruce en (47, −37), cada porche mira al cruce. Separadas **al menos 20 m** |
| Arboledas | tres manchas de árboles densos entre la casa y las cabañas, para aislarlas |
| Sendero a las cabañas | sale del camino en z 4 y pasa entre las arboledas, a ≥ 10 m de la casa |
| Laguna | **grande, al norte** (elipse de 56 × 34 m), con muelle en la orilla sur. **Sin arroyo** |
| Fogón comunal | al suroeste de la casa, en (−12, −4) |

Al acercarse a una construcción aparece su nombre y precio. Con un clic se abre el modal de detalle del catálogo. En la casa principal se abre la habitación más cercana o la lista de habitaciones ❓.

---

## 6. Transición

**Hecha.** Al entrar a `/mapa-3d` (desde "Recorrido 3D"):

1. Se sigue viendo la página que se estaba mirando: al tocar "Recorrido 3D" se copia su HTML (`capturarPagina`) y `Mapa3DView` la muestra encima del lienzo mientras se arma el mapa. Si se entra directo por la dirección, se muestra la página principal.
2. El póster del cartel tiene la proporción de la pantalla y la cámara arranca pegada a él, así que lo cubre justo.
3. La cámara retrocede (≈ 2,8 s, suave al arrancar y al frenar) hasta la altura de los ojos, 4 m delante del cartel.
4. La página real se achica siguiendo el rectángulo del póster en pantalla y se desvanece en la segunda mitad.
5. Debajo queda el póster con una copia de la página dibujada en un canvas (`posterPagina.js`: fondo, fotos, ornamentos del sprite, botones y textos en su posición real).

---

## 7. Método de trabajo

1. **Visor aparte:** un modelo por vez, sobre una grilla en metros, con el personaje de 1,75 m y cuatro cámaras fijas (frente, costado, tres cuartos y desde arriba).
2. **Etapas con aprobación:**
   1. Volumen.
   2. Aberturas.
   3. Techo y detalles.
   4. Colores.
3. **Cada versión se revisa con el checklist** antes de mostrarla.

## 8. Checklist de cada modelo
- [ ] ¿Las medidas coinciden con la ficha, comparadas contra la grilla y el personaje?
- [ ] ¿Ninguna abertura a menos de 0,6 m de una esquina ni cortando una viga, un tronco o el techo?
- [ ] ¿Ventanas con marco, alféizar y cruz, y con el antepecho de su tipo?
- [ ] ¿Aberturas simétricas, salvo que la ficha diga otra cosa?
- [ ] ¿Escalones y barandas donde corresponde?
- [ ] ¿Máximo 6 colores, todos de la paleta?
- [ ] ¿Mismo nivel de detalle que los otros modelos?
- [ ] ¿Se ve bien desde las 4 cámaras y a la altura de los ojos?
