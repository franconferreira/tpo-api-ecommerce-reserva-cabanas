package com.uade.tpo.complejo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemCarritoResponseDTO {
    private Long id;
    private EspacioResponseDTO espacio;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Double subtotal;
}
