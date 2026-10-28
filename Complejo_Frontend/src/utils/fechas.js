// Agrega un 0 adelante a los números de un dígito (5 -> '05')
const dosDigitos = (numero) => (numero < 10 ? `0${numero}` : `${numero}`)

// Fecha en formato ISO 'AAAA-MM-DD' (el mismo que usa el backend)
export const fechaIso = (anio, mes, dia) => `${anio}-${dosDigitos(mes)}-${dosDigitos(dia)}`

export const hoyIso = () => {
  const ahora = new Date()
  return fechaIso(ahora.getFullYear(), ahora.getMonth() + 1, ahora.getDate())
}

// Devuelve la fecha ISO del día siguiente ('2026-10-31' -> '2026-11-01')
export const diaSiguienteIso = (fecha) => {
  const partes = fecha.split('-')
  const siguiente = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]) + 1)
  return fechaIso(siguiente.getFullYear(), siguiente.getMonth() + 1, siguiente.getDate())
}

// Verifica que un array de fechas ISO ordenadas no tenga saltos en el medio
export const sonFechasConsecutivas = (fechasOrdenadas) => {
  for (let i = 0; i < fechasOrdenadas.length - 1; i = i + 1) {
    if (diaSiguienteIso(fechasOrdenadas[i]) !== fechasOrdenadas[i + 1]) {
      return false
    }
  }
  return true
}

// Calcula el precio según los días seleccionados (aplica 20% OFF en Mayo, Junio y Agosto igual que el backend)
export const calcularPrecioSeleccionado = (precioBase, fechasSeleccionadas) => {
  if (!fechasSeleccionadas || fechasSeleccionadas.length === 0) {
    return precioBase
  }

  let total = 0
  for (let i = 0; i < fechasSeleccionadas.length; i = i + 1) {
    const partes = fechasSeleccionadas[i].split('-')
    const mes = Number(partes[1])
    const descuento = mes === 5 || mes === 6 || mes === 8 ? 0.2 : 0
    total = total + precioBase * (1 - descuento)
  }

  return Math.round(total * 100) / 100
}

// Celdas del almanaque de un mes: primero las vacías hasta el primer día de la semana,
// después un objeto por día con su estado ('pasado', 'ocupado' o 'disponible').
// mes va de 0 (enero) a 11 (diciembre), igual que en Date.
export const armarCeldasMes = (anio, mes, fechasOcupadas) => {
  const hoy = hoyIso()
  const primerDiaSemana = new Date(anio, mes, 1).getDay()
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()

  let celdas = []

  for (let i = 0; i < primerDiaSemana; i = i + 1) {
    celdas = [...celdas, { key: `vacio-${i}`, vacio: true }]
  }

  for (let dia = 1; dia <= diasEnMes; dia = dia + 1) {
    const fecha = fechaIso(anio, mes + 1, dia)

    let estado = 'disponible'
    if (fecha < hoy) {
      estado = 'pasado'
    } else if (fechasOcupadas.includes(fecha)) {
      estado = 'ocupado'
    }

    celdas = [...celdas, { key: fecha, vacio: false, numero: dia, fechaIso: fecha, estado: estado }]
  }

  return celdas
}
