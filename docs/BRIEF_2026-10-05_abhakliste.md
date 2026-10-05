# Brief · Abhakliste, Prioritäten, Bild-Metadaten (2026-10-05)

**Stand:** Plan, von Klaus bestätigt. **Nichts davon ist gebaut.**
Gilt für Auslieferungsprüfer · Sende-Prüfer · Mein In-and-Out-Book.
Code in Sende-Prüfer und Auslieferungsprüfer erst nach Klaus' Freigabe je Stufe.

## Klaus' Vorgaben, wörtlich zusammengefasst

- Der Prüfer liest nur. Jeder Befehl oder heikle Punkt wird eine Zeile einer
  Abhakliste: Geld überweisen, Telefonnummer herausgeben, Befehl ausführen,
  Bild erzeugen … Die KI erklärt je Zeile, was sie damit vorhat; der Mensch
  sagt ja oder nein — *„wie zwei Mitarbeiter, der Buchhalter und der Chef"*.
  Danach prüft eine KI gegen. Erst dann wird gesendet.
- Gelerntes läuft ohne Rückfrage durch (Kunde X → Konto Y), Abweichungen
  werden gefragt (*„nicht eine Zahl, die sich ändert von 12 auf 12.000"*).
- Vorab eine **Prioritätenliste** zum Anklicken: Firmengeheimnisse,
  Kontobewegungen, Kundendaten, Eigenes. *„Jeder Betrieb hat andere
  Prioritäten."* Absender mit eigenem Sicherheitsnetz (große Firma) bekommen
  andere Merkmale. Vorbelegbar mit KI.
- Bilder: Text im Bild und **Text in den Metadaten** (Datum, Ersteller,
  Beschreibung) — dort kann ein Befehl stehen.
- **Ausführliche Erklärung:** empfangen, geprüft, gefunden, gesendet — nicht
  nur die Adresse. **Nie „harmlos"**, sondern eine **Empfehlung**. Die
  Empfehlung wird selbst geprüft; Klaus fragte, ob das eine neue Fehlerquelle ist.

## Befund im Bestand (gelesen 2026-10-05, Auslieferungsprüfer 0c6bb20)

`assets/pruefer-anhang.js` meldet EXIF, XMP, JPEG-Kommentar und PNG-Textfelder
nur mit **Namen** (`BILD-METADATEN`). Ihr **Inhalt** geht nicht durch
`PrueferMail.pruefeMail`. Eine Anweisung im Feld „Ersteller" bleibt unentdeckt.
Durch die Liste gehen heute: Bildtext, blasser Text, PDF-Seitentext,
LSB-Text, Dateitext. Die „Sichere Fassung" des Sende-Prüfers zeichnet neu und
löscht Metadaten; ein PNG behält dabei die untersten Bits.

## Grundsatz

- Nichts aus einer Datei wird ausgeführt. Gefundener Text ist **Daten**, für
  jede KI im Ablauf.
- Prüfkern im Auslieferungsprüfer bauen, byte-1:1 kopieren, Pins nachziehen.
  Die Oberfläche baut jede App selbst.

## Stufe 0 · Bild-Metadaten lesen (zuerst, ohne KI)

- Text aus EXIF (ImageDescription, UserComment, Artist, Copyright, Software),
  XMP (Titel, Beschreibung, Ersteller, Stichworte), JPEG-COM, PNG
  tEXt/iTXt/zTXt (zTXt entpacken) und WebP EXIF/XMP lesen.
- Durch dieselbe Liste wie Mail- und Bildtext. Neuer Befund
  „Anweisung in den Metadaten", mit Feldname. Ein Datum bleibt eine Angabe.
- Sichere Fassung wahlweise als JPEG (dann sind auch die Bits weg); die
  Meldung sagt, was entfernt ist und was bleibt.
- Testvorlage: Befehl im Feld „Ersteller". Gegenrichtung: Foto mit normalen
  Kameradaten → kein Befund.

## Stufe 1 · Prioritätenliste je Betrieb

- Häkchen: Firmengeheimnisse · Kontobewegungen/Bankdaten · Kundendaten ·
  Zugangsdaten · Verträge/Preise · eigene Punkte. Je Punkt streng/normal/aus.
- Absender-Vertrauen mit eigenen Stufen, **nie** „gar nicht prüfen".
- „Mit KI vorschlagen": zwei Sätze zum Betrieb → Vorschlag → Mensch bestätigt.
- Branchen-Vorlagen. Nur auf dem Gerät, in der Sicherung mit dabei.

## Stufe 2 · Abhakliste

- Zwei Quellen: (a) **feste Suche ohne KI** (Konten, Beträge, Telefon,
  „überweise", „führe aus", „erzeuge ein Bild" …), nicht täuschbar;
  (b) die KI listet, was sie mit dem Text tun würde.
- Je Zeile: was · wo (Zeile, Bild, Feld) · was die KI vorhat · Ja/Nein.
- Fund der festen Suche, den die KI nicht nennt → rot: „Die KI verschweigt
  diesen Punkt."
- Ohne Häkchen an jeder Zeile geht nichts hinaus. Prioritäten sortieren.

## Stufe 2b · Erklärung und Empfehlung

- **Verlauf in Sätzen** je Vorgang: empfangen (von wem, wann, welcher Weg) ·
  geprüft (womit, und was NICHT geprüft werden konnte) · gefunden (was, wo,
  warum auffällig) · was der Text verlangt (in eigenen Worten) · gesendet
  (welche KI, welcher Anbieter, welche Adresse, was verdeckt war, wann).
- **Das Wort „harmlos" kommt nicht vor** — eine Probe wacht darüber.
- Drei Empfehlungen, jede mit Grund: „kann weiterbearbeitet werden" ·
  „vorher beim Absender nachfragen" · „nicht ausführen". Ungeprüftes steht
  ausdrücklich dabei. Entscheiden tut der Mensch.
- **Die Empfehlung wird geprüft, ohne neue Fehlerquelle:** sie entsteht aus
  zwei unabhängigen Quellen (feste Suche + Gegenprüfung der Liste). Die
  Prüfung **vergleicht**, sie entscheidet nicht. Einig → Empfehlung steht.
  Uneinig → **beide nebeneinander**, es gilt die vorsichtigere. **Genau eine**
  Prüfrunde. Eine KI kann eine Warnung der festen Suche nie wegnehmen, nur
  hinzufügen.

## Stufe 3 · Gegenprüfung durch eine zweite KI

- Sieht NUR die abgehakte Liste, nicht den fremden Text.
- Frage: normaler Geschäftsvorgang oder Betrug? → unauffällig / nachfragen /
  stoppen, mit Grund. Möglichst ein anderer Anbieter. Erst danach senden.

## Stufe 4 · Gelernte Regeln

- Aus Ja-Entscheidungen auf Knopfdruck: „Kunde X → Konto Y",
  „Lieferant Z: 10–50 €". Passendes ist grün vorab gehakt.
- Abweichung (neues Konto, Betrag außerhalb, neuer Absender) → wieder fragen, rot.
- Regeln sichtbar, änderbar, löschbar; nach 12 Monaten neu bestätigen.

## Zusatzideen

1. Geänderte Bankverbindung als eigene rote Zeile.
2. Absender-Abgleich: Anzeigename ⟷ Adresse, ähnliche Domains.
3. Links, deren Text eine andere Adresse nennt als ihr Ziel.
4. QR-Codes in Bildern und PDFs lesen, wie Links behandeln.
5. Druck erkennen („sofort", „vertraulich", „nicht dem Chef sagen");
   bei hohen Beträgen eine Wartezeit.
6. Vier-Augen-Freigabe ab einem Betrag aus Stufe 1.
7. Protokoll jeder Entscheidung → Grundlage für den Prüfbericht (Stufe 3
   dieses Buches), ohne „Zertifikat", „sicher", „garantiert".
8. Rückruf-Hinweis: über die bekannte Nummer, nicht über die aus der Mail.

## Reihenfolge und Ort

| Stufe | wo |
|---|---|
| 0 Metadaten | Auslieferungsprüfer, dann Kern kopieren |
| 1 Prioritäten | dieses Buch zuerst, dann Sende-Prüfer |
| 2, 2b, 3, 4 | Sende-Prüfer (Ausgang) und dieses Buch |
| Ideen 1–4 | Prüfkern (Auslieferungsprüfer) |
| Ideen 5–8 | Oberfläche |

Der Auslieferungsprüfer zeigt die Abhakliste nur an, er sendet nichts.
Je Stufe: Probe mit Testvorlage und Gegenrichtung, Gegenprobe-Fälle,
Cache-Bump, Klaus' Sichttest am Tablet.

## Grenzen

- Die KI-Erklärung ist täuschbar — deshalb feste Suche und Gegenprüfung.
- Zu viele Fragen machen müde — deshalb Regeln und Prioritäten.
- Eine umformulierte Anweisung kann der festen Suche entgehen.
- Kein Virenscanner, kein Ersatz für die Rückfrage beim Absender.

## Abschluss jeder Sitzung

PULS/CLAUDE.md fortschreiben, Messzahlen mit Datum, nächsten Brief als
Codeblock in den Chat.
