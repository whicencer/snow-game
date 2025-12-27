export function trackGameEvent(action, label, value) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      'event_label': label,
      'value': value
    });
  } else {
    console.warn("GA4 еще не загружен или заблокирован");
  }
}