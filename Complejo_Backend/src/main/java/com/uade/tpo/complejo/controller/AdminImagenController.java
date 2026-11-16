package com.uade.tpo.complejo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Subida de imágenes para los espacios (solo administradores, por estar bajo /api/admin).
 * Los archivos se guardan en la carpeta "uploads" junto al backend y se sirven en /uploads/** (ver ArchivosConfig).
 * Devuelve la URL completa de la imagen, que el formulario guarda en la lista de imágenes del espacio.
 */
@RestController
@RequestMapping("/api/admin/imagenes")
public class AdminImagenController {

    public static final Path CARPETA = Paths.get("uploads");
    private static final Set<String> EXTENSIONES = Set.of("jpg", "jpeg", "png", "webp", "gif");

    @PostMapping
    public ResponseEntity<Map<String, String>> subir(@RequestParam("archivo") MultipartFile archivo) throws IOException {
        String tipo = archivo.getContentType();
        String nombreOriginal = archivo.getOriginalFilename() == null ? "" : archivo.getOriginalFilename();
        int punto = nombreOriginal.lastIndexOf('.');
        String extension = punto >= 0 ? nombreOriginal.substring(punto + 1).toLowerCase() : "";
        if (archivo.isEmpty() || tipo == null || !tipo.startsWith("image/") || !EXTENSIONES.contains(extension)) {
            return ResponseEntity.badRequest().body(Map.of("error", "El archivo debe ser una imagen (jpg, png, webp o gif)"));
        }
        Files.createDirectories(CARPETA);
        // nombre al azar: no se pisan archivos ni se usa el nombre que mandó el usuario
        String nombre = UUID.randomUUID() + "." + extension;
        Files.copy(archivo.getInputStream(), CARPETA.resolve(nombre), StandardCopyOption.REPLACE_EXISTING);
        String url = ServletUriComponentsBuilder.fromCurrentContextPath().path("/uploads/").path(nombre).toUriString();
        return ResponseEntity.ok(Map.of("url", url));
    }
}
