package com.uade.tpo.complejo.dto.response;
import com.uade.tpo.complejo.entity.enums.Role;
import lombok.Data;
import lombok.Builder;
@Data
@Builder
public class AuthResponse {
    private String token;
    private Role rol;
}
