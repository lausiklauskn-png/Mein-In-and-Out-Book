# Abschlussbrief · 2026-10-02 · Ausgangstor, Icon-Rand, Glas-Knöpfe

Zweig `ccr-020e3172-uuv4ck`. Gemergt: **#2** (Stufe 2, Ausgangstor) und **#3**
(silberner Rand ums Icon, schlanke Glas-Knöpfe). #1 (Stufe 1, Eingangstor)
stammt aus einer anderen Sitzung.

## Was getan ist

| | |
|---|---|
| **Stufe 2 · Ausgangstor** | Postfach (aus dem Sende-Prüfer übernommen), Verdecken mit Sage-Modul 25 (byte-1:1, SHA-gepinnt), Kopieren, Senden, Aufdecken der Antwort |
| **Icon** | ein glänzender, grauer bis weißer Rand rund ums Icon und Favicon (Klaus: „eher grau, spiegelnd") |
| **Knöpfe** | Glas-Knöpfe mit Wackeln wie in family-project und dem Sende-Prüfer, aber **schlank**: 32–38 px hoch (Klaus: „Nur nicht so fette Button … Bediener-Tool") |
| **Cache** | `inout-v3`, alle `?v=3` |

## Was gemessen ist

- `npm test`: **99 grün · 0 ROT** (nach #3). Stufe 2 allein: 82 grün.
- Gegenprobe in einer Wegwerf-Kopie: Stufe 2 **17 gefangen · 0 blind**, GLAS **8**,
  RAND **1**, VORRAT **2**, jeweils 0 blind und 0 tote Anker.
- Der Kontrast-Wächter hat zwei Grüntöne gefangen (4,15 und 4,45, beide unter 4,5).
  Nachgezogen: hell `#117a7a`/`#0b5555`, dunkel `#167676`/`#0f5252`.

## Was dabei schiefging und behoben ist

- Der Rand stand zuerst nur an den Ecken: der Maske fehlte ein Polster am Bildrand.
- Ein Stufe-2-Fall fing zuerst **aus dem falschen Grund**: die Probe wartete auf den
  Ordner, den der Fall wegnimmt. Danach 17 gefangen.
- Die Probe „rot markierte Kopie" flatterte: sie las die Karte, bevor die Kopie
  gezeichnet war. Sie wartet jetzt auf das Bild.
- Ein Anker der Gegenprobe (VORRAT) war nach dem Bump auf `?v=3` tot. Nachgezogen.

## Was NICHT gemessen ist

- Klaus' Sichttest am Tablet: Wackeln mit dem Finger, Höhe der Knöpfe, Rand am Startbildschirm.
- Das maskierbare Icon (`maskable`) trägt **keinen** Rand: der Launcher schneidet ihn ab.
- Echtes Senden an eine KI mit einem eigenen Schlüssel.
- Echtes Teilen über Android.

## Stundennachweis (gemessen)

| | UTC |
|---|---|
| erster Handgriff (Reflog, Klon) | 17:31:08 → **17:32** (aufgerundet) |
| letzter Commit | Merge dieses Abschlusses, siehe Forschungseintrag |

Die Spanne ist die **Obergrenze** von Klaus' Arbeitszeit. Der Zeitraum ist gemessen.
Dass Klaus in dieser Zeit anwesend war, ist seine eigene Auskunft. Pausen sind nicht
abgezogen. Zu den Commit-Stunden wird die Spanne nicht addiert.
