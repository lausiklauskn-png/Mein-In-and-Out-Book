**🔬 Regel: Forschung nur in Kimhub (Klaus 2026-10-31: „einheitlich alles in Kimhub … in den einzelnen Repos soll keine Forschungseinträge sein“):** jeder Forschungseintrag (Sitzungs-Befunde, Messungen, Stunden-Auswertungen, Forschungsnotizen) kommt nach **Kimhub `forschung/messungen/`**; in diesem Repo werden keine Forschungseinträge geführt und keine Forschungsdateien angelegt. Öffentliche Forschungs**aufgaben** stehen in Sage-Protokol.

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

## Silberner Rand und Glas-Knöpfe (Klaus 2026-10-02)

Klaus: *„eine glänzende, spiegelnde weiße Outline … also eher grau"* und *„das Design vom
Sendeprüfer, 3D-Button und Wackel-Button"* — dann: *„Nur nicht so fette Button. Das ist ein
Bediener-Tool."*

- **Icon:** `tools/rand-bauen.py` baut alle Größen (512, 192, 96, 48, 32, apple-touch 180) aus
  `icons/quelle-512.png` (dem Icon OHNE Rand) mit silbernem, diagonal gespiegeltem Ring und einer
  dunklen Fuge. **Nie ein fertiges Icon als Quelle nehmen**, sonst wächst bei jedem Bauen ein Ring
  dazu. ⚠ `maskable-512.png` bleibt ohne Ring: der Launcher schneidet es selbst zu (Grenze).
- **Neues Logo (Klaus 2026-10-15):** Schild und Paket mit Haken. Seine Datei hatte schwarze Ecken statt durchsichtiger;
  freigestellt wurde nur das Dunkel, das mit einer Ecke zusammenhängt, dann als `icons/quelle-512.png` abgelegt und mit
  `tools/rand-bauen.py` gebaut. `maskable-512.png` ist neu gesetzt: Logo auf 420 px im sicheren Kreis, Grund `#012524`.
- **Knöpfe:** Glas aus dem Sende-Prüfer (Verlauf, innere Schatten, Glanzpunkt `::before` folgt
  `--mx/--my`), Wackeln aus family-project (`assets/glas.js`: bis 9° bei Knöpfen, 3° bei
  Listenzeilen). **Schlank:** 32–38 px hoch. Kontrast der Schrift ≥ 4,5 hell UND dunkel
  (gemessen an beiden Enden des Verlaufs). Bei „weniger Bewegung" wackelt nichts (CSS UND Skript).
- Proben in `tests/smoke.mjs` (Abschnitt 9b) · Gegenprobe `NUR_FALL="GLAS:"` (8) und `RAND:` (1).
- ⚠ Nicht gemessen: Wackeln mit dem Finger am Tablet. Der Ring ist nicht als Gegenprobe-Fall
  sabotiert (`sed` tauscht kein Bild); von Hand gegengeprüft: die Quelle ohne Ring fällt im Wächter.

## ⬇ Der Installieren-Knopf gehört IN die App (Klaus 2026-10-05)

Klaus: *„Schon wieder App konnte nicht geöffnet werden … Das ist jetzt bei jeder App gewesen, die wir
zuletzt programmiert haben. Wenn der Installationsbutton nicht in der App selber drin ist, funktioniert
das Installieren nicht … dokumentiere das, dass wir das gleiche von der Reihe so machen."*

**Regel für jede neue App: ein Installieren-Knopf in der Kopfleiste, von Anfang an.** Über das Chrome-Menü
allein blieb am Tablet oft nur eine Verknüpfung, und beim Öffnen stand „App konnte nicht geöffnet werden".
Im Sende-Prüfer und im Auslieferungsprüfer hat der Knopf in der App eine echte App erzeugt (2026-09-30).
⚠ **Warum es so ist, ist nicht gemessen.** Es ist Klaus' Befund an mehreren Apps. Eine Folgerung von Chrome
selbst gibt es nicht.

`assets/installieren.js` (nach `installieren.js` + `neuladen.js` aus dem Sende-Prüfer) hängt zwei runde Knöpfe in die Kopfleiste:

| Lage (`data-lage`) | was der Knopf tut |
|---|---|
| `angeboten` (`beforeinstallprompt` abgefangen) | Tipp öffnet den Dialog des Browsers |
| `nicht-angeboten` | Tipp nennt den Weg: Verknüpfung mit Chrome-Zeichen entfernen, ⟳, dann Installieren |
| `app` (display-mode standalone) | Knopf weg, keine Meldung |

**⟳** wirft nur den eigenen Vorrat (`inout-*`) weg, meldet den Service-Worker ab und lädt mit `?frisch=` neu.
`schleuse-geteilt` und IndexedDB bleiben. Dazu gehören immer: ein Manifest mit `id`, `start_url`, `scope`,
`display: standalone` und einem maskable-Icon sowie ein Worker, der Seiten Netz-zuerst holt.
Proben: `smoke.mjs` § 11 (drei Lagen, gestellt; 360 px) · Gegenprobe `NUR_FALL="INSTALL:"` (5 Fälle).
Gemessen 2026-10-05: `smoke.mjs` 111 grün · 0 ROT · Gegenprobe 44 gefangen · 0 blind · 0 tote Anker.
Cache v4, `?v=4`. ⚠ Wer die `?v=` erhöht, zieht die Anker in `tests/gegenprobe.sh` mit (`NUR_ANKER=1` meldet sie).
⚠ Am Tablet nicht gemessen: ob die Installation über den Knopf jetzt zu einer echten App führt.

### Manifest-id im eigenen Ordner (Klaus 2026-10-18, chrome://webapks)

Chrome löst die `id` gegen den **Ursprung** auf, nicht gegen den App-Ordner: `"./"` wurde zu
`https://lausiklauskn-png.github.io/` — dieselbe id wie zehn andere installierte Apps. Daher „bereits installiert" im
Chrome-Menü und „App konnte nicht geöffnet werden". Jetzt `"id": "/Mein-In-and-Out-Book/index.html"` (= start_url).
`smoke.mjs` rechnet die id wie Chrome und verlangt sie im eigenen scope; Gegenprobe `NUR_FALL="MANIFEST-ID:"`.
Cache v18, alle `?v=18`; die neun seit v9 toten Anker in `tests/gegenprobe.sh` sind mitgezogen.
⚠ Eine schon installierte Fassung einmal deinstallieren und neu installieren (Chrome behält die alte id).
✅ **Am Tablet bestätigt (Klaus 2026-10-18, abends):** Installieren klappt — Chrome bot es an, der Knopf öffnete Chromes
Dialog statt der Erklärung. Hier stand: *„Am Tablet nicht gemessen."* ⚠ Die ersten Versuche Stunden nach dem Merge
scheiterten noch (nur die Erklärung, „lässt sich nicht installieren"), obwohl die neue Fassung seit 16:04 live war und
Chromium hier sie fehlerfrei als installierbar meldete; ein Eintrag in chrome://webapks gab es nicht. Wahrscheinlich hielt
Chrome am Tablet noch das alte Manifest — gefolgert, nicht gemessen. Bei Hängen: ⟳ in der App, später erneut versuchen.

### Kein „Websitedaten löschen“ mehr im Rat (2026-10-18)

Der Erklärtext des Knopfs riet zuletzt, die Websitedaten zu löschen. Auf github.io teilen sich alle Apps einen Speicher —
das nähme allen ihre Daten. Jetzt (wie Sage #1151): App unter Android-Einstellungen → Apps deinstallieren, Chrome schließen,
neu laden, neu installieren. Cache v19, alle `?v=19`, Anker in `tests/gegenprobe.sh` mitgezogen (0 tot). ⚠ Am Tablet nicht gemessen.

## 📋 Plan: Abhakliste, Prioritäten, Bild-Metadaten (Klaus 2026-10-05)

Entschieden, nicht gebaut: [`docs/BRIEF_2026-10-05_abhakliste.md`](docs/BRIEF_2026-10-05_abhakliste.md).
Gilt für Auslieferungsprüfer, Sende-Prüfer und dieses Buch; Code dort erst nach Klaus' Freigabe je Stufe.

## ⚑ Stufe 1 · Prioritätenliste (Klaus 2026-10-05)

`assets/prioritaeten.js` (app-eigen, `window.Prioritaeten`, läuft auch in Node).
Reiter **⚑ Prioritäten**: sechs Gruppen (Firmengeheimnisse · Bankdaten · Kundendaten ·
Zugangsdaten · Verträge/Preise · eigene Wörter), je **streng · normal · aus**, vier
Vorlagen (Handwerk, Kosmetikstudio, Büro, Privat), eigene Wörter (ab 3 Zeichen).
Schlüssel **`inout_prioritaeten_v1`** — app-eigen, ein fremder Wert wird nicht geglaubt.

- **Gefunden über eine feste Wortliste**, Wortgrenze per Buchstaben-Klasse (nicht `\b`,
  das kennt kein „ü"), Groß/klein egal. Jeder Treffer nennt Wort, Gruppe, Stufe, Stelle
  (Zeile) und sagt, dass ein zitiertes oder verneintes Wort ebenso gefunden wird.
- **Nie „harmlos“, immer eine Empfehlung** (Klaus). Eine Probe sucht das Wort in Code und Oberfläche.
- **Eingang:** eigener Kasten `[data-prio-treffer]`; die **Karte wird davon nicht rot** —
  eingehende Post nennt Bankdaten ständig. Ein Prüfkern-Befund (IBAN …) bekommt die Marke
  seiner Gruppe; „aus“ nimmt nur die Marke, nie den Befund.
- **Ausgang:** „streng“ hält den ersten Tipp an (wie eine KI-Anweisung), ein zweiter geht
  weiter; „normal“ steht nur in der Vorschau. Gelesen werden Kopf, Mailtext und Aufgabe, je mit eigener Zeilenzählung.
- ⚠ **Benannte Grenzen:** die Liste ist in keiner Sicherung (dieses Buch hat noch keine) ·
  Absender-Vertrauen und „Mit KI vorschlagen“ sind nicht gebaut (Stufe 1b) · der Ausgang
  kennt noch keine Anhänge. Sende-Prüfer und Auslieferungsprüfer bekommen dieselbe Liste
  später, je mit eigenem Schlüssel.
- Proben: `smoke.mjs` (ohne Browser und im Browser) · Gegenprobe `NUR_FALL="PRIO:"` (11 Fälle). Cache v6, `?v=6`.

## 🏷 Herkunftsnachweis (C2PA, Klaus 2026-10-14)

Klaus: *„kurz und verständlich für Nutzer … genauere Ausgabe auf Knopfdruck."*
`pruefer-formate.js` und `pruefer-anhang.js` sind neu byte-1:1 aus dem Auslieferungsprüfer kopiert
(Pins in `KANON` nachgezogen). Sie melden **`PDF-HERKUNFT`** und **`BILD-HERKUNFT`** (JPEG APP11, PNG `caBX`,
WebP), samt Feld `daten` (Programm, was gemacht wurde, woher der Inhalt stammt, Zeitpunkt, Unterzeichner …).

- **Eine Angabe, kein Befund:** beide stehen in `ANGABEN` (`eingang.js`), die Karte wird nicht rot, es gibt
  kein „Was jetzt tun". Im aufgeklappten Angaben-Bereich steht je Nachweis `<details data-herkunft-details>`
  „Details anzeigen", **zuerst zu**, die Paare als `dl`, nur `textContent`. Auch an Mail-Anhängen.
- ⚠ **Die Unterschrift wird NICHT geprüft** — das steht in den Einzelheiten selbst.
- Ausgangstor und Prioritäten sind unberührt (sie lesen nur Befunde bzw. Texte).
- Testdateien erfunden: `tests/anhang-muster.mjs` (byte-gleich aus dem Auslieferungsprüfer).
- Proben: `smoke.mjs` § 7b (JPEG und PDF mit Nachweis, PDF ohne Nachweis) · Gegenprobe `NUR_FALL="HERKUNFT:"`
  (6 Fälle). Cache v7, alle `?v=7`.
- Gemessen 2026-10-14: `npm test` **158 grün · 0 ROT**, Rückgabe 0.
  Gegenprobe `HERKUNFT:` in einer Kopie: erst **5 gefangen · 1 aus falschem Grund** (der Helfer der Probe las
  `summary` ohne Prüfung und stürzte an einem leeren details ab), danach meldet er statt zu werfen: **6 gefangen · 0 blind ·
  0 tote Anker**.
- ⚠ Nicht gemessen: Tablet, echte C2PA-Dateien außer Klaus' PDF (die nur im Auslieferungsprüfer gelesen wurde).

## 🍄 SBKIM-Knoten (Sammel-Brief 2026-10-15, Schritt 3)

Das Buch ist ein eigener SBKIM-Knoten, Bauart Sende-Prüfer/Workflow-Needs: **feste Leiste in der Kopfzeile,
kein Modul 17**. Lampen LEBT · VERKEHR · FREMD, Siegel (`#siegel-platz`, Band „IN-AND-OUT-BOOK“) mit dem
Andock-Wizard, Mycel-Blase (`[data-sbkim-mycel-platz]`) mit der Box „Netz“. Bis 1100 px stehen nur die Lampen
da; ein Tipp klappt Siegel und Mycel darunter auf.

- **Schublade `inoutbook`** — `window.SBKIM_DB_SUFFIX` im `<head>` vor jedem Skript, Modul-01-DB
  `sbkim_inoutbook`. **Nie ändern.** Getrennt von `InOutBook1` und den `inout_…`-Schlüsseln.
- **13 Module byte-1:1 aus Sage** (`modules/01…23`, `16b`, `noble-secp256k1`), gepinnt in `tests/smoke.mjs`
  (`KNOTEN_PINS`). Nie hier abwandeln — in Sage pflegen, mit `kanon-verteilen` neu kopieren.
- **05b ist eine eigene `<script type="module">`-Zeile**, nicht in der Kette (`assets/sbkim-init.js`); es holt
  `noble-secp256k1.js` selbst. noble steht deshalb **ohne** `?v=` im Vorrat.
- Die Prüfliste für den KI-Richter (`assets/pruefer-mail.js`) lädt die Seite schon für den Prüfkern, vor der Kette.
- **Alles im Installations-Vorrat** (Module, Klebstoff, Identität, `sicherheit.html`); die Kette lädt mit
  derselben `?v=` wie Seite und Vorrat (`var V` in `sbkim-init.js` — beim Cache-Bump mitziehen).
- **Beschreibung** (`assets/siegel-inhalt.js`): Zweck, Eingangs-/Ausgangstor, SBKIM — **nie** Postinhalt,
  Adressen oder Namen aus geprüfter Post (die Probe sucht nach @, Anschrift, Betrag, ⟦).
- **Beim Laden geht nichts ins Netz** (kein `ensureIdentity`; gemessen: keine WebSocket-Erzeugung, kein
  Abruf außer Haus, auch nicht beim Öffnen von Siegel und Blase).
- Gerätename hängt der Klebstoff ins Verbinden-Panel (`data-sbkim-geraetename`, nur als Text).
- Die erste Spore entsteht am Gerät, im Siegel → Andock-Wizard. Im Depot liegt keine `sbkim/spore.json`.

Gemessen 2026-10-15: `npm test` **231 grün · 0 ROT** (vorher 158) · Gegenprobe `KNOTEN:` **14 gefangen · 0 blind ·
0 aus falschem Grund · 0 tote Anker**. Erst 3 blind: der Siegel-Wächter las Text, der auch im Verbinden-Panel steht
(jetzt: `#sbkim-si-open` → `#sbkim-si-wizard`); der Netz-Wächter sah eine WebSocket auf eine ungültige Adresse nicht
(jetzt zählt die Probe jede Erzeugung im Browser); der Klappfeld-Fall nahm eine Regel weg, die am Handy überschrieben
wird (toter Eingriff, jetzt trifft er die tragende Regel). Cache v8, alle `?v=8`.
⚠ Nicht gemessen: das Tablet, der Andock-Wizard bis zur signierten Spore, ein echter Beitritt zu einem Netz.
⚠ `modules/25_pseudonym.js` ist eine ältere Fassung als Sages Kanon — benannt, nicht Teil dieses Schritts.

## Was leicht kaputtgeht

- **Cache-Bump:** wer eine Datei aus `CORE` in `sw.js` ändert, erhöht
  `CACHE_VERSION` (`inout-vN`) UND alle `?v=` in Seite, Vorrat und `var V` in `assets/sbkim-init.js`.
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

Zuletzt gemessen (2026-10-05, Prioritätenliste): **147 grün · 0 ROT** · `PRIO:` **11 gefangen · 0 blind · 0 aus falschem Grund · 0 tote Anker** (erst 1 aus falschem Grund: mein Muster `Stufe .aus.` — der Punkt trifft im C-Locale ein Byte, „ sind drei); `NUR_ANKER` 57 · 0 tot (ein alter Anker `k.appendChild(box);` traf durch den neuen Kasten zweimal, der Kasten heißt jetzt `pkasten`).
Davor (2026-10-05, Fachbegriff ≠ Anweisung): **114 grün · 0 ROT** · `BEGRIFF:` 2 gefangen, dazu die fünf auf `?v=5` nachgezogenen Fälle (`INSTALL:`, `VORRAT:`, `GLAS:`, `RAND:`) gefangen, 0 blind, 0 tote Anker. Prüfkern byte-1:1 aus dem Auslieferungsprüfer: `KI-BEGRIFF` steht hier bei den **Angaben** (Klaus 2026-10-05: eine .md über eine Marktlücke nennt „prompt injection“ — das ist keine Anweisung und gehört nicht unter „keine Panik“). Die Angabe sagt, wie sie entsteht (feste Wortliste). Neu kommt auch `BILD-METADATEN-KI-ANWEISUNG` mit. Cache v5, `?v=5`.
Davor (2026-10-02, Glas-Knöpfe): **99 grün · 0 ROT** · `GLAS:` 8 · `RAND:` 1 · `VORRAT:` 2 gefangen, 0 blind, 0 tote Anker (erst fing der neue Kontrast-Wächter das dunkle UND das helle Grün mit 4,15 bzw. 4,45). Davor (Ausgangstor): **82 grün · 0 ROT** · die 17 neuen
Gegenprobe-Fälle **17 gefangen · 0 blind · 0 tote Anker**. Erster Lauf: 1 aus falschem Grund
(die Probe wartete auf den Ordner, den der Fall wegnimmt, und stürzte ab), danach gefangen. Davor (Stufe 1): 49 grün · 13 gefangen.
⚠ Die Probe „… mit rot markierter Kopie der Stelle“ war ein Flatterer: sie las die Karte,
bevor die markierte Kopie gezeichnet war. Sie wartet jetzt auf das Bild selbst.
⚠ Nicht gemessen: das Tablet, echtes Teilen aus einer Android-App, echte Post, ein echter Versand an eine KI (gestellt).

## Netzweit

Freibrief · frisch von `origin/main` · Ton · kein PII · Ehrlichkeit:
[Sage-Protokol/docs/NETZWEIT.md](https://github.com/lausiklauskn-png/Sage-Protokol/blob/main/docs/NETZWEIT.md)

## ⬇ Installieren auch hinten in den Einstellungen (Klaus 2026-10-18)

Klaus: *„Installieren-Button unter Einstellungen hinten, wie bei meinem Rezeptbuch … sobald installiert, verschwindet er.“*
`#installieren-einstellungen` („⬇ Als App installieren“) steht als letztes Element im Reiter **⚑ Prioritäten**
(`data-tor-teil="einstellungen"`), `data-install-knopf`, `data-ort="einstellungen"` (Mechanik wie Sage-Protokol #1153), dieselbe
Klick-Logik wie oben; als App beide weg. Die Meldung war schon lesbar (`--flaeche`/`--text` aus `style.css`, gemessen dunkel 13,94 ·
hell 16,48) — keine Kontrast-Sicherung nötig. Gemessen im Browser: letztes Element, sichtbar, Meldung obenauf; als App versteckt.
Cache v20, alle `?v=20` (samt `var V` und den Ankern in `tests/gegenprobe.sh`). ⚠ Am Tablet nicht gemessen.
