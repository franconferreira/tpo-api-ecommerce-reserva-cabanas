package com.uade.tpo.complejo.dto.response;

import com.uade.tpo.complejo.entity.enums.TipoEspacio;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EspacioResponseDTO {
    private Long id;
    private String nombre;
    private Double precioBase;
    private TipoEspacio tipo;
    private String descripcion;
    private java.util.List<String> imagenes;
    private Double descuento;
}
