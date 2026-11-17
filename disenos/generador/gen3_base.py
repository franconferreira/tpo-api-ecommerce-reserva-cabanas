import math, sys, random, re

def bez(p0, p1, p2, p3, t):
    m = 1 - t
    return (m**3*p0[0] + 3*m*m*t*p1[0] + 3*m*t*t*p2[0] + t**3*p3[0],
            m**3*p0[1] + 3*m*m*t*p1[1] + 3*m*t*t*p2[1] + t**3*p3[1])

def norm(v):
    n = math.hypot(*v) or 1
    return (v[0]/n, v[1]/n)

def rot(v, a):
    c, s = math.cos(a), math.sin(a)
    return (v[0]*c - v[1]*s, v[0]*s + v[1]*c)

def add(a, b, k=1.0):
    return (a[0] + b[0]*k, a[1] + b[1]*k)

def resample(pts, step=1.0):
    acc = [0.0]
    for i in range(1, len(pts)):
        acc.append(acc[-1] + math.dist(pts[i-1], pts[i]))
    L = acc[-1]
    out, s, j = [], 0.0, 1
    while s <= L:
        while j < len(pts) - 1 and acc[j] < s:
            j += 1
        seg = acc[j] - acc[j-1] or 1e-9
        f = (s - acc[j-1]) / seg
        p = (pts[j-1][0] + (pts[j][0]-pts[j-1][0])*f, pts[j-1][1] + (pts[j][1]-pts[j-1][1])*f)
        t = norm((pts[j][0]-pts[j-1][0], pts[j][1]-pts[j-1][1]))
        out.append((p, t))
        s += step
    return out, L

def F(v):
    return f"{v:.1f}"

def poly(pts):
    return "M" + " L".join(f"{F(x)} {F(y)}" for x, y in pts)

class Dib:
    def __init__(self):
        self.trazos = []   # (ancho, path)
        self.hojas = []
        self.bayas = []
    def stem(self, pts, w0, w1, partes=4):
        n = len(pts)
        for i in range(partes):
            a, b = int(i*n/partes), int((i+1)*n/partes) + 1
            seg = pts[a:min(b, n)]
            if len(seg) > 1:
                self.trazos.append((w0 + (w1-w0)*i/(partes-1 if partes > 1 else 1), poly(seg)))
    def hoja(self, base, d, ln, ancho=.38, curva=.12):
        d = norm(d)
        w = (-d[1], d[0])
        m = add(base, d, ln*.5)
        tip = add(add(base, d, ln), w, ln*curva)
        W = ln*ancho
        a = add(m, w, W + ln*curva)
        b = add(m, w, -W + ln*curva)
        self.hojas.append(f"M{F(base[0])} {F(base[1])} Q{F(a[0])} {F(a[1])} {F(tip[0])} {F(tip[1])} Q{F(b[0])} {F(b[1])} {F(base[0])} {F(base[1])}Z")
    def espiral(self, o, u, v, R, vueltas=1.5, achique=4.5, inclin=.35, ancho=1.4):
        b = math.log(achique) / (2*math.pi*vueltas)
        c = (inclin*R, R)
        pts = [o]
        for i in range(60):
            th = -math.pi/2 + 2*math.pi*vueltas*i/59
            r = R*math.exp(-b*(th + math.pi/2))
            lx, ly = c[0] + r*math.cos(th), c[1] + r*math.sin(th)
            pts.append((o[0] + lx*u[0] + ly*v[0], o[1] + lx*u[1] + ly*v[1]))
        self.trazos.append((ancho, poly(pts)))
        self.bayas.append((pts[-1], 1.8))
    def svg(self):
        out = []
        for w, d in self.trazos:
            out.append(f'<path d="{d}" fill="none" stroke="currentColor" stroke-width="{w:.2f}" stroke-linecap="round" stroke-linejoin="round"/>')
        if self.hojas:
            out.append(f'<path d="{" ".join(self.hojas)}" fill="currentColor"/>')
        out.append("".join(f'<circle cx="{F(p[0])}" cy="{F(p[1])}" r="{r}" fill="currentColor"/>' for p, r in self.bayas))
        return "\n".join(out)

def enredadera_borde(dib, pts, lado, rng, w0=2.0, w1=.7, h0=11, h1=4, rizo_cada=(55, 80)):
    """Tallo fino pegado al borde que se va afinando: casi sin ondas, hojas recostadas y algún zarcillo chico."""
    P, L = resample(pts)
    stem = []
    for i, (p, t) in enumerate(P):
        s = i
        n = (-t[1]*lado, t[0]*lado)
        off = 1.4*(math.sin(2*math.pi*s/41) * .6 + math.sin(2*math.pi*s/27 + 1.3) * .4) * (1 - .6*s/L)
        stem.append(add(p, n, off))
    dib.stem(stem, w0, w1, partes=5)
    s, lado_h, prox_rizo = 8.0, 1, rng.uniform(*rizo_cada)
    while s < L - 6:
        s += rng.uniform(10, 18)
        if s >= L - 4:
            break
        k = s / L
        p, t = P[int(s)]
        n = (-t[1]*lado, t[0]*lado)
        base = stem[int(s)]
        lado_h = -lado_h if rng.random() < .8 else lado_h
        ang = math.radians(rng.uniform(24, 40))
        d = norm(add((t[0]*math.cos(ang), t[1]*math.cos(ang)), n, math.sin(ang)*lado_h))
        dib.hoja(base, d, (h0 + (h1-h0)*k) * rng.uniform(.8, 1.1), curva=.1*lado_h)
        if s > prox_rizo and s < L - 20:
            prox_rizo = s + rng.uniform(*rizo_cada)
            sg = rng.choice([-1, 1])
            v = (n[0]*sg, n[1]*sg)
            dib.espiral(base, t, v, rng.uniform(3.2, 4.6) * (1 - .4*k), vueltas=1.3, inclin=1.1, ancho=max(.7, w0*(1-k)*.7))

def tallo(dib, o, d, largo, curva, rng, w0=2.4, w1=1.0, h0=13, final="espiral", R=None):
    """Tallo en latigazo (coup de fouet) que sale de una esquina y remata en espiral o brote."""
    d = norm(d)
    p1 = add(o, d, largo*.42)
    d2 = rot(d, curva*math.radians(rng.uniform(38, 58)))
    p2 = add(p1, d2, largo*.34)
    d3 = rot(d2, -curva*math.radians(rng.uniform(20, 40)))
    p3 = add(p2, d3, largo*.3)
    pts = [bez(o, p1, p2, p3, i/120) for i in range(121)]
    dib.stem(pts, w0, w1, partes=4)
    P, L = resample(pts)
    s, lado = rng.uniform(8, 14), rng.choice([-1, 1])
    while s < L - 14:
        k = s / L
        p, t = P[int(s)]
        n = (-t[1], t[0])
        ang = math.radians(rng.uniform(32, 55))
        dd = norm(add((t[0]*math.cos(ang), t[1]*math.cos(ang)), n, math.sin(ang)*lado))
        dib.hoja(p, dd, h0*(1 - .55*k)*rng.uniform(.85, 1.1), curva=.12*lado)
        lado = -lado
        s += rng.uniform(11, 17)
    end, tf = P[-1]
    n = (-tf[1], tf[0])
    sg = -curva
    if final == "espiral":
        dib.espiral(end, tf, (n[0]*sg, n[1]*sg), R or rng.uniform(6, 11), ancho=max(.9, w1))
    else:
        dib.hoja(end, tf, h0*.7, ancho=.45)
        dib.hoja(end, rot(tf, .6), h0*.5)
        dib.hoja(end, rot(tf, -.6), h0*.5)
        dib.bayas.append((add(end, tf, -2), 2.4))

def planta_esquina(dib, o, arriba, afuera, adentro, escala, rng):
    """Mata que crece desde una esquina: varios tallos en abanico, hojas grandes en la base y bayas."""
    for t, lf, fin in ((.04, 1.45, "espiral"), (.16, 1.15, "brote"), (.3, .95, "espiral"), (.46, .75, "espiral"), (.66, .52, "brote")):
        d = norm(add((arriba[0]*(1-t), arriba[1]*(1-t)), afuera, t))
        curva = -1 if afuera[0] < 0 else 1
        tallo(dib, o, d, 112*escala*lf*rng.uniform(.92, 1.08), curva, rng, w0=2.8*min(1, escala+.25), w1=1.0, h0=14*escala, final=fin, R=rng.uniform(9, 14)*escala)
    d_in = norm(add(adentro, arriba, .18))
    tallo(dib, o, d_in, 80*escala, 1 if adentro[0] > 0 else -1, rng, w0=2.0, w1=.8, h0=10*escala, final="espiral", R=5*escala)
    for a in (-.35, .05, .5):
        dib.hoja(o, rot(norm(add(arriba, afuera, .6)), a), 17*escala, ancho=.42)
    for k in range(3):
        dib.bayas.append((add(add(o, arriba, 9 + 5*k), afuera, 4 + 3*(k % 2)), 2.2))

def friso_largo(ancho, alto, rng, A=6.5):
    """Rinceau largo sin repetición: el tallo ondula con períodos que no coinciden y las volutas cambian de tamaño."""
    dib = Dib()
    y0 = alto/2
    def fase(x):
        return 2*math.pi*x/96 + 1.3*math.sin(2*math.pi*x/251) + .8*math.sin(2*math.pi*x/157 + 2) + .5*math.sin(2*math.pi*x/389 + 1)
    pts = [(x, y0 + A*math.sin(fase(x))) for x in range(0, ancho + 1, 2)]
    dib.stem(pts, 1.8, 1.8, partes=1)
    prev = fase(0)
    for x in range(1, ancho):
        f = fase(x)
        if math.floor((prev - math.pi/2)/math.pi) != math.floor((f - math.pi/2)/math.pi) and 12 < x < ancho - 12:
            arriba = math.sin(f) > 0
            o = (x, y0 + A*math.sin(f))
            v = (0, 1) if arriba else (0, -1)
            u = (1, 0) if rng.random() < .7 else (-1, 0)
            if rng.random() < .82:
                dib.espiral(o, u, v, rng.uniform(5.5, 9.5), vueltas=rng.uniform(1.2, 1.7), inclin=rng.uniform(.2, .55), ancho=1.3)
            for sg in (-1, 1):
                if rng.random() < .75:
                    dd = norm((u[0]*sg*.8, -v[1]*.9 + rng.uniform(-.2, .2)))
                    dib.hoja(o, dd, rng.uniform(7, 11), curva=.15*sg)
        prev = f
    x = 6.0
    while x < ancho - 6:
        x += rng.uniform(14, 30)
        if x >= ancho - 4:
            break
        y = y0 + A*math.sin(fase(x))
        dy = A*math.cos(fase(x))*(2*math.pi/96)
        t = norm((1, dy))
        sg = rng.choice([-1, 1])
        dib.hoja((x, y), rot(t, sg*math.radians(rng.uniform(30, 55))), rng.uniform(5, 8.5), curva=.12*sg)
    return dib.svg()

