package com.uade.tpo.complejo.dto.response;

import lombok.Builder;
import lombok.Data;

// Datos públicos de un usuario. Nunca incluye la contraseña.
@Data
@Builder
public class UsuarioResponseDTO {
    private Long id;
    private String username;
    private String nombre;
    private String apellido;
    private String email;
    private String rol;
    private Boolean activo;
}
