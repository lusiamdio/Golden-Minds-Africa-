/**
 * Registers the Service Worker in production or supporting preview environments
 * to enable instant return caching and offline capabilities.
 */
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[GMA] Service Worker registered with scope:', registration.scope);
        })
        .catch((err) => {
          console.warn('[GMA] Service Worker registration notice:', err);
        });
    });
  }
}
