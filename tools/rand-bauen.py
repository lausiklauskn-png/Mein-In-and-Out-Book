"""Silberner, spiegelnder Rand um das App-Icon (Klaus 2026-10-02).

Quelle: icons/quelle-512.png (das Icon OHNE Rand, einmal gesichert).
Baut daraus alle Größen neu. Nie die fertigen Icons als Quelle nehmen,
sonst bekommt jedes Bauen einen Rand mehr.
    python3 tools/rand-bauen.py
"""
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import numpy as np
import os

HIER = os.path.join(os.path.dirname(__file__), "..", "icons")
QUELLE = os.path.join(HIER, "quelle-512.png")
SS = 4  # Überabtastung

# Metall: diagonal von oben links (hell) nach unten rechts (dunkel), mit zwei Glanzstreifen.
STOPS = [(0.00, (250, 252, 253)), (0.18, (196, 203, 209)), (0.34, (255, 255, 255)),
         (0.50, (150, 158, 166)), (0.66, (226, 230, 233)), (0.82, (128, 136, 144)),
         (1.00, (92, 100, 108))]

def farbe(t):
    for (a, ca), (b, cb) in zip(STOPS, STOPS[1:]):
        if t <= b:
            f = (t - a) / (b - a) if b > a else 0
            return tuple(round(ca[i] + (cb[i] - ca[i]) * f) for i in range(3))
    return STOPS[-1][1]

def metall(n):
    zeile = np.array([farbe(i / (2 * n - 2)) for i in range(2 * n - 1)], dtype=np.uint8)
    y, x = np.mgrid[0:n, 0:n]
    return Image.fromarray(zeile[x + y], "RGB")

def schrumpfen(m, r):
    """Maske um r Pixel nach innen ziehen (4er-Nachbarschaft, ergibt eine Raute; bei abgerundeten Ecken unsichtbar)."""
    a = np.pad(np.array(m) > 127, 1)   # außerhalb des Bildes ist „außen", sonst schrumpft die Kante nie
    for _ in range(r):
        b = a.copy()
        b[1:, :] &= a[:-1, :]; b[:-1, :] &= a[1:, :]; b[:, 1:] &= a[:, :-1]; b[:, :-1] &= a[:, 1:]
        a = b
    return Image.fromarray((a[1:-1, 1:-1] * 255).astype(np.uint8), "L")

def form(n, rund):
    """Maske der Icon-Fläche: bei durchsichtigen Ecken aus dem Alpha, sonst ein abgerundetes Quadrat."""
    m = Image.new("L", (n, n), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, n - 1, n - 1], radius=round(n * rund), fill=255)
    return m

def bauen(groesse, name, alpha, rund=0.225):
    n = groesse * SS
    q = Image.open(QUELLE).convert("RGBA").resize((n, n), Image.LANCZOS)
    if alpha:
        maske = q.getchannel("A").point(lambda v: 255 if v > 127 else 0)
    else:
        maske = form(n, rund)
    breite = max(2 * SS, round(n * 0.04))
    innen = schrumpfen(maske, breite)
    ring = ImageChops.subtract(maske, innen)
    linie = ImageChops.subtract(innen, schrumpfen(innen, max(1, SS // 2)))
    bild = q.copy()
    bild.paste(metall(n), (0, 0), ring)
    # feine dunkle Fuge zwischen Silber und Bild, damit der Rand absetzt
    schatten = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    schatten.putalpha(linie.point(lambda v: v * 120 // 255))
    bild = Image.alpha_composite(bild, schatten)
    if alpha:
        bild.putalpha(maske)
    else:
        bild = bild.convert("RGB")
    bild = bild.resize((groesse, groesse), Image.LANCZOS)
    bild.save(os.path.join(HIER, name), optimize=True)
    print(name, groesse)

if __name__ == "__main__":
    for g, n in [(512, "icon-512.png"), (192, "icon-192.png"), (96, "marke-96.png"), (48, "favicon-48.png"), (32, "favicon-32.png")]:
        bauen(g, n, True)
    bauen(180, "apple-touch-icon.png", False)
