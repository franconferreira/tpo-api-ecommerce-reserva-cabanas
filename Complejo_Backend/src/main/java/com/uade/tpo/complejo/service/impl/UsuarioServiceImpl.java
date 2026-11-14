package com.uade.tpo.complejo.service.impl;

import com.uade.tpo.complejo.dto.response.UsuarioResponseDTO;
import com.uade.tpo.complejo.entity.Usuario;
import com.uade.tpo.complejo.entity.enums.Role;
import com.uade.tpo.complejo.repository.UsuarioRepository;
import com.uade.tpo.complejo.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public List<UsuarioResponseDTO> obtenerTodosLosUsuarios() {
        return usuarioRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public UsuarioResponseDTO cambiarRol(Long id, Role nuevoRol) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow();
        usuario.setRol(nuevoRol);
        return mapToDTO(usuarioRepository.save(usuario));
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

    private UsuarioResponseDTO mapToDTO(Usuario usuario) {
        return UsuarioResponseDTO.builder()
                .id(usuario.getId())
                .username(usuario.getNombreDeUsuario())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .email(usuario.getEmail())
                .rol(usuario.getRol().name())
                .activo(usuario.getActivo())
                .build();
    }
}
