'use strict';

/* Google-AdSense-Loader für PostureShift, nach dem gleichen Muster wie bei
 * Random Jingle (js/ads.js dort). Das AdSense-Skript wird nur dynamisch
 * nachgeladen, sobald PSConsent.getStatus() === 'granted' ist — nie
 * spekulativ und nie als statisches <script>-Tag in index.html. Bei
 * späterem Widerruf gibt es kein "Entladen" eines bereits geladenen
 * Skripts (Browser unterstützen das nicht) — app.js blendet stattdessen
 * nur die Werbefläche wieder aus, was aus Datenschutzsicht das
 * Entscheidende ist (keine Anzeige, keine weiteren Requests unsererseits).
 *
 * Verwendet dieselbe AdSense-Publisher-ID wie Random Jingle (ein Konto,
 * mehrere zugelassene Domains). Der konkrete Ad-Slot für PostureShift muss
 * im AdSense-Dashboard neu angelegt und in index.html eingetragen werden
 * (siehe REPLACE_WITH_ADSENSE_SLOT_ID dort).
 */
const PSAds = (() => {
  const ADSENSE_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8453553622026562';
  const ADSENSE_HOST = 'googlesyndication.com';

  let loaded = false;
  let loadPromise = null;

  function isLoaded() {
    return loaded;
  }

  function load() {
    if (loadPromise) return loadPromise;
    loadPromise = new Promise((resolve, reject) => {
      try {
        const script = document.createElement('script');
        script.async = true;
        script.src = ADSENSE_SRC;
        script.crossOrigin = 'anonymous';
        script.onload = () => {
          loaded = true;
          resolve();
        };
        script.onerror = (err) => {
          loadPromise = null;
          reject(err);
        };
        document.head.appendChild(script);
      } catch (err) {
        loadPromise = null;
        reject(err);
      }
    });
    return loadPromise;
  }

  // Weist AdSense an, die Seite zu scannen und jedes <ins class="adsbygoogle">
  // zu befüllen, das noch keine Anzeige enthält. Jedes Element darf nur
  // einmal angefordert werden — daher hier gekapselt statt der aufrufenden
  // Seite überlassen.
  function requestAd() {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.warn('AdSense: Anzeige konnte nicht angefordert werden', err);
    }
  }

  // Fehler, die asynchron aus dem AdSense-Skript selbst geworfen werden
  // (z.B. weil eine Domain im Konto noch nicht freigegeben ist), landen
  // außerhalb jedes eigenen try/catch. Hier abfangen, damit sie nie als
  // uncaught error erscheinen oder sonst etwas auf der Seite stören — die
  // Werbefläche bleibt so oder so einfach leer.
  window.addEventListener('error', (event) => {
    if (event.filename && event.filename.includes(ADSENSE_HOST)) {
      console.warn('AdSense-Skriptfehler (ignoriert, Werbefläche bleibt leer)', event.error || event.message);
      event.preventDefault();
    }
  }, true);

  return { load, isLoaded, requestAd };
})();
