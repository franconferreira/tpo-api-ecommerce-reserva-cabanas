package com.uade.tpo.complejo.repository;

import com.uade.tpo.complejo.entity.Espacio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EspacioRepository extends JpaRepository<Espacio, Long> {
    List<Espacio> findByActivoTrue();
}
