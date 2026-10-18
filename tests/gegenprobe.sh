#!/usr/bin/env bash
# Gegenprobe: baut Fehler ein — jeder MUSS seine eigene rote Zeile werfen.
# Läuft in einer WEGWERF-KOPIE, nie im echten Baum.
#   NUR_ANKER=1   nur prüfen, ob jeder Anker genau einmal trifft (Sekunden)
#   NUR_FALL=...  nur Fälle, deren Name so beginnt
# ⚠ Dieses Skript während eines Laufs NICHT bearbeiten: bash liest es zeilenweise nach (2026-10-15 so zerbrochen).
set -u
QUELLE="$(cd "$(dirname "$0")/.." && pwd)"
KOPIE="$(mktemp -d)/kopie"
mkdir -p "$KOPIE"
( cd "$QUELLE" && tar --exclude=node_modules --exclude=.git -cf - . ) | ( cd "$KOPIE" && tar -xf - )
ln -s "$QUELLE/node_modules" "$KOPIE/node_modules"
gefangen=0; blind=0; falsch=0; tot=0; n=0

fall() { # name datei anker ersatz muster-der-roten-zeile
  local name="$1" datei="$2" anker="$3" ersatz="$4" muster="$5"
  [ -n "${NUR_FALL:-}" ] && [[ "$name" != "$NUR_FALL"* ]] && return
  n=$((n+1))
  local zahl
  zahl=$(ANKER="$anker" python3 -c 'import os,sys;print(open(sys.argv[1],encoding="utf-8").read().count(os.environ["ANKER"]))' "$KOPIE/$datei")
  if [ "$zahl" != "1" ]; then tot=$((tot+1)); echo "☠ TOTER ANKER ($zahl Treffer): $name"; return; fi
  [ -n "${NUR_ANKER:-}" ] && { echo "✓ Anker lebt: $name"; return; }
  cp "$KOPIE/$datei" "$KOPIE/.sicher"
  ANKER="$anker" ERSATZ="$ersatz" python3 -c 'import os,sys;p=sys.argv[1];t=open(p,encoding="utf-8").read();open(p,"w",encoding="utf-8").write(t.replace(os.environ["ANKER"],os.environ["ERSATZ"],1))' "$KOPIE/$datei"
  local aus; aus=$(cd "$KOPIE" && node tests/smoke.mjs 2>&1)
  cp "$KOPIE/.sicher" "$KOPIE/$datei"
  local roteZeilen; roteZeilen=$(printf '%s\n' "$aus" | grep '^✗ ROT')
  if [ -z "$roteZeilen" ]; then blind=$((blind+1)); echo "✗ BLIND: $name"
  elif printf '%s\n' "$roteZeilen" | grep -qE "$muster"; then gefangen=$((gefangen+1)); echo "✓ gefangen: $name"
  else falsch=$((falsch+1)); echo "✗ AUS FALSCHEM GRUND: $name"; printf '%s\n' "$roteZeilen" | head -3; fi
}

if [ -z "${NUR_ANKER:-}" ]; then
  aus=$(cd "$KOPIE" && node tests/smoke.mjs 2>&1); rc=$?
  [ $rc -ne 0 ] && { echo "Ausgangslage nicht grün (Rückgabe $rc) — Gegenprobe abgebrochen"; printf '%s\n' "$aus" | grep -v '^✓'; exit 2; }
fi

fall "EINGANG: eine Mailadresse gilt wieder als Befund" assets/eingang.js \
  'var ANGABEN = { "PERSONENBEZUG": 1,' 'var ANGABEN = { "NICHTS": 1,' "Mailadresse macht eingehende Post NICHT rot"
fall "EINGANG: ungeprüft wird zu sauber" assets/eingang.js \
  ': info.ungeprueft ? "ungeprueft" : "sauber"' ': "sauber"' "unbekannte Binärdatei"
fall "EINGANG: der Anhang trägt seine Stelle nicht mehr" assets/eingang.js \
  'stelle: "Anhang " + a.name, daten:' 'stelle: "", daten:' "Anhang wird gelesen"
fall "EINGANG: der Dateiname wird als HTML gesetzt" assets/eingang.js \
  'kopf.appendChild(el("b", "", name));' 'var bb = el("b"); bb.innerHTML = name; kopf.appendChild(bb);' "Markup bleibt Text|kein innerHTML"
fall "EINGANG: kein „Was jetzt tun\" mehr" assets/eingang.js \
  'k.appendChild(box);' '' "Was jetzt tun"
fall "EINGANG: Verdacht-Knopf auch bei PDFs" assets/eingang.js \
  '/^(png|jpeg|webp|gif)$/.test(A.artVon(info.bytes))' 'true' "KEINEN Knopf"
fall "EINGANG: Ablegen per Drag & Drop geht nicht mehr" assets/eingang.js \
  'dateienAnnehmen(e.dataTransfer.files);' '' "abgelegte Datei"
fall "TEILEN: der Vorrat wird nach dem Lesen nicht gelöscht" assets/eingang.js \
  'return caches.delete(GESCHEHEN);' 'return null;' "danach gelöscht|löscht den Vorrat"
fall "TEILEN: ?geteilt=1 bleibt in der Adresse" assets/eingang.js \
  'history.replaceState(null, "", location.pathname);' '' "geteilt=1 steht nicht mehr"
fall "TEILEN: sw.js legt in einen anderen Vorrat" sw.js \
  'var GETEILT = "schleuse-geteilt";' 'var GETEILT = "schleuse-anders";' "denselben Vorrat|geteilte Datei kommt an"
fall "VORRAT: vendor/ wandert in den Installations-Vorrat" sw.js \
  '"index.html", "impressum.html",' '"index.html", "vendor/pdfjs/pdf.min.js", "impressum.html",' "vendor/ steht NICHT"
fall "INSTALL: der Knopf fängt das Angebot des Browsers nicht mehr ab" assets/installieren.js \
  'e.preventDefault(); ereignis = e; knopfZeichnen();' 'e.preventDefault(); knopfZeichnen();' "Lage auf .angeboten|öffnet den Dialog"
fall "INSTALL: ein Tipp öffnet den Dialog nicht" assets/installieren.js \
  '      e.prompt();' '      void 0;' "öffnet den Dialog des Browsers"
fall "INSTALL: als App bleibt der Knopf stehen" assets/installieren.js \
  '    k.hidden = app;' '    k.hidden = false;' "Seite als App, ist der Knopf weg"
fall "INSTALL: ⟳ räumt auch fremde Vorräte" assets/installieren.js \
  'var EIGEN = /^inout-/;' 'var EIGEN = /./;' "nur den eigenen Vorrat"
fall "INSTALL: die Datei wird nicht geladen" index.html \
  '<script src="assets/installieren.js?v=20"></script>' '' "installieren.js steht im Vorrat und wird geladen|Absturz"
fall "KANON: der Prüfkern wird hier abgewandelt" assets/pruefer-anhang.js \
  '/* Auslieferungsprüfer — Anhänge und einzelne Dateien' '/* Auslieferungsprüfer: Anhänge und einzelne Dateien' "Kanon byte-1:1: assets/pruefer-anhang.js"
fall "RECHT: Platzhalter statt echter Angaben im Impressum" impressum.html \
  '<p>Klaus Nitzsche<br>Märchenweg 14' '<p>Max Mustermann<br>Musterweg 1' "echten Angaben"

fall "AUSGANG: ohne Modul 25 geht trotzdem etwas hinaus" assets/ausgang.js \
  'if (!P) { meldung("Die Prüfung (Modul 25) ist nicht geladen. Es geht nichts hinaus."); return null; }' 'if (!P) { return { text: hinaus(m), map: {}, treffer: [] }; }' "fehlt Modul 25"
fall "AUSGANG: der Leck-Riegel ist weg" assets/ausgang.js \
  'if (leck) {' 'if (false) {' "steht nach dem Verdecken noch ein echter Wert"
fall "AUSGANG: eine Anweisung an eine KI hält nicht mehr an" assets/ausgang.js \
  'if (ki.length) {' 'if (false) {' "Anweisung an eine KI, hält der erste Tipp"
fall "AUSGANG: der zweite Tipp geht nie weiter" assets/ausgang.js \
  'if (weiterFuer !== schluessel) {' 'if (true) {' "zweiter Tipp geht weiter"
fall "AUSGANG: hinaus geht der Klartext" assets/ausgang.js \
  'return { text: r.text, map: r.map, treffer: r.findings };' 'return { text: hinaus(m), map: {}, treffer: r.findings };' "Verdeckt kopieren|nur verdeckt"
fall "AUSGANG: „Weitere Namen\" werden nicht mit verdeckt" assets/ausgang.js \
  '.concat(String(m.namen || "").split(/[\n,;]/))' '' "keine echte Angabe mehr"
fall "AUSGANG: der KI-Schlüssel wird abgelegt" assets/ausgang.js \
  'schluesselImSpeicher = sch.value.trim(); });' 'schluesselImSpeicher = sch.value.trim(); localStorage.setItem("inout_schluessel", schluesselImSpeicher); });' "Schlüssel wird nirgends abgelegt|weder in localStorage"
fall "AUSGANG: fremde IndexedDB" assets/ausgang.js \
  'var DB_NAME = "InOutBook1"' 'var DB_NAME = "SendePruefer1"' "eigene IndexedDB"
fall "AUSGANG: gesendet wird an eine andere Adresse" assets/ausgang.js \
  'fetch(a.adresse,' 'fetch(String(a.adresse).replace("api.", "proxy."),' "kein freies Adressfeld|Adresse aus der Liste"
fall "AUSGANG: Fremdes als HTML" assets/ausgang.js \
  'if (text != null) e.textContent = String(text);' 'if (text != null) e.innerHTML = String(text);' "kein innerHTML in ausgang"
fall "AUSGANG: Aufdecken ohne Zuordnung" assets/ausgang.js \
  'var t = aufdecken(ant.value, m.zuordnung);' 'var t = ant.value;' "Aufdecken setzt"
fall "AUSGANG: die Antwort landet nicht unter KI-Antworten" assets/ausgang.js \
  'var neu = { id: neueId(), ordner: "antwort",' 'var neu = { id: neueId(), ordner: "entwurf",' "KI-Antworten"
fall "AUSGANG: die .eml ist kein Entwurf mehr" assets/ausgang.js \
  '"X-Unsent: 1", ' '' "Als .eml speichern"
fall "AUSGANG: am Handy läuft die Liste quer" assets/style.css \
  '.zeile b,.zeile span{' '.zeile span{' "Ausgangstor mit offener Mail"
fall "KANON: Modul 25 wird hier abgewandelt" modules/25_pseudonym.js \
  ' * SBKIM — Modul 25 — Pseudonymisierung' ' * SBKIM: Modul 25 — Pseudonymisierung' "Kanon byte-1:1: modules/25_pseudonym.js"
fall "KANON: die Anbieter-Liste wird hier abgewandelt" assets/anbieter.js \
  'claude-opus-5' 'claude-opus-4' "Kanon byte-1:1: assets/anbieter.js"
fall "VORRAT: ausgang.js fehlt im Installations-Vorrat" sw.js \
  '"assets/ausgang.js?v=20"' '"assets/ausgang-alt.js?v=20"' "Vorrat nennen assets/ausgang.js|liegt wirklich da"

fall "GLAS: die Knöpfe werden wieder fett" assets/style.css \
  'min-height:36px;padding:5px 13px' 'min-height:46px;padding:12px 20px' "schlank"
fall "GLAS: der Glanzpunkt fehlt" assets/style.css \
  'background:radial-gradient(90px 60px at var(--mx,50%) var(--my,20%),rgb(255 255 255/.55),transparent 60%),' 'background:' "Glanzpunkt"
fall "GLAS: glas.js wird nicht geladen" index.html \
  'src="assets/glas.js?v=20"' 'src="assets/glas-alt.js?v=20"' "glas.js steht im Vorrat|Wackeln"
fall "GLAS: glas.js fehlt im Vorrat" sw.js \
  '"assets/glas.js?v=20"' '"assets/glas-alt.js?v=20"' "glas.js steht im Vorrat"
fall "GLAS: der CSS-Riegel für weniger Bewegung ist weg" assets/style.css \
  '@media (prefers-reduced-motion:reduce){.btn,.zeile{transform:none!important;transition:none}' '@media (prefers-reduced-motion:reduce){.btn,.zeile{transition:none}' "weniger Bewegung"
fall "GLAS: das Skript wackelt trotz weniger Bewegung" assets/glas.js \
  '(ruhig && ruhig.matches) || ' '' "rechnet dann gar nicht"
fall "GLAS: im Dunkeln ist der Knopf wieder hell" assets/style.css \
  '--h1:#167676;--h2:#0f5252' '--h1:#3cb4b4;--h2:#2a9a9a' "lesbar \\(dunkel"
fall "GLAS: im Hellen ist der Knopf zu hell" assets/style.css \
  '--h1:#117a7a;' '--h1:#3cb4b4;' "lesbar \\(hell"
fall "RAND: Manifest nennt eine andere Icon-Fassung" manifest.json \
  'icons/icon-512.png?v=20' 'icons/icon-512.png?v=3' "Manifest|manifest"
fall "MANIFEST-ID: die id ist wieder \"./\" (= Ursprung, für alle Apps auf github.io dieselbe)" manifest.json \
  '"id": "/Mein-In-and-Out-Book/index.html",' '"id": "./",' "Manifest-id liegt im eigenen scope"

fall "BEGRIFF: ein Fachbegriff macht die Karte wieder rot" assets/eingang.js \
  ', "KI-BEGRIFF": 1,' ',' 'Fachbegriff .* macht die Karte NICHT rot'
fall "BEGRIFF: die Angabe sagt nicht mehr „keine Anweisung“" assets/eingang.js \
  '"KI-BEGRIFF":"Fachbegriff zu KI-Angriffen (keine Anweisung)",' '"KI-BEGRIFF":"Fachbegriff zu KI-Angriffen",' 'Angabe .*Fachbegriff'

fall "PRIO: die Wortgrenze rechts fehlt (PINsel wird zu PIN)" assets/prioritaeten.js \
  '(?=$|[^\\p{L}\\p{N}])", "iu"' '", "iu"' "Wortgrenze"
fall "PRIO: Stufe „aus“ sucht trotzdem" assets/prioritaeten.js \
  'if (stufe === "aus") return;' '' 'sucht die Wörter der Gruppe nicht'
fall "PRIO: eine Empfehlung sagt „harmlos“" assets/prioritaeten.js \
  'streng: "Lies diese Stelle selbst' 'streng: "Wahrscheinlich harmlos. Lies diese Stelle selbst' "harmlos"
fall "PRIO: der Satz sagt nicht mehr, wie der Befund entsteht" assets/prioritaeten.js \
  '(Stufe " + stufe + "). Gefunden über eine feste "' '(Stufe " + stufe + "). Erkannt als "' "wie der Befund entsteht"
fall "PRIO: ein fremder Speicherwert wird geglaubt" assets/prioritaeten.js \
  'if (STUFEN.indexOf(v) >= 0) g0.stufen[gr.id] = v;' 'if (v) g0.stufen[gr.id] = v;' "fremder Speicherwert"
fall "PRIO: im Eingang macht ein Treffer die Karte rot" assets/eingang.js \
  'var lage = warn.length ? "befund"' 'var lage = (warn.length || (PRIO && PRIO.treffer(info.texte || [], prioStand(), "eingang").length)) ? "befund"' "Karte bleibt dabei ohne Befund"
fall "PRIO: im Eingang fehlt die Empfehlung" assets/eingang.js \
  'li.appendChild(el("span", "empfehlung", "Empfehlung: " + x.empfehlung));' '' "Empfehlung"
fall "PRIO: der Schlüssel ist nicht mehr app-eigen" assets/eingang.js \
  'var PRIO_SCHLUESSEL = "inout_prioritaeten_v1";' 'var PRIO_SCHLUESSEL = "toolpoint_prioritaeten";' "app-eigen"
fall "PRIO: prioritaeten.js fehlt im Vorrat" sw.js \
  '"assets/prioritaeten.js?v=20"' '"assets/prioritaeten-alt.js?v=20"' "prioritaeten.js steht im Vorrat"
fall "PRIO: im Ausgang hält ein strenges Wort nicht an" assets/ausgang.js \
  'if (streng.length) {' 'if (false) {' "strenges Wort hält"
fall "PRIO: die Vorschau im Ausgang zeigt den Treffer nicht" assets/ausgang.js \
  'if (pt && pt.length) {' 'if (false) {' "Vorschau zeigt den Prioritäts"

fall "HERKUNFT: ein Nachweis gilt wieder als Befund (Karte rot)" assets/eingang.js \
  '"PDF-HERKUNFT": 1, "BILD-HERKUNFT": 1 };' '};' "Herkunft eule-c2pa"
fall "HERKUNFT: die Einzelheiten fehlen (kein Details-Knopf)" assets/eingang.js \
  'if (b.daten && b.daten.length) {' 'if (false) {' "Details anzeigen.* steht in den Angaben"
fall "HERKUNFT: die Einzelheiten stehen gleich offen" assets/eingang.js \
  'det.setAttribute("data-herkunft-details", "");' 'det.setAttribute("data-herkunft-details", ""); det.open = true;' "zuerst zu"
fall "HERKUNFT: die daten gehen unterwegs verloren" assets/eingang.js \
  'stelle: b.stelle || "", daten: b.daten || null };' 'stelle: b.stelle || "" };' "Details anzeigen.* steht in den Angaben"
fall "HERKUNFT: der Prüfkern wird hier abgewandelt" assets/pruefer-formate.js \
  '"Unterschrieben von"' '"Signiert von"' "Kanon byte-1:1: assets/pruefer-formate.js"
fall "HERKUNFT: auch ohne Nachweis steht ein Details-Knopf" assets/eingang.js \
  'if (angaben.length) {' 'var dd0 = el("details"); dd0.setAttribute("data-herkunft-details", ""); k.appendChild(dd0); if (angaben.length) {' "Gegenrichtung"

# ── KNOTEN: SBKIM-Knoten (Sammel-Brief 2026-10-15, Schritt 3) ──
fall "KNOTEN: Schublade fehlt im Kopf" index.html \
  '<script>window.SBKIM_DB_SUFFIX = "inoutbook";</script>' '' "Schublade „inoutbook“ steht im <head>"
fall "KNOTEN: Modul 16 wird hier abgewandelt" modules/16_siegel.js \
  ' * SBKIM — Modul 16 — SBKIM-Siegel' ' * SBKIM — Modul 16 — SBKIM-Siegel (hier angepasst)' "13 Module sind byte-gleich"
fall "KNOTEN: Pflicht-Modul 15 fehlt in der Kette" assets/sbkim-init.js \
  '    ["",       "modules/15_membran.js" + V],' '' "lädt jedes Pflicht-Modul|alle Pflicht-Module geladen"
fall "KNOTEN: die Identität fehlt in der Kette" assets/sbkim-init.js \
  '    ["",       "assets/siegel-inhalt.js" + V],        // die Identität dieses Knotens' '' "lädt jedes Pflicht-Modul \(ohne 05b\) und die Identität"
fall "KNOTEN: die 05b-Zeile fehlt" index.html \
  '<script type="module" src="modules/05b_nostr_relay.js?v=20"></script>' '' "05b als ES-Modul|alle Pflicht-Module geladen"
fall "KNOTEN: noble als klassisches Skript" index.html \
  '<script src="assets/sbkim-init.js?v=20"></script>' '<script src="modules/noble-secp256k1.js"></script><script src="assets/sbkim-init.js?v=20"></script>' "noble-secp256k1 steht NICHT|Seitenfehler"
fall "KNOTEN: Modul 23 fehlt im Installations-Vorrat" sw.js \
  '"modules/23_rendezvous.js?v=20", ' '' "stehen im Installations-Vorrat"
fall "KNOTEN: fremde Herkunft erlaubt" assets/sbkim-init.js \
  'allowedOrigins: []' 'allowedOrigins: ["https://fremd.example"]' "keine fremde Herkunft"
fall "KNOTEN: Mailadresse in der Beschreibung" assets/siegel-inhalt.js \
  'FÜR WEN: für Betriebe' 'FÜR WEN: post@beispiel.example für Betriebe' "keine Mailadresse"
fall "KNOTEN: das Siegel öffnet kein Fenster" assets/sbkim-init.js \
  'mountModal: true' 'mountModal: false' "öffnet sich mit dem Knopf zum Andock-Werkzeug|öffnet den Andock-Wizard"
fall "KNOTEN: beim Start geht etwas ins Netz" assets/sbkim-init.js \
  '      if (!window.SbkimStorage) return;' '      try { new WebSocket("wss://relais.example.invalid"); } catch (_e) {} if (!window.SbkimStorage) return;' "kein WebSocket|Abruf außer Haus"
fall "KNOTEN: Klappfeld am Handy links verankert" assets/style.css \
  ' .netz-mehr{right:12px;top:calc(100% + 6px)}' ' .netz-mehr{right:auto;left:calc(100% - 20px);top:calc(100% + 6px)}' "ohne über den Rand"
fall "KNOTEN: der Andock-Wizard fehlt in der Kette" assets/sbkim-init.js \
  '    ["",       "modules/16b_andock_wizard.js" + V]    // Andock-Werkzeug IM Siegel' '    ["",       "modules/16_siegel.js" + V]' "lädt jedes Pflicht-Modul|Andock-Werkzeug|Andock-Wizard"
fall "KNOTEN: Leiste erscheint beim Drucken" assets/style.css \
  '@media print{.netzleiste,#sbkim-siegel-badge,[data-sbkim-mycel-platz],[id^="sbkim-"]{display:none!important}}' '' "beim Drucken ist keine Lampe"

echo "$n Fälle · $gefangen gefangen · $blind blind · $falsch aus falschem Grund · $tot tote Anker"
rm -rf "$(dirname "$KOPIE")"
[ $((blind+falsch+tot)) -eq 0 ]
