package com.uade.tpo.complejo.dto.response;
import lombok.Data;
import lombok.Builder;
@Data
@Builder
public class AuthResponse {
    private String token;
}
