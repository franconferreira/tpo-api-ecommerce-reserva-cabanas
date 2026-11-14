package com.uade.tpo.complejo.dto.request;
import lombok.Data;

// El rol no se recibe: todo usuario registrado es ROLE_CLIENTE.
// Solo un administrador puede cambiar roles desde /api/admin/usuarios/{id}/rol.
@Data
public class RegisterRequest {
    private String username;
    private String nombre;
    private String apellido;
    private String email;
    private String password;
}
