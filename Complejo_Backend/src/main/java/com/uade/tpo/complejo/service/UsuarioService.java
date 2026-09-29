package com.uade.tpo.complejo.service;

import com.uade.tpo.complejo.entity.Usuario;
import com.uade.tpo.complejo.entity.enums.Role;
import java.util.List;

public interface UsuarioService {
    List<Usuario> obtenerTodosLosUsuarios();
    Usuario cambiarRol(Long id, Role nuevoRol);
    void darDeBajaUsuario(Long id);
    void restaurarUsuario(Long id);
}
