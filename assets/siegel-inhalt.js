/*
 * Siegel-Inhalt — DIE IDENTITÄT DIESES KNOTENS, und sonst nichts.
 *
 * Der Andock-Wizard liegt byte-1:1 aus Sage in `modules/16b_andock_wizard.js`
 * und liest nur `window.SBKIM_SIEGEL_WIZ`. Diese Datei wird NIE verteilt: sie
 * trägt die Bedeutung des Knotens (Sage-Protokol/docs/INTERFACES.md §11.9).
 *
 * ⚠ Modul 03 rechnet aus der Beschreibung den Domänen-Vektor. Das Wichtigste
 * steht vorn (Name, Zweck, Protokoll). Kein Postinhalt, keine Adresse und kein
 * Name aus einer geprüften Mail gehören hierher — die Beschreibung geht ins Netz.
 */
(function () {
  "use strict";
  window.SBKIM_SIEGEL_WIZ = {
    domain: "Eingangsprüfung/Ausgangsprüfung/Werkzeug",
    endpoint: "https://lausiklauskn-png.github.io/Mein-In-and-Out-Book/",
    nodeType: "hybrid",
    nodeName: "Mein In-and-Out-Book",
    domainDescription: "Mein In-and-Out-Book ist ein Werkzeug im SBKIM-Mycel und ein eigener Knoten. ZWECK: auf dem eigenen Gerät prüfen, was hereinkommt und was hinausgeht. Das Eingangstor liest Dateien, Bilder, PDFs und E-Mails samt Anhängen und sucht versteckte Anweisungen an eine KI und andere Tarnungen; es meldet drei Lagen: Befund, ungeprüft, sauber. Das Ausgangstor ersetzt vor dem Versand an eine KI Namen, Mailadressen, Telefonnummern, IBANs und Beträge durch Platzhalter und deckt die Antwort danach wieder auf. Dazu eine Prioritätenliste mit eigenen Wörtern und der Herkunftsnachweis (C2PA) als Angabe. FORSCHUNG UND PROTOKOLL: das In-and-Out-Book gehört zum SBKIM-Protokoll (Semantisches Bidirektionales KI-Matching), der offenen Spezifikation aus dem Sage-Protokol; die Platzhalter kommen aus dem Sage-Modul 25, der Prüfkern aus dem Auslieferungsprüfer. Es ist selbst ein Knoten: eigene signierte Spore, eigene Kennung, und mit dem Netz verbindet es sich nur auf ausdrücklichen Klick. WAS ES NICHT IST: kein Virenscanner und kein Mailprogramm; es verschickt nichts und lädt nichts hoch. Die geprüfte Post bleibt im Browser des Geräts. FÜR WEN: für Betriebe und Einzelne, die eingehende Post vor dem Öffnen und ausgehende Texte vor einer KI prüfen wollen.",
    domainKeywords: ["SBKIM", "SBKIM-Protokoll", "Sage-Protokol", "Mycel", "Knoten", "In-and-Out-Book", "Eingangsprüfung", "Ausgangsprüfung", "versteckte Anweisung", "Prompt-Injection", "E-Mail", "PDF", "Anhang", "Platzhalter", "Pseudonym", "Prioritätenliste", "Herkunftsnachweis", "offline", "Daten bleiben auf dem Gerät", "Werkzeug"],
    stammCategories: ["Eingangsprüfung", "Ausgangsprüfung", "Werkzeug"],
    guestCategories: ["Prüfung", "Mail", "Siegel"],
    backupPrefix: "in-and-out-book-backup",
  };
})();
