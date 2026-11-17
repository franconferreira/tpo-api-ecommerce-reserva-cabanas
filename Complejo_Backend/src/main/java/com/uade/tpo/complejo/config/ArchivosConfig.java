package com.uade.tpo.complejo.config;

import com.uade.tpo.complejo.controller.AdminImagenController;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Sirve las imágenes subidas desde el panel de administración (carpeta "uploads") en /uploads/** */
@Configuration
public class ArchivosConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(AdminImagenController.CARPETA.toAbsolutePath().toUri().toString());
    }
}
