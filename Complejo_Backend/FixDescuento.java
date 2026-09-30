import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;

public class FixDescuento {
    public static void main(String[] args) throws Exception {
        // 1. Espacio.java
        String p1 = "src/main/java/com/uade/tpo/complejo/entity/Espacio.java";
        String c1 = new String(Files.readAllBytes(Paths.get(p1)), StandardCharsets.UTF_8);
        c1 = c1.replace("    @Builder.Default\n    @Column(nullable = false)\n    private Double descuento = 0.0;", "");
        Files.write(Paths.get(p1), c1.getBytes(StandardCharsets.UTF_8));

        // 2. EspacioRequestDTO.java
        String p2 = "src/main/java/com/uade/tpo/complejo/dto/request/EspacioRequestDTO.java";
        String c2 = new String(Files.readAllBytes(Paths.get(p2)), StandardCharsets.UTF_8);
        c2 = c2.replace("    private Double descuento;", "");
        Files.write(Paths.get(p2), c2.getBytes(StandardCharsets.UTF_8));

        // 3. EspacioResponseDTO.java
        String p3 = "src/main/java/com/uade/tpo/complejo/dto/response/EspacioResponseDTO.java";
        String c3 = new String(Files.readAllBytes(Paths.get(p3)), StandardCharsets.UTF_8);
        c3 = c3.replace("    private Double descuento;", "");
        Files.write(Paths.get(p3), c3.getBytes(StandardCharsets.UTF_8));

        // 4. EspacioServiceImpl.java
        String p4 = "src/main/java/com/uade/tpo/complejo/service/impl/EspacioServiceImpl.java";
        String c4 = new String(Files.readAllBytes(Paths.get(p4)), StandardCharsets.UTF_8);
        c4 = c4.replace("                .descuento(request.getDescuento() != null ? request.getDescuento() : 0.0)\n", "");
        c4 = c4.replace("        espacio.setDescuento(request.getDescuento() != null ? request.getDescuento() : 0.0);\n", "");
        c4 = c4.replace("                .descuento(espacio.getDescuento())\n", "");
        Files.write(Paths.get(p4), c4.getBytes(StandardCharsets.UTF_8));
    }
}
