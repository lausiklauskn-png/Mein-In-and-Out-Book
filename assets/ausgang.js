/* Mein In-and-Out-Book — Stufe 2: das Ausgangstor.
 *
 * Prüft einen Text, BEVOR er an eine KI geht, und verdeckt Namen, Mailadressen,
 * Telefonnummern, IBANs, Beträge, Rechnungsnummern und Schlüssel durch
 * Platzhalter (⟦NAME-1⟧ …). Die Antwort der KI wird hier wieder aufgedeckt.
 *
 * Der Prüfkern ist Sage-Modul 25 (modules/25_pseudonym.js, byte-1:1 aus
 * Sage-Protokol, per SHA gepinnt). Hier stehen KEINE eigenen Muster.
 * Das Postfach (Ordner, Original ⟷ „Was die KI sieht", Kopieren/Senden,
 * Aufdecken) ist nach dem Sende-Prüfer gebaut, nicht neu erfunden.
 *
 * Drei Riegel, alle „fail closed":
 *   1. fehlt Modul 25, geht NICHTS hinaus (kein Kopieren, kein Senden);
 *   2. steht nach dem Verdecken noch ein gefundener Wert im Text, geht nichts hinaus;
 *   3. steht im Mailtext eine Anweisung an eine KI (oder fehlt die Prüfung dafür),
 *      hält der erste Tipp an und nennt die Zeile; erst ein zweiter Tipp geht weiter.
 *
 * Eigene Ablage: IndexedDB "InOutBook1", Speicher-Schlüssel mit "inout_".
 * github.io ist eine geteilte Adresse — nie den Namen einer Geschwister-App nehmen.
 * Der KI-Schlüssel wird NIRGENDS abgelegt, er lebt nur, solange die Seite offen ist.
 * Fremdes nur als Text: keine HTML-Zuweisung in dieser Datei. */
(function () {
  "use strict";
  var P = window.SbkimPseudonym || null;
  var M = window.PrueferMail || null;
  var ANB = window.SPAnbieter || null;
  var DB_NAME = "InOutBook1", STORE = "mails", ZULETZT = "inout_ausgang_ordner";

  var ORDNER = [
    { id: "eingang", name: "Eingefügt", icon: "📥", hin: "Mails, die du beantworten willst" },
    { id: "entwurf", name: "Entwürfe", icon: "📝", hin: "Was du selbst schreibst" },
    { id: "antwort", name: "KI-Antworten", icon: "↩", hin: "Zurück, mit echten Angaben" },
    { id: "export", name: "Exportiert", icon: "📤", hin: "Als .eml gespeichert" }
  ];
  var AUFGABEN = {
    eingang: [["💬 Antwort", "eine kurze, freundliche Antwort auf diese E-Mail"],
      ["🧾 Rechnung", "eine Rechnung zu diesem Auftrag: Positionen mit Menge und Preis, netto, Umsatzsteuer, brutto, zahlbar in 14 Tagen"],
      ["⏰ Mahnung", "eine höfliche Zahlungserinnerung zur offenen Rechnung mit neuer Frist von 7 Tagen"],
      ["📋 Angebot", "ein Angebot zu dieser Anfrage: Leistungen mit Preis, Summe, gültig 30 Tage"],
      ["📅 Termin", "eine Antwort mit zwei Terminvorschlägen"]],
    sonst: [["✎ Überarbeiten", "diesen Entwurf freundlich, klar und kurz"],
      ["✂ Kürzen", "diesen Entwurf auf das Nötige gekürzt"],
      ["🎩 Förmlicher", "diesen Entwurf in förmlichem Ton"]]
  };
  var SORTE = { NAME: "Name", MAIL: "E-Mail", TELEFON: "Telefon", IBAN: "IBAN", BETRAG: "Betrag", RECHNUNG: "Rechnung", SCHLUESSEL: "Schlüssel" };

  function anweisung(t) {
    return "Aufgabe: Schreibe " + t + ".\nGrundlage ist die E-Mail oben. Übernimm jeden Platzhalter in ⟦ ⟧ genau so, wie er steht, " +
      "und erfinde keine Namen, Nummern oder Beträge. Fehlt eine Angabe, schreibe [bitte ergänzen: …]. Gib nur den fertigen Text aus.";
  }

  /* ── Bausteine ── */
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = String(text);   // Text ist immer Text, nie HTML
    return e;
  }
  function knopf(text, cls, fn) { var b = el("button", "btn" + (cls ? " " + cls : ""), text); b.type = "button"; b.addEventListener("click", fn); return b; }
  function lies(k) { try { return localStorage.getItem(k); } catch (_e) { return null; } }
  function schreib(k, v) { try { localStorage.setItem(k, v); } catch (_e) {} }

  /* ── Ablage ── */
  var dbVersprechen = null;
  function db() {
    if (dbVersprechen) return dbVersprechen;
    dbVersprechen = new Promise(function (ok, nein) {
      if (!window.indexedDB) { nein(new Error("kein IndexedDB")); return; }
      var q = indexedDB.open(DB_NAME, 1);
      q.onupgradeneeded = function () { if (!q.result.objectStoreNames.contains(STORE)) q.result.createObjectStore(STORE, { keyPath: "id" }); };
      q.onsuccess = function () { ok(q.result); };
      q.onerror = function () { nein(q.error); };
    });
    return dbVersprechen;
  }
  function tx(art, fn) {
    return db().then(function (d) {
      return new Promise(function (ok, nein) {
        var t = d.transaction(STORE, art), s = t.objectStore(STORE), r = fn(s);
        t.oncomplete = function () { ok(r && r.result); };
        t.onerror = function () { nein(t.error); };
      });
    });
  }
  var MAILS = [];
  function ladeAlle() { return tx("readonly", function (s) { return s.getAll(); }).then(function (l) { MAILS = l || []; }, function () { MAILS = []; }); }
  function speichere(m) { m.geaendert = new Date().toISOString(); return tx("readwrite", function (s) { return s.put(m); }).catch(function () {}); }
  function loesche(id) { return tx("readwrite", function (s) { return s.delete(id); }).catch(function () {}); }
  function neueId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  /* ── die Mail als Text ── */
  function ganzeMail(m) {
    var k = [];
    if (m.vonName) k.push("Von: " + m.vonName);
    if (m.anName) k.push("An: " + m.anName);
    if (m.betreff) k.push("Betreff: " + m.betreff);
    return (k.length ? k.join("\n") + "\n\n" : "") + String(m.text || "");
  }
  // Mail zuerst, damit die Zeilennummern der Befunde die der Mail sind.
  function hinaus(m) { var b = String(m.bitte || "").trim(); return ganzeMail(m) + (b ? "\n\n---\n" + b : ""); }
  function mailNamen(m) {
    var n = [m.vonName, m.anName].concat(String(m.namen || "").split(/[\n,;]/));
    var aus = [];
    n.forEach(function (x) { x = String(x || "").trim(); if (x.length >= 2 && aus.indexOf(x) === -1) aus.push(x); });
    return aus;
  }
  // Eine eingefügte Mail: Kopfzeilen Von/An/Betreff (deutsch oder From/To/Subject) werden gelesen.
  function mailLesen(roh) {
    var m = { vonName: "", anName: "", betreff: "", text: "" };
    var zeilen = String(roh || "").replace(/^﻿/, "").replace(/\r\n/g, "\n").split("\n"), i = 0;
    for (; i < zeilen.length; i++) {
      var z = zeilen[i].match(/^(Von|An|Betreff|From|To|Subject|Datum|Date|Gesendet|Cc):\s*(.*)$/i);
      if (!z) break;
      var w = z[1].toLowerCase(), v = z[2].trim().replace(/\s*<[^>]*>\s*$/, "").replace(/^"|"$/g, "");
      if (w === "von" || w === "from") m.vonName = v;
      else if (w === "an" || w === "to") m.anName = v.split(",")[0].trim();
      else if (w === "betreff" || w === "subject") m.betreff = z[2].trim();
    }
    m.text = zeilen.slice(i).join("\n").trim();
    return m;
  }

  /* ── Prüfen und Verdecken ── */
  function verdecke(m) {
    if (!P) return null;
    var r = P.pseudonymize(hinaus(m), { values: mailNamen(m) });
    return { text: r.text, map: r.map, treffer: r.findings };
  }
  function kiStellen(m) {
    if (!M) return null;
    return M.pruefeMail(String(m.text || "")).stellen.filter(function (s) {
      return s.kennung === "KI-ANWEISUNG" || s.kennung === "UNSICHTBARE-ZEICHEN" || s.kennung === "VERSTECKTER-TEXT";
    });
  }
  var weiterFuer = null;   // nur im Speicher: der Text, für den ein zweiter Tipp gilt
  /* bereit(m) → { text, map, treffer } oder null (dann steht der Grund in meldung). */
  function bereit(m, meldung) {
    if (!P) { meldung("Die Prüfung (Modul 25) ist nicht geladen. Es geht nichts hinaus."); return null; }
    if (!String(m.text || "").trim()) { meldung("Es steht noch kein Text da."); return null; }
    var r = verdecke(m);
    var leck = P.findLeak(r.text, r.map);
    if (leck) { meldung("Nach dem Verdecken steht noch „" + leck + "\" im Text. Es geht nichts hinaus."); return null; }
    var schluessel = hinaus(m);
    if (weiterFuer !== schluessel) {
      var ki = kiStellen(m);
      if (ki === null) { weiterFuer = schluessel; meldung("Angehalten: die Suche nach Anweisungen an eine KI ist nicht geladen (UNGEPRÜFT). Noch einmal tippen, um trotzdem weiterzugehen."); return null; }
      if (ki.length) {
        weiterFuer = schluessel;
        meldung("Angehalten: im Mailtext steht etwas, das sich an eine KI richtet (" + ki.map(function (s) { return (s.zeile ? "Zeile " + s.zeile : s.kennung); }).join(", ") +
          "). Wer das an eine KI gibt, gibt ihr diese Anweisung mit. Noch einmal tippen, um trotzdem weiterzugehen.");
        return null;
      }
    }
    return r;
  }
  function merkeHinaus(m, r, wie) {
    m.zuordnung = Object.assign({}, m.zuordnung || {}, r.map);
    m.hinaus = { wann: new Date().toISOString(), wie: wie, platzhalter: Object.keys(r.map).length };
    speichere(m);
  }
  function aufdecken(text, map) { return P ? P.rehydrate(String(text || ""), map || {}) : String(text || ""); }

  /* ── KI-Anfrage (geschlossene Anbieter-Liste, kein freies Adressfeld) ── */
  function anfrage(a, schluessel, text) {
    if (a.protokoll === "messages") {
      return { headers: { "content-type": "application/json", "x-api-key": schluessel,
          "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: { model: a.modell, max_tokens: 4096, messages: [{ role: "user", content: text }] } };
    }
    var body = { model: a.modell, messages: [{ role: "user", content: text }] };
    body[a.grenze || "max_tokens"] = 4096;
    return { headers: { "content-type": "application/json", "authorization": "Bearer " + schluessel }, body: body };
  }
  function antwortText(a, j) {
    if (a.protokoll === "messages") return (j.content || []).filter(function (c) { return c.type === "text"; }).map(function (c) { return c.text; }).join("\n");
    return (((j.choices || [])[0] || {}).message || {}).content || "";
  }

  /* ── .eml (nur zum Speichern, wird nie gesendet) ── */
  function kodiereWort(s) {
    s = String(s || "");
    if (!/[^\x20-\x7e]/.test(s)) return s;
    var b = new TextEncoder().encode(s), bin = "";
    for (var i = 0; i < b.length; i++) bin += String.fromCharCode(b[i]);
    return "=?UTF-8?B?" + btoa(bin) + "?=";
  }
  function emlBauen(m, text) {
    return ["To: " + kodiereWort(m.anName || ""), "Subject: " + kodiereWort(m.betreff || ""), "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8", "Content-Transfer-Encoding: 8bit", "X-Unsent: 1", "", String(text || "")].join("\r\n");
  }

  /* ── Oberfläche ── */
  var ordnerJetzt = lies(ZULETZT) || "eingang", offen = null, ansicht = "original";
  var schluesselImSpeicher = "";   // nie abgelegt

  function zeichneOrdner() {
    var box = $("ausOrdner"); if (!box) return;
    box.replaceChildren();
    ORDNER.forEach(function (o) {
      var n = MAILS.filter(function (m) { return m.ordner === o.id; }).length;
      var b = knopf(o.icon + " " + o.name + " (" + n + ")", o.id === ordnerJetzt ? "" : "leicht", function () {
        ordnerJetzt = o.id; schreib(ZULETZT, o.id); offen = null; alles();
      });
      b.setAttribute("data-ordner", o.id); b.setAttribute("data-anzahl", String(n)); b.title = o.hin;
      if (o.id === ordnerJetzt) b.setAttribute("aria-current", "true");
      box.appendChild(b);
    });
  }
  function zeichneListe() {
    var box = $("ausListe"); if (!box) return;
    box.replaceChildren();
    var liste = MAILS.filter(function (m) { return m.ordner === ordnerJetzt; })
      .sort(function (a, b) { return String(b.geaendert || "").localeCompare(String(a.geaendert || "")); });
    if (!liste.length) { box.appendChild(el("p", "leise", "Hier liegt noch nichts.")); return; }
    liste.forEach(function (m) {
      var b = el("button", "zeile" + (offen && offen.id === m.id ? " an" : ""));
      b.type = "button"; b.setAttribute("data-mail", m.id);
      b.appendChild(el("b", "", m.betreff || "(ohne Betreff)"));
      b.appendChild(el("span", "leise", (m.vonName || m.anName || "") + " · " + String(m.text || "").slice(0, 60)));
      b.addEventListener("click", function () { offen = m; ansicht = "original"; alles(); });
      box.appendChild(b);
    });
  }

  function textMitMarken(text, treffer, klasse) {
    var pre = el("pre", "mailtext"), pos = 0;
    treffer.forEach(function (f) {
      pre.appendChild(document.createTextNode(text.slice(pos, f.start)));
      var mk = el("mark", klasse, text.slice(f.start, f.end)); mk.title = SORTE[f.type] || f.type;
      pre.appendChild(mk); pos = f.end;
    });
    pre.appendChild(document.createTextNode(text.slice(pos)));
    return pre;
  }
  function textMitPlatzhaltern(text) {
    var pre = el("pre", "mailtext"), re = /⟦[A-Z][A-Z0-9_]*-\d+⟧/g, pos = 0, t;
    while ((t = re.exec(text)) !== null) {
      pre.appendChild(document.createTextNode(text.slice(pos, t.index)));
      pre.appendChild(el("span", "tok", t[0])); pos = t.index + t[0].length;
    }
    pre.appendChild(document.createTextNode(text.slice(pos)));
    return pre;
  }

  function feld(label, wert, mehrzeilig, fn, id) {
    var w = el("label", "feld");
    w.appendChild(el("span", "leise", label));
    var i = mehrzeilig ? el("textarea") : el("input");
    if (!mehrzeilig) i.type = "text";
    i.value = wert || ""; i.spellcheck = false; if (id) i.id = id;
    i.addEventListener("input", function () { fn(i.value); });
    w.appendChild(i); return w;
  }

  var speicherUhr = null;
  function bald(m) { clearTimeout(speicherUhr); speicherUhr = setTimeout(function () { speichere(m); zeichneListe(); }, 250); }

  function zeichneOffen() {
    var box = $("ausOffen"); if (!box) return;
    box.replaceChildren();
    if (!offen) { box.appendChild(el("p", "leise", "Wähle links eine Mail, füge eine ein oder schreibe einen Entwurf.")); return; }
    var m = offen;
    var vorschau = el("div", "vorschau");
    function neuZeichnen() { zeichneVorschau(m, vorschau); }

    var felder = el("div", "felder");
    felder.appendChild(feld("Von", m.vonName, false, function (v) { m.vonName = v; bald(m); neuZeichnen(); }, "ausVon"));
    felder.appendChild(feld("An", m.anName, false, function (v) { m.anName = v; bald(m); neuZeichnen(); }, "ausAn"));
    felder.appendChild(feld("Betreff", m.betreff, false, function (v) { m.betreff = v; bald(m); neuZeichnen(); }, "ausBetreff"));
    felder.appendChild(feld("Text", m.text, true, function (v) { m.text = v; bald(m); neuZeichnen(); }, "ausText"));
    felder.appendChild(feld("Weitere Namen (je Zeile oder mit Komma) — werden mit verdeckt", m.namen, true, function (v) { m.namen = v; bald(m); neuZeichnen(); }, "ausNamen"));
    box.appendChild(felder);

    // Aufgabe an die KI
    var aufg = el("div", "kasten");
    aufg.appendChild(el("h3", "", "Aufgabe an die KI"));
    var chips = el("div", "reihe");
    var bitte = feld("Anweisung (wird mitgeprüft und mit verdeckt)", m.bitte, true, function (v) { m.bitte = v; bald(m); neuZeichnen(); }, "ausBitte");
    AUFGABEN[m.ordner === "eingang" ? "eingang" : "sonst"].forEach(function (a) {
      var c = knopf(a[0], "leicht", function () { m.bitte = anweisung(a[1]); bitte.querySelector("textarea").value = m.bitte; bald(m); neuZeichnen(); });
      c.setAttribute("data-aufgabe", a[0]); chips.appendChild(c);
    });
    aufg.appendChild(chips); aufg.appendChild(bitte);
    box.appendChild(aufg);

    // Ansicht
    var schalter = el("div", "reihe");
    var bO = knopf("Original", ansicht === "original" ? "" : "leicht", function () { ansicht = "original"; zeichneOffen(); });
    var bK = knopf("Was die KI sieht", ansicht === "ki" ? "" : "leicht", function () { ansicht = "ki"; zeichneOffen(); });
    bO.setAttribute("data-ansicht", "original"); bK.setAttribute("data-ansicht", "ki");
    schalter.appendChild(bO); schalter.appendChild(bK);
    box.appendChild(schalter);
    box.appendChild(vorschau);
    neuZeichnen();

    // Hinaus
    var raus = el("div", "kasten");
    raus.appendChild(el("h3", "", "Hinaus"));
    var meldung = el("p", "meldung"); meldung.id = "ausMeldung"; meldung.setAttribute("aria-live", "polite");
    function melde(t, art) { meldung.textContent = t; meldung.setAttribute("data-art", art || "warn"); }
    var reihe = el("div", "reihe");
    var kop = knopf("📋 Verdeckt kopieren", "", function () {
      var r = bereit(m, function (t) { melde(t); }); if (!r) return;
      merkeHinaus(m, r, "kopiert");
      var gut = function () { melde("Kopiert: die verdeckte Fassung mit " + r.treffer.length + " Platzhalter(n). Füge sie in deine KI ein und hol die Antwort hierher zurück.", "gut"); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(r.text).then(gut, function () { melde("Die Zwischenablage hat abgelehnt. Die verdeckte Fassung steht unter „Was die KI sieht\"."); });
      else melde("Diese Umgebung hat keine Zwischenablage. Die verdeckte Fassung steht unter „Was die KI sieht\".");
    });
    kop.id = "ausKopieren"; reihe.appendChild(kop);
    raus.appendChild(reihe);

    if (ANB) {
      var wahl = el("select"); wahl.id = "ausAnbieter";
      Object.keys(ANB).forEach(function (k) { var o = el("option", "", ANB[k].name); o.value = k; wahl.appendChild(o); });
      var sch = el("input"); sch.type = "password"; sch.id = "ausSchluessel"; sch.autocomplete = "off"; sch.placeholder = "Schlüssel (wird nicht gespeichert)";
      sch.value = schluesselImSpeicher;
      sch.addEventListener("input", function () { schluesselImSpeicher = sch.value.trim(); });
      var holen = el("a", "", "🔑 Schlüssel beim Anbieter erzeugen ↗"); holen.target = "_blank"; holen.rel = "noopener noreferrer";
      function holenSetzen() { holen.href = ANB[wahl.value].holen; }
      wahl.addEventListener("change", holenSetzen); holenSetzen();
      var send = knopf("✉ Verdeckt senden", "", function () { senden(m, ANB[wahl.value], melde); });
      send.id = "ausSenden";
      var sz = el("div", "reihe"); sz.appendChild(wahl); sz.appendChild(sch); sz.appendChild(send);
      raus.appendChild(sz); raus.appendChild(holen);
      raus.appendChild(el("p", "leise", "Ein KI-Abo ist kein Schlüssel: die Schnittstelle wird getrennt abgerechnet. Mit Abo nimm „Verdeckt kopieren\"."));
    } else {
      raus.appendChild(el("p", "leise", "Die Anbieter-Liste ist nicht geladen — es geht nur Kopieren."));
    }
    raus.appendChild(meldung);
    box.appendChild(raus);

    // Antwort zurück
    var zur = el("div", "kasten");
    zur.appendChild(el("h3", "", "Antwort der KI aufdecken"));
    var ant = el("textarea"); ant.id = "ausAntwort"; ant.spellcheck = false; ant.value = m.antwortRoh || "";
    ant.placeholder = "Antwort der KI hier einfügen";
    ant.addEventListener("input", function () { m.antwortRoh = ant.value; bald(m); });
    var klar = el("div"); klar.id = "ausKlar";
    var auf = knopf("Aufdecken", "", function () {
      var t = aufdecken(ant.value, m.zuordnung);
      klar.replaceChildren(el("pre", "mailtext", t));
      var rest = (t.match(/⟦[A-Z][A-Z0-9_]*-\d+⟧/g) || []);
      if (rest.length) klar.appendChild(el("p", "meldung", "Diese Platzhalter kennt diese Mail nicht und bleiben stehen: " + rest.join(", ")));
      var ab = knopf("In KI-Antworten ablegen", "leicht", function () {
        var neu = { id: neueId(), ordner: "antwort", vonName: m.anName || "", anName: m.vonName || "", betreff: "Re: " + (m.betreff || ""),
          text: t, namen: m.namen || "", erstellt: new Date().toISOString(), herkunft: m.id };
        MAILS.push(neu); speichere(neu).then(function () { ordnerJetzt = "antwort"; schreib(ZULETZT, "antwort"); offen = neu; alles(); });
      });
      ab.id = "ausAblegen"; klar.appendChild(ab);
    });
    auf.id = "ausAufdecken";
    if (!m.zuordnung) zur.appendChild(el("p", "leise", "Erst verdeckt kopieren oder senden — dann kennt diese Mail ihre Platzhalter."));
    zur.appendChild(ant); var zr = el("div", "reihe"); zr.appendChild(auf); zur.appendChild(zr); zur.appendChild(klar);
    box.appendChild(zur);

    // Sonstiges
    var fuss = el("div", "reihe");
    var eml = knopf("⬇ Als .eml speichern", "leicht", function () {
      var blob = new Blob([emlBauen(m, m.text)], { type: "message/rfc822" }), a = el("a");
      a.href = URL.createObjectURL(blob); a.download = (m.betreff || "mail").replace(/[^\p{L}\p{N} _.-]+/gu, "_").slice(0, 60) + ".eml";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
      if (m.ordner !== "export") {
        var kopie = Object.assign({}, m, { id: neueId(), ordner: "export", erstellt: new Date().toISOString() });
        MAILS.push(kopie); speichere(kopie).then(zeichneOrdner);
      }
      melde("Gespeichert als .eml (Entwurf, wird nicht gesendet). Eine Kopie liegt unter „Exportiert\".", "gut");
    });
    eml.id = "ausEml";
    var weg = knopf("🗑 Löschen", "leicht", function () {
      if (!confirm("Diese Mail hier löschen?")) return;
      MAILS = MAILS.filter(function (x) { return x.id !== m.id; }); loesche(m.id).then(function () { offen = null; alles(); });
    });
    fuss.appendChild(eml); fuss.appendChild(weg);
    box.appendChild(fuss);
  }

  function zeichneVorschau(m, box) {
    box.replaceChildren();
    if (!P) { box.appendChild(el("p", "meldung", "Die Prüfung (Modul 25) ist nicht geladen. Es geht nichts hinaus.")); return; }
    var text = hinaus(m), r = P.pseudonymize(text, { values: mailNamen(m) });
    box.setAttribute("data-treffer", String(r.findings.length));
    var n = {}; r.findings.forEach(function (f) { n[f.type] = (n[f.type] || 0) + 1; });
    box.appendChild(el("p", "leise", r.findings.length
      ? r.findings.length + " Stelle(n) werden verdeckt: " + Object.keys(n).map(function (k) { return (SORTE[k] || k) + " " + n[k]; }).join(" · ")
      : "Nichts zu verdecken gefunden. Namen, die kein Muster kennt, trägst du oben unter „Weitere Namen\" ein."));
    box.appendChild(ansicht === "ki" ? textMitPlatzhaltern(r.text) : textMitMarken(text, r.findings, "fund"));
  }

  function senden(m, a, melde) {
    var r = bereit(m, function (t) { melde("Nicht gesendet: " + t); }); if (!r) return Promise.resolve();
    var schluessel = schluesselImSpeicher;
    if (!schluessel) { melde("Es fehlt ein Schlüssel für " + a.name + ". Oder nimm „Verdeckt kopieren\"."); return Promise.resolve(); }
    if (a.beginnt && schluessel.indexOf(a.beginnt) !== 0) { melde("Ein Schlüssel für " + a.name + " beginnt mit " + a.beginnt + ". Der eingetragene tut das nicht."); return Promise.resolve(); }
    var q = anfrage(a, schluessel, r.text);
    merkeHinaus(m, r, "gesendet");
    melde("Wird gesendet an " + a.adresse + " …", "laeuft");
    return fetch(a.adresse, { method: "POST", headers: q.headers, body: JSON.stringify(q.body) }).then(function (antwort) {
      return antwort.json().catch(function () { return {}; }).then(function (j) {
        if (Array.isArray(j)) j = j[0] || {};
        if (!antwort.ok) { melde("Der Anbieter hat abgelehnt (" + antwort.status + "): " + ((j.error && (j.error.message || j.error.type)) || j.message || "HTTP " + antwort.status)); return; }
        m.antwortRoh = antwortText(a, j); speichere(m);
        var f = $("ausAntwort"); if (f) f.value = m.antwortRoh;
        melde("Antwort erhalten. Gesendet wurde die verdeckte Fassung mit " + r.treffer.length + " Platzhalter(n). Jetzt „Aufdecken\".", "gut");
      });
    }, function (x) { melde("Keine Verbindung zu " + a.adresse + " (" + (x && x.message || x) + ")."); });
  }

  function alles() { zeichneOrdner(); zeichneListe(); zeichneOffen(); }

  function neu(ordner, roh) {
    var m = roh != null ? mailLesen(roh) : { vonName: "", anName: "", betreff: "", text: "" };
    m.id = neueId(); m.ordner = ordner; m.namen = ""; m.bitte = ""; m.erstellt = new Date().toISOString();
    MAILS.push(m); ordnerJetzt = ordner; schreib(ZULETZT, ordner); offen = m; ansicht = "original";
    return speichere(m).then(alles);
  }

  /* ── Reiter Eingang / Ausgang ── */
  function torZeigen(welches) {
    document.querySelectorAll("[data-tor-teil]").forEach(function (t) { t.hidden = t.getAttribute("data-tor-teil") !== welches; });
    document.querySelectorAll("[data-tor]").forEach(function (b) {
      var an = b.getAttribute("data-tor") === welches; b.setAttribute("aria-pressed", String(an)); b.classList.toggle("leicht", !an);
    });
  }

  var bereitVersprechen = ladeAlle().then(function () {
    document.querySelectorAll("[data-tor]").forEach(function (b) { b.addEventListener("click", function () { torZeigen(b.getAttribute("data-tor")); }); });
    var e = $("ausEinfuegen");
    if (e) e.addEventListener("click", function () { var f = $("ausRoh"); var t = f ? f.value : ""; if (!t.trim()) return; if (f) f.value = ""; neu("eingang", t); });
    var w = $("ausEntwurf"); if (w) w.addEventListener("click", function () { neu("entwurf", null); });
    if (location.hash === "#ausgang") torZeigen("ausgang");
    alles();
  });

  window.__inoutAusgang = { bereit: bereitVersprechen, pruefeHinaus: bereit, verdecke: verdecke, hinaus: hinaus, mailLesen: mailLesen,
    aufdecken: aufdecken, mails: function () { return MAILS; }, offen: function () { return offen; }, DB_NAME: DB_NAME };
})();
