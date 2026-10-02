# Brief für die nächste Sitzung · Mein In-and-Out-Book · Tests

**Stand:** `main` mit Stufe 1 (Eingangstor), Stufe 2 (Ausgangstor) und den
Glas-Knöpfen. Cache `inout-v3`. `npm test` zuletzt 99 grün · 0 ROT.

## Pflichtlektüre (in dieser Reihenfolge)

1. `CLAUDE.md` dieses Depots
2. `docs/ABSCHLUSS_2026-10-02.md`
3. `Sage-Protokol/docs/NETZWEIT.md` (Freibrief, origin/main, Ton, kein PII)

## Der Auftrag: testen, was die Proben nicht können

| # | Test | wer | Erfolgsmerkmal |
|---|---|---|---|
| 1 | **Sichttest am Tablet** | Klaus | Knöpfe schlank, Wackeln folgt dem Finger, Icon-Rand am Startbildschirm sichtbar |
| 2 | **Eingangstor mit echten Dateien** aus Klaus' Alltag (PDF, Foto, E-Mail) | Klaus, Sitzung wertet aus | jeder Befund hat eine Stelle; nichts heißt „sauber", was ungeprüft ist |
| 3 | **Ausgangstor: echtes Senden** an eine KI mit eigenem Schlüssel | Klaus | an die KI geht nur der verdeckte Text; die Antwort wird richtig aufgedeckt |
| 4 | **Echtes Teilen** über Android | Klaus | was mitgeht, steht vorher da |
| 5 | Zeit und Speicher am Tablet (Texterkennung, PDF mit vielen Seiten) | Klaus misst, Sitzung schreibt es hin | Zahlen mit Datum |

Die Sitzung baut **keine neuen Funktionen**, bevor diese Befunde da sind. Was
gefunden wird, wird erst gemessen, dann behoben, mit Wächter und Gegenprobe.

## Danach (nicht vorher)

- **Stufe 3 · Prüfbericht.** Der Bericht verwendet **nicht** die Wörter „Zertifikat",
  „sicher" oder „garantiert".

## Was nicht angefasst wird

Sende-Pruefer, Auslieferung-Pruefer und die `*-Made-GPT`-Depots. `impressum.html`
und `datenschutz.html` tragen Klaus' echte Angaben (§ 5 DDG).

## Abschluss-Befehl (Pflicht)

Am Ende: Abschlussbrief mit **gemessenem** Stundennachweis (Reflog → letzter Commit,
UTC), Forschungseintrag in Kimhub (`tools/sitzung-eintragen.mjs`), dann einen neuen
Brief für die nächste Sitzung, vollständig als Codeblock im Chat.
