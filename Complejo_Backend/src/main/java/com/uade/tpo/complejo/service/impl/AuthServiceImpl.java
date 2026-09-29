package com.uade.tpo.complejo.service.impl;

import com.uade.tpo.complejo.entity.Carrito;
import com.uade.tpo.complejo.repository.CarritoRepository;
import com.uade.tpo.complejo.dto.request.AuthRequest;
import com.uade.tpo.complejo.dto.request.RegisterRequest;
import com.uade.tpo.complejo.dto.response.AuthResponse;
import com.uade.tpo.complejo.entity.Usuario;
import com.uade.tpo.complejo.repository.UsuarioRepository;
import com.uade.tpo.complejo.security.JwtService;
import com.uade.tpo.complejo.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;
    private final CarritoRepository carritoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {
        var user = Usuario.builder()
                .username(request.getUsername())
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(request.getRol())
                .activo(true)
                .build();
        usuarioRepository.save(user);

        Carrito carrito = Carrito.builder().usuario(user).total(0.0).build();
        carritoRepository.save(carrito);

        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder().token(jwtToken).build();
    }

    @Override
    public AuthResponse authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder().token(jwtToken).build();
    }
}
