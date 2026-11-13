# Contexto del Proyecto: Nueva Estructura de Lugares y Alojamientos

Este documento sirve como resumen integral de la estructura del sistema para compartir contexto rápido con otros chats, asistentes o integrantes del equipo.

---

## 🌲 Visión General del Negocio

El sistema gestiona la reserva y alquiler de espacios en un complejo turístico rústico de montaña/bosque (*Whispering Pines*).
A partir de la última reestructuración, la oferta de lugares se divide en **3 tipos principales (técnicamente 4 componentes)**:

1. **Cabañas Independientes (`CABANA`)**:
   - Capacidad: **4 a 5 huéspedes**.
   - Espacios autónomos con deck privado, parrilla y hogar a leña.
   - Cantidad en el complejo: **4 cabañas**.
     - *Cabaña del Cedro* ($120 USD/noche)
     - *Refugio de Troncos Los Pinos* ($140 USD/noche)
     - *Cabaña El Roble* ($110 USD/noche)
     - *Chalet del Arroyo* ($160 USD/noche)

2. **Galpón de Fiestas (`GALPON_FIESTAS`)**:
   - Espacio amplio para eventos sociales, banquetes y celebraciones privadas.
   - Capacidad: Eventos de hasta 120 personas.
   - Cantidad en el complejo: **1 galpón**.
     - *Galpón de Fiestas Las Acacias* ($280 USD/día)

3. **Casa Principal**:
   Inmueble mayor con dos componentes interconectados:
   - **3.1. Habitaciones Privadas (`HABITACION_CASA_PRINCIPAL`)**:
     - Capacidad: **2 a 3 huéspedes** por habitación.
     - Cantidad: **6 piezas/habitaciones** individuales:
       - *Habitación 1 (Suite El Bosque)* ($65 USD/noche)
       - *Habitación 2 (Balcón de las Aves)* ($60 USD/noche)
       - *Habitación 3 (Nido de Pinos)* ($55 USD/noche)
       - *Habitación 4 (Valle Verde)* ($60 USD/noche)
       - *Habitación 5 (Rincón de la Colina)* ($55 USD/noche)
       - *Habitación 6 (Mirador Silvestre)* ($70 USD/noche)
     - **Regla de Casa Entera**: Si un cliente desea alquilar la Casa Principal completa, simplemente reserva todas las habitaciones disponibles para las mismas fechas (lo que activa además el descuento automático de 15% Pack Multi-Espacio).
   - **3.2. Salón Común de Comida & Baños Compartidos (`SALON_COMIDA_CASA_PRINCIPAL`)**:
     - Es un **área comunal de libre acceso** para todos los huéspedes que se alojen en cualquiera de las 6 habitaciones de la Casa Principal.
     - Cuenta con estufa a leña, mesas largas de roble, vajilla completa y sector de baños comunales.
     - No requiere pago adicional (está 100% incluido en la tarifa de las habitaciones). En el sistema se muestra con tarifa $0 y ficha informativa.

---

## 🛠️ Arquitectura Técnica y Decisiones de Diseño

### 1. Backend (Spring Boot / Java / JPA / MySQL)
* **Principio de Simplicidad**: Siguiendo las directivas de la cátedra de no sobrecargar la base de datos, la cantidad de huéspedes **no se almacena como columnas en MySQL**, sino que es una convención de negocio y presentación resuelta en el frontend.
* **Entidad `Espacio`**: Mantiene los campos estándar: `id`, `nombre`, `precioBase`, `descripcion`, `tipo`, `imagenes`, `activo`, `descuento`.
* **Enum `TipoEspacio`**:
  ```java
  public enum TipoEspacio {
      CABANA,
      GALPON_FIESTAS,
      HABITACION_CASA_PRINCIPAL,
      SALON_COMIDA_CASA_PRINCIPAL
  }
  ```
* **Limpieza y Carga Inicial (`DataInitializer.java`)**:
  - Al iniciar, se limpian `items_carrito`, `detalles_reserva` y `espacios` anteriores.
  - Se siembran los 12 espacios exactos (4 cabañas + 1 galpón + 6 habitaciones + 1 salón común).
  - Se precargan reservas iniciales de prueba y los usuarios clave (`admin@gmail.com` / `admin`, `cliente@gmail.com` / `1234`, `juan@gmail.com` / `1234`).

### 2. Frontend (React / Vite - Clases 8, 9 y 10)
* **Flujo Unidireccional y Componentes Funcionales**:
  - `CatalogoView` → `EspacioList` → `EspacioCard`: Renderiza las tarjetas del catálogo con la píldora informativa de capacidad en la esquina superior izquierda de cada foto (`👥 4-5 pers`, `👥 2-3 pers • 🍽️ Salón Común`, etc.).
  - `DetalleEspacioView` → `DetalleEspacio`: Muestra la galería de fotos, el badge de categoría y un recuadro explicativo si se trata de una habitación de la Casa Principal (beneficios de comedor común y baños compartidos).
  - `ReservaWidgetForm`:
    - Para cabañas, galpón y habitaciones: Almanaque interactivo de días, cálculo dinámico de noches en USD y botón de agregar al carrito.
    - Para el Salón Común de Comida: Ficha informativa que resalta que el acceso está incluido con cualquiera de las habitaciones, con botón directo para explorar las piezas.
  - `AdminEspaciosView` → `AdminEspacioForm` + `AdminEspacioRow`: Selector de los 4 tipos de espacios para el CRUD administrativo.
* **Textos Bilingües (`textos.js`)**: Soporte completo en español e inglés (`es` / `en`) para todas las categorías, capacidades y descripciones.
