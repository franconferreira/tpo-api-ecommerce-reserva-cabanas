package com.uade.tpo.complejo.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemCarritoRequestDTO {
    private Long espacioId;
    private LocalDate checkIn;
    private LocalDate checkOut;
}
