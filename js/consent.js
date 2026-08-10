'use strict';

/* Werbe-Cookie-Consent für Bodenzeit, nach dem gleichen Muster wie bei
 * Random Jingle (js/consent.js dort): rein lokal, die Entscheidung wird
 * in einem echten Browser-Cookie gespeichert (dem Cookie, um das es bei
 * der Einwilligung geht), nie über das Netzwerk. Drei Zustände: null
 * (noch keine Entscheidung), 'granted', 'denied'. js/ads.js nutzt das,
 * um zu entscheiden, ob AdSense geladen wird — 'denied' oder keine
 * Entscheidung heißt: keine Werbung, ohne Fallback-Anbieter.
 */
const BZConsent = (() => {
  const COOKIE_NAME = 'bz_ad_consent';
  const MAX_AGE_DAYS = 180;
  const listeners = new Set();

  function readCookie() {
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
    const value = match ? decodeURIComponent(match[1]) : null;
    return value === 'granted' || value === 'denied' ? value : null;
  }

  function writeCookie(value) {
    const maxAgeSeconds = MAX_AGE_DAYS * 24 * 60 * 60;
    document.cookie = `${COOKIE_NAME}=${value}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax`;
  }

  let current = readCookie();

  function getStatus() {
    return current; // null | 'granted' | 'denied'
  }

  function setStatus(value) {
    if (value !== 'granted' && value !== 'denied') return;
    current = value;
    writeCookie(value);
    for (const cb of listeners) cb(current);
  }

  function onChange(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }

  return { getStatus, setStatus, onChange };
})();
