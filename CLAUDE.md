# Mein In-and-Out-Book — Sitzungs-Anker

Eine PWA, die prüft, **was hereinkommt und was hinausgeht** (Klaus 2026-10-02).
Kein Build-Schritt, läuft im Browser, auch offline. Adresse:
https://lausiklauskn-png.github.io/Mein-In-and-Out-Book/

**Der Name heißt „Mein In-and-Out-Book"** (nicht „Meine"). Das Depot hieß zuerst
`meine-in-and-out-book`; GitHub leitet den alten Namen weiter.

## Woher es kommt — und was NICHT

- Der **Prüfkern** (`assets/pruefer.js`, `pruefer-formate.js`, `pruefer-mail.js`,
  `pruefer-anhang.js`) und `vendor/` (pdf.js, Tesseract) sind **byte-1:1 aus dem
  Auslieferungsprüfer** (origin/main 35d003c), gepinnt in `tests/smoke.mjs`
  (`KANON`). **Dort pflegen, hier neu kopieren, Pins nachziehen.**
- **Sende-Prüfer und Auslieferungsprüfer bleiben eigene Apps** (Klaus: kleiner,
  und sie zeigen den Weg, den er gegangen ist). Nichts dort wird angefasst.
- **Die GPT-Kopien** (`Auslieferungspruefer-Made-GPT`, `Sendepruefer-Made-GPT`)
  waren nur Gegenproben von ChatGPT. **Sie bleiben draußen**, nichts wird von
  dort übernommen.

## Stufen (Reihenfolge von Klaus)

1. **Eingangstor** — gebaut (`assets/eingang.js`).
2. **Ausgangstor** — gebaut (`assets/ausgang.js`, 2026-10-02).
3. **Prüfbericht ganz zuletzt.** ⚠ Ohne die Wörter „Zertifikat", „sicher",
   „garantiert" — Haftung. Vor einem Verkauf schaut ein IT-Anwalt drauf.

## Das Eingangstor

- Drei Lagen je Karte (`data-lage`): **befund · ungeprueft · sauber**.
  „Ungeprüft" ist nie „sauber".
- ⚠ **Angaben sind kein Befund.** PERSONENBEZUG, RECHNUNGSDATEN, PDF-METADATEN,
  BILD-METADATEN, PDF-ALTFASSUNG stehen in eingehender Post immer
  (`ANGABEN` in `eingang.js`) und werden aufgeklappt gezeigt (`[data-angaben]`),
  nicht rot. Alles andere ist ein Befund.
- Bilder: rot markierte Kopie der Stelle; „🔍 Bildpunkte auf Verdacht prüfen"
  nur bei png/jpeg/webp/gif und nur auf Tipp.
- E-Mails: Anhänge werden gelesen (nie ausgeführt), ihre Befunde tragen „Anhang …".
- Fremdes nur als Text: kein `innerHTML` in `eingang.js` (Probe misst es).
- **Teilen-Ziel:** `manifest.json` → POST an `./teilen`, `sw.js` legt die Dateien
  in den Vorrat `schleuse-geteilt` und leitet auf `index.html?geteilt=1`;
  `eingang.js` prüft sie und **löscht den Vorrat danach**. Der Name steht an
  zwei Stellen, die Probe hält sie gleich.

## Das Ausgangstor (2026-10-02)

Reiter **📤 Ausgang** (auch `index.html#ausgang`). Übernommen aus dem Sende-Prüfer,
nichts neu erfunden; der Sende-Prüfer selbst bleibt unangetastet.

- **Verdeckt wird mit Sage-Modul 25** (`modules/25_pseudonym.js`, byte-1:1 aus
  `Sage-Protokol/src/modules/`, gepinnt in `KANON`). `ausgang.js` trägt **keine eigenen
  Muster**. Die Anbieter-Liste `assets/anbieter.js` ist byte-1:1 aus dem Sende-Prüfer
  (geschlossen, kein freies Adressfeld). **Dort pflegen, hier neu kopieren.**
- Postfach: Eingefügt · Entwürfe · KI-Antworten · Exportiert; Ansicht Original ⟷
  „Was die KI sieht“; Aufgaben zum Antippen; Kopieren · Senden · Aufdecken · .eml.
- **Drei Riegel vor dem Hinausgehen** (`bereit()`): ohne Modul 25 geht nichts hinaus ·
  bleibt nach dem Verdecken ein Wert stehen (`findLeak`), geht nichts hinaus · eine
  Anweisung an eine KI im Mailtext (oder fehlende Liste) hält beim ersten Tipp an, ein
  zweiter Tipp geht weiter.
- **Eigene Ablage:** IndexedDB `InOutBook1` (Store `mails`), Schlüssel `inout_…` —
  github.io ist eine geteilte Adresse. **Der KI-Schlüssel liegt nur im Speicher**, solange
  die Seite offen ist; er wird nie abgelegt (kein Tresor wie im Sende-Prüfer — Grenze).
- ⚠ **Grenzen:** Vornamen allein stehen nicht in Von/An; sie gehören unter „Weitere
  Namen“ (wie im Sende-Prüfer). Keine Anhänge im Ausgang. An eine KI geht nur der
  Mailtext samt Aufgabe.

## Was leicht kaputtgeht

- **Cache-Bump:** wer eine Datei aus `CORE` in `sw.js` ändert, erhöht
  `CACHE_VERSION` (`inout-vN`) UND alle `?v=` in Seite und Vorrat.
- `vendor/` (22 MB) gehört **nicht** in `CORE`; der Worker legt es beim ersten
  Gebrauch ab.
- `impressum.html`/`datenschutz.html` tragen Klaus' **echte** Angaben (§ 5 DDG) —
  nie durch Platzhalter ersetzen.

## Prüfen

```bash
npm install
npm test                                # tests/smoke.mjs, Rückgabe 2 = nicht lauffähig, KEIN Grün
bash tests/gegenprobe.sh                # Wegwerf-Kopie, jeder Fall muss seine rote Zeile werfen
NUR_ANKER=1 bash tests/gegenprobe.sh    # nur die Anker, in Sekunden
```

Zuletzt gemessen (2026-10-02, Ausgangstor): **82 grün · 0 ROT** · Gegenprobe
siehe PR. Davor (Stufe 1): 49 grün · 13 gefangen.
⚠ Die Probe „… mit rot markierter Kopie der Stelle“ war ein Flatterer: sie las die Karte,
bevor die markierte Kopie gezeichnet war. Sie wartet jetzt auf das Bild selbst.
⚠ Nicht gemessen: das Tablet, echtes Teilen aus einer Android-App, echte Post, ein echter Versand an eine KI (gestellt).

## Netzweit

Freibrief · frisch von `origin/main` · Ton · kein PII · Ehrlichkeit:
[Sage-Protokol/docs/NETZWEIT.md](https://github.com/lausiklauskn-png/Sage-Protokol/blob/main/docs/NETZWEIT.md)
