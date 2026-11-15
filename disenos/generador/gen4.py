import math, sys, random, re, os
AQUI = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(AQUI, "gen3_base.py"), encoding="utf-8").read())
# funciones de gen3 (mata, flor_latigo, helecho) sin ejecutar su parte final
src3 = open(os.path.join(AQUI, "gen3.py"), encoding="utf-8").read()
src3 = src3[src3.index("def trepadora"):src3.index("def arco_izq")]
exec(src3)

def entrelazada(dib, pts, rng, A=5.5, lam=44, w0=2.6, w1=.8, h0=14, h1=6, brotes=(70, 110), rizos=(45, 75), fin="espiral", sentido=1):
    """Enredadera que se entrelaza con el borde: cruza la línea por delante y por detrás (corte en el trazo),
    con hojas a ambos lados, brotes laterales hacia AFUERA y zarcillos. El ritmo es irregular (sin patrón repetido)."""
    P, L = resample(pts)
    f1, f2, f3 = rng.uniform(0, 6.28), rng.uniform(0, 6.28), rng.uniform(0, 6.28)
    fases, fase = [], 0.0
    for i in range(len(P)):
        lam_s = lam*(1 + .45*math.sin(2*math.pi*i/137 + f1) + .25*math.sin(2*math.pi*i/61 + f2))
        fase += 2*math.pi/max(18, lam_s)
        fases.append(fase)
    def off(i):
        tap = .55 + .45*(1 - i/L)
        amp = .6 + .4*math.sin(2*math.pi*i/97 + f3)
        return A*tap*amp*math.sin(fases[min(i, len(fases)-1)])
    def afuera(t):
        return (t[1]*sentido, -t[0]*sentido)
    stem, offs = [], []
    for i, (p, t) in enumerate(P):
        n = afuera(t)
        o = off(i)
        offs.append(o)
        stem.append(add(p, n, o))
    # cruces: uno sí y uno no, el tallo pasa por detrás del borde (hueco en el trazo)
    huecos, detras = [], False
    for i in range(1, len(offs)):
        if (offs[i-1] < 0) != (offs[i] < 0):
            if detras:
                huecos.append((i - 3.5, i + 3.5))
            detras = not detras
    tramo = []
    def cerrar():
        if len(tramo) > 1:
            k = (tramo[0][0] + tramo[-1][0]) / 2 / L
            dib.trazos.append((w0 + (w1 - w0)*k, poly([q for _, q in tramo])))
    for i, q in enumerate(stem):
        if any(a <= i <= b for a, b in huecos):
            cerrar(); tramo = []
        else:
            tramo.append((i, q))
    cerrar()
    # hojas a ambos lados del borde
    s = 5.0
    while s < L - 6:
        s += rng.uniform(8, 13)
        if s >= L - 4:
            break
        i = int(s); k = s/L
        p, t = P[i]
        n = afuera(t)
        lado = 1 if offs[i] > 0 else -1
        if rng.random() < .3:
            lado = -lado
        ang = math.radians(rng.uniform(30, 55))
        d = norm(add((t[0]*math.cos(ang), t[1]*math.cos(ang)), n, math.sin(ang)*lado))
        dib.hoja(stem[i], d, (h0 + (h1 - h0)*k)*rng.uniform(.8, 1.15), curva=.13*lado)
    # brotes laterales hacia afuera y zarcillos que se enroscan sobre el borde
    s = rng.uniform(*brotes)*.6
    while s < L - 30:
        i = int(s); k = s/L
        p, t = P[i]
        n = afuera(t)
        d = norm(add(t, n, rng.uniform(.9, 1.5)))
        tallo(dib, stem[i], d, rng.uniform(30, 48)*(1 - .4*k), rng.choice([-1, 1]), rng,
              w0=max(1.0, (w0 + (w1 - w0)*k)*.8), w1=.7, h0=(h0 + (h1 - h0)*k)*.75,
              final=rng.choice(["espiral", "espiral", "brote"]), R=rng.uniform(5, 8)*(1 - .3*k))
        s += rng.uniform(*brotes)
    s = rng.uniform(*rizos)*.5
    while s < L - 15:
        i = int(s); k = s/L
        p, t = P[i]
        n = afuera(t)
        sg = 1 if offs[i] > 0 else -1
        dib.espiral(stem[i], t, (n[0]*sg, n[1]*sg), rng.uniform(4, 6.5)*(1 - .35*k), vueltas=rng.uniform(1.2, 1.7), inclin=rng.uniform(.5, .9), ancho=max(.8, (w0 + (w1 - w0)*k)*.6))
        s += rng.uniform(*rizos)
    end, tf = stem[-1], P[-1][1]
    if fin == "espiral":
        n = afuera(tf)
        dib.espiral(end, tf, n, 6, vueltas=1.6, ancho=w1 + .2)
    elif fin == "brote":
        dib.hoja(end, tf, h1*1.6, ancho=.42)
        dib.hoja(end, rot(tf, .55), h1*1.1)
        dib.hoja(end, rot(tf, -.55), h1*1.1)
    return end, tf

def abrazo(dib, p0, centro, radio, giro, total, rng, w=1.2, hoja=8):
    """El tallo llega a un medallón (luna, sol) y lo rodea, como una planta que se enrosca."""
    a0 = math.atan2(p0[1] - centro[1], p0[0] - centro[0])
    r0 = math.dist(p0, centro)
    pts = []
    for i in range(121):
        f = i/120
        a = a0 + giro*total*f
        r = r0 + (radio - r0)*min(1, f*3) - 3*f
        pts.append((centro[0] + r*math.cos(a), centro[1] + r*math.sin(a)))
    dib.stem(pts, w, w*.7, partes=2)
    P, L = resample(pts)
    s = 6
    while s < L - 6:
        p, t = P[int(s)]
        n = (-t[1], t[0])
        sg = rng.choice([-1, 1])
        dib.hoja(p, rot(t, sg*.8), hoja*rng.uniform(.8, 1.1), curva=.12*sg)
        s += rng.uniform(9, 14)
    end, tf = P[-1]
    dib.espiral(end, tf, (-tf[1]*giro, tf[0]*giro), 4.5, vueltas=1.5, ancho=w*.8)

# ---------------- Ventana 400 x 540: borde exterior en x=10 ----------------
def borde_ventana(y_desde, t_hasta, x=10):
    pts = [(x, y_desde - i) for i in range(0, int(y_desde - 208), 2)]
    pts += [bez((x, 208), (x, 88), (96, 12), (200, 12), t_hasta*i/200) for i in range(1, 201)]
    return pts

LUNA = (200, -8)
def base_ventana(largo, y=520, x0=12):
    return [(x0 + i, y) for i in range(0, largo, 2)]
def base_tarjeta(largo, y=390.5, x0=6):
    return [(x0 + i, y) for i in range(0, largo, 2)]
def en_base(dib, pts, rng, h0=11, fin="brote"):
    """Enredadera que corre por la base desde la esquina hacia el centro; crece hacia abajo (afuera)."""
    entrelazada(dib, pts, rng, sentido=-1, A=3.6, lam=36, w0=2.2, w1=.7, h0=h0, h1=5, brotes=(55, 85), rizos=(35, 55), fin=fin)
rng = random.Random(41)
vi = Dib()
end, tf = entrelazada(vi, borde_ventana(519, .93), rng, A=6, w0=3.1, w1=1.0, h0=16, h1=7, brotes=(65, 95), rizos=(40, 65), fin=None)
abrazo(vi, end, LUNA, 33, 1, math.radians(150), rng, w=1.3, hoja=9)
mata(vi, (12, 518), (0, -1), (-1, 0), rng, 1.3, tallos=((.12, 1.1, "espiral"), (.42, .85, "brote"), (.75, .6, "espiral")))
flor_latigo(vi, (34, 520), (-.35, -1), 160, 1, rng, 1.0)
en_base(vi, base_ventana(80), rng, h0=12, fin="espiral")
V_IZQ = vi.svg()

rng = random.Random(77)
vd = Dib()
entrelazada(vd, [(10, 519 - i) for i in range(0, 270, 2)], rng, A=5, w0=2.6, w1=.8, h0=14, h1=6, brotes=(70, 110), rizos=(45, 70), fin="brote")
mata(vd, (12, 518), (0, -1), (-1, 0), rng, .9, tallos=((.2, .9, "brote"), (.6, .6, "espiral")), hojas_base=2)
helecho(vd, (16, 520), (-.45, -1), 100, -1, rng, 1.05)
en_base(vd, base_ventana(165), rng, h0=13, fin="brote")
V_DER = vd.svg()

rng = random.Random(5)
vt = Dib()
baja = [bez((10, 208), (10, 88), (96, 12), (200, 12), 1 - .62*i/200) for i in range(0, 201)]
entrelazada(vt, baja, rng, sentido=-1, A=4, lam=38, w0=2.0, w1=.7, h0=11, h1=5, brotes=(80, 120), rizos=(35, 50), fin="espiral")
V_TOPE = vt.svg()

# ---------------- Tarjetas: caja interior 307 x 390, borde CSS en x = -0.5 ----------------
W, H, R = 307, 390, 153.6
MEDALLON = (153.6, -1)
def borde_tarjeta(y_desde=388, a_max=1.0, x=-.5, y_hasta=None):
    pts = []
    y_tope = R if y_hasta is None else y_hasta
    pts += [(x, y_desde - i) for i in range(0, int(y_desde - y_tope), 2)]
    if y_hasta is None:
        a = math.pi
        while a < math.pi*a_max:
            pts.append((R + (R - x)*math.cos(a), R + (R - x)*math.sin(a)))
            a += .008
    return pts

variantes = []
# 1: izquierda trepa todo el lado y abraza el medallón; derecha helecho y enredadera hasta media altura.
rng = random.Random(101); a = Dib(); b = Dib()
end, tf = entrelazada(a, borde_tarjeta(a_max=1.43), rng, A=4.6, lam=40, w0=2.6, w1=.8, h0=13, h1=6, brotes=(70, 100), rizos=(45, 65), fin=None)
abrazo(a, end, MEDALLON, 27, 1, math.radians(120), rng, w=1.1, hoja=7)
mata(a, (2, 388), (0, -1), (-1, 0), rng, .82, tallos=((.06, 1.0, "espiral"), (.22, .7, "brote")), hojas_base=2)
entrelazada(b, borde_tarjeta(y_hasta=190), rng, A=4, lam=38, w0=2.2, w1=.7, h0=11, h1=5, brotes=(80, 120), rizos=(45, 65), fin="brote")
helecho(b, (0, 388), (-.12, -1), 92, -1, rng, .9)
en_base(a, base_tarjeta(60), rng, h0=10, fin="espiral")
en_base(b, base_tarjeta(135), rng, h0=10, fin="brote")
variantes.append((a.svg(), b.svg()))
# 2: izquierda sube hasta el arranque del arco y se abre; derecha lirio + enredadera que abraza el medallón.
rng = random.Random(202); a = Dib(); b = Dib()
entrelazada(a, borde_tarjeta(a_max=1.12), rng, A=4.4, lam=40, w0=2.4, w1=.8, h0=12, h1=5, brotes=(70, 105), rizos=(45, 65), fin="espiral")
mata(a, (2, 388), (0, -1), (-1, 0), rng, .78, tallos=((.1, .9, "brote"), (.25, .7, "espiral")), hojas_base=2)
end, tf = entrelazada(b, borde_tarjeta(a_max=1.43), rng, A=4.6, lam=42, w0=2.6, w1=.8, h0=13, h1=6, brotes=(65, 95), rizos=(45, 65), fin=None)
abrazo(b, end, MEDALLON, 27, 1, math.radians(115), rng, w=1.1, hoja=7)
flor_latigo(b, (0, 388), (-.1, -1), 175, -1, rng, .85)
en_base(a, base_tarjeta(135), rng, h0=10, fin="espiral")
en_base(b, base_tarjeta(55), rng, h0=10, fin="brote")
variantes.append((a.svg(), b.svg()))
# 3: izquierda baja desde el medallón por el arco y otra sube desde la base; derecha trepa todo el lado.
rng = random.Random(303); a = Dib(); b = Dib()
desde_med = []
ang = math.pi*1.45
while ang > math.pi*1.02:
    desde_med.append((R + (R + .5)*math.cos(ang), R + (R + .5)*math.sin(ang)))
    ang -= .008
desde_med += [(-.5, R + i) for i in range(2, 70, 2)]
entrelazada(a, desde_med, rng, sentido=-1, A=4, lam=38, w0=2.2, w1=.7, h0=11, h1=5, brotes=(80, 120), rizos=(40, 60), fin="brote")
entrelazada(a, borde_tarjeta(y_hasta=270), rng, A=3.8, lam=36, w0=2.2, w1=.8, h0=11, h1=5, brotes=(90, 130), rizos=(40, 60), fin="espiral")
helecho(a, (0, 388), (-.15, -1), 98, -1, rng, .9)
entrelazada(b, borde_tarjeta(a_max=1.3), rng, A=4.6, lam=42, w0=2.6, w1=.8, h0=13, h1=6, brotes=(65, 95), rizos=(40, 60), fin="espiral")
mata(b, (2, 388), (0, -1), (-1, 0), rng, .9, tallos=((.05, 1.0, "espiral"), (.16, .8, "brote"), (.28, .6, "espiral")), hojas_base=3)
en_base(a, base_tarjeta(85), rng, h0=10, fin="espiral")
en_base(b, base_tarjeta(95), rng, h0=10, fin="brote")
variantes.append((a.svg(), b.svg()))

FRISO = friso_largo(1200, 34, random.Random(5))

tpl = open(sys.argv[1], encoding="utf-8").read()
defs = (f'<g id="vIzq">{V_IZQ}</g><g id="vDer">{V_DER}</g><g id="vTope">{V_TOPE}</g><g id="frisoLargo">{FRISO}</g>'
        + "".join(f'<g id="t{i}a">{va}</g><g id="t{i}b">{vb}</g>' for i, (va, vb) in enumerate(variantes)))
tpl = tpl.replace("%%DEFS%%", defs)
contador = [0]
def tarjeta(m):
    img, nombre, tipo, precio = m.group(1).split("|")
    i = contador[0]; contador[0] += 1
    return f'''<div class="tarjeta">
      <svg class="medalla tallado" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" style="fill:var(--tarjeta-a)" stroke="currentColor" stroke-width="1.6"/><circle cx="22" cy="22" r="14.5" fill="none" stroke="currentColor" stroke-width=".8"/><use class="solo-oscuro" href="#luna-talla" x="10" y="10" width="24" height="24"/><use class="solo-claro" href="#sol-talla" x="10" y="10" width="24" height="24"/></svg>
      <svg class="rin-card" viewBox="0 0 {W} {H}"><use href="#t{i}a"/><g transform="translate({W} 0) scale(-1 1)"><use href="#t{i}b"/></g></svg>
      <div class="img"><img src="{img}" alt=""></div>
      <h3>{nombre}</h3><div class="tipo">{tipo}</div><div class="precio">USD {precio} <small>por noche</small></div>
    </div>'''
tpl = re.sub(r"%%TARJETA:(.*?)%%", tarjeta, tpl)
open(sys.argv[2], "w", encoding="utf-8").write(tpl)
print("ok", len(tpl))
