package com.uade.tpo.complejo.service;

import com.uade.tpo.complejo.dto.request.ItemCarritoRequestDTO;
import com.uade.tpo.complejo.dto.response.CarritoResponseDTO;

public interface CarritoService {
    CarritoResponseDTO obtenerMiCarrito();
    CarritoResponseDTO agregarItem(ItemCarritoRequestDTO request);
    CarritoResponseDTO eliminarItem(Long itemId);
    void checkout();
}
