package com.uade.tpo.complejo.dto.request;
import lombok.Data;
import com.uade.tpo.complejo.entity.enums.Role;
@Data
public class RegisterRequest {
    private String username;
    private String nombre;
    private String apellido;
    private String email;
    private String password;
    private Role rol;
}
