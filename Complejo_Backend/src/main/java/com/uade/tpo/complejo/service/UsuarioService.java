package com.uade.tpo.complejo.service;

import com.uade.tpo.complejo.dto.response.UsuarioResponseDTO;
import com.uade.tpo.complejo.entity.enums.Role;
import java.util.List;

public interface UsuarioService {
    List<UsuarioResponseDTO> obtenerTodosLosUsuarios();
    UsuarioResponseDTO cambiarRol(Long id, Role nuevoRol);
    void darDeBajaUsuario(Long id);
    void restaurarUsuario(Long id);
}
