package com.uade.tpo.complejo.controller;

import com.uade.tpo.complejo.entity.Reserva;
import com.uade.tpo.complejo.entity.Usuario;
import com.uade.tpo.complejo.entity.enums.Role;
import com.uade.tpo.complejo.service.ReservaService;
import com.uade.tpo.complejo.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.uade.tpo.complejo.dto.request.RoleUpdateRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminGeneralController {

    private final UsuarioService usuarioService;
    private final ReservaService reservaService;

    @GetMapping("/usuarios")
    public ResponseEntity<List<Usuario>> obtenerUsuarios() {
        return ResponseEntity.ok(usuarioService.obtenerTodosLosUsuarios());
    }

    @PutMapping("/usuarios/{id}/rol")
    public ResponseEntity<Usuario> cambiarRol(@PathVariable Long id, @RequestBody RoleUpdateRequest request) {
        return ResponseEntity.ok(usuarioService.cambiarRol(id, Role.valueOf(request.getRol())));
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Map<String, String>> darDeBajaUsuario(@PathVariable Long id) {
        usuarioService.darDeBajaUsuario(id);
        return ResponseEntity.ok(Map.of("mensaje", "Usuario dado de baja con exito"));
    }

    @GetMapping("/reservas")
    public ResponseEntity<List<com.uade.tpo.complejo.dto.response.ReservaResponseDTO>> obtenerTodasLasReservas() {
        return ResponseEntity.ok(reservaService.obtenerTodasLasReservas());
    }

    @DeleteMapping("/reservas/{id}")
    public ResponseEntity<Map<String, String>> cancelarReservaAdmin(@PathVariable Long id) {
        reservaService.cancelarReservaAdmin(id);
        return ResponseEntity.ok(Map.of("mensaje", "Reserva cancelada con exito"));
    }

    @PatchMapping("/usuarios/{id}/restaurar")
    public ResponseEntity<Map<String, String>> restaurarUsuario(@PathVariable Long id) {
        usuarioService.restaurarUsuario(id);
        return ResponseEntity.ok(Map.of("mensaje", "Usuario restaurado con exito"));
    }
}
