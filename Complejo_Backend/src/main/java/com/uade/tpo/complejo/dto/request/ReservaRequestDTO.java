package com.uade.tpo.complejo.dto.request;
import lombok.Data;
import java.time.LocalDate;
@Data
public class ReservaRequestDTO {
    private Long espacioId;
    private LocalDate checkIn;
    private LocalDate checkOut;
}
