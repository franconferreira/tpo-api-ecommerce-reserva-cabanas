package com.uade.tpo.complejo.service;

import com.uade.tpo.complejo.dto.request.AuthRequest;
import com.uade.tpo.complejo.dto.request.RegisterRequest;
import com.uade.tpo.complejo.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse authenticate(AuthRequest request);
}
