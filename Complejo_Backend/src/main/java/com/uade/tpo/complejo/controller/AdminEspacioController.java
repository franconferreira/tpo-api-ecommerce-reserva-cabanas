package com.uade.tpo.complejo.controller;

import com.uade.tpo.complejo.dto.request.EspacioRequestDTO;
import com.uade.tpo.complejo.dto.response.EspacioResponseDTO;
import com.uade.tpo.complejo.service.EspacioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/espacios")
@RequiredArgsConstructor
public class AdminEspacioController {

    private final EspacioService espacioService;

    @PostMapping
    public ResponseEntity<EspacioResponseDTO> crearEspacio(@RequestBody EspacioRequestDTO request) {
        return ResponseEntity.ok(espacioService.crearEspacio(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EspacioResponseDTO> modificarEspacio(@PathVariable Long id, @RequestBody EspacioRequestDTO request) {
        return ResponseEntity.ok(espacioService.modificarEspacio(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> eliminarEspacio(@PathVariable Long id) {
        espacioService.eliminarEspacio(id);
        return ResponseEntity.ok(Map.of("mensaje", "Espacio eliminado con exito"));
    }

    @PatchMapping("/{id}/restaurar")
    public ResponseEntity<Map<String, String>> restaurarEspacio(@PathVariable Long id) {
        espacioService.restaurarEspacio(id);
        return ResponseEntity.ok(Map.of("mensaje", "Espacio restaurado con exito"));
    }
}
