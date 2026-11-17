package com.uade.tpo.complejo;

import com.uade.tpo.complejo.entity.Carrito;
import com.uade.tpo.complejo.entity.DetalleReserva;
import com.uade.tpo.complejo.entity.Espacio;
import com.uade.tpo.complejo.entity.Reserva;
import com.uade.tpo.complejo.entity.Usuario;
import com.uade.tpo.complejo.entity.enums.EstadoReserva;
import com.uade.tpo.complejo.entity.enums.Role;
import com.uade.tpo.complejo.entity.enums.TipoEspacio;
import com.uade.tpo.complejo.repository.CarritoRepository;
import com.uade.tpo.complejo.repository.EspacioRepository;
import com.uade.tpo.complejo.repository.ItemCarritoRepository;
import com.uade.tpo.complejo.repository.ReservaRepository;
import com.uade.tpo.complejo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final CarritoRepository carritoRepository;
    private final EspacioRepository espacioRepository;
    private final ReservaRepository reservaRepository;
    private final ItemCarritoRepository itemCarritoRepository;
    private final PasswordEncoder passwordEncoder;

    // Galerías de fotos: están en Complejo_Frontend/public/espacios (las sirve el frontend en /espacios/...).
    // La primera foto de cada lista es la de la tarjeta del catálogo.
    // Las cuatro cabañas son el mismo modelo: cada una tiene su exterior y comparten las fotos de adentro.
    private static final List<String> GALERIA_CABANA_1 = List.of(
            "/espacios/cabana-cedro.jpg",
            "/espacios/cabana-living.jpg",
            "/espacios/cabana-dormitorio.jpg",
            "/espacios/cabana-altillo.jpg",
            "/espacios/cabana-cocina.jpg",
            "/espacios/cabana-bano.jpg",
            "/espacios/cabana-cedro-noche.jpg"
    );
    private static final List<String> GALERIA_CABANA_2 = List.of(
            "/espacios/cabana-pinos.jpg",
            "/espacios/cabana-living.jpg",
            "/espacios/cabana-dormitorio.jpg",
            "/espacios/cabana-altillo.jpg",
            "/espacios/cabana-cocina.jpg",
            "/espacios/cabana-bano.jpg"
    );
    private static final List<String> GALERIA_CABANA_3 = List.of(
            "/espacios/cabana-roble.jpg",
            "/espacios/cabana-living.jpg",
            "/espacios/cabana-dormitorio.jpg",
            "/espacios/cabana-altillo.jpg",
            "/espacios/cabana-cocina.jpg",
            "/espacios/cabana-bano.jpg"
    );
    private static final List<String> GALERIA_CABANA_4 = List.of(
            "/espacios/cabana-cipres.jpg",
            "/espacios/cabana-living.jpg",
            "/espacios/cabana-dormitorio.jpg",
            "/espacios/cabana-altillo.jpg",
            "/espacios/cabana-cocina.jpg",
            "/espacios/cabana-bano.jpg"
    );
    private static final List<String> GALERIA_GALPON = List.of(
            "/espacios/galpon-frente.jpg",
            "/espacios/galpon-salon.jpg",
            "/espacios/galpon-diagonal.jpg",
            "/espacios/galpon-noche.jpg",
            "/espacios/galpon-cocina.jpg",
            "/espacios/galpon-frente-faroles.jpg"
    );
    // Habitaciones: la foto de la habitación y después la casa y los baños compartidos
    private static final List<String> GALERIA_HABITACION_1 = List.of(
            "/espacios/hab-fresno.jpg",
            "/espacios/casa-patio.jpg",
            "/espacios/casa-frente.jpg",
            "/espacios/casa-diagonal.jpg",
            "/espacios/casa-banos.jpg",
            "/espacios/casa-noche.jpg"
    );
    private static final List<String> GALERIA_HABITACION_2 = List.of(
            "/espacios/hab-aliso.jpg",
            "/espacios/casa-patio.jpg",
            "/espacios/casa-frente.jpg",
            "/espacios/casa-diagonal.jpg",
            "/espacios/casa-banos.jpg",
            "/espacios/casa-noche.jpg"
    );
    private static final List<String> GALERIA_HABITACION_3 = List.of(
            "/espacios/hab-sauce.jpg",
            "/espacios/casa-patio.jpg",
            "/espacios/casa-frente.jpg",
            "/espacios/casa-diagonal.jpg",
            "/espacios/casa-banos.jpg",
            "/espacios/casa-noche.jpg"
    );
    private static final List<String> GALERIA_HABITACION_4 = List.of(
            "/espacios/hab-abedul.jpg",
            "/espacios/casa-patio.jpg",
            "/espacios/casa-frente.jpg",
            "/espacios/casa-diagonal.jpg",
            "/espacios/casa-banos.jpg",
            "/espacios/casa-noche.jpg"
    );
    // todavía no hay foto propia de la Habitación del Nogal
    private static final List<String> GALERIA_HABITACION_5 = List.of(
            "/espacios/casa-diagonal.jpg",
            "/espacios/casa-patio.jpg",
            "/espacios/casa-frente.jpg",
            "/espacios/casa-banos.jpg",
            "/espacios/casa-comedor.jpg",
            "/espacios/casa-noche.jpg"
    );
    private static final List<String> GALERIA_HABITACION_6 = List.of(
            "/espacios/hab-olmo.jpg",
            "/espacios/casa-patio.jpg",
            "/espacios/casa-frente.jpg",
            "/espacios/casa-diagonal.jpg",
            "/espacios/casa-banos.jpg",
            "/espacios/casa-noche.jpg"
    );
    private static final List<String> GALERIA_SALON_COMIDA = List.of(
            "/espacios/casa-cocina.jpg",
            "/espacios/casa-comedor.jpg",
            "/espacios/casa-banos.jpg",
            "/espacios/casa-patio.jpg",
            "/espacios/casa-frente.jpg",
            "/espacios/casa-noche.jpg"
    );

    @Override
    public void run(String... args) {
        // 1. Asegurar Usuarios
        Usuario admin = usuarioRepository.findByEmail("admin@gmail.com").orElse(null);
        if (admin == null) {
            admin = Usuario.builder()
                    .username("admin")
                    .nombre("Sarah")
                    .apellido("Chen")
                    .email("admin@gmail.com")
                    .password(passwordEncoder.encode("admin"))
                    .rol(Role.ROLE_ADMIN)
                    .activo(true)
                    .build();
            admin = usuarioRepository.save(admin);

            Carrito carritoAdmin = Carrito.builder().usuario(admin).total(0.0).build();
            carritoRepository.save(carritoAdmin);
        }

        Usuario cliente = usuarioRepository.findByEmail("cliente@gmail.com").orElse(null);
        if (cliente == null) {
            cliente = Usuario.builder()
                    .username("eleanor")
                    .nombre("Eleanor")
                    .apellido("Vance")
                    .email("cliente@gmail.com")
                    .password(passwordEncoder.encode("1234"))
                    .rol(Role.ROLE_CLIENTE)
                    .activo(true)
                    .build();
            cliente = usuarioRepository.save(cliente);

            Carrito carritoCliente = Carrito.builder().usuario(cliente).total(0.0).build();
            carritoRepository.save(carritoCliente);
        }

        Usuario juan = usuarioRepository.findByEmail("juan@gmail.com").orElse(null);
        if (juan == null) {
            juan = Usuario.builder()
                    .username("juanperez")
                    .nombre("Juan")
                    .apellido("Pérez")
                    .email("juan@gmail.com")
                    .password(passwordEncoder.encode("1234"))
                    .rol(Role.ROLE_CLIENTE)
                    .activo(true)
                    .build();
            juan = usuarioRepository.save(juan);

            Carrito carritoJuan = Carrito.builder().usuario(juan).total(0.0).build();
            carritoRepository.save(carritoJuan);
        }

        // 2. Limpieza total de datos anteriores de espacios, carritos y reservas
        itemCarritoRepository.deleteAll();
        reservaRepository.deleteAll();
        espacioRepository.deleteAll();

        // 3. Creación de los nuevos 12 espacios:
        // - 4 Cabañas (4 o 5 personas)
        // - 1 Galpón de Fiestas
        // - Casa Principal: 6 Habitaciones (2 o 3 personas) + 1 Salón de Comida Comunal

        Espacio cabana1 = Espacio.builder()
                .nombre("Cabaña del Cedro / Cedar Cabin")
                .tipo(TipoEspacio.CABANA)
                .descripcion("Cabaña de troncos sobre pilotes, con porche techado y un banco de madera para mirar el bosque. Techo a dos aguas, hogar a leña y capacidad para 4 a 5 personas. / Log cabin on stilts with a covered porch and a wooden bench facing the woods. Gabled roof, wood stove and room for 4 to 5 guests.")
                .precioBase(120.0)
                .imagenes(new ArrayList<>(GALERIA_CABANA_1))
                .activo(true)
                .build();

        Espacio cabana2 = Espacio.builder()
                .nombre("Cabaña Los Pinos / Pines Cabin")
                .tipo(TipoEspacio.CABANA)
                .descripcion("Cabaña de troncos en el corazón del pinar, con leñero propio junto al porche y hogar a leña para las noches frías. Para 4 a 5 personas. / Log cabin in the heart of the pine grove, with its own woodpile by the porch and a wood stove for cold nights. Sleeps 4 to 5.")
                .precioBase(140.0)
                .imagenes(new ArrayList<>(GALERIA_CABANA_2))
                .activo(true)
                .build();

        Espacio cabana3 = Espacio.builder()
                .nombre("Cabaña El Roble / Oak Cabin")
                .tipo(TipoEspacio.CABANA)
                .descripcion("Cabaña de troncos rodeada de robles, con parrilla al aire libre al pie del porche y un claro propio en el bosque. Para 4 a 5 personas. / Log cabin among oak trees, with an outdoor grill by the porch and its own clearing in the woods. Sleeps 4 to 5.")
                .precioBase(110.0)
                .imagenes(new ArrayList<>(GALERIA_CABANA_3))
                .activo(true)
                .build();

        Espacio cabana4 = Espacio.builder()
                .nombre("Cabaña del Ciprés / Cypress Cabin")
                .tipo(TipoEspacio.CABANA)
                .descripcion("La cabaña más apartada del bosque de las cabañas, con canoa propia para salir a la laguna y porche techado sobre pilotes. Para 4 a 5 personas. / The most secluded of the forest cabins, with its own canoe for the lake and a covered porch on stilts. Sleeps 4 to 5.")
                .precioBase(160.0)
                .imagenes(new ArrayList<>(GALERIA_CABANA_4))
                .activo(true)
                .build();

        Espacio galpon = Espacio.builder()
                .nombre("Galpón de Fiestas Las Acacias / Las Acacias Party Barn")
                .tipo(TipoEspacio.GALPON_FIESTAS)
                .descripcion("Galpón de madera para fiestas y eventos de hasta 120 personas, con pérgola de guirnaldas de luces, mesas largas, cocina en el anexo y una explanada de piedra al frente. / Wooden party barn for events of up to 120 guests, with a string-lit pergola, long tables, an annex kitchen and a stone plaza in front.")
                .precioBase(280.0)
                .imagenes(new ArrayList<>(GALERIA_GALPON))
                .activo(true)
                .build();

        Espacio hab1 = Espacio.builder()
                .nombre("Casa Principal - Habitación 1 (Fresno) / Ash Room 1")
                .tipo(TipoEspacio.HABITACION_CASA_PRINCIPAL)
                .descripcion("Habitación del ala oeste de la casa de piedra, en la punta del ala, con ventanas a dos lados y contraventanas de madera. Para 2 a 3 personas; la cocina, el comedor y los baños compartidos están en el cuerpo central. / West-wing corner room in the stone house, with windows on two sides and wooden shutters. Sleeps 2 to 3; the shared kitchen, dining room and bathrooms are in the central wing.")
                .precioBase(65.0)
                .imagenes(new ArrayList<>(GALERIA_HABITACION_1))
                .activo(true)
                .build();

        Espacio hab2 = Espacio.builder()
                .nombre("Casa Principal - Habitación 2 (Aliso) / Alder Room 2")
                .tipo(TipoEspacio.HABITACION_CASA_PRINCIPAL)
                .descripcion("Habitación del medio del ala oeste, con puerta a la galería que rodea el patio de piedra. Para 2 a 3 personas, con acceso a la cocina, el comedor y los baños compartidos. / Middle room of the west wing, opening onto the gallery around the stone courtyard. Sleeps 2 to 3, with access to the shared kitchen, dining room and bathrooms.")
                .precioBase(60.0)
                .imagenes(new ArrayList<>(GALERIA_HABITACION_2))
                .activo(true)
                .build();

        Espacio hab3 = Espacio.builder()
                .nombre("Casa Principal - Habitación 3 (Sauce) / Willow Room 3")
                .tipo(TipoEspacio.HABITACION_CASA_PRINCIPAL)
                .descripcion("Habitación del ala oeste pegada al cuerpo central, la más cerca de la cocina y el comedor. Para 2 a 3 personas, con baños compartidos a pocos pasos. / West-wing room next to the central wing, the closest to the kitchen and dining room. Sleeps 2 to 3, with shared bathrooms a few steps away.")
                .precioBase(55.0)
                .imagenes(new ArrayList<>(GALERIA_HABITACION_3))
                .activo(true)
                .build();

        Espacio hab4 = Espacio.builder()
                .nombre("Casa Principal - Habitación 4 (Abedul) / Birch Room 4")
                .tipo(TipoEspacio.HABITACION_CASA_PRINCIPAL)
                .descripcion("Habitación del ala este pegada al cuerpo central, con ventana al patio y a la galería. Para 2 a 3 personas, con acceso a la cocina, el comedor y los baños compartidos. / East-wing room next to the central wing, with a window onto the courtyard and gallery. Sleeps 2 to 3, with access to the shared kitchen, dining room and bathrooms.")
                .precioBase(60.0)
                .imagenes(new ArrayList<>(GALERIA_HABITACION_4))
                .activo(true)
                .build();

        Espacio hab5 = Espacio.builder()
                .nombre("Casa Principal - Habitación 5 (Nogal) / Walnut Room 5")
                .tipo(TipoEspacio.HABITACION_CASA_PRINCIPAL)
                .descripcion("Habitación del medio del ala este, tranquila y luminosa, con puerta a la galería del patio. Para 2 a 3 personas, con acceso a los espacios compartidos del cuerpo central. / Quiet, bright middle room of the east wing, opening onto the courtyard gallery. Sleeps 2 to 3, with access to the shared spaces in the central wing.")
                .precioBase(55.0)
                .imagenes(new ArrayList<>(GALERIA_HABITACION_5))
                .activo(true)
                .build();

        Espacio hab6 = Espacio.builder()
                .nombre("Casa Principal - Habitación 6 (Olmo) / Elm Room 6")
                .tipo(TipoEspacio.HABITACION_CASA_PRINCIPAL)
                .descripcion("Habitación del ala este en la punta del ala, la más amplia de la casa, con ventanas a dos lados y vista al camino de entrada. Para 2 a 3 personas, con acceso a la cocina, el comedor y los baños compartidos. / East-wing corner room, the largest in the house, with windows on two sides overlooking the entrance road. Sleeps 2 to 3, with access to the shared kitchen, dining room and bathrooms.")
                .precioBase(70.0)
                .imagenes(new ArrayList<>(GALERIA_HABITACION_6))
                .activo(true)
                .build();

        Espacio salonComida = Espacio.builder()
                .nombre("Casa Principal - Cocina, Comedor y Baños / Kitchen, Dining & Baths")
                .tipo(TipoEspacio.SALON_COMIDA_CASA_PRINCIPAL)
                .descripcion("Cuerpo central de la casa de piedra: cocina comunal equipada, comedor con hogar y baños compartidos para quienes se alojan en las seis habitaciones. Incluido con toda estadía en la Casa Principal. / Central wing of the stone house: fully equipped shared kitchen, dining room with fireplace and shared bathrooms for guests of the six rooms. Included with every Main House stay.")
                .precioBase(0.0)
                .imagenes(new ArrayList<>(GALERIA_SALON_COMIDA))
                .activo(true)
                .build();

        List<Espacio> guardados = espacioRepository.saveAll(List.of(
                cabana1, cabana2, cabana3, cabana4,
                galpon,
                hab1, hab2, hab3, hab4, hab5, hab6,
                salonComida
        ));

        // 4. Precargar reservas de prueba con los nuevos lugares
        if (cliente != null && guardados.size() >= 6) {
            Espacio espCabana = guardados.get(0); // Cabaña del Cedro
            Espacio espHabitacion = guardados.get(5); // Hab 1 Suite El Bosque

            Reserva rActiva = Reserva.builder()
                    .usuario(cliente)
                    .fechaCreacion(LocalDateTime.now().minusDays(1))
                    .totalSinDescuento(370.0)
                    .descuentoPackPorcentaje(0.0)
                    .total(370.0)
                    .estado(EstadoReserva.CONFIRMADA)
                    .activo(true)
                    .detalles(new ArrayList<>())
                    .build();

            DetalleReserva d1 = DetalleReserva.builder()
                    .reserva(rActiva)
                    .espacio(espCabana)
                    .checkIn(LocalDate.now().plusDays(4))
                    .checkOut(LocalDate.now().plusDays(7))
                    .precioUnitarioHistorico(espCabana.getPrecioBase())
                    .build();

            rActiva.getDetalles().add(d1);
            reservaRepository.save(rActiva);

            if (juan != null) {
                Reserva rJuan = Reserva.builder()
                        .usuario(juan)
                        .fechaCreacion(LocalDateTime.now().minusDays(2))
                        .totalSinDescuento(130.0)
                        .descuentoPackPorcentaje(0.0)
                        .total(130.0)
                        .estado(EstadoReserva.CONFIRMADA)
                        .activo(true)
                        .detalles(new ArrayList<>())
                        .build();

                DetalleReserva dJuan = DetalleReserva.builder()
                        .reserva(rJuan)
                        .espacio(espHabitacion)
                        .checkIn(LocalDate.now().plusDays(8))
                        .checkOut(LocalDate.now().plusDays(10))
                        .precioUnitarioHistorico(espHabitacion.getPrecioBase())
                        .build();

                rJuan.getDetalles().add(dJuan);
                reservaRepository.save(rJuan);
            }
        }
    }
}
