/* Mein In-and-Out-Book — Glas-Knöpfe mit Wackeln (Klaus 2026-10-02).
 * Übernommen aus family-project (wireHoloButtons) und dem Sende-Prüfer (Glanzpunkt
 * folgt der Maus), nichts neu erfunden. Ein Zuhörer für die ganze Seite: auch Knöpfe,
 * die später entstehen (Ausgang, Ergebnis-Karten), wackeln mit.
 * Setzt nur CSS-Variablen; ohne diese Datei bleiben die Knöpfe flach und gehen trotzdem.
 * Bei „weniger Bewegung" wackelt nichts (CSS-Riegel in style.css UND hier). */
(function () {
  "use strict";
  var SEL = ".btn, .zeile";
  var MAX = { btn: 9, zeile: 3 };          // Grad: Knöpfe stärker, Listenzeilen kaum
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var aktiv = null;

  function zurueck(e) {
    if (!e) return;
    ["--mx", "--my", "--rx", "--ry"].forEach(function (v) { e.style.removeProperty(v); });
  }
  function bewege(ev) {
    var e = ev.target && ev.target.closest ? ev.target.closest(SEL) : null;
    if (e !== aktiv) { zurueck(aktiv); aktiv = e; }
    if (!e || (ruhig && ruhig.matches) || e.disabled) return;
    var r = e.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var px = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width));
    var py = Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height));
    var max = e.classList.contains("zeile") ? MAX.zeile : MAX.btn;
    e.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
    e.style.setProperty("--my", (py * 100).toFixed(1) + "%");
    e.style.setProperty("--ry", ((px - 0.5) * 2 * max).toFixed(2) + "deg");
    e.style.setProperty("--rx", (-(py - 0.5) * 2 * max).toFixed(2) + "deg");
  }
  document.addEventListener("pointermove", bewege, { passive: true });
  document.addEventListener("pointerdown", bewege, { passive: true });
  document.addEventListener("pointerout", function (ev) {
    if (aktiv && !(ev.relatedTarget && aktiv.contains(ev.relatedTarget))) { zurueck(aktiv); aktiv = null; }
  }, { passive: true });
  document.addEventListener("pointerup", function (ev) {
    if (ev.pointerType !== "mouse") { zurueck(aktiv); aktiv = null; }   // Finger weg → gerade stehen
  }, { passive: true });
  window.__glas = { SEL: SEL, MAX: MAX };
})();
