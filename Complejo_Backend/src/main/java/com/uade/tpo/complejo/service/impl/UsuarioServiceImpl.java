package com.uade.tpo.complejo.service.impl;

import com.uade.tpo.complejo.entity.Usuario;
import com.uade.tpo.complejo.entity.enums.Role;
import com.uade.tpo.complejo.repository.UsuarioRepository;
import com.uade.tpo.complejo.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public List<Usuario> obtenerTodosLosUsuarios() {
        return usuarioRepository.findAll();
    }

    @Override
    public Usuario cambiarRol(Long id, Role nuevoRol) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow();
        usuario.setRol(nuevoRol);
        return usuarioRepository.save(usuario);
    }

    @Override
    public void darDeBajaUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow();
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
    }

    @Override
    public void restaurarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow();
        usuario.setActivo(true);
        usuarioRepository.save(usuario);
    }
}
