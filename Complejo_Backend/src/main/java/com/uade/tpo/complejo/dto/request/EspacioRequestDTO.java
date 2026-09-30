package com.uade.tpo.complejo.dto.request;

import com.uade.tpo.complejo.entity.enums.TipoEspacio;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EspacioRequestDTO {
    private String nombre;
    private Double precioBase;
    private TipoEspacio tipo;
    private String descripcion;
    private java.util.List<String> imagenes;

}
