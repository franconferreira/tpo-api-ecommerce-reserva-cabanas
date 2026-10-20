// Agrega un 0 adelante a los números de un dígito (5 -> '05')
const dosDigitos = (numero) => (numero < 10 ? `0${numero}` : `${numero}`)

// Fecha en formato ISO 'AAAA-MM-DD' (el mismo que usan los inputs date y el backend)
export const fechaIso = (anio, mes, dia) => `${anio}-${dosDigitos(mes)}-${dosDigitos(dia)}`

export const hoyIso = () => {
  const ahora = new Date()
  return fechaIso(ahora.getFullYear(), ahora.getMonth() + 1, ahora.getDate())
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
