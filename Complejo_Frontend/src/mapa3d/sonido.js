// Sonido del recorrido, armado con la Web Audio API (sin archivos): un murmullo de viento, el ruido de las hojas
// de los árboles (más fuerte con las ráfagas y cerca del bosque) y dos tipos de pasos: sobre pasto y sobre piedra.
// El navegador solo deja empezar a sonar después de un clic o una tecla, por eso se inicia con `iniciar()`.

// Buffer de ruido: blanco (todas las frecuencias) o marrón (más grave, como un soplido)
function ruido(ctx, segundos, marron) {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * segundos), ctx.sampleRate)
  const datos = buffer.getChannelData(0)
  let ultimo = 0
  for (let i = 0; i < datos.length; i++) {
    const blanco = Math.random() * 2 - 1
    if (marron) {
      ultimo = (ultimo + 0.02 * blanco) / 1.02
      datos[i] = ultimo * 3.5
    } else {
      datos[i] = blanco
    }
  }
  return buffer
}

function bucle(ctx, buffer) {
  const fuente = ctx.createBufferSource()
  fuente.buffer = buffer
  fuente.loop = true
  fuente.start()
  return fuente
}

export function crearSonido() {
  let ctx = null
  let general, viento, hojas, ruidoBlanco

  function iniciar() {
    const Contexto = window.AudioContext || window.webkitAudioContext
    if (!Contexto) return
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume()
      return
    }
    ctx = new Contexto()
    general = ctx.createGain()
    general.gain.value = silencio ? 0 : 0.6
    general.connect(ctx.destination)

    // viento: ruido grave filtrado, con el volumen siguiendo las ráfagas
    viento = ctx.createGain()
    viento.gain.value = 0
    const filtroViento = ctx.createBiquadFilter()
    filtroViento.type = 'lowpass'
    filtroViento.frequency.value = 450
    bucle(ctx, ruido(ctx, 4, true)).connect(filtroViento)
    filtroViento.connect(viento)
    viento.connect(general)

    // hojas: ruido agudo (un "shhh" suave) que tiembla
    ruidoBlanco = ruido(ctx, 3, false)
    hojas = ctx.createGain()
    hojas.gain.value = 0
    const filtroHojas = ctx.createBiquadFilter()
    filtroHojas.type = 'bandpass'
    filtroHojas.frequency.value = 4200
    filtroHojas.Q.value = 0.7
    bucle(ctx, ruidoBlanco).connect(filtroHojas)
    filtroHojas.connect(hojas)
    hojas.connect(general)
  }

  // fuerza: la ráfaga en el lugar (0 a 1); bosque: cuántos árboles hay cerca (0 a 1); noche: 0 de día, 1 de noche
  function actualizar(t, fuerza, bosque, noche = 0) {
    if (!ctx) return
    const ahora = ctx.currentTime
    const calma = 1 - 0.65 * noche // de noche el viento casi se calma
    viento.gain.setTargetAtTime((0.05 + 0.1 * fuerza) * calma, ahora, 0.4)
    const temblor = 0.7 + 0.3 * Math.sin(t * 7.3) * Math.sin(t * 3.1)
    hojas.gain.setTargetAtTime((0.008 + 0.06 * fuerza * bosque) * temblor * calma, ahora, 0.15)
    if (noche > 0.5 && !silencio) grillos(ahora, (noche - 0.5) * 2)
  }

  // Grillos lejanos: cada uno canta a su ritmo (3 o 4 pulsos agudos seguidos) desde un costado distinto
  const listaGrillos = Array.from({ length: 5 }, (_, i) => ({
    tono: 4200 + i * 230 + Math.random() * 150,
    lado: -0.8 + i * 0.4,
    proximo: 0,
    pausa: 0.7 + Math.random() * 0.6
  }))
  function grillos(ahora, fuerza) {
    for (const g of listaGrillos) {
      if (ahora < g.proximo) continue
      if (g.proximo === 0) {
        g.proximo = ahora + Math.random() * 2 // que no arranquen todos juntos
        continue
      }
      const osc = ctx.createOscillator()
      osc.frequency.value = g.tono
      const volumen = ctx.createGain()
      volumen.gain.value = 0
      const paneo = ctx.createStereoPanner()
      paneo.pan.value = g.lado
      const pulsos = 3 + Math.floor(Math.random() * 2)
      const fuerte = 0.012 * fuerza
      for (let k = 0; k < pulsos; k++) {
        const t0 = ahora + k * 0.05
        volumen.gain.setValueAtTime(0, t0)
        volumen.gain.linearRampToValueAtTime(fuerte, t0 + 0.012)
        volumen.gain.linearRampToValueAtTime(0, t0 + 0.035)
      }
      osc.connect(volumen)
      volumen.connect(paneo)
      paneo.connect(general)
      osc.start(ahora)
      osc.stop(ahora + pulsos * 0.05 + 0.05)
      g.proximo = ahora + g.pausa + Math.random() * 0.5
    }
  }

  // Un paso se arma como un sonido corto de "granitos": muchos chasquidos chiquitos al azar dentro de dos golpes
  // (talón y punta). En grava son más secos y densos; en pasto, más suaves y con un roce de fondo.
  let pasosPiedra = []
  let pasosPasto = []
  function sonidoDePaso(piedra) {
    const sr = ctx.sampleRate
    const largo = Math.floor(sr * (piedra ? 0.26 : 0.32))
    const buffer = ctx.createBuffer(1, largo, sr)
    const d = buffer.getChannelData(0)
    let grano = 0
    let caida = 0
    let suave = 0
    let entradaAnterior = 0
    let salidaAnterior = 0
    const corte = piedra ? 0.95 : 0.9 // filtro que saca solo los graves más bajos (para que no suene a golpe de tambor)
    for (let i = 0; i < largo; i++) {
      const t = i / sr
      // envolvente: talón y, un poco después, la punta del pie
      const talon = t < 0.012 ? t / 0.012 : Math.exp(-(t - 0.012) / (piedra ? 0.035 : 0.05))
      const punta = t < 0.07 ? 0 : (t < 0.085 ? (t - 0.07) / 0.015 : Math.exp(-(t - 0.085) / (piedra ? 0.04 : 0.06))) * 0.7
      const env = talon + punta
      // granitos: aparecen al azar (más cuanto más fuerte es la pisada) y se apagan muy rápido
      if (Math.random() < (piedra ? 0.012 : 0.004) * env) {
        grano = 0.4 + Math.random() * 0.6
        caida = Math.exp(-1 / (sr * (piedra ? 0.0015 : 0.004)))
      }
      grano *= caida
      const blanco = Math.random() * 2 - 1
      suave += ((piedra ? 0.6 : 0.25) * (blanco - suave)) // ruido un poco suavizado
      let x = (blanco * grano * (piedra ? 1 : 0.7) + suave * env * (piedra ? 0.15 : 0.35)) * env
      // filtro pasa-altos simple
      const y = corte * (salidaAnterior + x - entradaAnterior)
      entradaAnterior = x
      salidaAnterior = y
      x = y
      d[i] = x
    }
    return buffer
  }

  // superficie: 'pasto' o 'piedra'
  function paso(superficie) {
    if (!ctx || silencio) return
    if (!pasosPiedra.length) {
      for (let i = 0; i < 5; i++) {
        pasosPiedra.push(sonidoDePaso(true))
        pasosPasto.push(sonidoDePaso(false))
      }
    }
    const piedra = superficie === 'piedra'
    const lista = piedra ? pasosPiedra : pasosPasto
    const fuente = ctx.createBufferSource()
    fuente.buffer = lista[Math.floor(Math.random() * lista.length)]
    // más lento = más grave (en pasto, todavía más grave)
    fuente.playbackRate.value = (0.68 + Math.random() * 0.14) * (piedra ? 1 : 0.67)
    const volumen = ctx.createGain()
    volumen.gain.value = (piedra ? 0.075 : 0.055) * (0.8 + Math.random() * 0.4) // tenues
    fuente.connect(volumen)
    volumen.connect(general)
    fuente.start()
  }

  // silencio (tecla M): se apaga todo
  let silencio = false
  function setSilencio(valor) {
    silencio = valor
    if (ctx) general.gain.setTargetAtTime(valor ? 0 : 0.6, ctx.currentTime, 0.05)
  }

  function cerrar() {
    if (ctx) ctx.close()
    ctx = null
  }

  return { iniciar, actualizar, paso, setSilencio, cerrar }
}
