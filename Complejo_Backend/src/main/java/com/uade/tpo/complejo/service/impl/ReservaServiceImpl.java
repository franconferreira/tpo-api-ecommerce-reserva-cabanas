package com.uade.tpo.complejo.service.impl;

import com.uade.tpo.complejo.entity.Reserva;
import com.uade.tpo.complejo.entity.enums.EstadoReserva;
import com.uade.tpo.complejo.repository.ReservaRepository;
import com.uade.tpo.complejo.repository.UsuarioRepository;
import com.uade.tpo.complejo.service.ReservaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import com.uade.tpo.complejo.dto.response.ReservaResponseDTO;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservaServiceImpl implements ReservaService {

    private final ReservaRepository reservaRepository;
    private final UsuarioRepository usuarioRepository;

    private ReservaResponseDTO mapToDTO(Reserva reserva) {
        String nombreCompleto = reserva.getUsuario() != null
                ? reserva.getUsuario().getNombre() + " " + reserva.getUsuario().getApellido()
                : "";
        String email = reserva.getUsuario() != null ? reserva.getUsuario().getEmail() : "";

        return ReservaResponseDTO.builder()
                .id(reserva.getId())
                .nombreUsuario(nombreCompleto)
                .emailUsuario(email)
                .fechaCreacion(reserva.getFechaCreacion())
                .total(reserva.getTotal())
                .totalSinDescuento(reserva.getTotalSinDescuento())
                .descuentoPackPorcentaje(reserva.getDescuentoPackPorcentaje())
                .estado(reserva.getEstado())
                .mensajeCancelacion(reserva.getMensajeCancelacion())
                .detalles(reserva.getDetalles().stream().map(d -> ReservaResponseDTO.DetalleReservaDTO.builder()
                        .nombreEspacio(d.getEspacio().getNombre())
                        .checkIn(d.getCheckIn())
                        .checkOut(d.getCheckOut())
                        .subtotal(d.getPrecioUnitarioHistorico())
                        .build()).collect(Collectors.toList()))
                .build();
    }

    @Override
    public List<ReservaResponseDTO> obtenerMisReservas(String userEmail) {
        var user = usuarioRepository.findByEmail(userEmail).orElseThrow();
        return reservaRepository.findByUsuarioIdAndActivoTrue(user.getId())
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public void cancelarReserva(Long id, String userEmail) {
        Reserva reserva = reservaRepository.findById(id).orElseThrow();
        if (!reserva.getUsuario().getEmail().equals(userEmail)) {
            throw new RuntimeException("No tiene permisos para cancelar esta reserva");
        }
        reserva.setEstado(EstadoReserva.CANCELADA);
        reserva.setActivo(false);
        reservaRepository.save(reserva);
    }

    @Override
    public List<ReservaResponseDTO> obtenerTodasLasReservas() {
        return reservaRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public void cancelarReservaAdmin(Long id, String mensajeCancelacion) {
        Reserva reserva = reservaRepository.findById(id).orElseThrow();
        reserva.setEstado(EstadoReserva.CANCELADA);
        String motivo = (mensajeCancelacion != null && !mensajeCancelacion.trim().isEmpty())
                ? mensajeCancelacion.trim()
                : "Cancelada por la administracion del complejo.";
        reserva.setMensajeCancelacion(motivo);
        reservaRepository.save(reserva);
    }
}
