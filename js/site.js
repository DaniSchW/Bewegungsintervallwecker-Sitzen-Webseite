'use strict';

// Bodenzeit — Verdrahtung von Consent-Banner und Werbefläche auf der
// Einführungsseite. Die Werbung wird erst nach ausdrücklicher Einwilligung
// geladen (BZConsent/BZAds, siehe js/consent.js und js/ads.js).

const el = (id) => document.getElementById(id);

function refreshConsentBanner() {
  el('consentBanner').classList.toggle('hidden', BZConsent.getStatus() !== null);
}

function refreshAdVisibility() {
  const shouldShowAd = BZConsent.getStatus() === 'granted';
  el('adSlotAdsense').classList.toggle('hidden', !shouldShowAd);
  if (!shouldShowAd) return;

  if (BZAds.isLoaded()) {
    BZAds.requestAd();
    return;
  }
  BZAds.load()
    .then(() => BZAds.requestAd())
    .catch(() => {
      /* AdSense nicht erreichbar/blockiert — Werbefläche bleibt leer */
    });
}

el('consentAcceptBtn').addEventListener('click', () => BZConsent.setStatus('granted'));
el('consentDeclineBtn').addEventListener('click', () => BZConsent.setStatus('denied'));
el('btn-cookie-settings').addEventListener('click', () => {
  el('consentBanner').classList.remove('hidden');
});

BZConsent.onChange(() => {
  refreshConsentBanner();
  refreshAdVisibility();
});

refreshConsentBanner();
refreshAdVisibility();
