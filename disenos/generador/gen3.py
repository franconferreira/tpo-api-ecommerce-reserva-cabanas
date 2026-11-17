import math, sys, random, re, os
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "gen3_base.py"), encoding="utf-8").read())

def camino(pts_lista):
    return pts_lista

def trepadora(dib, pts, lado, rng, w0=2.4, w1=.6, h0=13, h1=4, A=2.2, rizos=(40, 70), R=(4.5, 7.5)):
    """Enredadera que trepa siguiendo un borde: arranca gruesa en la raíz y se afina; volutas chicas que no rompen la silueta."""
    P, L = resample(pts)
    stem = []
    for i, (p, t) in enumerate(P):
        n = (-t[1]*lado, t[0]*lado)
        off = A*(math.sin(2*math.pi*i/47)*.55 + math.sin(2*math.pi*i/29 + .7)*.45)*(1 - .5*i/L)
        stem.append(add(p, n, off))
    dib.stem(stem, w0, w1, partes=6)
    s, lh, prox = 6.0, 1, rng.uniform(*rizos)
    while s < L - 8:
        s += rng.uniform(9, 16)
        if s >= L - 5:
            break
        k = s/L
        p, t = P[int(s)]
        n = (-t[1]*lado, t[0]*lado)
        base = stem[int(s)]
        lh = -lh if rng.random() < .75 else lh
        ang = math.radians(rng.uniform(26, 48))
        d = norm(add((t[0]*math.cos(ang), t[1]*math.cos(ang)), n, math.sin(ang)*lh))
        dib.hoja(base, d, (h0 + (h1-h0)*k)*rng.uniform(.8, 1.15), curva=.12*lh)
        if s > prox and s < L - 18:
            prox = s + rng.uniform(*rizos)
            sg = rng.choice([-1, 1])
            dib.espiral(base, t, (n[0]*sg, n[1]*sg), rng.uniform(*R)*(1 - .45*k), vueltas=rng.uniform(1.2, 1.6), inclin=rng.uniform(.6, 1.1), ancho=max(.7, w0*(1-k)*.75))
    end, tf = P[-1]
    n = (-tf[1]*lado, tf[0]*lado)
    dib.espiral(stem[-1], tf, n, 5, vueltas=1.5, inclin=.5, ancho=w1+.2)

def mata(dib, o, arriba, lateral, rng, escala, tallos=((.08, 1.0, "espiral"), (.3, .78, "brote"), (.55, .6, "espiral")), hojas_base=3):
    """Mata baja: tallos en abanico entre 'arriba' y 'lateral' (no sale hacia la tarjeta vecina si lateral apunta hacia adentro)."""
    for t, lf, fin in tallos:
        d = norm(add((arriba[0]*(1-t), arriba[1]*(1-t)), lateral, t))
        curva = -1 if lateral[0] < 0 else 1
        tallo(dib, o, d, 100*escala*lf*rng.uniform(.9, 1.1), curva, rng, w0=2.4*min(1, escala+.3), w1=.9, h0=13*escala, final=fin, R=rng.uniform(7, 11)*escala)
    for a in rng.sample([-.5, -.2, .1, .35, .6], hojas_base):
        dib.hoja(o, rot(norm(add(arriba, lateral, .5)), a), 16*escala*rng.uniform(.85, 1.1), ancho=.4)
    for k in range(2):
        dib.bayas.append((add(add(o, arriba, 8 + 6*k), lateral, 5 + 2*k), 2.1))

def flor_latigo(dib, o, d, largo, curva, rng, escala=1.0):
    """Tallo largo en latigazo que remata en un pimpollo tipo lirio, con hojas largas como espadas en la base."""
    d = norm(d)
    p1 = add(o, d, largo*.45)
    d2 = rot(d, curva*math.radians(30))
    p2 = add(p1, d2, largo*.3)
    d3 = rot(d2, -curva*math.radians(48))
    p3 = add(p2, d3, largo*.28)
    pts = [bez(o, p1, p2, p3, i/140) for i in range(141)]
    dib.stem(pts, 2.2*escala + .4, 1.0, partes=4)
    P, L = resample(pts)
    tip, tf = P[-1]
    nf = (-tf[1], tf[0])
    # pimpollo: pétalo central y dos laterales que se abren en latigazo
    dib.hoja(tip, tf, 18*escala, ancho=.3)
    for sg in (-1, 1):
        a = add(tip, tf, 4*escala)
        c1 = add(add(a, tf, 8*escala), nf, sg*9*escala)
        e = add(add(a, tf, 4*escala), nf, sg*15*escala)
        dib.trazos.append((1.3, f"M{F(a[0])} {F(a[1])} Q{F(c1[0])} {F(c1[1])} {F(e[0])} {F(e[1])}"))
        dib.hoja(tip, rot(tf, sg*.5), 11*escala, ancho=.35)
        dib.bayas.append((e, 1.6))
    # hojas largas en la base
    for sg, ln in ((-1, 46), (1, 36)):
        dib.hoja(o, rot(d, sg*.28), ln*escala, ancho=.16, curva=.22*sg)
    s = 30
    while s < L - 30:
        p, t = P[int(s)]
        sg = rng.choice([-1, 1])
        dib.hoja(p, rot(t, sg*.7), 10*escala, curva=.1*sg)
        s += rng.uniform(26, 38)

def helecho(dib, o, d, largo, curva, rng, escala=1.0):
    """Fronda de helecho que se enrosca al final (báculo), con foliolos que se achican."""
    d = norm(d)
    p1 = add(o, d, largo*.5)
    d2 = rot(d, curva*math.radians(40))
    p2 = add(p1, d2, largo*.35)
    pts = [bez(o, p1, p2, add(p2, rot(d2, curva*math.radians(40)), largo*.15), i/100) for i in range(101)]
    dib.stem(pts, 2.0*escala + .3, 1.0, partes=3)
    P, L = resample(pts)
    s = 8
    while s < L - 6:
        p, t = P[int(s)]
        k = s/L
        for sg in (-1, 1):
            dib.hoja(p, rot(t, sg*math.radians(62)), 9*escala*(1 - .6*k), ancho=.32)
        s += 6 + 3*k
    end, tf = P[-1]
    n = (-tf[1]*curva, tf[0]*curva)
    dib.espiral(end, tf, n, 11*escala, vueltas=1.8, achique=5, inclin=.3, ancho=1.3)

def arco_izq(t0, t1, x=16, y=210, top=18):
    return [bez((x, y), (x, 93), (100, top), (200, top), t0 + (t1-t0)*i/200) for i in range(201)]

# ======================= Ventana 400 x 540 =======================
# Abajo-izquierda pesado (trepadora que sube hasta el arco + mata), arriba-derecha liviano (ramita que baja del símbolo),
# abajo-derecha una mata baja distinta. Ninguna esquina repite la de enfrente.
rng = random.Random(41)
vi = Dib()
sube = [(15, 514 - i) for i in range(0, 305, 2)] + arco_izq(0, .62, x=15)
trepadora(vi, sube, -1, rng, w0=3.2, w1=.8, h0=17, h1=6, A=2.6, R=(5.5, 9))
mata(vi, (12, 518), (0, -1), (-1, 0), rng, 1.35, tallos=((.12, 1.1, "espiral"), (.42, .85, "brote"), (.75, .6, "espiral")))
flor_latigo(vi, (34, 520), (-.35, -1), 165, 1, rng, 1.05)
V_IZQ = vi.svg()

rng = random.Random(77)
vd = Dib()
mata(vd, (12, 518), (0, -1), (-1, 0), rng, .95, tallos=((.2, .9, "brote"), (.6, .6, "espiral")), hojas_base=2)
helecho(vd, (16, 520), (-.45, -1), 105, -1, rng, 1.1)
V_DER = vd.svg()

rng = random.Random(5)
vt = Dib()
baja = arco_izq(1, .52, x=15)
trepadora(vt, baja, 1, rng, w0=2.3, w1=.6, h0=12, h1=5, A=1.8, rizos=(30, 45), R=(4.5, 7))
V_TOPE = vt.svg()

# ======================= Tarjetas: caja 307 x 390 =======================
W, H, r = 307, 390, 153.6
def lado_y_arco(x=3, desde=386, a_max=1.25):
    pts = [(x, desde - i) for i in range(0, int(desde - r), 2)]
    a = math.pi
    while a < math.pi*a_max:
        pts.append((r + (r - x)*math.cos(a), r + (r - x)*math.sin(a)))
        a += .01
    return pts

variantes = []
# Tarjeta 1: trepadora a la izquierda que sube hasta el arco; a la derecha, helecho chico.
rng = random.Random(101); a = Dib(); b = Dib()
trepadora(a, lado_y_arco(a_max=1.22), -1, rng, w0=2.7, w1=.6, h0=14, h1=5, A=2.0, rizos=(45, 70), R=(5, 7.5))
mata(a, (4, 386), (0, -1), (1, 0), rng, .82, tallos=((.15, 1.0, "espiral"), (.5, .7, "brote")), hojas_base=2)
helecho(b, (8, 386), (.15, -1), 92, 1, rng, .9)
variantes.append((a.svg(), b.svg()))
# Tarjeta 2: izquierda una mata baja; derecha un lirio en latigazo que sube por el borde.
rng = random.Random(202); a = Dib(); b = Dib()
mata(a, (4, 386), (0, -1), (1, 0), rng, .78, tallos=((.2, .9, "brote"), (.55, .7, "espiral")), hojas_base=2)
flor_latigo(b, (8, 386), (.12, -1), 190, 1, rng, .88)
trepadora(b, [(3, 386 - i) for i in range(0, 150, 2)], -1, rng, w0=2.2, w1=.5, h0=11, h1=4, A=1.5, rizos=(40, 60), R=(3.5, 5))
variantes.append((a.svg(), b.svg()))
# Tarjeta 3: izquierda ramita que baja desde el medallón por el arco; abajo un helecho; derecha una mata media.
rng = random.Random(303); a = Dib(); b = Dib()
desde_medallon = []
ang = math.pi*1.47
while ang > math.pi*1.18:
    desde_medallon.append((r + (r - 3)*math.cos(ang), r + (r - 3)*math.sin(ang)))
    ang -= .01
trepadora(a, desde_medallon, 1, rng, w0=2.2, w1=.5, h0=11, h1=4, A=1.5, rizos=(30, 45), R=(4.5, 6.5))
helecho(a, (6, 386), (.2, -1), 100, 1, rng, .92)
mata(b, (4, 386), (0, -1), (1, 0), rng, .9, tallos=((.1, 1.0, "espiral"), (.35, .8, "brote"), (.62, .6, "espiral")), hojas_base=3)
trepadora(b, [(3, 380 - i) for i in range(0, 130, 2)], -1, rng, w0=2.2, w1=.5, h0=11, h1=4, A=1.4, rizos=(40, 60), R=(4, 6))
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
      <svg class="rin-card" viewBox="0 0 {W} {H}"><use href="#t{i}a"/><g transform="translate({W} 0) scale(-1 1)"><use href="#t{i}b"/></g></svg>
      <svg class="medalla tallado" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" style="fill:var(--tarjeta-a)" stroke="currentColor" stroke-width="1.6"/><circle cx="22" cy="22" r="14.5" fill="none" stroke="currentColor" stroke-width=".8"/><use class="solo-oscuro" href="#luna-talla" x="10" y="10" width="24" height="24"/><use class="solo-claro" href="#sol-talla" x="10" y="10" width="24" height="24"/></svg>
      <div class="img"><img src="{img}" alt=""></div>
      <h3>{nombre}</h3><div class="tipo">{tipo}</div><div class="precio">USD {precio} <small>por noche</small></div>
    </div>'''
tpl = re.sub(r"%%TARJETA:(.*?)%%", tarjeta, tpl)
open(sys.argv[2], "w", encoding="utf-8").write(tpl)
print("ok", len(tpl))
