package com.uade.tpo.complejo.controller;

import com.uade.tpo.complejo.entity.Reserva;
import com.uade.tpo.complejo.service.ReservaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import java.util.Map;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;

    @GetMapping("/mis-reservas")
    public ResponseEntity<List<com.uade.tpo.complejo.dto.response.ReservaResponseDTO>> obtenerMisReservas() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(reservaService.obtenerMisReservas(email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> cancelarReserva(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        reservaService.cancelarReserva(id, email);
        return ResponseEntity.ok(Map.of("mensaje", "Reserva cancelada con exito"));
    }
}
