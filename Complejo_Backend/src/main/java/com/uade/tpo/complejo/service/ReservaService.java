package com.uade.tpo.complejo.service;

import com.uade.tpo.complejo.entity.Reserva;
import com.uade.tpo.complejo.dto.response.ReservaResponseDTO;
import java.util.List;

public interface ReservaService {
    List<ReservaResponseDTO> obtenerMisReservas(String userEmail);
    void cancelarReserva(Long id, String userEmail);
    List<ReservaResponseDTO> obtenerTodasLasReservas();
    void cancelarReservaAdmin(Long id);
}
