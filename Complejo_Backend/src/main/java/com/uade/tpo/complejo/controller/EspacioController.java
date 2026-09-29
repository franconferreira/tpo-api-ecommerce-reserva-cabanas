package com.uade.tpo.complejo.controller;

import com.uade.tpo.complejo.dto.response.EspacioResponseDTO;
import com.uade.tpo.complejo.entity.enums.TipoEspacio;
import com.uade.tpo.complejo.service.EspacioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/espacios")
@RequiredArgsConstructor
public class EspacioController {

    private final EspacioService espacioService;

    @GetMapping
    public ResponseEntity<List<EspacioResponseDTO>> obtenerEspaciosActivos(
            @RequestParam(required = false) TipoEspacio categoria) {
        return ResponseEntity.ok(espacioService.obtenerEspaciosActivos(categoria));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EspacioResponseDTO> obtenerEspacioPorId(@PathVariable Long id) {
        return ResponseEntity.ok(espacioService.obtenerEspacioPorId(id));
    }

    @GetMapping("/{id}/fechas-ocupadas")
    public ResponseEntity<List<LocalDate>> obtenerFechasOcupadas(@PathVariable Long id) {
        return ResponseEntity.ok(espacioService.obtenerFechasOcupadas(id));
    }
}
