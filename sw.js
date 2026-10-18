/* Mein In-and-Out-Book — Service-Worker.
 * Wer eine Datei aus CORE ändert, erhöht CACHE_VERSION UND die ?v= in der Seite.
 * vendor/ (pdf.js, Texterkennung, 22 MB) steht NICHT in CORE: es wird beim
 * ersten Gebrauch geholt und dann abgelegt.
 *
 * Teilen aus einer anderen App: der POST an ./teilen wird hier angenommen,
 * Dateien und Text kommen in den Vorrat GETEILT, dann geht es auf
 * index.html?geteilt=1. Die Seite liest ihn und LÖSCHT ihn danach. */
var CACHE_VERSION = "inout-v18";
var GETEILT = "schleuse-geteilt";
var CORE = ["./", "index.html", "impressum.html", "datenschutz.html", "manifest.json",
  "assets/style.css?v=18", "assets/pruefer.js?v=18", "assets/pruefer-formate.js?v=18", "assets/pruefer-mail.js?v=18",
  "assets/pruefer-anhang.js?v=18", "assets/prioritaeten.js?v=18", "assets/eingang.js?v=18",
  "modules/25_pseudonym.js?v=18", "assets/anbieter.js?v=18", "assets/ausgang.js?v=18",
  "icons/favicon-32.png?v=18", "icons/favicon-48.png?v=18", "icons/apple-touch-icon.png?v=18",
  "icons/icon-192.png?v=18", "icons/icon-512.png?v=18", "icons/maskable-512.png?v=18", "icons/marke-96.png?v=18", "assets/glas.js?v=18", "assets/installieren.js?v=18",
  /* SBKIM-Knoten (Sage PFLICHT_MODULE, Falle 4): alles im Vorrat. noble ohne ?v= — 05b holt es per import ohne Zusatz. */
  "assets/sbkim-init.js?v=18", "assets/siegel-inhalt.js?v=18", "modules/noble-secp256k1.js",
  "modules/01_storage.js?v=18", "modules/02_spore.js?v=18", "modules/03_embedding.js?v=18", "modules/04_match.js?v=18", "modules/05_anastomose.js?v=18", "modules/05b_nostr_relay.js?v=18", "modules/07_apoptose.js?v=18", "modules/15_membran.js?v=18", "modules/16_siegel.js?v=18", "modules/16b_andock_wizard.js?v=18", "modules/23_rendezvous.js?v=18", "modules/23_rendezvous_ui.js?v=18",
  "sicherheit.html"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE_VERSION).then(function (c) {
    return Promise.allSettled(CORE.map(function (u) { return c.add(new Request(u, { cache: "reload" })); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return /^inout-/.test(k) && k !== CACHE_VERSION; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function teilenAnnehmen(req) {
  return req.formData().then(function (fd) {
    return caches.open(GETEILT).then(function (c) {
      var n = 0, arbeit = [];
      fd.getAll("dateien").forEach(function (f) {
        if (!f || typeof f === "string") return;
        arbeit.push(c.put(new Request("geteilt/" + (n++)), new Response(f, {
          headers: { "X-Name": encodeURIComponent(f.name || "geteilt"), "X-Art": "datei" } })));
      });
      var text = [fd.get("title"), fd.get("text"), fd.get("url")].filter(function (x) { return x && typeof x === "string"; }).join("\n");
      if (text.trim()) arbeit.push(c.put(new Request("geteilt/text"), new Response(text, { headers: { "X-Name": "text", "X-Art": "text" } })));
      return Promise.all(arbeit);
    });
  }).then(function () { return Response.redirect("index.html?geteilt=1", 303); },
          function () { return Response.redirect("index.html?geteilt=1", 303); });
}

self.addEventListener("fetch", function (e) {
  var req = e.request, url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (req.method === "POST" && /\/teilen$/.test(url.pathname)) { e.respondWith(teilenAnnehmen(req)); return; }
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (r) { return r || caches.match("index.html"); });
    }));
    return;
  }
  e.respondWith(caches.match(req).then(function (r) {
    return r || fetch(req).then(function (res) {
      if (res.status === 200) { var kopie = res.clone(); caches.open(CACHE_VERSION).then(function (c) { c.put(req, kopie); }); }
      return res;
    });
  }));
});
