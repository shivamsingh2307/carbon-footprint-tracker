/**
 * Boot check — surfaces a helpful message if the SPA never initializes.
 */
(function bootCheck() {
  function showLoadError() {
    var viewContainer = document.getElementById('view-container');
    if (!viewContainer || viewContainer.children.length > 0 || window.__ECOTRACK_BOOTED__) {
      return;
    }

    viewContainer.innerHTML =
      '<div class="card" style="padding: var(--space-8); text-align: center;">' +
      '<div style="font-size: 3rem; margin-bottom: var(--space-4);">⚠️</div>' +
      '<h2 style="margin-bottom: var(--space-2);">EcoTrack failed to load</h2>' +
      '<p class="text-secondary" style="margin-bottom: var(--space-4);">' +
      'JavaScript could not be loaded. This app must be served through Vite after installing dependencies.' +
      '</p>' +
      '<p class="text-secondary" style="font-size: var(--font-size-sm);">' +
      'Run <code>npm install</code> then <code>npm run dev</code>, then open the local URL shown in the terminal.' +
      '</p>' +
      '</div>';
  }

  window.addEventListener('load', function () {
    window.setTimeout(showLoadError, 1500);
  });
})();
