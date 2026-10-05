/* Mein In-and-Out-Book — Knöpfe „Installieren" und ⟳ in der Kopfleiste (Klaus 2026-10-05).
 *
 * Anlass: nach dem Installieren über das Chrome-Menü stand „App konnte nicht geöffnet
 * werden". Klaus: „Das ist jetzt bei jeder App gewesen, die wir zuletzt programmiert
 * haben. Wenn der Installationsbutton nicht in der App selber drin ist, funktioniert das
 * Installieren nicht." Im Sende-Prüfer und im Auslieferungsprüfer hat der Knopf in der
 * App eine echte App erzeugt. Deshalb gilt: der Installieren-Knopf gehört IN jede App.
 *
 * Gebaut nach assets/installieren.js und assets/neuladen.js aus dem Sende-Prüfer:
 *   · läuft die Seite schon als installierte App  → kein Knopf, keine Meldung
 *   · der Browser bietet die Installation an      → Tipp öffnet seinen Dialog
 *   · er bietet sie nicht an                      → Tipp nennt die Gründe und den Weg
 *   · ⟳ wirft den eigenen Vorrat (inout-*) weg, meldet den Service-Worker ab und lädt
 *     mit geänderter Adresse neu. Geteiltes (schleuse-geteilt) und IndexedDB bleiben.
 * Fehlt die Datei, fehlen nur die Knöpfe. Texte nur über textContent. */
(function () {
  "use strict";
  var ereignis = null;
  var EIGEN = /^inout-/;

  function alsApp() {
    try {
      return (window.matchMedia && (matchMedia("(display-mode: standalone)").matches ||
        matchMedia("(display-mode: window-controls-overlay)").matches ||
        matchMedia("(display-mode: minimal-ui)").matches)) || navigator.standalone === true;
    } catch (_e) { return false; }
  }

  function melde(text) {
    var m = document.getElementById("install-meldung");
    if (!m) {
      m = document.createElement("div");
      m.id = "install-meldung";
      m.setAttribute("role", "status");
      var zu = document.createElement("button");
      zu.type = "button"; zu.className = "btn leicht"; zu.textContent = "✕";
      zu.setAttribute("aria-label", "Meldung schließen");
      zu.addEventListener("click", function () { m.hidden = true; });
      m.appendChild(zu);
      var t = document.createElement("span"); t.id = "install-meldung-text"; m.appendChild(t);
      document.body.appendChild(m);
    }
    document.getElementById("install-meldung-text").textContent = text;
    m.hidden = false;
  }

  function knopfZeichnen() {
    var k = document.getElementById("installieren");
    if (!k) return;
    var app = alsApp();
    k.hidden = app;
    k.dataset.lage = app ? "app" : (ereignis ? "angeboten" : "nicht-angeboten");
    k.title = ereignis ? "Als App installieren" :
      "Installieren — der Browser bietet es gerade nicht an, ein Tipp sagt warum";
  }

  function klick() {
    if (alsApp()) return;
    if (ereignis) {
      var e = ereignis; ereignis = null;
      e.prompt();
      e.userChoice.then(function (w) {
        melde(w && w.outcome === "accepted"
          ? "Installiert. Die App liegt jetzt auf dem Startbildschirm bzw. in der App-Liste."
          : "Nicht installiert — abgebrochen.");
        knopfZeichnen();
      }).catch(function () { knopfZeichnen(); });
      return;
    }
    melde("Der Browser bietet die Installation gerade nicht an.\n\n" +
      "Häufigster Grund: Chrome hält die App schon für installiert. Trägt das Symbol auf dem Startbildschirm " +
      "ein kleines Chrome-Zeichen, ist es nur eine VERKNÜPFUNG (öffnet in Chrome), keine App.\n\n" +
      "So wird es eine App: Symbol lange drücken → Entfernen bzw. Deinstallieren, diese Seite neu laden (⟳), " +
      "dann hier „Installieren“ tippen.\n\n" +
      "„App konnte nicht geöffnet werden“ kommt vom Gerät, nicht von dieser Seite. Hilft nichts: " +
      "Chrome ⋮ → Einstellungen → Websiteeinstellungen → diese Seite → Daten löschen, dann neu installieren.");
  }

  async function neuLaden(k) {
    if (k) { k.disabled = true; k.dataset.laedt = "1"; }
    try {
      if (window.caches && caches.keys) {
        var namen = await caches.keys();
        await Promise.all(namen.filter(function (n) { return EIGEN.test(n); }).map(function (n) { return caches.delete(n); }));
      }
    } catch (_e) {}
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
        var regs = await navigator.serviceWorker.getRegistrations();
        var hier = new URL("./", location.href).href;
        await Promise.all(regs.filter(function (r) { return r.scope === hier; }).map(function (r) { return r.unregister(); }));
      }
    } catch (_e) {}
    location.replace(location.pathname + "?frisch=" + Date.now() + location.hash);
  }

  function adresseAufraeumen() {
    try {
      if (/[?&]frisch=/.test(location.search) && history.replaceState) history.replaceState(null, "", location.pathname + location.hash);
    } catch (_e) {}
  }

  function rund(id, zeichen, text, wasTun) {
    var k = document.createElement("button");
    k.type = "button"; k.className = "btn leicht rund"; k.id = id;
    k.setAttribute("aria-label", text); k.title = text;
    var z = document.createElement("span"); z.setAttribute("aria-hidden", "true"); z.textContent = zeichen;
    k.appendChild(z);
    k.addEventListener("click", wasTun);
    return k;
  }

  function einhaengen() {
    adresseAufraeumen();
    var bar = document.querySelector("header .bar");
    if (!bar || document.getElementById("installieren")) return;
    var gruppe = document.createElement("div");
    gruppe.className = "kopfknoepfe";
    var inst = rund("installieren", "⬇", "Als App installieren", klick);
    var t = document.createElement("span"); t.className = "t"; t.textContent = " Installieren";
    inst.appendChild(t);
    var nl = rund("neuladen", "⟳", "Neue Version laden (Vorrat leeren und neu laden)", function () { neuLaden(nl); });
    gruppe.appendChild(inst); gruppe.appendChild(nl);
    bar.appendChild(gruppe);
    knopfZeichnen();
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault(); ereignis = e; knopfZeichnen();
  });
  window.addEventListener("appinstalled", function () {
    ereignis = null; knopfZeichnen(); melde("Installiert.");
  });
  try { matchMedia("(display-mode: standalone)").addEventListener("change", knopfZeichnen); } catch (_e) {}

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", einhaengen);
  else einhaengen();

  window.INOUT_INSTALL = { alsApp: alsApp, neuLaden: neuLaden,
    lage: function () { var k = document.getElementById("installieren"); return k ? k.dataset.lage : null; } };
})();
