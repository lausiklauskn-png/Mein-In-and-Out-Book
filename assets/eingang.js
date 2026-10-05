/* Mein In-and-Out-Book — das Eingangstor (Stufe 1, 2026-10-02).
 *
 * Nimmt Dateien auf drei Wegen an (Ablegen, Wählen, Teilen aus einer anderen
 * App) und Text über das Feld. Geprüft wird mit dem Prüfkern des
 * Auslieferungsprüfers (assets/pruefer*.js, byte-1:1, gepinnt in
 * tests/smoke.mjs). Nichts wird ausgeführt, angezeigt oder ins Netz geschickt.
 *
 * Drei Lagen je Eingang, nie zwei: BEFUND · UNGEPRÜFT · KEIN BEFUND.
 * „Ungeprüft" ist nicht „sauber" — es heißt, ein Teil ließ sich nicht lesen.
 *
 * Angaben zu Personen, Metadaten und frühere Fassungen sind in eingehender
 * Post normal. Sie stehen getrennt als „Angaben" da und machen eine Karte
 * nicht rot. Wichtig werden sie erst, wenn etwas HINAUSgeht (Stufe 2). */
(function () {
  "use strict";
  var GESCHEHEN = "schleuse-geteilt";      // Vorrat, in den sw.js geteilte Dateien legt
  var ANGABEN = { "PERSONENBEZUG": 1, "RECHNUNGSDATEN": 1, "PDF-METADATEN": 1, "BILD-METADATEN": 1, "PDF-ALTFASSUNG": 1, "KI-BEGRIFF": 1 };
  var KURZ = {"FREMDE-ADRESSE":"fremde Adresse","SCHLUESSEL":"Zugangsschlüssel","PERSONENBEZUG":"Angabe zu einer Person",
    "RECHNUNGSDATEN":"Abrechnungsdaten","PDF-VERWEIS":"Verweis nach außen","PDF-AKTION":"eingebettete Aktion","PDF-ANHANG":"Datei im PDF",
    "PDF-METADATEN":"Metadaten","PDF-ALTFASSUNG":"frühere Fassung","PDF-KI-ANWEISUNG":"Anweisung an eine KI","BILD-KI-ANWEISUNG":"Anweisung im Bild",
    "BILD-LSB-VERDACHT":"Verdacht in Bildpunkten","PDF-VERSTECKTER-TEXT":"unsichtbarer Text","LINK-TARNUNG":"Link zeigt woanders hin",
    "ADRESS-TRICK":"getarnte Adresse","KURZLINK":"Kürzel verbirgt das Ziel","ZAEHLPIXEL":"Lesebestätigung","ANHANG-GEFAEHRLICH":"Anhang führt etwas aus",
    "ANHANG-TARNUNG":"Endung täuscht","ANHANG-PROGRAMM":"Programm","BILD-ANHAENGSEL":"Daten hinter dem Bild","BILD-METADATEN":"Metadaten im Bild",
    "SVG-SKRIPT":"Skript in Grafik","SVG-VERWEIS":"Grafik holt von außen","OFFICE-MAKRO":"Makro","OFFICE-VERWEIS":"Dokument holt von außen",
    "OFFICE-EINBETTUNG":"eingebettete Datei","ANHANG-DOPPELENDUNG":"Anhang mit zwei Endungen","VERSTECKTER-TEXT":"versteckter Text",
    "UNSICHTBARE-ZEICHEN":"unsichtbare Zeichen","KI-ANWEISUNG":"Anweisung an eine KI","KI-BEGRIFF":"Fachbegriff zu KI-Angriffen (keine Anweisung)",
    "BILD-METADATEN-KI-ANWEISUNG":"Anweisung in den Bild-Metadaten","ABSENDER-TARNUNG":"Absender passt nicht",
    "PRUEFUNG-DURCHGEFALLEN":"Echtheitsprüfung durchgefallen","KONTO-WECHSEL":"geänderte Bankverbindung","ZUGANGSDATEN":"fragt nach Zugangsdaten",
    "DRUCK":"Frist und Drohung"};

  var A = window.PrueferAnhang, M = window.PrueferMail, F = window.PrueferFormate;
  var aus = document.getElementById("ergebnisse");
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  if (A && A.pfade) {
    try { A.pfade({ pdfjs: new URL("vendor/pdfjs/", location.href).href, tesseract: new URL("vendor/tesseract/", location.href).href }); } catch (_e) {}
  }

  /* Text einer Datei (Seiten, Bildtext, SVG …) geht zusätzlich durch die
     Text-Suche: Schlüssel, Mailadressen, Kontonummern. */
  function textTreffer(r, name) {
    var x = [];
    if (!F) return x;
    if (r.seiten && r.seiten.length) {
      r.seiten.forEach(function (s) {
        F.pruefeText(s.text, name, []).forEach(function (t) {
          x.push({ kennung: t.kennung, satz: t.satz, stelle: "Seite " + s.seite + (t.zeile ? (s.bild ? ", Bildtext Zeile " : ", Zeile ") + t.zeile : "") });
        });
      });
    } else if (r.text) {
      F.pruefeText(r.text, name, []).forEach(function (t) {
        x.push({ kennung: t.kennung, satz: t.satz, stelle: t.zeile ? (r.textQuelle === "bild" ? "Bildtext Zeile " : "Zeile ") + t.zeile : "" });
      });
    }
    return x;
  }

  function karte(name) {
    var k = el("article", "karte");
    k.setAttribute("data-lage", "laeuft");
    k.setAttribute("data-eingang", name);
    var kopf = el("div", "kopf");
    kopf.appendChild(el("span", "marke laeuft", "wird geprüft …"));
    kopf.appendChild(el("b", "", name));
    k.appendChild(kopf);
    aus.insertBefore(k, aus.firstChild);
    return k;
  }

  /* Eine Karte füllen. befunde: [{kennung, satz, stelle}] */
  function fuellen(k, info) {
    var warn = info.befunde.filter(function (b) { return !ANGABEN[b.kennung]; });
    var angaben = info.befunde.filter(function (b) { return ANGABEN[b.kennung]; });
    var lage = warn.length ? "befund" : info.ungeprueft ? "ungeprueft" : "sauber";
    k.setAttribute("data-lage", lage);
    k.textContent = "";
    var kopf = el("div", "kopf");
    kopf.appendChild(el("span", "marke " + lage,
      lage === "befund" ? warn.length + " Befund" + (warn.length > 1 ? "e" : "")
        : lage === "ungeprueft" ? (info.ungeprueftSatz || "ungeprüft") : "kein Befund"));
    kopf.appendChild(el("b", "", info.name));
    if (info.art) kopf.appendChild(el("span", "leise", info.art));
    k.appendChild(kopf);
    if (lage === "ungeprueft") k.appendChild(el("p", "", "Ein Teil ließ sich nicht lesen. Das heißt nicht, dass die Datei sauber ist."));
    if (warn.length) {
      var ul = el("ul", "befunde");
      warn.forEach(function (b) {
        var li = el("li");
        li.setAttribute("data-kennung", b.kennung);
        li.appendChild(el("b", "", (KURZ[b.kennung] || b.kennung) + ": "));
        li.appendChild(document.createTextNode(b.satz));
        if (b.stelle) li.appendChild(el("span", "stelle", b.stelle));
        ul.appendChild(li);
      });
      k.appendChild(ul);
      /* Was jetzt tun — je Art einmal, aus dem Prüfkern. */
      var gesehen = {};
      warn.forEach(function (b) {
        var schritte = A && A.wasTun ? A.wasTun(b.kennung) : [];
        if (!schritte.length || gesehen[b.kennung]) return;
        gesehen[b.kennung] = 1;
        var box = el("div", "wastun");
        box.setAttribute("data-was-tun", b.kennung);
        box.appendChild(el("b", "", "Was jetzt tun (" + (KURZ[b.kennung] || b.kennung) + ")"));
        var ol = el("ol");
        schritte.forEach(function (s) { ol.appendChild(el("li", "", s)); });
        box.appendChild(ol);
        k.appendChild(box);
      });
    } else if (lage === "sauber") {
      k.appendChild(el("p", "leise", "Nichts gefunden von dem, wonach gesucht wird. Kein Virenscanner."));
    }
    if (angaben.length) {
      var d = el("details", "hinweise");
      d.setAttribute("data-angaben", String(angaben.length));
      d.appendChild(el("summary", "", angaben.length + " Angabe(n) zu Personen oder zur Datei — in eingehender Post normal"));
      var ul2 = el("ul");
      angaben.forEach(function (b) { ul2.appendChild(el("li", "", (KURZ[b.kennung] || b.kennung) + ": " + b.satz + (b.stelle ? " (" + b.stelle + ")" : ""))); });
      d.appendChild(ul2);
      k.appendChild(d);
    }
    if (info.hinweise && info.hinweise.length) {
      var h = el("details", "hinweise");
      h.appendChild(el("summary", "", "Was genau gelesen wurde"));
      var ul3 = el("ul");
      info.hinweise.forEach(function (x) { ul3.appendChild(el("li", "", x)); });
      h.appendChild(ul3);
      k.appendChild(h);
    }
    if (info.bytes && A && A.markieren) markiertZeigen(k, info.name, info.bytes, info.roheBefunde || []);
    if (info.bytes && A && A.verdachtPruefen && /^(png|jpeg|webp|gif)$/.test(A.artVon(info.bytes))) verdachtKnopf(k, info.name, info.bytes);
  }

  function markiertZeigen(k, name, bytes, befunde) {
    if (!A.marken(befunde).length) return;
    A.markieren(bytes, befunde).then(function (c) {
      if (!c || !document.contains(k)) return;
      var f = el("figure");
      f.setAttribute("data-markiert", "");
      var img = el("img"); img.alt = name + " — die Stelle ist rot markiert"; img.src = c.toDataURL("image/jpeg", 0.88);
      f.appendChild(img);
      f.appendChild(el("figcaption", "leise", "Rot markiert: die Stelle des Befunds. Eine Kopie zum Ansehen, die Datei bleibt unverändert."));
      k.appendChild(f);
    }, function () {});
  }

  /* Nur auf Tipp: Text in den untersten Bits der Farben. Ergebnis heißt Verdacht. */
  function verdachtKnopf(k, name, bytes) {
    var b = el("button", "btn leicht", "🔍 Bildpunkte auf Verdacht prüfen");
    b.type = "button";
    b.setAttribute("data-verdacht-knopf", "");
    var p = el("p", "leise");
    var reihe = el("div", "reihe"); reihe.appendChild(b);
    k.appendChild(reihe); k.appendChild(p);
    b.addEventListener("click", function () {
      b.disabled = true;
      A.verdachtPruefen(name, bytes).then(function (r) {
        var lage = !r.geprueft ? "ungeprueft" : r.verdacht ? "ja" : "nein";
        p.setAttribute("data-verdacht", lage);
        p.textContent = lage === "ja" ? "Verdacht: in den Bildpunkten steht lesbarer Text. " + r.befunde.map(function (x) { return x.satz; }).join(" ")
          : lage === "nein" ? "Kein Verdacht. Verschlüsselte Botschaften erkennt diese Suche nicht." : "Nicht geprüft: " + r.grund;
      }, function () { p.setAttribute("data-verdacht", "ungeprueft"); p.textContent = "Nicht geprüft: das Bild ließ sich nicht lesen."; });
    });
  }

  function dateiPruefen(name, bytes, vorweg) {
    var k = karte(name);
    if (!A) { fuellen(k, { name: name, befunde: [], ungeprueft: true, ungeprueftSatz: "ungeprüft", hinweise: ["Der Prüfkern ist nicht geladen."] }); return Promise.resolve(); }
    /* Eine .eml ist eine ganze Mail: Text UND Anhänge. */
    var kopf = String.fromCharCode.apply(null, bytes.subarray(0, Math.min(2000, bytes.length)));
    if (/\.eml$/i.test(name) || (/^(Received|Return-Path|From|MIME-Version|Delivered-To):/im.test(kopf) && /^Content-Type:/im.test(kopf))) {
      return mailPruefen(new TextDecoder("utf-8").decode(bytes), name, k);
    }
    return A.pruefe(name, bytes).then(function (r) {
      var befunde = r.befunde.map(function (b) { return { kennung: b.kennung, satz: b.satz, stelle: b.stelle || "" }; }).concat(textTreffer(r, name));
      fuellen(k, { name: name, art: r.artName + " · " + A.gross(bytes.length), befunde: befunde, roheBefunde: r.befunde,
        ungeprueft: !!r.bildUngeprueft, ungeprueftSatz: r.ungeprueftSatz, hinweise: (vorweg || []).concat(r.hinweise || []), bytes: bytes });
    }, function () {
      fuellen(k, { name: name, befunde: [], ungeprueft: true, ungeprueftSatz: "ungeprüft", hinweise: ["Die Datei ließ sich nicht lesen."] });
    });
  }

  function mailPruefen(text, name, k) {
    k = k || karte(name);
    var r = M ? M.pruefeMail(text) : { stellen: [], hinweise: ["Die Mail-Prüfung ist nicht geladen."], text: text };
    var befunde = r.stellen.map(function (s) { return { kennung: s.kennung, satz: s.satz, stelle: s.zeile ? "Zeile " + s.zeile : "" }; });
    if (F) F.pruefeText(r.text || text, name, []).forEach(function (t) {
      if (t.kennung === "PERSONENBEZUG" || t.kennung === "SCHLUESSEL") befunde.push({ kennung: t.kennung, satz: t.satz, stelle: t.zeile ? "Zeile " + t.zeile : "" });
    });
    var hinweise = r.hinweise.slice(), ungeprueft = !M, satz = M ? "" : "ungeprüft";
    var anh = A ? A.ausMail(text) : [];
    if (!anh.length) { fuellen(k, { name: name, art: "Text", befunde: befunde, ungeprueft: ungeprueft, ungeprueftSatz: satz, hinweise: hinweise }); return Promise.resolve(); }
    fuellen(k, { name: name, art: "E-Mail", befunde: befunde, hinweise: hinweise.concat(["Anhänge werden gelesen …"]) });
    return Promise.all(anh.map(function (a) {
      if (a.zuGross) { hinweise.push("Anhang „" + a.name + "\" ist zu groß und wurde NICHT geöffnet — ungeprüft."); ungeprueft = true; return null; }
      return A.pruefe(a.name, a.bytes).then(function (x) {
        x.befunde.forEach(function (b) { befunde.push({ kennung: b.kennung, satz: b.satz, stelle: "Anhang " + a.name }); });
        textTreffer(x, a.name).forEach(function (t) { t.stelle = "Anhang " + a.name + (t.stelle ? ", " + t.stelle : ""); befunde.push(t); });
        if (x.bildUngeprueft) { ungeprueft = true; satz = satz || ("Anhang „" + a.name + "\": " + (x.ungeprueftSatz || "ungeprüft")); }
        hinweise.push("Anhang „" + a.name + "\" gelesen (nicht ausgeführt): " + x.artName + ".");
      }, function () { ungeprueft = true; hinweise.push("Anhang „" + a.name + "\" ließ sich nicht lesen — ungeprüft."); });
    })).then(function () {
      fuellen(k, { name: name, art: "E-Mail mit " + anh.length + " Anhang/Anhängen", befunde: befunde, ungeprueft: ungeprueft, ungeprueftSatz: satz,
        hinweise: hinweise.map(function (h) { return h.replace(/⚠ Kein Anhang wurde geöffnet\. Geprüft ist nur, was er zu sein behauptet/, "Die Anhänge wurden gelesen, nicht ausgeführt"); }) });
    });
  }

  function dateienAnnehmen(liste) {
    var kette = Promise.resolve();
    Array.prototype.forEach.call(liste, function (f) {
      kette = kette.then(function () {
        if (A && f.size > A.GROESSE_MAX) {
          fuellen(karte(f.name), { name: f.name, befunde: [], ungeprueft: true, ungeprueftSatz: "zu groß — ungeprüft",
            hinweise: ["Die Datei ist größer als " + A.gross(A.GROESSE_MAX) + " und wurde nicht geöffnet."] });
          return;
        }
        return f.arrayBuffer().then(function (b) { return dateiPruefen(f.name, new Uint8Array(b)); });
      });
    });
    return kette;
  }

  /* ── Wege hinein ── */
  var wahl = document.getElementById("dateiWahl");
  wahl.addEventListener("change", function () { dateienAnnehmen(this.files); this.value = ""; });

  var ablage = document.getElementById("ablage");
  ["dragenter", "dragover"].forEach(function (t) {
    document.addEventListener(t, function (e) { if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types, "Files") >= 0) { e.preventDefault(); ablage.classList.add("ueber"); } });
  });
  document.addEventListener("dragleave", function (e) { if (!e.relatedTarget) ablage.classList.remove("ueber"); });
  document.addEventListener("drop", function (e) {
    ablage.classList.remove("ueber");
    if (!e.dataTransfer || !e.dataTransfer.files.length) return;
    e.preventDefault();
    dateienAnnehmen(e.dataTransfer.files);
  });

  var feld = document.getElementById("textFeld");
  document.getElementById("textPruefen").addEventListener("click", function () {
    var t = feld.value;
    if (!t.trim()) { feld.focus(); return; }
    mailPruefen(t, /^(From|Von|Subject|Betreff):/im.test(t) ? "Eingefügte E-Mail" : "Eingefügter Text");
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-test-datei]"), function (b) {
    b.addEventListener("click", function () {
      var pfad = b.getAttribute("data-test-datei");
      fetch(pfad).then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); }).then(function (buf) {
        return dateiPruefen(pfad.split("/").pop(), new Uint8Array(buf), ["Test-Datei: hier ist ein Befund das richtige Ergebnis."]);
      }, function () {
        fuellen(karte(pfad), { name: pfad, befunde: [], ungeprueft: true, ungeprueftSatz: "nicht geladen", hinweise: ["Die Test-Datei kam nicht an (offline?)."] });
      });
    });
  });

  /* ── Geteilt aus einer anderen App (Web Share Target) ──
     sw.js nimmt den POST an, legt Dateien und Text in den Vorrat GESCHEHEN
     und leitet auf ?geteilt=1. Hier wird gelesen und der Vorrat geleert —
     geteilte Dateien bleiben nicht liegen. */
  function geteiltAbholen() {
    if (!/[?&]geteilt=1/.test(location.search) || !window.caches) return Promise.resolve();
    history.replaceState(null, "", location.pathname);
    return caches.open(GESCHEHEN).then(function (c) {
      return c.keys().then(function (keys) {
        var kette = Promise.resolve();
        keys.forEach(function (req) {
          kette = kette.then(function () { return c.match(req); }).then(function (res) {
            var name = decodeURIComponent(res.headers.get("X-Name") || "geteilt");
            if (res.headers.get("X-Art") === "text") return res.text().then(function (t) { if (t.trim()) { feld.value = t; return mailPruefen(t, "Geteilter Text"); } });
            return res.arrayBuffer().then(function (b) { return dateiPruefen(name, new Uint8Array(b), ["Geteilt aus einer anderen App."]); });
          });
        });
        return kette.then(function () { return caches.delete(GESCHEHEN); });
      });
    });
  }
  window.__inout = { dateiPruefen: dateiPruefen, mailPruefen: mailPruefen, bereit: geteiltAbholen() };
})();
