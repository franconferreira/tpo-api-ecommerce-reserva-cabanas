package com.uade.tpo.complejo.controller;

import com.uade.tpo.complejo.dto.request.ItemCarritoRequestDTO;
import com.uade.tpo.complejo.dto.response.CarritoResponseDTO;
import com.uade.tpo.complejo.service.CarritoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carrito")
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoService carritoService;

    @GetMapping
    public ResponseEntity<CarritoResponseDTO> obtenerMiCarrito() {
        return ResponseEntity.ok(carritoService.obtenerMiCarrito());
    }

    @PostMapping("/items")
    public ResponseEntity<CarritoResponseDTO> agregarItem(@RequestBody ItemCarritoRequestDTO request) {
        return ResponseEntity.ok(carritoService.agregarItem(request));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<CarritoResponseDTO> eliminarItem(@PathVariable Long id) {
        return ResponseEntity.ok(carritoService.eliminarItem(id));
    }

    @PostMapping("/checkout")
    public ResponseEntity<Void> checkout() {
        carritoService.checkout();
        return ResponseEntity.ok().build();
    }
}
