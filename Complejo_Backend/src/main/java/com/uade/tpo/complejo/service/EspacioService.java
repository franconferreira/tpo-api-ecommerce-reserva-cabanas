package com.uade.tpo.complejo.service;

import com.uade.tpo.complejo.dto.request.EspacioRequestDTO;
import com.uade.tpo.complejo.dto.response.EspacioResponseDTO;
import com.uade.tpo.complejo.entity.enums.TipoEspacio;
import java.time.LocalDate;
import java.util.List;

public interface EspacioService {
    List<EspacioResponseDTO> obtenerEspaciosActivos(TipoEspacio categoria);
    EspacioResponseDTO obtenerEspacioPorId(Long id);
    List<LocalDate> obtenerFechasOcupadas(Long id);
    EspacioResponseDTO crearEspacio(EspacioRequestDTO request);
    EspacioResponseDTO modificarEspacio(Long id, EspacioRequestDTO request);
    void eliminarEspacio(Long id);
    void restaurarEspacio(Long id);
}
