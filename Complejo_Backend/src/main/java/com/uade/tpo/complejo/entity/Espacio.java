package com.uade.tpo.complejo.entity;

import com.uade.tpo.complejo.entity.enums.TipoEspacio;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "espacios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Espacio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private Double precioBase;

    @Column(length = 1000)
    private String descripcion;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "espacio_imagenes", joinColumns = @JoinColumn(name = "espacio_id"))
    @Column(name = "imagen_url")
    private java.util.List<String> imagenes;

    @Builder.Default
    @Column(nullable = false)
    private Double descuento = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoEspacio tipo;

    @Builder.Default
    @Column(nullable = false)
    private Boolean activo = true;
}
