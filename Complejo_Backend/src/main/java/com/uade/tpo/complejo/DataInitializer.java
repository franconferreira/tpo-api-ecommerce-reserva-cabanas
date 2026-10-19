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
    private final PasswordEncoder passwordEncoder;

    private static final String URL_SALON_EVENTOS = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800";

    @Override
    public void run(String... args) {
        if (usuarioRepository.findByEmail("admin@gmail.com").isEmpty()) {
            Usuario admin = Usuario.builder()
                    .username("admin")
                    .nombre("Sarah")
                    .apellido("Chen")
                    .email("admin@gmail.com")
                    .password(passwordEncoder.encode("admin"))
                    .rol(Role.ROLE_ADMIN)
                    .activo(true)
                    .build();
            usuarioRepository.save(admin);

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

        String nombreE1 = "Cabaña del Cedro / Cedar Hollow Cabin";
        String descE1 = "Cabaña independiente de pino y roble rústico frente a la laguna, con deck y parrilla propia. / Standalone rustic pine and oak cabin facing the lagoon, featuring a private deck and grill.";
        String imgE1 = "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800";

        String nombreE2 = "Refugio de Troncos Los Pinos / Whispering Pines Timber Lodge";
        String descE2 = "Cabaña de troncos amplia ideal para grupos familiares rodeada de bosque nativo. / Spacious timber lodge ideal for family groups surrounded by native forest.";
        String imgE2 = "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800";

        String nombreE3 = "Salón Rústico para Eventos / Rustic Event Venue";
        String descE3 = "Galpón rústico para eventos con parrillas integradas y guirnaldas de iluminación cálida. / Rustic event barn with built-in grills and strings of warm-toned lights.";

        String nombreE4 = "Embarcadero Laguna Plateada / Silver Lake Boathouse";
        String descE4 = "Espejo de agua natural con embarcadero, kayaks y espacio para actividades náuticas. / Natural body of water with a boathouse, kayaks, and space for water activities.";
        String imgE4 = "https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&q=80&w=800";

        String nombreE5 = "Cabaña El Roble / The Oak Sanctuary Cabin";
        String descE5 = "Cabaña acogedora para parejas rodeada de robles antiguos con chimenea a leña y jacuzzi exterior. / Cozy couples cabin surrounded by ancient oaks featuring a wood-burning fireplace and outdoor hot tub.";
        String imgE5 = "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&q=80&w=800";

        String nombreE6 = "Refugio del Arroyo / Creekside Mountain Chalet";
        String descE6 = "Chalet de montaña de dos plantas junto al arroyo cristalino, con mirador panorámico y fogonero privado. / Two-story mountain chalet by the crystal creek, with a panoramic deck and private fire pit.";
        String imgE6 = "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=800";

        String nombreE7 = "Galpón Campestre Las Acacias / Las Acacias Country Barn";
        String descE7 = "Quincho y salón campestre con horno de barro, asador criollo y amplio jardín para celebraciones al aire libre. / Country quincho and event hall with clay oven, traditional grill, and spacious garden for outdoor celebrations.";
        String imgE7 = "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800";

        String nombreE8 = "Sector Domos & Fogón / Geodesic Domes & Fire Pit Lounge";
        String descE8 = "Sector recreativo junto al agua con domos geodésicos, fogón comunitario y alquiler de tablas de stand-up paddle. / Waterside recreational lounge featuring geodesic domes, a communal fire pit, and stand-up paddleboard rentals.";
        String imgE8 = "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800";

        if (espacioRepository.count() == 0) {
            Espacio e1 = Espacio.builder()
                    .nombre(nombreE1)
                    .tipo(TipoEspacio.CABANA)
                    .descripcion(descE1)
                    .precioBase(220.0)
                    .imagenes(List.of(imgE1))
                    .activo(true)
                    .build();

            Espacio e2 = Espacio.builder()
                    .nombre(nombreE2)
                    .tipo(TipoEspacio.CABANA)
                    .descripcion(descE2)
                    .precioBase(180.0)
                    .imagenes(List.of(imgE2))
                    .activo(true)
                    .build();

            Espacio e3 = Espacio.builder()
                    .nombre(nombreE3)
                    .tipo(TipoEspacio.GALPON_FIESTAS)
                    .descripcion(descE3)
                    .precioBase(450.0)
                    .imagenes(List.of(URL_SALON_EVENTOS))
                    .activo(true)
                    .build();

            Espacio e4 = Espacio.builder()
                    .nombre(nombreE4)
                    .tipo(TipoEspacio.LAGUNA_RECREATIVA)
                    .descripcion(descE4)
                    .precioBase(80.0)
                    .imagenes(List.of(imgE4))
                    .activo(true)
                    .build();

            Espacio e5 = Espacio.builder()
                    .nombre(nombreE5)
                    .tipo(TipoEspacio.CABANA)
                    .descripcion(descE5)
                    .precioBase(150.0)
                    .imagenes(List.of(imgE5))
                    .activo(true)
                    .build();

            Espacio e6 = Espacio.builder()
                    .nombre(nombreE6)
                    .tipo(TipoEspacio.CABANA)
                    .descripcion(descE6)
                    .precioBase(260.0)
                    .imagenes(List.of(imgE6))
                    .activo(true)
                    .build();

            Espacio e7 = Espacio.builder()
                    .nombre(nombreE7)
                    .tipo(TipoEspacio.GALPON_FIESTAS)
                    .descripcion(descE7)
                    .precioBase(380.0)
                    .imagenes(List.of(imgE7))
                    .activo(true)
                    .build();

            Espacio e8 = Espacio.builder()
                    .nombre(nombreE8)
                    .tipo(TipoEspacio.LAGUNA_RECREATIVA)
                    .descripcion(descE8)
                    .precioBase(110.0)
                    .imagenes(List.of(imgE8))
                    .activo(true)
                    .build();

            espacioRepository.saveAll(List.of(e1, e2, e3, e4, e5, e6, e7, e8));
        } else {
            List<Espacio> existentes = espacioRepository.findAll();
            for (Espacio esp : existentes) {
                boolean modificado = false;
                String nombreActual = esp.getNombre() != null ? esp.getNombre() : "";

                if ("Cedar Hollow Cabin".equals(nombreActual) || nombreActual.contains("Cedar Hollow Cabin")) {
                    if (!nombreE1.equals(esp.getNombre()) || !descE1.equals(esp.getDescripcion()) || !Boolean.TRUE.equals(esp.getActivo())) {
                        esp.setNombre(nombreE1);
                        esp.setDescripcion(descE1);
                        esp.setActivo(true);
                        modificado = true;
                    }
                } else if ("Whispering Pines Timber Lodge".equals(nombreActual) || nombreActual.contains("Whispering Pines Timber Lodge")) {
                    if (!nombreE2.equals(esp.getNombre()) || !descE2.equals(esp.getDescripcion()) || !Boolean.TRUE.equals(esp.getActivo())) {
                        esp.setNombre(nombreE2);
                        esp.setDescripcion(descE2);
                        esp.setActivo(true);
                        modificado = true;
                    }
                } else if ("Salón Rústico para Eventos".equals(nombreActual) || nombreActual.contains("Salón Rústico para Eventos")) {
                    if (!nombreE3.equals(esp.getNombre()) || !descE3.equals(esp.getDescripcion()) || !Boolean.TRUE.equals(esp.getActivo())) {
                        esp.setNombre(nombreE3);
                        esp.setDescripcion(descE3);
                        esp.setActivo(true);
                        modificado = true;
                    }
                } else if ("Silver Lake Boathouse".equals(nombreActual) || nombreActual.contains("Silver Lake Boathouse")) {
                    if (!nombreE4.equals(esp.getNombre()) || !descE4.equals(esp.getDescripcion()) || !Boolean.TRUE.equals(esp.getActivo())) {
                        esp.setNombre(nombreE4);
                        esp.setDescripcion(descE4);
                        esp.setActivo(true);
                        modificado = true;
                    }
                }

                boolean tieneUrlRota = esp.getImagenes() != null && esp.getImagenes().stream()
                        .anyMatch(img -> img.contains("1505916349660-8d91a99c31a4"));
                boolean sinImagenes = esp.getImagenes() == null || esp.getImagenes().isEmpty();
                if (tieneUrlRota || (esp.getNombre() != null && esp.getNombre().contains("Salón Rústico para Eventos") && sinImagenes)) {
                    esp.setImagenes(new ArrayList<>(List.of(URL_SALON_EVENTOS)));
                    modificado = true;
                }

                if (modificado) {
                    espacioRepository.save(esp);
                }
            }

            List<Espacio> actualizados = espacioRepository.findAll();
            boolean existeE5 = actualizados.stream().anyMatch(e -> e.getNombre() != null && e.getNombre().contains("Cabaña El Roble"));
            if (!existeE5) {
                espacioRepository.save(Espacio.builder()
                        .nombre(nombreE5)
                        .tipo(TipoEspacio.CABANA)
                        .descripcion(descE5)
                        .precioBase(150.0)
                        .imagenes(new ArrayList<>(List.of(imgE5)))
                        .activo(true)
                        .build());
            }

            boolean existeE6 = actualizados.stream().anyMatch(e -> e.getNombre() != null && e.getNombre().contains("Refugio del Arroyo"));
            if (!existeE6) {
                espacioRepository.save(Espacio.builder()
                        .nombre(nombreE6)
                        .tipo(TipoEspacio.CABANA)
                        .descripcion(descE6)
                        .precioBase(260.0)
                        .imagenes(new ArrayList<>(List.of(imgE6)))
                        .activo(true)
                        .build());
            }

            boolean existeE7 = actualizados.stream().anyMatch(e -> e.getNombre() != null && e.getNombre().contains("Galpón Campestre Las Acacias"));
            if (!existeE7) {
                espacioRepository.save(Espacio.builder()
                        .nombre(nombreE7)
                        .tipo(TipoEspacio.GALPON_FIESTAS)
                        .descripcion(descE7)
                        .precioBase(380.0)
                        .imagenes(new ArrayList<>(List.of(imgE7)))
                        .activo(true)
                        .build());
            }

            boolean existeE8 = actualizados.stream().anyMatch(e -> e.getNombre() != null && e.getNombre().contains("Sector Domos & Fogón"));
            if (!existeE8) {
                espacioRepository.save(Espacio.builder()
                        .nombre(nombreE8)
                        .tipo(TipoEspacio.LAGUNA_RECREATIVA)
                        .descripcion(descE8)
                        .precioBase(110.0)
                        .imagenes(new ArrayList<>(List.of(imgE8)))
                        .activo(true)
                        .build());
            }
        }

        // Precargar reservas de prueba (1 confirmada + 1 cancelada con motivo para Eleanor, 1 confirmada para Juan)
        List<Espacio> todosEspacios = espacioRepository.findAll();
        if (!todosEspacios.isEmpty() && cliente != null) {
            Espacio espCabana1 = todosEspacios.get(0);
            Espacio espCabana2 = todosEspacios.size() > 1 ? todosEspacios.get(1) : todosEspacios.get(0);
            Espacio espSalon = todosEspacios.size() > 2 ? todosEspacios.get(2) : todosEspacios.get(0);
            Espacio espLaguna = todosEspacios.size() > 3 ? todosEspacios.get(3) : todosEspacios.get(0);

            List<Reserva> reservasCliente = reservaRepository.findByUsuarioIdAndActivoTrue(cliente.getId());
            boolean tieneConfirmada = reservasCliente.stream()
                    .anyMatch(r -> r.getEstado() == EstadoReserva.CONFIRMADA);
            boolean tieneCanceladaConMotivo = reservasCliente.stream()
                    .anyMatch(r -> r.getEstado() == EstadoReserva.CANCELADA && r.getMensajeCancelacion() != null);

            if (!tieneConfirmada) {
                Reserva rActiva = Reserva.builder()
                        .usuario(cliente)
                        .fechaCreacion(LocalDateTime.now().minusDays(2))
                        .totalSinDescuento(820.0)
                        .descuentoPackPorcentaje(15.0)
                        .total(697.0)
                        .estado(EstadoReserva.CONFIRMADA)
                        .activo(true)
                        .detalles(new ArrayList<>())
                        .build();

                DetalleReserva d1 = DetalleReserva.builder()
                        .reserva(rActiva)
                        .espacio(espCabana1)
                        .checkIn(LocalDate.now().plusDays(5))
                        .checkOut(LocalDate.now().plusDays(8))
                        .precioUnitarioHistorico(espCabana1.getPrecioBase())
                        .build();

                DetalleReserva d2 = DetalleReserva.builder()
                        .reserva(rActiva)
                        .espacio(espLaguna)
                        .checkIn(LocalDate.now().plusDays(5))
                        .checkOut(LocalDate.now().plusDays(7))
                        .precioUnitarioHistorico(espLaguna.getPrecioBase())
                        .build();

                rActiva.getDetalles().add(d1);
                rActiva.getDetalles().add(d2);
                reservaRepository.save(rActiva);
            }

            if (!tieneCanceladaConMotivo) {
                Reserva rCancelada = Reserva.builder()
                        .usuario(cliente)
                        .fechaCreacion(LocalDateTime.now().minusDays(4))
                        .totalSinDescuento(900.0)
                        .descuentoPackPorcentaje(0.0)
                        .total(900.0)
                        .estado(EstadoReserva.CANCELADA)
                        .mensajeCancelacion("Cancelada por tareas de mantenimiento y poda en el sector norte / Cancelled due to scheduled maintenance and tree pruning in the north sector")
                        .activo(true)
                        .detalles(new ArrayList<>())
                        .build();

                DetalleReserva dCancelada = DetalleReserva.builder()
                        .reserva(rCancelada)
                        .espacio(espSalon)
                        .checkIn(LocalDate.now().plusDays(12))
                        .checkOut(LocalDate.now().plusDays(14))
                        .precioUnitarioHistorico(espSalon.getPrecioBase())
                        .build();

                rCancelada.getDetalles().add(dCancelada);
                reservaRepository.save(rCancelada);
            }

            if (juan != null) {
                List<Reserva> reservasJuan = reservaRepository.findByUsuarioIdAndActivoTrue(juan.getId());
                if (reservasJuan.isEmpty()) {
                    Reserva rJuan = Reserva.builder()
                            .usuario(juan)
                            .fechaCreacion(LocalDateTime.now().minusDays(1))
                            .totalSinDescuento(540.0)
                            .descuentoPackPorcentaje(0.0)
                            .total(540.0)
                            .estado(EstadoReserva.CONFIRMADA)
                            .activo(true)
                            .detalles(new ArrayList<>())
                            .build();

                    DetalleReserva dJuan = DetalleReserva.builder()
                            .reserva(rJuan)
                            .espacio(espCabana2)
                            .checkIn(LocalDate.now().plusDays(10))
                            .checkOut(LocalDate.now().plusDays(13))
                            .precioUnitarioHistorico(espCabana2.getPrecioBase())
                            .build();

                    rJuan.getDetalles().add(dJuan);
                    reservaRepository.save(rJuan);
                }
            }
        }
    }
}
