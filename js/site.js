'use strict';

// PostureShift — Verdrahtung von Consent-Banner und Werbefläche auf der
// Einführungsseite. Die Werbung wird erst nach ausdrücklicher Einwilligung
// geladen (PSConsent/PSAds, siehe js/consent.js und js/ads.js).

const el = (id) => document.getElementById(id);

function refreshConsentBanner() {
  el('consentBanner').classList.toggle('hidden', PSConsent.getStatus() !== null);
}

function refreshAdVisibility() {
  const shouldShowAd = PSConsent.getStatus() === 'granted';
  el('adSlotAdsense').classList.toggle('hidden', !shouldShowAd);
  if (!shouldShowAd) return;

  if (PSAds.isLoaded()) {
    PSAds.requestAd();
    return;
  }
  PSAds.load()
    .then(() => PSAds.requestAd())
    .catch(() => {
      /* AdSense nicht erreichbar/blockiert — Werbefläche bleibt leer */
    });
}

el('consentAcceptBtn').addEventListener('click', () => PSConsent.setStatus('granted'));
el('consentDeclineBtn').addEventListener('click', () => PSConsent.setStatus('denied'));
el('btn-cookie-settings').addEventListener('click', () => {
  el('consentBanner').classList.remove('hidden');
});

PSConsent.onChange(() => {
  refreshConsentBanner();
  refreshAdVisibility();
});

refreshConsentBanner();
refreshAdVisibility();
