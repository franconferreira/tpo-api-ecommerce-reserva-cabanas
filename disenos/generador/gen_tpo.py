"""Genera public/ornamentos.svg para el TPO: un sprite con todos los ornamentos (símbolos y grupos con id).
Los componentes de React los usan con <use href="/ornamentos.svg#id" />. Todo usa currentColor,
así toma el color del tema donde se use (plata en oscuro, oro en claro).

Uso: python gen_tpo.py <salida.svg>
"""
import math, sys, random, os
AQUI = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(AQUI, "gen3_base.py"), encoding="utf-8").read())
src3 = open(os.path.join(AQUI, "gen3.py"), encoding="utf-8").read()
exec(src3[src3.index("def trepadora"):src3.index("def arco_izq")])
src4 = open(os.path.join(AQUI, "gen4.py"), encoding="utf-8").read()
exec(src4[src4.index("def entrelazada"):src4.index("# ---------------- Ventana")])

def en_base(dib, pts, rng, h0=11, fin="brote"):
    entrelazada(dib, pts, rng, sentido=-1, A=3.6, lam=36, w0=2.2, w1=.7, h0=h0, h1=5, brotes=(55, 85), rizos=(35, 55), fin=fin)

# ---------------- Ventana 400 x 540 (igual que el mockup) ----------------
def borde_ventana(y_desde, t_hasta, x=10):
    pts = [(x, y_desde - i) for i in range(0, int(y_desde - 208), 2)]
    pts += [bez((x, 208), (x, 88), (96, 12), (200, 12), t_hasta*i/200) for i in range(1, 201)]
    return pts

LUNA = (200, -8)
rng = random.Random(41); vi = Dib()
end, tf = entrelazada(vi, borde_ventana(519, .93), rng, A=6, w0=3.1, w1=1.0, h0=16, h1=7, brotes=(65, 95), rizos=(40, 65), fin=None)
abrazo(vi, end, LUNA, 33, 1, math.radians(150), rng, w=1.3, hoja=9)
mata(vi, (12, 518), (0, -1), (-1, 0), rng, 1.3, tallos=((.12, 1.1, "espiral"), (.42, .85, "brote"), (.75, .6, "espiral")))
flor_latigo(vi, (34, 520), (-.35, -1), 160, 1, rng, 1.0)
en_base(vi, [(12 + i, 520) for i in range(0, 80, 2)], rng, h0=12, fin="espiral")
rng = random.Random(77); vd = Dib()
entrelazada(vd, [(10, 519 - i) for i in range(0, 270, 2)], rng, A=5, w0=2.6, w1=.8, h0=14, h1=6, brotes=(70, 110), rizos=(45, 70), fin="brote")
mata(vd, (12, 518), (0, -1), (-1, 0), rng, .9, tallos=((.2, .9, "brote"), (.6, .6, "espiral")), hojas_base=2)
helecho(vd, (16, 520), (-.45, -1), 100, -1, rng, 1.05)
en_base(vd, [(12 + i, 520) for i in range(0, 165, 2)], rng, h0=13, fin="brote")
rng = random.Random(5); vt = Dib()
baja = [bez((10, 208), (10, 88), (96, 12), (200, 12), 1 - .62*i/200) for i in range(0, 201)]
entrelazada(vt, baja, rng, sentido=-1, A=4, lam=38, w0=2.0, w1=.7, h0=11, h1=5, brotes=(80, 120), rizos=(35, 50), fin="espiral")

# ---------------- Tarjeta del catálogo: caja interior 307 x 470 ----------------
W, H, R = 307, 470, 153.6
MED = (153.6, -1)
def borde_t(a_max=1.0, y_hasta=None, x=-.5):
    y_desde = H - 2
    tope = R if y_hasta is None else y_hasta
    pts = [(x, y_desde - i) for i in range(0, int(y_desde - tope), 2)]
    if y_hasta is None:
        a = math.pi
        while a < math.pi*a_max:
            pts.append((R + (R - x)*math.cos(a), R + (R - x)*math.sin(a)))
            a += .008
    return pts
def base_t(largo):
    return [(6 + i, H + .5) for i in range(0, largo, 2)]

tarjetas = []
rng = random.Random(101); a = Dib(); b = Dib()
end, tf = entrelazada(a, borde_t(a_max=1.43), rng, A=4.6, lam=40, w0=2.6, w1=.8, h0=13, h1=6, brotes=(70, 100), rizos=(45, 65), fin=None)
abrazo(a, end, MED, 27, 1, math.radians(120), rng, w=1.1, hoja=7)
mata(a, (2, H - 2), (0, -1), (-1, 0), rng, .82, tallos=((.06, 1.0, "espiral"), (.22, .7, "brote")), hojas_base=2)
entrelazada(b, borde_t(y_hasta=240), rng, A=4, lam=38, w0=2.2, w1=.7, h0=11, h1=5, brotes=(80, 120), rizos=(45, 65), fin="brote")
helecho(b, (0, H - 2), (-.12, -1), 92, -1, rng, .9)
en_base(a, base_t(60), rng, h0=10, fin="espiral"); en_base(b, base_t(135), rng, h0=10, fin="brote")
tarjetas.append((a, b))
rng = random.Random(202); a = Dib(); b = Dib()
entrelazada(a, borde_t(a_max=1.12), rng, A=4.4, lam=40, w0=2.4, w1=.8, h0=12, h1=5, brotes=(70, 105), rizos=(45, 65), fin="espiral")
mata(a, (2, H - 2), (0, -1), (-1, 0), rng, .78, tallos=((.1, .9, "brote"), (.25, .7, "espiral")), hojas_base=2)
end, tf = entrelazada(b, borde_t(a_max=1.43), rng, A=4.6, lam=42, w0=2.6, w1=.8, h0=13, h1=6, brotes=(65, 95), rizos=(45, 65), fin=None)
abrazo(b, end, MED, 27, 1, math.radians(115), rng, w=1.1, hoja=7)
flor_latigo(b, (0, H - 2), (-.1, -1), 175, -1, rng, .85)
en_base(a, base_t(135), rng, h0=10, fin="espiral"); en_base(b, base_t(55), rng, h0=10, fin="brote")
tarjetas.append((a, b))
rng = random.Random(303); a = Dib(); b = Dib()
desde_med = []
ang = math.pi*1.45
while ang > math.pi*1.02:
    desde_med.append((R + (R + .5)*math.cos(ang), R + (R + .5)*math.sin(ang)))
    ang -= .008
desde_med += [(-.5, R + i) for i in range(2, 70, 2)]
entrelazada(a, desde_med, rng, sentido=-1, A=4, lam=38, w0=2.2, w1=.7, h0=11, h1=5, brotes=(80, 120), rizos=(40, 60), fin="brote")
entrelazada(a, borde_t(y_hasta=340), rng, A=3.8, lam=36, w0=2.2, w1=.8, h0=11, h1=5, brotes=(90, 130), rizos=(40, 60), fin="espiral")
helecho(a, (0, H - 2), (-.15, -1), 98, -1, rng, .9)
entrelazada(b, borde_t(a_max=1.3), rng, A=4.6, lam=42, w0=2.6, w1=.8, h0=13, h1=6, brotes=(65, 95), rizos=(40, 60), fin="espiral")
mata(b, (2, H - 2), (0, -1), (-1, 0), rng, .9, tallos=((.05, 1.0, "espiral"), (.16, .8, "brote"), (.28, .6, "espiral")), hojas_base=3)
en_base(a, base_t(85), rng, h0=10, fin="espiral"); en_base(b, base_t(95), rng, h0=10, fin="brote")
tarjetas.append((a, b))

# ---------------- Esquinas para paneles rectangulares (origen = esquina inferior izquierda) ----------------
# Se dibujan con la esquina en (0, 0): el borde izquierdo sube por y negativas y la base va hacia x positivas.
paneles = []
for semilla, (alto, largo_base, especie) in ((501, (170, 110, "mata")), (502, (120, 160, "helecho")), (503, (210, 90, "lirio"))):
    rng = random.Random(semilla); p = Dib()
    entrelazada(p, [(-.5, -2 - i) for i in range(0, alto, 2)], rng, A=4, lam=38, w0=2.4, w1=.7, h0=12, h1=5, brotes=(60, 95), rizos=(40, 60), fin="espiral")
    en_base(p, [(4 + i, .5) for i in range(0, largo_base, 2)], rng, h0=10, fin="brote")
    if especie == "mata":
        mata(p, (1, -1), (0, -1), (-1, 0), rng, .8, tallos=((.08, 1.0, "espiral"), (.3, .75, "brote"), (.55, .55, "espiral")), hojas_base=3)
    elif especie == "helecho":
        helecho(p, (0, -1), (-.3, -1), 95, -1, rng, .9)
        mata(p, (1, -1), (0, -1), (-1, 0), rng, .55, tallos=((.4, .8, "brote"),), hojas_base=2)
    else:
        flor_latigo(p, (0, -1), (-.25, -1), 150, -1, rng, .85)
        mata(p, (1, -1), (0, -1), (-1, 0), rng, .6, tallos=((.2, .9, "espiral"),), hojas_base=2)
    paneles.append(p)

FRISO = friso_largo(1200, 34, random.Random(5))

SIMBOLOS = '''
<symbol id="hoja" viewBox="0 0 24 10"><path d="M0 5 C 6 -1, 18 -1, 24 5 C 18 11, 6 11, 0 5 Z" fill="currentColor"/></symbol>
<symbol id="latigo" viewBox="0 0 240 50"><g fill="none" stroke="currentColor" stroke-linecap="round"><path d="M238 25 C 200 25, 186 5, 150 9 C 112 13, 104 43, 66 41 C 34 39, 20 18, 33 9 C 44 2, 57 14, 48 22 C 42 28, 34 22, 38 17" stroke-width="2"/><path d="M238 25 C 208 31, 192 47, 162 43 C 141 40, 139 29, 150 29" stroke-width="1.3"/><path d="M120 16 C 112 4, 98 6, 100 15" stroke-width="1.2"/></g><use href="#hoja" x="170" y="5" width="20" height="8" transform="rotate(-12 180 9)"/><use href="#hoja" x="80" y="38" width="20" height="8" transform="rotate(12 90 42)"/><circle cx="38" cy="17" r="2.6" fill="currentColor"/><circle cx="150" cy="29" r="2" fill="currentColor"/></symbol>
<symbol id="divisor" viewBox="0 0 400 40"><g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M182 20 C 165 20, 160 6, 130 10 C 100 14, 90 30, 60 26 C 40 23, 30 14, 6 20"/><path d="M218 20 C 235 20, 240 6, 270 10 C 300 14, 310 30, 340 26 C 360 23, 370 14, 394 20"/><path d="M150 12 C 140 2, 124 4, 126 14 C 128 22, 140 18, 136 12"/><path d="M250 12 C 260 2, 276 4, 274 14 C 272 22, 260 18, 264 12"/></g><use href="#hoja" x="86" y="24" width="18" height="7" transform="rotate(20 95 27)"/><use href="#hoja" x="296" y="24" width="18" height="7" transform="rotate(-20 305 27)"/></symbol>
<symbol id="voluta" viewBox="0 0 20 20"><path d="M1 18 C 6 18, 12 16, 15 11 C 18 6, 14 2, 10 4 C 7 6, 9 10, 12 8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="luna-talla" viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M40 8 A 25 25 0 1 0 57 45 A 19 19 0 1 1 40 8 Z" stroke-width="2.2"/><path d="M36 14 A 20 20 0 1 0 50 46" stroke-width="1" opacity=".7"/><path d="M14 13 l1.3 3.6 3.6 1.3 -3.6 1.3 -1.3 3.6 -1.3 -3.6 -3.6 -1.3 3.6 -1.3Z" stroke-width="1.2"/><path d="M54 14 l.9 2.3 2.3 .9 -2.3 .9 -.9 2.3 -.9 -2.3 -2.3 -.9 2.3 -.9Z" stroke-width="1"/></g></symbol>
<symbol id="sol-talla" viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="13" stroke-width="2.2"/><circle cx="32" cy="32" r="9" stroke-width="1" opacity=".7"/><path d="M32 4 V 13 M32 51 V 60 M4 32 H 13 M51 32 H 60 M12.2 12.2 L 18.6 18.6 M45.4 45.4 L 51.8 51.8 M51.8 12.2 L 45.4 18.6 M18.6 45.4 L 12.2 51.8" stroke-width="2"/><path d="M23 6.5 L 25.5 15 M41 6.5 L 38.5 15 M23 57.5 L 25.5 49 M41 57.5 L 38.5 49 M6.5 23 L 15 25.5 M6.5 41 L 15 38.5 M57.5 23 L 49 25.5 M57.5 41 L 49 38.5" stroke-width="1"/></g></symbol>
<symbol id="latigosFondo" viewBox="0 0 1200 640" preserveAspectRatio="none"><g fill="none" stroke="currentColor" stroke-linecap="round"><path d="M560 620 C 640 540, 600 340, 760 260 C 900 190, 1040 260, 1010 350 C 990 410, 920 390, 940 350 C 952 326, 980 334, 975 350" stroke-width="1.6"/><path d="M600 630 C 690 560, 660 370, 800 300 C 920 240, 1030 300, 1000 360" stroke-width="1"/><path d="M1200 90 C 1090 70, 1010 150, 900 120 C 820 98, 800 40, 850 30 C 885 23, 895 60, 870 64" stroke-width="1.4"/></g></symbol>
'''

partes = [SIMBOLOS,
          f'<g id="frisoLargo">{FRISO}</g>',
          f'<g id="vIzq">{vi.svg()}</g>', f'<g id="vDer">{vd.svg()}</g>', f'<g id="vTope">{vt.svg()}</g>']
for i, (a, b) in enumerate(tarjetas):
    partes.append(f'<g id="t{i}a">{a.svg()}</g><g id="t{i}b">{b.svg()}</g>')
for i, p in enumerate(paneles):
    partes.append(f'<g id="p{i}">{p.svg()}</g>')

svg = '<svg xmlns="http://www.w3.org/2000/svg">\n<!-- Generado por disenos/generador/gen_tpo.py: no editar a mano -->\n<defs>\n' + "\n".join(partes) + '\n</defs>\n</svg>\n'
open(sys.argv[1], "w", encoding="utf-8").write(svg)
print("ok", len(svg))
