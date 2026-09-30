package com.uade.tpo.complejo.service.impl;

import com.uade.tpo.complejo.dto.request.ItemCarritoRequestDTO;
import com.uade.tpo.complejo.dto.response.CarritoResponseDTO;
import com.uade.tpo.complejo.dto.response.EspacioResponseDTO;
import com.uade.tpo.complejo.dto.response.ItemCarritoResponseDTO;
import com.uade.tpo.complejo.entity.*;
import com.uade.tpo.complejo.entity.enums.EstadoReserva;
import com.uade.tpo.complejo.repository.*;
import com.uade.tpo.complejo.service.CarritoService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.Month;
import java.time.LocalDate;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarritoServiceImpl implements CarritoService {

    private final CarritoRepository carritoRepository;
    private final ItemCarritoRepository itemCarritoRepository;
    private final EspacioRepository espacioRepository;
    private final ReservaRepository reservaRepository;
    private final UsuarioRepository usuarioRepository;

    private Usuario getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email).orElseThrow();
    }

    private Carrito getMiCarrito() {
        Usuario user = getAuthenticatedUser();
        return carritoRepository.findByUsuario(user)
                .orElseGet(() -> {
                    Carrito nuevo = Carrito.builder().usuario(user).total(0.0).build();
                    return carritoRepository.save(nuevo);
                });
    }

    @Override
    public CarritoResponseDTO obtenerMiCarrito() {
        return mapToDTO(getMiCarrito());
    }

    @Override
    @Transactional
    public CarritoResponseDTO agregarItem(ItemCarritoRequestDTO request) {
        Carrito carrito = getMiCarrito();
        Espacio espacio = espacioRepository.findById(request.getEspacioId())
                .orElseThrow(() -> new RuntimeException("Espacio no encontrado"));

        if (!espacio.getActivo()) {
            throw new RuntimeException("Espacio inactivo");
        }

        // Validate stock logic (Anti-overbooking) temporally just checking existing reservas
        boolean ocupadoPorReserva = reservaRepository.isEspacioOcupado(espacio.getId(), request.getCheckIn(), request.getCheckOut());
        boolean ocupadoPorCarrito = itemCarritoRepository.existsByEspacioIdAndCheckInLessThanAndCheckOutGreaterThanAndFechaExpiracionAfter(
            espacio.getId(), request.getCheckOut(), request.getCheckIn(), LocalDateTime.now()
        );

        if (ocupadoPorReserva || ocupadoPorCarrito) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "El espacio no esta disponible en las fechas seleccionadas");
        }

        long dias = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        if (dias <= 0) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Fechas invalidas");

        double subtotal = 0.0;
        LocalDate diaActual = request.getCheckIn();
        while (diaActual.isBefore(request.getCheckOut())) {
            Month mesActual = diaActual.getMonth();
            double descuentoDia = 0.0;
            if (mesActual == Month.MAY || mesActual == Month.JUNE || mesActual == Month.AUGUST) {
                descuentoDia = 20.0;
            }
            double costoDelDia = espacio.getPrecioBase() * (1 - (descuentoDia / 100.0));
            subtotal += costoDelDia;
            diaActual = diaActual.plusDays(1);
        }

        ItemCarrito item = ItemCarrito.builder()
                .carrito(carrito)
                .espacio(espacio)
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .subtotal(subtotal)
                .fechaExpiracion(LocalDateTime.now().plusMinutes(10))
                .build();

        carrito.getItems().add(item);
        recalcularTotales(carrito);

        carritoRepository.save(carrito);
        return mapToDTO(carrito);
    }

    @Override
    @Transactional
    public CarritoResponseDTO eliminarItem(Long itemId) {
        Carrito carrito = getMiCarrito();
        ItemCarrito item = itemCarritoRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item no encontrado"));

        if (!item.getCarrito().getId().equals(carrito.getId())) {
            throw new RuntimeException("El item no pertenece a su carrito");
        }

        carrito.getItems().remove(item);
        itemCarritoRepository.delete(item);
        recalcularTotales(carrito);
        
        return mapToDTO(carritoRepository.save(carrito));
    }

    @Override
    @Transactional
    public void checkout() {
        Carrito carrito = getMiCarrito();
        if (carrito.getItems().isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "El carrito esta vacio");
        }

        // Double check availability and expiration
        for (ItemCarrito item : carrito.getItems()) {
            if (item.getFechaExpiracion().isBefore(LocalDateTime.now())) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "El item " + item.getEspacio().getNombre() + " en tu carrito ha expirado despues de 10 minutos. Por favor, vacia el carrito y vuelve a intentar.");
            }

            boolean ocupado = reservaRepository.isEspacioOcupado(item.getEspacio().getId(), item.getCheckIn(), item.getCheckOut());
            if (ocupado) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "El espacio " + item.getEspacio().getNombre() + " ya no esta disponible. Eliminelo del carrito e intente nuevamente.");
            }
        }

        Reserva reserva = Reserva.builder()
                .usuario(carrito.getUsuario())
                .fechaCreacion(LocalDateTime.now())
                .estado(EstadoReserva.PRE_RESERVA)
                .total(carrito.getTotal())
                .totalSinDescuento(carrito.getTotalSinDescuento())
                .descuentoPackPorcentaje(carrito.getDescuentoPackPorcentaje())
                .activo(true)
                .build();

        for (ItemCarrito item : carrito.getItems()) {
            DetalleReserva detalle = DetalleReserva.builder()
                    .reserva(reserva)
                    .espacio(item.getEspacio())
                    .checkIn(item.getCheckIn())
                    .checkOut(item.getCheckOut())
                    .precioUnitarioHistorico(item.getSubtotal() / ChronoUnit.DAYS.between(item.getCheckIn(), item.getCheckOut()))
                    .build();
            reserva.getDetalles().add(detalle);
        }

        reservaRepository.save(reserva);

        // Vaciamos carrito
        carrito.getItems().clear();
        carrito.setTotal(0.0);
        carrito.setTotalSinDescuento(0.0);
        carrito.setDescuentoPackPorcentaje(0.0);
        carritoRepository.save(carrito);
    }

    private void recalcularTotales(Carrito carrito) {
        double totalSinDescuento = carrito.getItems().stream().mapToDouble(ItemCarrito::getSubtotal).sum();
        double descuentoPack = carrito.getItems().size() >= 2 ? 15.0 : 0.0;
        double totalFinal = totalSinDescuento * (1 - (descuentoPack / 100.0));
        carrito.setTotalSinDescuento(totalSinDescuento);
        carrito.setDescuentoPackPorcentaje(descuentoPack);
        carrito.setTotal(totalFinal);
    }

    private CarritoResponseDTO mapToDTO(Carrito carrito) {
        return CarritoResponseDTO.builder()
                .id(carrito.getId())
                .total(carrito.getTotal())
                .totalSinDescuento(carrito.getTotalSinDescuento())
                .descuentoPackPorcentaje(carrito.getDescuentoPackPorcentaje())
                .items(carrito.getItems().stream().map(item -> ItemCarritoResponseDTO.builder()
                        .id(item.getId())
                        .espacio(EspacioResponseDTO.builder()
                                .id(item.getEspacio().getId())
                                .nombre(item.getEspacio().getNombre())
                                .precioBase(item.getEspacio().getPrecioBase())
                                .tipo(item.getEspacio().getTipo())
                                .descripcion(item.getEspacio().getDescripcion())
                                .imagenes(item.getEspacio().getImagenes())
                                
                                .build())
                        .checkIn(item.getCheckIn())
                        .checkOut(item.getCheckOut())
                        .subtotal(item.getSubtotal())
                        .build()).collect(Collectors.toList()))
                .build();
    }
}
