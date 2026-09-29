package com.uade.tpo.complejo.repository;

import com.uade.tpo.complejo.entity.ItemCarrito;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface ItemCarritoRepository extends JpaRepository<ItemCarrito, Long> {
    
    // Para el Anti-Overbooking: Revisa si hay otro carrito reteniendo la cabaña y que aún no expiró
    boolean existsByEspacioIdAndCheckInLessThanAndCheckOutGreaterThanAndFechaExpiracionAfter(Long espacioId, LocalDate checkOut, LocalDate checkIn, LocalDateTime now);

    // Para el Cron Job: Busca ítems que ya expiraron
    List<ItemCarrito> findByFechaExpiracionBefore(LocalDateTime now);

    // Para obtener fechas bloqueadas en el frontend
    List<ItemCarrito> findByEspacioIdAndFechaExpiracionAfter(Long espacioId, LocalDateTime now);
}
