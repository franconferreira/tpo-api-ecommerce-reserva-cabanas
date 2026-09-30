import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;

public class UpdateCarritoService {
    public static void main(String[] args) throws Exception {
        String path = "src/main/java/com/uade/tpo/complejo/service/impl/CarritoServiceImpl.java";
        String content = new String(Files.readAllBytes(Paths.get(path)), StandardCharsets.UTF_8);

        // 1. Add Month import
        content = content.replace("import java.time.temporal.ChronoUnit;", "import java.time.temporal.ChronoUnit;\nimport java.time.Month;\nimport java.time.LocalDate;");

        // 2. Remove .descuento(item.getEspacio().getDescuento()) from mapToDTO
        content = content.replace(".descuento(item.getEspacio().getDescuento())", "");

        // 3. Update mapToDTO to set the new CarritoResponseDTO fields
        content = content.replace(".total(carrito.getTotal())", ".total(carrito.getTotal())\n                .totalSinDescuento(carrito.getTotalSinDescuento())\n                .descuentoPackPorcentaje(carrito.getDescuentoPackPorcentaje())");

        // 4. Update agregarItem logic
        String oldAgregarLogic = 
            "        long dias = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());\n" +
            "        if (dias <= 0) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, \"Fechas invalidas\");\n" +
            "\n" +
            "        Double descuentoAplicado = espacio.getDescuento() != null ? espacio.getDescuento() : 0.0;\n" +
            "        Double precioFinalPorDia = espacio.getPrecioBase() * (1 - (descuentoAplicado / 100.0));\n" +
            "        Double subtotal = precioFinalPorDia * dias;\n" +
            "\n" +
            "        ItemCarrito item = ItemCarrito.builder()\n" +
            "                .carrito(carrito)\n" +
            "                .espacio(espacio)\n" +
            "                .checkIn(request.getCheckIn())\n" +
            "                .checkOut(request.getCheckOut())\n" +
            "                .subtotal(subtotal)\n" +
            "                .fechaExpiracion(LocalDateTime.now().plusMinutes(10))\n" +
            "                .build();\n" +
            "\n" +
            "        carrito.getItems().add(item);\n" +
            "        carrito.setTotal(carrito.getTotal() + subtotal);";

        String newAgregarLogic = 
            "        long dias = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());\n" +
            "        if (dias <= 0) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, \"Fechas invalidas\");\n" +
            "\n" +
            "        double subtotal = 0.0;\n" +
            "        LocalDate diaActual = request.getCheckIn();\n" +
            "        while (diaActual.isBefore(request.getCheckOut())) {\n" +
            "            Month mesActual = diaActual.getMonth();\n" +
            "            double descuentoDia = 0.0;\n" +
            "            if (mesActual == Month.MAY || mesActual == Month.JUNE || mesActual == Month.AUGUST) {\n" +
            "                descuentoDia = 20.0;\n" +
            "            }\n" +
            "            double costoDelDia = espacio.getPrecioBase() * (1 - (descuentoDia / 100.0));\n" +
            "            subtotal += costoDelDia;\n" +
            "            diaActual = diaActual.plusDays(1);\n" +
            "        }\n" +
            "\n" +
            "        ItemCarrito item = ItemCarrito.builder()\n" +
            "                .carrito(carrito)\n" +
            "                .espacio(espacio)\n" +
            "                .checkIn(request.getCheckIn())\n" +
            "                .checkOut(request.getCheckOut())\n" +
            "                .subtotal(subtotal)\n" +
            "                .fechaExpiracion(LocalDateTime.now().plusMinutes(10))\n" +
            "                .build();\n" +
            "\n" +
            "        carrito.getItems().add(item);\n" +
            "        recalcularTotales(carrito);";

        content = content.replace(oldAgregarLogic, newAgregarLogic);

        // 5. Update eliminarItem
        String oldEliminarLogic = 
            "        carrito.setTotal(carrito.getTotal() - item.getSubtotal());\n" +
            "        carrito.getItems().remove(item);\n" +
            "        itemCarritoRepository.delete(item);";

        String newEliminarLogic = 
            "        carrito.getItems().remove(item);\n" +
            "        itemCarritoRepository.delete(item);\n" +
            "        recalcularTotales(carrito);";
        
        content = content.replace(oldEliminarLogic, newEliminarLogic);

        // 6. Add recalcularTotales helper
        String recalcularTotales = 
            "    private void recalcularTotales(Carrito carrito) {\n" +
            "        double totalSinDescuento = carrito.getItems().stream().mapToDouble(ItemCarrito::getSubtotal).sum();\n" +
            "        double descuentoPack = carrito.getItems().size() >= 2 ? 15.0 : 0.0;\n" +
            "        double totalFinal = totalSinDescuento * (1 - (descuentoPack / 100.0));\n" +
            "        carrito.setTotalSinDescuento(totalSinDescuento);\n" +
            "        carrito.setDescuentoPackPorcentaje(descuentoPack);\n" +
            "        carrito.setTotal(totalFinal);\n" +
            "    }\n\n" +
            "    private CarritoResponseDTO mapToDTO(Carrito carrito) {";

        content = content.replace("    private CarritoResponseDTO mapToDTO(Carrito carrito) {", recalcularTotales);

        // 7. Update checkout
        String oldCheckoutLogic = 
            "        Reserva reserva = Reserva.builder()\n" +
            "                .usuario(carrito.getUsuario())\n" +
            "                .fechaCreacion(LocalDateTime.now())\n" +
            "                .estado(EstadoReserva.PRE_RESERVA)\n" +
            "                .total(carrito.getTotal())\n" +
            "                .activo(true)\n" +
            "                .build();";

        String newCheckoutLogic = 
            "        Reserva reserva = Reserva.builder()\n" +
            "                .usuario(carrito.getUsuario())\n" +
            "                .fechaCreacion(LocalDateTime.now())\n" +
            "                .estado(EstadoReserva.PRE_RESERVA)\n" +
            "                .total(carrito.getTotal())\n" +
            "                .totalSinDescuento(carrito.getTotalSinDescuento())\n" +
            "                .descuentoPackPorcentaje(carrito.getDescuentoPackPorcentaje())\n" +
            "                .activo(true)\n" +
            "                .build();";
        
        content = content.replace(oldCheckoutLogic, newCheckoutLogic);

        String vaciarCarrito = 
            "        // Vaciamos carrito\n" +
            "        carrito.getItems().clear();\n" +
            "        carrito.setTotal(0.0);";

        String newVaciarCarrito = 
            "        // Vaciamos carrito\n" +
            "        carrito.getItems().clear();\n" +
            "        carrito.setTotal(0.0);\n" +
            "        carrito.setTotalSinDescuento(0.0);\n" +
            "        carrito.setDescuentoPackPorcentaje(0.0);";
        
        content = content.replace(vaciarCarrito, newVaciarCarrito);

        Files.write(Paths.get(path), content.getBytes(StandardCharsets.UTF_8));
    }
}
