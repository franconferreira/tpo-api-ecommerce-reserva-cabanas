package com.uade.tpo.complejo.dto.response;

import com.uade.tpo.complejo.entity.enums.EstadoReserva;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ReservaResponseDTO {
    private Long id;
    private LocalDateTime fechaCreacion;
    private Double total;
    private EstadoReserva estado;
    private List<DetalleReservaDTO> detalles;

    @Data
    @Builder
    public static class DetalleReservaDTO {
        private String nombreEspacio;
        private LocalDate checkIn;
        private LocalDate checkOut;
        private Double subtotal;
    }
}
