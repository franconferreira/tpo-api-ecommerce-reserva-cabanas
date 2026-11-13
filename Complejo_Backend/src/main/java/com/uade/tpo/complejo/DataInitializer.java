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

    // Galerías de fotos
    private static final List<String> GALERIA_CABANA_1 = List.of(
            "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80&w=800"
    );

    private static final List<String> GALERIA_CABANA_2 = List.of(
            "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800"
    );

    private static final List<String> GALERIA_CABANA_3 = List.of(
            "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800"
    );

    private static final List<String> GALERIA_CABANA_4 = List.of(
            "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1617104678098-de229db51175?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=800"
    );

    private static final List<String> GALERIA_GALPON = List.of(
            "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800"
    );

    private static final List<String> GALERIA_HABITACION_1 = List.of(
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800"
    );

    private static final List<String> GALERIA_HABITACION_2 = List.of(
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800"
    );

    private static final List<String> GALERIA_HABITACION_3 = List.of(
            "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800"
    );

    private static final List<String> GALERIA_HABITACION_4 = List.of(
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800"
    );

    private static final List<String> GALERIA_HABITACION_5 = List.of(
            "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800"
    );

    private static final List<String> GALERIA_HABITACION_6 = List.of(
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800"
    );

    private static final List<String> GALERIA_SALON_COMIDA = List.of(
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800"
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
                .nombre("Cabaña del Cedro / Cedar Hollow Cabin")
                .tipo(TipoEspacio.CABANA)
                .descripcion("Cabaña independiente de pino y roble frente a la laguna, con deck techado, parrilla privada y capacidad para 4 a 5 huéspedes. / Standalone pine and oak cabin with private deck, grill, and sleeping capacity for 4 to 5 guests.")
                .precioBase(120.0)
                .imagenes(new ArrayList<>(GALERIA_CABANA_1))
                .activo(true)
                .build();

        Espacio cabana2 = Espacio.builder()
                .nombre("Refugio de Troncos Los Pinos / Whispering Pines Timber Lodge")
                .tipo(TipoEspacio.CABANA)
                .descripcion("Cabaña de troncos macizos en medio del bosque nativo, amplia cocina integrada y hogar a leña para 4 a 5 personas. / Timber cabin surrounded by native pines featuring open kitchen, stone fireplace, for 4 to 5 guests.")
                .precioBase(140.0)
                .imagenes(new ArrayList<>(GALERIA_CABANA_2))
                .activo(true)
                .build();

        Espacio cabana3 = Espacio.builder()
                .nombre("Cabaña El Roble / The Oak Sanctuary Cabin")
                .tipo(TipoEspacio.CABANA)
                .descripcion("Cabaña entre robles centenarios con terraza panorámica, living espacioso y capacidad para 4 a 5 huéspedes. / Forest cabin set among heritage oaks with scenic deck and living space for 4 to 5 guests.")
                .precioBase(110.0)
                .imagenes(new ArrayList<>(GALERIA_CABANA_3))
                .activo(true)
                .build();

        Espacio cabana4 = Espacio.builder()
                .nombre("Chalet del Arroyo / Mountain Stream Chalet")
                .tipo(TipoEspacio.CABANA)
                .descripcion("Chalet de montaña de dos plantas junto al arroyo cristalino, deck mirador y fogonero para 4 a 5 huéspedes. / Mountain chalet along crystal creek with scenic lookout deck and private fire pit for 4 to 5 guests.")
                .precioBase(160.0)
                .imagenes(new ArrayList<>(GALERIA_CABANA_4))
                .activo(true)
                .build();

        Espacio galpon = Espacio.builder()
                .nombre("Galpón de Fiestas Las Acacias / Las Acacias Event Barn")
                .tipo(TipoEspacio.GALPON_FIESTAS)
                .descripcion("Galpón rústico para eventos y celebraciones, equipado con parrillas integradas, cocina industrial, guirnaldas cálidas y amplio parque. / Rustic celebration barn with integrated grills, warm string lights, and spacious lawn for private events.")
                .precioBase(280.0)
                .imagenes(new ArrayList<>(GALERIA_GALPON))
                .activo(true)
                .build();

        Espacio hab1 = Espacio.builder()
                .nombre("Casa Principal - Habitación 1 (Suite El Bosque) / Forest Suite Room 1")
                .tipo(TipoEspacio.HABITACION_CASA_PRINCIPAL)
                .descripcion("Habitación privada en la Casa Principal para 2 a 3 personas con cama queen y sommier individual. Incluye acceso libre al Salón de Comida comunal y baños compartidos. / Private room in the Main House for 2-3 guests with queen bed. Includes full access to communal dining hall and shared baths.")
                .precioBase(65.0)
                .imagenes(new ArrayList<>(GALERIA_HABITACION_1))
                .activo(true)
                .build();

        Espacio hab2 = Espacio.builder()
                .nombre("Casa Principal - Habitación 2 (Balcón de las Aves) / Birdsong Balcony Room 2")
                .tipo(TipoEspacio.HABITACION_CASA_PRINCIPAL)
                .descripcion("Habitación privada en planta alta con balcón hacia el dosel del bosque para 2 a 3 personas. Incluye acceso al Salón de Comida comunal y baños compartidos. / Upper level private room with timber balcony for 2-3 guests. Includes access to communal dining hall and shared baths.")
                .precioBase(60.0)
                .imagenes(new ArrayList<>(GALERIA_HABITACION_2))
                .activo(true)
                .build();

        Espacio hab3 = Espacio.builder()
                .nombre("Casa Principal - Habitación 3 (Nido de Pinos) / Pine Nest Room 3")
                .tipo(TipoEspacio.HABITACION_CASA_PRINCIPAL)
                .descripcion("Acogedora habitación con ventanales al pinar para 2 a 3 personas. Incluye libre acceso al Salón de Comida comunal y baños compartidos de la Casa Principal. / Cozy room with forest view windows for 2-3 guests. Includes full access to communal dining and shared bathrooms.")
                .precioBase(55.0)
                .imagenes(new ArrayList<>(GALERIA_HABITACION_3))
                .activo(true)
                .build();

        Espacio hab4 = Espacio.builder()
                .nombre("Casa Principal - Habitación 4 (Valle Verde) / Green Valley Room 4")
                .tipo(TipoEspacio.HABITACION_CASA_PRINCIPAL)
                .descripcion("Habitación luminosa en el ala oeste para 2 a 3 personas. Permite disfrutar del Salón de Comida y baños compartidos de la Casa Principal. / Sunlit west-wing room for 2-3 guests. Includes access to the communal dining hall and shared bathrooms.")
                .precioBase(60.0)
                .imagenes(new ArrayList<>(GALERIA_HABITACION_4))
                .activo(true)
                .build();

        Espacio hab5 = Espacio.builder()
                .nombre("Casa Principal - Habitación 5 (Rincón de la Colina) / Hillside Corner Room 5")
                .tipo(TipoEspacio.HABITACION_CASA_PRINCIPAL)
                .descripcion("Habitación con piso de roble y ambientación rústica para 2 a 3 personas. Incluye acceso al Salón de Comida comunal y baños compartidos. / Rustic oak floor room for 2-3 guests. Includes access to communal dining hall and shared bathrooms.")
                .precioBase(55.0)
                .imagenes(new ArrayList<>(GALERIA_HABITACION_5))
                .activo(true)
                .build();

        Espacio hab6 = Espacio.builder()
                .nombre("Casa Principal - Habitación 6 (Mirador Silvestre) / Wild Vista Room 6")
                .tipo(TipoEspacio.HABITACION_CASA_PRINCIPAL)
                .descripcion("Habitación espaciosa para 2 a 3 personas, con vista panorámica a la arboleda. Incluye acceso al Salón de Comida comunal y baños compartidos. / Spacious room for 2-3 guests with panoramic woodland vista. Includes access to communal dining and shared bathrooms.")
                .precioBase(70.0)
                .imagenes(new ArrayList<>(GALERIA_HABITACION_6))
                .activo(true)
                .build();

        Espacio salonComida = Espacio.builder()
                .nombre("Casa Principal - Salón Comunal & Baños / Communal Dining & Baths")
                .tipo(TipoEspacio.SALON_COMIDA_CASA_PRINCIPAL)
                .descripcion("Gran salón de comida general con estufa a leña, mesas largas de roble, vajilla completa y baños comunales, compartido por todos los huéspedes que se alojen en las habitaciones de la Casa Principal. / Large communal dining room with wood stove, long dining tables, and shared bathrooms for all Main House guests.")
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
