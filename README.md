# Mein In-and-Out-Book

**Prüft, was hereinkommt und was hinausgeht.** Eine App, die im Browser läuft,
auch ohne Internet, ohne Konto und ohne Server.

Adresse: <https://lausiklauskn-png.github.io/Mein-In-and-Out-Book/>

## Stand: Stufe 1 · das Eingangstor

Eine Datei, eine E-Mail oder ein Text wird **auf dem Gerät** geprüft, bevor man
ihn liest oder an eine KI weitergibt:

- versteckte Anweisungen an eine KI, im Text, im PDF, im Bild (auch blass) und
  in den Bildpunkten (nur auf Knopf, Ergebnis heißt „Verdacht")
- unsichtbarer Text im PDF, getarnte Dateien, Makros, Programme, fremde Abrufe
- E-Mails (.eml) samt Anhängen

Wege hinein: Datei wählen, Datei auf die Seite ziehen, Text einfügen, aus einer
anderen App **teilen** (nach dem Installieren), Test-Dateien zum Ausprobieren.

Jede Prüfung endet in einer von drei Lagen: **Befund** · **ungeprüft** ·
**kein Befund**. „Ungeprüft" heißt nie „sauber". Und: **kein Virenscanner.**

## Geplant

- Stufe 2 · Ausgangstor: Texte vor dem Senden an eine KI verdecken (aus dem Sende-Prüfer)
- Stufe 3 · ein Prüfbericht

Sende-Prüfer und Auslieferungsprüfer bleiben eigene, kleinere Apps.

## Prüfen

```bash
npm install
npm test               # Probe im echten Browser
npm run gegenprobe     # baut Fehler ein, jeder muss auffallen
```
