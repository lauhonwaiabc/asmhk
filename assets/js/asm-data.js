/* ASM 2027 data loader
   Edit the files in js/data/ rather than this file.
   Each component assigns one global; this file combines them into window.ASM_DATA. */
(function () {
  "use strict";
  /* Absolute base of the site (works from / and /pages/ alike). */
  window.ASM_BASE = (function () {
    var s = document.currentScript;
    if (!s || !s.src) return "./";
    return new URL("../../", s.src).href;
  })();

  /* Resolve a path stored in js/data (images/..., downloads/...) against the site. */
  window.ASM_URL = function (p) {
    if (!p) return "";
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(p)) return p;
    return window.ASM_BASE + "assets/" + p.replace(/^\.?\//, "");
  };

  window.ASM_DATA = Object.assign(
    {},
    window.ASM_DATA_META || {},
    window.ASM_DATA_CONTENT || {},
    window.ASM_DATA_COMMITTEE || {},
    window.ASM_DATA_PEOPLE || {},
    window.ASM_DATA_PROGRAMME || {},
    window.ASM_DATA_ABSTRACTS || {},
    window.ASM_DATA_REGISTRATION || {},
    window.ASM_DATA_SPONSORS || {},
    window.ASM_DATA_SLOTS || {},
    window.ASM_DATA_CONTACT || {}
  );
})();
