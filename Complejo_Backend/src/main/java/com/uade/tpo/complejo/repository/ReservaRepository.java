package com.uade.tpo.complejo.repository;

import com.uade.tpo.complejo.entity.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Reserva r JOIN r.detalles d WHERE d.espacio.id = :espacioId AND r.estado IN ('CONFIRMADA', 'PRE_RESERVA') AND r.activo = true AND d.checkIn < :checkOut AND d.checkOut > :checkIn")
    boolean isEspacioOcupado(@Param("espacioId") Long espacioId, @Param("checkIn") LocalDate checkIn, @Param("checkOut") LocalDate checkOut);

    List<Reserva> findByUsuarioIdAndActivoTrue(Long usuarioId);

    @Query("SELECT r FROM Reserva r JOIN r.detalles d WHERE d.espacio.id = :espacioId AND r.estado IN ('CONFIRMADA', 'PRE_RESERVA') AND r.activo = true AND d.checkOut >= :today")
    List<Reserva> findActiveReservasByEspacioIdAfterDate(@Param("espacioId") Long espacioId, @Param("today") LocalDate today);
}
