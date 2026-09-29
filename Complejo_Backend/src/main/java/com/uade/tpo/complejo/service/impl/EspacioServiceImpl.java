package com.uade.tpo.complejo.service.impl;

import com.uade.tpo.complejo.dto.request.EspacioRequestDTO;
import com.uade.tpo.complejo.dto.response.EspacioResponseDTO;
import com.uade.tpo.complejo.entity.Espacio;
import com.uade.tpo.complejo.entity.ItemCarrito;
import com.uade.tpo.complejo.entity.Reserva;
import com.uade.tpo.complejo.entity.DetalleReserva;
import com.uade.tpo.complejo.entity.enums.TipoEspacio;
import com.uade.tpo.complejo.repository.EspacioRepository;
import com.uade.tpo.complejo.repository.ItemCarritoRepository;
import com.uade.tpo.complejo.repository.ReservaRepository;
import com.uade.tpo.complejo.service.EspacioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class EspacioServiceImpl implements EspacioService {

    private final EspacioRepository espacioRepository;
    private final ReservaRepository reservaRepository;
    private final ItemCarritoRepository itemCarritoRepository;

    @Override
    public List<EspacioResponseDTO> obtenerEspaciosActivos(TipoEspacio categoria) {
        Stream<Espacio> espaciosStream = espacioRepository.findByActivoTrue().stream();
        if (categoria != null) {
            espaciosStream = espaciosStream.filter(e -> e.getTipo() == categoria);
        }
        return espaciosStream.map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public EspacioResponseDTO obtenerEspacioPorId(Long id) {
        Espacio espacio = espacioRepository.findById(id).orElseThrow();
        return mapToDTO(espacio);
    }

    @Override
    public List<LocalDate> obtenerFechasOcupadas(Long id) {
        List<LocalDate> fechasOcupadas = new ArrayList<>();
        
        // Reservas confirmadas
        List<Reserva> reservas = reservaRepository.findActiveReservasByEspacioIdAfterDate(id, LocalDate.now());
        for (Reserva r : reservas) {
            for (DetalleReserva d : r.getDetalles()) {
                if (d.getEspacio().getId().equals(id)) {
                    LocalDate date = d.getCheckIn();
                    while (date.isBefore(d.getCheckOut())) {
                        fechasOcupadas.add(date);
                        date = date.plusDays(1);
                    }
                }
            }
        }

        // Carritos bloqueando fechas temporalmente
        List<ItemCarrito> items = itemCarritoRepository.findByEspacioIdAndFechaExpiracionAfter(id, LocalDateTime.now());
        for (ItemCarrito item : items) {
            LocalDate date = item.getCheckIn();
            while (date.isBefore(item.getCheckOut())) {
                if (!fechasOcupadas.contains(date)) {
                    fechasOcupadas.add(date);
                }
                date = date.plusDays(1);
            }
        }

        return fechasOcupadas.stream().distinct().sorted().collect(Collectors.toList());
    }

    @Override
    public EspacioResponseDTO crearEspacio(EspacioRequestDTO request) {
        Espacio espacio = Espacio.builder()
                .nombre(request.getNombre())
                .precioBase(request.getPrecioBase())
                .tipo(request.getTipo())
                .descripcion(request.getDescripcion())
                .imagenes(request.getImagenes())
                .descuento(request.getDescuento() != null ? request.getDescuento() : 0.0)
                .activo(true)
                .build();
        return mapToDTO(espacioRepository.save(espacio));
    }

    @Override
    public EspacioResponseDTO modificarEspacio(Long id, EspacioRequestDTO request) {
        Espacio espacio = espacioRepository.findById(id).orElseThrow();
        espacio.setNombre(request.getNombre());
        espacio.setPrecioBase(request.getPrecioBase());
        espacio.setTipo(request.getTipo());
        espacio.setDescripcion(request.getDescripcion());
        espacio.setImagenes(request.getImagenes());
        espacio.setDescuento(request.getDescuento() != null ? request.getDescuento() : 0.0);
        return mapToDTO(espacioRepository.save(espacio));
    }

    @Override
    public void eliminarEspacio(Long id) {
        Espacio espacio = espacioRepository.findById(id).orElseThrow();
        espacio.setActivo(false);
        espacioRepository.save(espacio);
    }

    @Override
    public void restaurarEspacio(Long id) {
        Espacio espacio = espacioRepository.findById(id).orElseThrow();
        espacio.setActivo(true);
        espacioRepository.save(espacio);
    }

    private EspacioResponseDTO mapToDTO(Espacio espacio) {
        return EspacioResponseDTO.builder()
                .id(espacio.getId())
                .nombre(espacio.getNombre())
                .precioBase(espacio.getPrecioBase())
                .tipo(espacio.getTipo())
                .descripcion(espacio.getDescripcion())
                .imagenes(espacio.getImagenes())
                .descuento(espacio.getDescuento())
                .build();
    }
}
