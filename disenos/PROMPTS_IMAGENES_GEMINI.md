# Prompts para generar las fotos de los espacios con Gemini

Hay que generar **72 fotos**: 12 espacios con 6 fotos cada uno. Se hacen en **3 chats, uno por categoría**:

| Chat | Espacios | Fotos |
|---|---|---|
| **A. Cabañas** | Cedro, Los Pinos, El Roble, Ciprés | 24 |
| **B. Galpón de fiestas** | Las Acacias | 6 |
| **C. Casa principal** | 6 habitaciones + cocina, comedor y baños | 42 |

Los prompts están **en inglés** porque los modelos de imagen suelen respetar mejor los detalles así.

> **Fotos y capturas no son lo mismo.**
> - Las **72 fotos** las genera Gemini con los prompts de este archivo.
> - Las **16 capturas** de [`referencias_gemini/`](referencias_gemini/) son imágenes del mapa 3D que se le **adjuntan a Gemini** para que copie la forma y los colores de cada construcción.
>
> Las capturas son solo de exteriores, porque el modelo 3D no tiene interiores. Los interiores salen de la descripción escrita.

---

## Cómo usarlo

1. **Abrí un chat nuevo de Gemini por categoría** (3 chats).
2. En cada chat:
   - pegá primero el **Mensaje 1 (contexto común)**;
   - después pegá el **Mensaje 2** de la categoría, **con las capturas adjuntas** que indica cada sección.

   Con esos dos mensajes todavía no tiene que generar nada.
3. Pegá los prompts de fotos **de a uno**. Cada prompt nombra el espacio, así Gemini sabe de cuál se trata aunque el chat sea compartido.
4. **Cuando cambies de espacio dentro del mismo chat**, pegá primero el mensaje "Cambio de espacio" de esa sección. En las cabañas, adjuntá de nuevo las capturas de esa cabaña: así no mezcla, por ejemplo, el techo verde de Los Pinos con el marrón del Cedro.
5. Si una foto sale distinta a las anteriores del mismo espacio, pedile: *"Keep it exactly the same building as in the previous images of this cabin, only change the camera angle"*. También podés adjuntar la foto que sí salió bien.
6. Revisá en cada foto:
   - que no haya **nieve, gente, texto ni carteles**;
   - que el **color del techo** sea el que corresponde.

   Si algo falla, pedile que la regenere corrigiendo solo eso.
7. Descargá cada foto y guardala con el **nombre de archivo** indicado (en minúsculas, sin espacios ni tildes).
8. Poné las 72 fotos en `Complejo_Frontend/public/espacios/` y avisame. Actualizo el `DataInitializer` para que use esas fotos.

> Los chats van a quedar largos (el de la casa tiene 42 fotos). Si en algún momento Gemini empieza a olvidarse cómo es el lugar, abrí un chat nuevo de esa categoría. Pegá otra vez el Mensaje 1 y el Mensaje 2 con las capturas, y seguí desde la foto donde te quedaste.

---

## Mensaje 1 — contexto común (se pega en los 3 chats)

```
I'm creating the photo gallery for the booking website of "Whispering Pines", a small rural lodge complex in a temperate pine-and-oak forest next to a lake. Season: late summer / early autumn, green grass, mild weather. There is absolutely NO snow anywhere.

Style for every image:
- Photorealistic, like professional travel / real-estate photography. Natural light, realistic materials and textures, slight depth of field, 24–35 mm lens.
- Horizontal 3:2 format, with the main subject centered (the website crops the edges in small thumbnails).
- No people, no animals, no text, no signs, no logos, no watermarks.
- Warm, cozy and rustic, but clean and well kept. Not luxury-hotel modern, not a restaurant.

I will attach screenshots of a simple low-poly 3D model of the places. Use them ONLY as a reference for shape, proportions, layout and colors. The photos you generate must be fully photorealistic, NOT low-poly, NOT cartoon, NOT 3D-render style.

Every photo I ask for names the place it shows. Photos of the same place must look identical (same shapes, materials and colors); only the camera angle, the room or the time of day changes.

Don't generate anything yet. I'll describe the places in the next message.
```

---

# Chat A — Cabañas (24 fotos)

**Capturas para adjuntar con el Mensaje 2:** `ref-cedro-1.jpg`, `ref-pinos-1.jpg`, `ref-roble-1.jpg`, `ref-cipres-1.jpg` y `ref-noche-cabana.jpg`.

**Mensaje 2 — las cabañas:**
```
This chat is about the four guest cabins. They are the SAME log cabin model; they differ only in the roof color, one accessory and the surroundings.

The cabin model (exterior):
- Tall, narrow log cabin for 4–5 guests, about 6.5 m wide, raised on short wooden stilts (0.9 m) with an X-shaped brace between the front stilts.
- Walls of horizontal round logs in warm honey-orange wood; the log ends cross and stick out at the corners.
- Very steep gable roof (about 55°) of corrugated metal (the color depends on the cabin, see below). The roof extends forward to cover a full-width front porch.
- Front porch with turned wooden balusters on three sides and a big X of beams in the front gable triangle. A narrow vertical window high in the gable (the loft).
- Centered wooden front stairs with 5 steps and handrails.
- On the porch: an off-center dark-brown wooden door on one side and a window on the other. Window frames are cream (#f2e6cc) with a cross mullion.
- A stone chimney on the back slope of the roof with a thin wisp of smoke.
- Around it: a lantern on a wooden post next to a stepping-stone path, two barrels and a couple of wooden crates, a short rustic fence.

The cabin model (interior): log walls and wooden plank floors; a cast-iron wood-burning stove; a small living area with a sofa bed; a ground-floor bedroom with a double bed; a sleeping loft under the steep roof with 2 single beds, reached by a wooden ladder-stair; a small kitchenette; a small bathroom with a wooden vanity.

The four cabins (attached screenshots, in this order):
1. "Cedar Cabin": BROWN roof (#8a5230). Accessory: a wooden bench on the porch. Surroundings: pines close around, a small grassy clearing. Textiles: cream, rust and forest green.
2. "Pines Cabin": MOSS GREEN roof (#4f6b3a). Accessory: a woodpile of split logs under a small lean-to roof beside the porch. Surroundings: a dense grove of tall pines, pine needles on the ground. Textiles: forest green, cream and mustard.
3. "Oak Cabin": RUST RED roof (#9c4a32). Accessory: an outdoor brick barbecue grill with a small brick chimney at the foot of the porch. Surroundings: broad oak trees around a sunny clearing. Textiles: rust red, cream and brown.
4. "Cypress Cabin": SLATE BLUE-GREY roof (#4a5a6a). Accessory: a wooden canoe upside down on the grass with two paddles. Surroundings: tall cypress and pine trees, a calm lake visible through the trees, with a simple wooden dock. Textiles: slate blue, cream and natural linen.

The last screenshot shows how the cabins look at night (warm light in the windows, the lantern lit).
```

### A1. Cabaña del Cedro — techo marrón, banco en el porche
**Cambio de espacio** (antes de la primera foto no hace falta; adjuntá `ref-cedro-1.jpg` y `ref-cedro-2.jpg` si después volvés a esta cabaña):
```
Now the Cedar Cabin (brown roof, bench on the porch). Attached: its screenshots.
```
1. `cedro-1.jpg`
   ```
   Cedar Cabin, exterior: three-quarter view from the front-left, sunny afternoon. Show the whole cabin with its brown roof, the stilts, the stairs and the bench on the porch.
   ```
2. `cedro-2.jpg`
   ```
   Cedar Cabin, close-up of the front porch: the wooden bench, the balusters and the door, with the pine forest seen from the porch. Soft afternoon light.
   ```
3. `cedro-3.jpg`
   ```
   Cedar Cabin, interior: living area with the wood-burning stove lit, the sofa bed with blankets in cream and rust, the log walls. Cozy late-afternoon light.
   ```
4. `cedro-4.jpg`
   ```
   Cedar Cabin, interior: the ground-floor bedroom with the double bed, log walls, a small window with cream frame looking at pine trees, bedside lamps.
   ```
5. `cedro-5.jpg`
   ```
   Cedar Cabin, interior: the sleeping loft under the steep roof, with 2 single beds and the narrow gable window letting light in. Seen from the top of the ladder.
   ```
6. `cedro-6.jpg`
   ```
   Cedar Cabin, exterior at dusk (blue hour): warm yellow light in all windows, the lantern on the post lit, smoke from the chimney, brown roof.
   ```

### A2. Cabaña Los Pinos — techo verde musgo, leñero
**Cambio de espacio** (adjuntá `ref-pinos-1.jpg`, `ref-pinos-2.jpg` y tu foto `cedro-1.jpg` ya generada):
```
Now the Pines Cabin. It is the same cabin model as the Cedar Cabin photo I attach, but with a MOSS GREEN roof, a woodpile under a small lean-to roof beside the porch and a dense pine grove around it. Attached: its screenshots.
```
1. `pinos-1.jpg`
   ```
   Pines Cabin, exterior: three-quarter view from the front-right, surrounded by tall pines, soft morning light filtering through the trees. Show the whole cabin with its moss-green roof and the woodpile beside the porch.
   ```
2. `pinos-2.jpg`
   ```
   Pines Cabin, close-up of the woodpile under its small lean-to roof next to the porch stairs, with the log wall of the cabin behind it.
   ```
3. `pinos-3.jpg`
   ```
   Pines Cabin, interior: the wood-burning stove lit, a basket of firewood beside it, the sofa bed with a green plaid blanket, log walls. Warm evening light.
   ```
4. `pinos-4.jpg`
   ```
   Pines Cabin, interior: small kitchenette with wooden cabinets, a two-burner stove, enamel mugs, a small wooden table for four by a window with pines outside.
   ```
5. `pinos-5.jpg`
   ```
   Pines Cabin, interior: the ground-floor bedroom with a double bed, green and cream bedding, log walls, morning light through the window.
   ```
6. `pinos-6.jpg`
   ```
   Pines Cabin, exterior at night: the cabin among dark pines, warm yellow light in the windows, the lantern on the post lit, a starry sky with a crescent moon.
   ```

### A3. Cabaña El Roble — techo rojo óxido, parrilla de ladrillo
**Cambio de espacio** (adjuntá `ref-roble-1.jpg`, `ref-roble-2.jpg` y tu foto `cedro-1.jpg`):
```
Now the Oak Cabin. It is the same cabin model as the Cedar Cabin photo I attach, but with a RUST RED roof, an outdoor brick barbecue grill at the foot of the porch and broad oak trees around a sunny clearing. Attached: its screenshots.
```
1. `roble-1.jpg`
   ```
   Oak Cabin, exterior: front three-quarter view in its sunny clearing among oak trees, midday light. Show the whole cabin with its rust-red roof and the brick barbecue beside the path.
   ```
2. `roble-2.jpg`
   ```
   Oak Cabin, close-up of the brick barbecue grill with glowing embers and a wooden prep table beside it, the porch and stairs in the background. Golden-hour light.
   ```
3. `roble-3.jpg`
   ```
   Oak Cabin, interior: living area with the wood-burning stove, the sofa bed with rust-red cushions, log walls, a window looking at oak trees.
   ```
4. `roble-4.jpg`
   ```
   Oak Cabin, interior: the sleeping loft under the steep roof with 2 single beds with rust and cream bedding, light coming through the narrow gable window.
   ```
5. `roble-5.jpg`
   ```
   Oak Cabin, interior: small bathroom with log walls, a wooden vanity with a ceramic basin, a shower with stone tiles, white towels.
   ```
6. `roble-6.jpg`
   ```
   Oak Cabin, exterior at sunset: the cabin seen from the clearing, warm orange sky, light starting to glow in the windows, smoke from the chimney, rust-red roof.
   ```

### A4. Cabaña del Ciprés — techo gris pizarra, canoa, junto a la laguna
**Cambio de espacio** (adjuntá `ref-cipres-1.jpg`, `ref-cedro-2.jpg` (donde se ve la laguna) y tu foto `cedro-1.jpg`):
```
Now the Cypress Cabin. It is the same cabin model as the Cedar Cabin photo I attach, but with a SLATE BLUE-GREY roof, a wooden canoe upside down on the grass beside it and tall cypress and pine trees around, with the lake visible through the trees. Attached: its screenshots.
```
1. `cipres-1.jpg`
   ```
   Cypress Cabin, exterior: three-quarter view among cypress and pine trees, with the canoe on the grass beside it and a glimpse of the lake behind. Slate blue-grey roof. Soft morning light.
   ```
2. `cipres-2.jpg`
   ```
   Cypress Cabin surroundings: the calm lake a short walk from the cabin, a simple wooden dock on posts going into the water, the canoe in the foreground, forest on the far shore. Early morning mist on the water.
   ```
3. `cipres-3.jpg`
   ```
   Cypress Cabin, interior: living area with the wood-burning stove and the sofa bed in slate-blue tones, a window framing the trees and the lake.
   ```
4. `cipres-4.jpg`
   ```
   Cypress Cabin, interior: the ground-floor bedroom with a double bed in natural linen and slate-blue bedding, log walls, a reading lamp, view of the trees.
   ```
5. `cipres-5.jpg`
   ```
   Cypress Cabin, the covered front porch seen from one side: the balusters, two wooden chairs and a small table with two mugs, the forest beyond.
   ```
6. `cipres-6.jpg`
   ```
   Cypress Cabin, exterior at dusk: warm light in the windows, the lantern lit, the lake reflecting the last light of the sky through the trees.
   ```

---

# Chat B — Galpón de fiestas (6 fotos)

**Capturas para adjuntar con el Mensaje 2:** `ref-galpon-1.jpg`, `ref-galpon-2.jpg` y `ref-noche-galpon.jpg`.

**Mensaje 2 — el galpón:**
```
This chat is about "Las Acacias Party Barn", a wooden barn for parties and events of up to 120 guests, in a grassy clearing at the edge of the forest. Attached: screenshots of its 3D model (two by day, one at night).

Exterior (keep it identical in every exterior shot):
- Large rectangular barn, 12 m wide and 22 m long, with walls of vertical wooden boards with battens, in warm medium-brown wood (#b07a45), on a low stone base.
- Simple gable roof (30°) of corrugated metal in RUST RED (#9c4a32).
- Front facade: a big sliding barn door in the center (two leaves, each with an X brace, on a top rail), one large window on each side of it, and a ROUND window high in the front gable. Cream window frames (#f2e6cc).
- Along the sides: 4 large windows on each side.
- At the back, a small single-slope annex for the kitchen.
- In front of the facade, a wooden PERGOLA (12 × 4 m) with strings of warm festoon light bulbs hanging across, long wooden trestle tables and benches under it.
- In front of the pergola, a paved plaza of irregular light-colored stones.
- Two lanterns on wooden posts at the entrance; barrels and crates next to the annex.

Interior: one large open hall with exposed wooden roof trusses, wooden plank floor, long rustic tables, festoon string lights hanging from the beams, the big sliding door open to the pergola. A simple, functional kitchen in the annex (stainless counters, a big stove), suitable for catering.
```

**Nombres de archivo:** `galpon-1.jpg` a `galpon-6.jpg`
1. `galpon-1.jpg`
   ```
   Party Barn, exterior: front three-quarter view of the whole barn in daylight: the rust-red roof, the sliding door, the round gable window, the pergola with tables in front and the stone plaza.
   ```
2. `galpon-2.jpg`
   ```
   Party Barn, the pergola at dusk: festoon lights glowing, long wooden tables set simply with white tablecloths and jars of wildflowers, the barn facade behind. No people.
   ```
3. `galpon-3.jpg`
   ```
   Party Barn, interior of the hall, empty and ready for an event: long rustic tables in rows, exposed wooden trusses, string lights along the beams, daylight through the side windows.
   ```
4. `galpon-4.jpg`
   ```
   Party Barn, interior of the hall set up for a party in the evening: tables with candles and greenery, string lights on, a dance-floor area near the back, warm atmosphere. No people.
   ```
5. `galpon-5.jpg`
   ```
   Party Barn, the kitchen in the back annex: simple stainless steel counters, a large stove, shelves with plates and pots, a window to the forest. Clean and functional, rustic wooden walls.
   ```
6. `galpon-6.jpg`
   ```
   Party Barn, exterior at night from a distance: all its windows and the round gable window lit, the pergola lights glowing, the lanterns on, the dark forest behind.
   ```

---

# Chat C — Casa principal (42 fotos)

Son las 6 habitaciones y el cuerpo central (cocina, comedor y baños). Todo es la **misma casa**, por eso va en un solo chat.

Para que no queden seis habitaciones iguales, cada una toma el **color de la madera del árbol que le da nombre**:

| Habitación | Madera | Ubicación |
|---|---|---|
| Fresno | clara | punta del ala oeste |
| Aliso | rojiza clara | medio del ala oeste |
| Sauce | verdes suaves y mimbre | ala oeste, junto al cuerpo central |
| Abedul | blanca y muy clara | ala este, junto al cuerpo central |
| Nogal | oscura | medio del ala este |
| Olmo | marrón medio | punta del ala este, la más amplia |

**Capturas para adjuntar con el Mensaje 2:** `ref-casa-1.jpg`, `ref-casa-2.jpg`, `ref-casa-3.jpg` (el patio con la galería) y `ref-noche-casa.jpg`.

**Mensaje 2 — la casa:**
```
This chat is about the "Main House", a single-storey STONE house shaped like a U, open to the south. Attached: screenshots of its 3D model (front, three-quarter view, the courtyard, and at night).
- Walls of grey natural stone (#8d8a82) on a darker stone base, with cut-stone quoins at the outer corners.
- Gable roofs (35°) of dark grey-blue SLATE (#4a5a6a).
- The central block at the back holds the shared kitchen, dining room and bathrooms, with a large stone chimney over the dining room. Towards the courtyard it has a double wooden door with a big window on each side.
- Two wings come forward from it, each with 3 guest rooms. The wings and the central block surround a courtyard paved with irregular light stones.
- A covered gallery with wooden columns runs along the three sides of the courtyard. Each guest room has a wooden door onto the gallery and an outward-facing window with GREEN wooden shutters (#4f6b3a) and cream frames.
- A stone path with flowerbeds leads to the courtyard; pine trees around the house.

Guest rooms: about 4.5 × 5.5 m, for 2–3 guests (a double bed plus a single bed, or three single beds). Whitewashed or exposed-stone walls, wooden ceiling beams, wooden floors, simple rustic furniture, a window with green shutters. They do NOT have their own bathroom (the bathrooms are shared, in the central block).

Each room is named after a tree, and its furniture and wood tones follow that tree:
- West wing (from the south end to the central block): Ash Room (light ash wood, corner room with windows on two sides), Alder Room (warm reddish alder), Willow Room (pale wood, wicker, sage green).
- East wing (from the central block to the south end): Birch Room (very pale birch, white), Walnut Room (dark walnut), Elm Room (medium-brown elm, the largest, corner room with windows on two sides).

The central block (shared by all guests) must look like the common area of a rural guesthouse or family country home — NOT a restaurant, NOT a hotel lobby: no bar counter, no many small tables, no menus.
- Kitchen: home-style country kitchen with wooden cabinets, a big farmhouse sink, a gas range, open shelves with plates and jars, a large wooden worktable, stone walls.
- Dining room: ONE long wooden farmhouse table for about 16 people with simple wooden chairs, a big stone fireplace, ceiling beams, windows to the courtyard.
- Bathrooms: shared but tidy, like a guesthouse: stone and white tiles, wooden vanities with several basins, separate shower cubicles with wooden doors.

Keep the house identical in every exterior photo; only the room changes.
```

### C1. Habitación 1 — Fresno (ash)
**Cambio de espacio:** `Now the Ash Room (west wing, south corner).`
1. `fresno-1.jpg`
   ```
   Main House exterior: the west wing seen from the south-west corner, showing the stone walls, the slate roof and the Ash Room at the corner with windows with green shutters on two sides. Sunny morning.
   ```
2. `fresno-2.jpg`
   ```
   Ash Room interior: a corner room with windows on two walls (green shutters open), light ash-wood double bed and single bed, white linen, whitewashed stone walls, ceiling beams. Bright morning light.
   ```
3. `fresno-3.jpg`
   ```
   Ash Room, other angle: a light ash-wood wardrobe and a small desk with a chair under one of the windows, a woven rug on the wooden floor.
   ```
4. `fresno-4.jpg`
   ```
   Ash Room detail: the bedside table in light ash wood with a ceramic lamp and a small vase of wildflowers, the window with green shutters and pine trees outside.
   ```
5. `fresno-5.jpg`
   ```
   Main House, the covered gallery outside the Ash Room: wooden columns, the stone-paved courtyard, the room's wooden door, a bench against the stone wall.
   ```
6. `fresno-6.jpg`
   ```
   Ash Room in the evening: bedside lamps on, warm light on the whitewashed stone, the shutters half closed, a cozy throw on the bed.
   ```

### C2. Habitación 2 — Aliso (alder)
**Cambio de espacio:** `Now the Alder Room (middle of the west wing).`
1. `aliso-1.jpg`
   ```
   Main House, the courtyard seen from the gallery of the west wing: wooden columns, stone paving, the doors of the guest rooms along the gallery. Afternoon light.
   ```
2. `aliso-2.jpg`
   ```
   Alder Room interior: a double bed and a single bed in warm reddish alder wood, terracotta and cream bedding, exposed stone wall behind the beds, ceiling beams.
   ```
3. `aliso-3.jpg`
   ```
   Alder Room, seen from the bed towards the door that opens onto the gallery, with the courtyard visible through the open door.
   ```
4. `aliso-4.jpg`
   ```
   Alder Room detail: a reddish alder-wood chest of drawers with a mirror, a jug and a folded towel, soft light from the shuttered window.
   ```
5. `aliso-5.jpg`
   ```
   Alder Room: the window with green shutters open onto the pine trees, an armchair with a reading lamp and a small bookshelf beside it.
   ```
6. `aliso-6.jpg`
   ```
   Alder Room at night: warm lamps on, terracotta tones, the bed turned down, a woollen blanket at the foot.
   ```

### C3. Habitación 3 — Sauce (willow)
**Cambio de espacio:** `Now the Willow Room (west wing, next to the central block).`
1. `sauce-1.jpg`
   ```
   Main House, the corner of the courtyard where the west wing meets the central block: the gallery turning the corner, wooden columns, stone walls, the slate roofs meeting.
   ```
2. `sauce-2.jpg`
   ```
   Willow Room interior: three single beds in pale wood with soft sage-green bedding, wicker headboards, whitewashed walls, ceiling beams.
   ```
3. `sauce-3.jpg`
   ```
   Willow Room, other angle: a wicker armchair, a pale wooden wardrobe, a woven willow basket, the window with green shutters.
   ```
4. `sauce-4.jpg`
   ```
   Willow Room detail: wicker bedside lamp, a sage-green ceramic cup on a pale wooden bedside table, linen curtains moving slightly.
   ```
5. `sauce-5.jpg`
   ```
   Main House, the short walk from the Willow Room door along the gallery to the door of the central block (kitchen and dining room), stone paving, wooden columns.
   ```
6. `sauce-6.jpg`
   ```
   Willow Room in the evening: warm lamp light, sage and cream tones, the three beds made, a calm and simple atmosphere.
   ```

### C4. Habitación 4 — Abedul (birch)
**Cambio de espacio:** `Now the Birch Room (east wing, next to the central block).`
1. `abedul-1.jpg`
   ```
   Main House, the courtyard seen from the east wing gallery: stone paving, wooden columns, the central block with its double door and chimney.
   ```
2. `abedul-2.jpg`
   ```
   Birch Room interior: a double bed and a single bed in very pale birch wood, white and light-grey bedding, whitewashed stone, ceiling beams painted white. Very bright and airy.
   ```
3. `abedul-3.jpg`
   ```
   Birch Room: the window looking onto the courtyard and gallery through green shutters, a pale birch desk and chair under it.
   ```
4. `abedul-4.jpg`
   ```
   Birch Room detail: decorative birch logs with white bark in a corner, a white ceramic lamp, a light wool throw.
   ```
5. `abedul-5.jpg`
   ```
   Birch Room seen from the door: the whole room, pale wood furniture, light floor, white walls, morning light.
   ```
6. `abedul-6.jpg`
   ```
   Birch Room at dusk: lamps on, soft warm light on white walls, blue twilight in the window.
   ```

### C5. Habitación 5 — Nogal (walnut)
**Cambio de espacio:** `Now the Walnut Room (middle of the east wing).`
1. `nogal-1.jpg`
   ```
   Main House exterior: the east wing seen from outside the U, stone walls with windows with green shutters, slate roof, pine trees. Afternoon light.
   ```
2. `nogal-2.jpg`
   ```
   Walnut Room interior: a double bed and a single bed with dark walnut headboards, cream and deep green bedding, exposed stone wall, dark ceiling beams. Bright window light balancing the dark wood.
   ```
3. `nogal-3.jpg`
   ```
   Walnut Room: a dark walnut wardrobe and a leather armchair beside the window with green shutters open.
   ```
4. `nogal-4.jpg`
   ```
   Walnut Room detail: a walnut bedside table with a brass lamp, a book and a pair of glasses, cream linen.
   ```
5. `nogal-5.jpg`
   ```
   Walnut Room seen from the bed towards the door onto the gallery, the courtyard and wooden columns visible outside.
   ```
6. `nogal-6.jpg`
   ```
   Walnut Room in the evening: brass lamps on, warm tones of walnut and stone, a cosy wool blanket on the bed.
   ```

### C6. Habitación 6 — Olmo (elm)
**Cambio de espacio:** `Now the Elm Room (east wing, south corner, the largest room).`
1. `olmo-1.jpg`
   ```
   Main House exterior from the south-east, near the entrance road: the end of the east wing with the Elm Room at the corner and its windows on two sides with green shutters, the courtyard opening to the right.
   ```
2. `olmo-2.jpg`
   ```
   Elm Room interior, the largest room: a double bed and a single bed in medium-brown elm wood, windows on two walls with green shutters, exposed stone and ceiling beams, plenty of space.
   ```
3. `olmo-3.jpg`
   ```
   Elm Room: a small sitting corner with two armchairs and a low elm-wood table by a corner window that looks at the entrance road and pine trees.
   ```
4. `olmo-4.jpg`
   ```
   Elm Room detail: an elm-wood bench at the foot of the bed with folded blankets, a woven rug, morning sun on the floor.
   ```
5. `olmo-5.jpg`
   ```
   Elm Room seen from the corner, showing its size: the beds, the wardrobe, the sitting corner and both windows.
   ```
6. `olmo-6.jpg`
   ```
   Elm Room at night: lamps on, curtains drawn, the warm glow on stone and wood.
   ```

### C7. Cocina, comedor y baños (compartidos)
**Cambio de espacio:** `Now the central block: the shared kitchen, dining room and bathrooms. Remember: a country home, NOT a restaurant.`
1. `cocina-1.jpg`
   ```
   Main House exterior: the central block seen from the courtyard: the double wooden door with a big window on each side, the covered gallery with wooden columns, the large stone chimney on the slate roof. Late afternoon.
   ```
2. `cocina-2.jpg`
   ```
   Main House, the shared country kitchen: wooden cabinets, farmhouse sink, gas range, open shelves, a big wooden worktable in the middle with a bowl of fruit and fresh bread. Morning light.
   ```
3. `cocina-3.jpg`
   ```
   Main House, the dining room: one long wooden farmhouse table with simple chairs, the big stone fireplace lit at the end of the room, ceiling beams, windows to the courtyard.
   ```
4. `cocina-4.jpg`
   ```
   Main House, the long dining table set for a shared breakfast: coffee pots, jam jars, bread baskets, enamel mugs, the fireplace in the background. No people.
   ```
5. `cocina-5.jpg`
   ```
   Main House, the shared bathroom: a long wooden vanity with three ceramic basins and round mirrors, stone walls and white tiles, shower cubicles with wooden doors, rolled white towels.
   ```
6. `cocina-6.jpg`
   ```
   Main House, the dining room in the evening: the fireplace lit, warm lamps, the long table with candles, the courtyard dark blue through the windows.
   ```

---

## Las capturas de referencia

Están en [`referencias_gemini/`](referencias_gemini/). Son 16, sacadas del mapa 3D:

| Captura | Qué muestra | Se usa en |
|---|---|---|
| `ref-cedro-1.jpg`, `ref-cedro-2.jpg` | Cabaña del Cedro (la 2 tiene la laguna al fondo) | Chat A |
| `ref-pinos-1.jpg`, `ref-pinos-2.jpg` | Cabaña Los Pinos | Chat A |
| `ref-roble-1.jpg`, `ref-roble-2.jpg` | Cabaña El Roble con la parrilla | Chat A |
| `ref-cipres-1.jpg` | Cabaña del Ciprés | Chat A |
| `ref-noche-cabana.jpg` | Una cabaña de noche | Chat A |
| `ref-galpon-1.jpg`, `ref-galpon-2.jpg` | Galpón de frente y en diagonal | Chat B |
| `ref-noche-galpon.jpg` | Galpón de noche | Chat B |
| `ref-casa-1.jpg`, `ref-casa-2.jpg` | Casa principal de frente y en diagonal | Chat C |
| `ref-casa-3.jpg` | El patio con la galería y las puertas de las habitaciones | Chat C |
| `ref-noche-casa.jpg` | Casa principal de noche | Chat C |
| `ref-complejo-aereo.jpg` | Todo el complejo desde arriba | Opcional, si Gemini se confunde con dónde está cada cosa |

---

## Lista de control

| Chat | Espacio | Archivos | ¿Listo? |
|---|---|---|---|
| A | Cabaña del Cedro | `cedro-1` … `cedro-6` | ☐ |
| A | Cabaña Los Pinos | `pinos-1` … `pinos-6` | ☐ |
| A | Cabaña El Roble | `roble-1` … `roble-6` | ☐ |
| A | Cabaña del Ciprés | `cipres-1` … `cipres-6` | ☐ |
| B | Galpón Las Acacias | `galpon-1` … `galpon-6` | ☐ |
| C | Habitación 1 (Fresno) | `fresno-1` … `fresno-6` | ☐ |
| C | Habitación 2 (Aliso) | `aliso-1` … `aliso-6` | ☐ |
| C | Habitación 3 (Sauce) | `sauce-1` … `sauce-6` | ☐ |
| C | Habitación 4 (Abedul) | `abedul-1` … `abedul-6` | ☐ |
| C | Habitación 5 (Nogal) | `nogal-1` … `nogal-6` | ☐ |
| C | Habitación 6 (Olmo) | `olmo-1` … `olmo-6` | ☐ |
| C | Cocina, comedor y baños | `cocina-1` … `cocina-6` | ☐ |

La **foto 1 de cada espacio es la que aparece en la tarjeta del catálogo**, así que conviene que sea la mejor.

> Las capturas empiezan con `ref-` (`ref-cedro-1.jpg`) y **no** van al sitio. Las fotos generadas se llaman sin prefijo (`cedro-1.jpg`) y son las que van en `Complejo_Frontend/public/espacios/`.
