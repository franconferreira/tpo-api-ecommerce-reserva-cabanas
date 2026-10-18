package com.uade.tpo.complejo;

import com.uade.tpo.complejo.entity.Carrito;
import com.uade.tpo.complejo.entity.Espacio;
import com.uade.tpo.complejo.entity.Usuario;
import com.uade.tpo.complejo.entity.enums.Role;
import com.uade.tpo.complejo.entity.enums.TipoEspacio;
import com.uade.tpo.complejo.repository.CarritoRepository;
import com.uade.tpo.complejo.repository.EspacioRepository;
import com.uade.tpo.complejo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final CarritoRepository carritoRepository;
    private final EspacioRepository espacioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (usuarioRepository.findByEmail("admin@gmail.com").isEmpty()) {
            Usuario admin = Usuario.builder()
                    .username("admin")
                    .nombre("Sarah")
                    .apellido("Chen")
                    .email("admin@gmail.com")
                    .password(passwordEncoder.encode("admin"))
                    .rol(Role.ROLE_ADMIN)
                    .activo(true)
                    .build();
            usuarioRepository.save(admin);

            Carrito carritoAdmin = Carrito.builder().usuario(admin).total(0.0).build();
            carritoRepository.save(carritoAdmin);
        }

        if (usuarioRepository.findByEmail("cliente@gmail.com").isEmpty()) {
            Usuario cliente = Usuario.builder()
                    .username("eleanor")
                    .nombre("Eleanor")
                    .apellido("Vance")
                    .email("cliente@gmail.com")
                    .password(passwordEncoder.encode("1234"))
                    .rol(Role.ROLE_CLIENTE)
                    .activo(true)
                    .build();
            usuarioRepository.save(cliente);

            Carrito carritoCliente = Carrito.builder().usuario(cliente).total(0.0).build();
            carritoRepository.save(carritoCliente);
        }

        if (espacioRepository.count() == 0) {
            Espacio e1 = Espacio.builder()
                    .nombre("Cedar Hollow Cabin")
                    .tipo(TipoEspacio.CABANA)
                    .descripcion("Cabaña independiente de pino y roble rústico frente a la laguna, con deck y parrilla propia.")
                    .precioBase(220.0)
                    .imagenes(List.of("https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800"))
                    .activo(true)
                    .build();

            Espacio e2 = Espacio.builder()
                    .nombre("Whispering Pines Timber Lodge")
                    .tipo(TipoEspacio.CABANA)
                    .descripcion("Cabaña de troncos amplia ideal para grupos familiares rodeada de bosque nativo.")
                    .precioBase(180.0)
                    .imagenes(List.of("https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800"))
                    .activo(true)
                    .build();

            Espacio e3 = Espacio.builder()
                    .nombre("Salón Rústico para Eventos")
                    .tipo(TipoEspacio.GALPON_FIESTAS)
                    .descripcion("Galpón rústico para eventos con parrillas integradas y guirnaldas de iluminación cálida.")
                    .precioBase(450.0)
                    .imagenes(List.of("https://images.unsplash.com/photo-1505916349660-8d91a99c31a4?auto=format&fit=crop&q=80&w=800"))
                    .activo(true)
                    .build();

            Espacio e4 = Espacio.builder()
                    .nombre("Silver Lake Boathouse")
                    .tipo(TipoEspacio.LAGUNA_RECREATIVA)
                    .descripcion("Espejo de agua natural con embarcadero, kayaks y espacio para actividades náuticas.")
                    .precioBase(80.0)
                    .imagenes(List.of("https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&q=80&w=800"))
                    .activo(true)
                    .build();

            espacioRepository.saveAll(List.of(e1, e2, e3, e4));
        }
    }
}
