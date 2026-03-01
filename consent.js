(function () {
  var CONSENT_KEY = "gc_consent";
  var CONSENT_VERSION_KEY = "gc_consent_version";
  var CONSENT_VERSION = "1"; // hochzählen, wenn ihr Text/Tracking wesentlich ändert
  var GA_SCRIPT_ID = "gc-ga4-script";

  // Referenz für sauberes removeEventListener
  var keydownHandler = null;

  function getConsent() {
    return window.localStorage.getItem(CONSENT_KEY);
  }

  function hasConsent() {
    return getConsent() === "granted";
  }

  function getGaId() {
    var meta = document.querySelector('meta[name="ga4-id"]');
    if (!meta) return "";
    return (meta.getAttribute("content") || "").trim();
  }

  function loadGa() {
    if (!hasConsent()) return;
    if (typeof window.gtag === "function") return;

    var gaId = getGaId();
    if (!gaId) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    if (!document.getElementById(GA_SCRIPT_ID)) {
      var script = document.createElement("script");
      script.id = GA_SCRIPT_ID;
      script.async = true;
      script.src =
        "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(gaId);
      document.head.appendChild(script);
    }

    window.gtag("js", new Date());
    window.gtag("config", gaId, { anonymize_ip: true });
  }

  function removeBanner() {
    var banner = document.getElementById("gc-consent-banner");
    if (banner) banner.remove();

    var backdrop = document.getElementById("gc-consent-backdrop");
    if (backdrop) backdrop.remove();

    // ✅ wichtig: keydown listener wieder entfernen
    if (keydownHandler) {
      document.removeEventListener("keydown", keydownHandler);
      keydownHandler = null;
    }
  }

  function setConsent(value) {
    window.localStorage.setItem(CONSENT_KEY, value);
    window.localStorage.setItem(CONSENT_VERSION_KEY, CONSENT_VERSION);

    if (value === "granted") loadGa();
    removeBanner();
  }

  function shouldAskAgain() {
    var v = window.localStorage.getItem(CONSENT_VERSION_KEY);
    return v !== CONSENT_VERSION;
  }

  function renderBanner() {
    // Wenn schon eine Entscheidung existiert und Version passt: nicht anzeigen
    if (getConsent() && !shouldAskAgain()) return;
    if (!document.body) return;

    // Backdrop
    var backdrop = document.createElement("div");
    backdrop.id = "gc-consent-backdrop";
    backdrop.className = "gc-consent-backdrop";
    backdrop.addEventListener("click", function () {
      // ✅ optional, aber UX: Klick außerhalb = ablehnen
      setConsent("denied");
    });
    document.body.appendChild(backdrop);

    var banner = document.createElement("div");
    banner.id = "gc-consent-banner";
    banner.className = "gc-consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-modal", "true");
    banner.setAttribute("aria-labelledby", "gc-consent-title");
    banner.setAttribute("aria-describedby", "gc-consent-desc");

    banner.innerHTML =
      '<div class="gc-consent-copy">' +
      '  <p class="gc-consent-title" id="gc-consent-title">Cookies &amp; Statistik</p>' +
      '  <p class="gc-consent-text" id="gc-consent-desc">' +
      "    Wir nutzen Google Analytics, um die Nutzung zu verstehen und das Tool zu verbessern. " +
      '    Das passiert nur mit deiner Einwilligung. <a href="/datenschutz.html">Mehr Infos</a>.' +
      "  </p>" +
      "</div>" +
      '<div class="gc-consent-actions" role="group" aria-label="Cookie-Auswahl">' +
      '  <button type="button" class="gc-consent-btn gc-consent-btn--primary" data-consent="granted">Akzeptieren</button>' +
      '  <button type="button" class="gc-consent-btn gc-consent-btn--secondary" data-consent="denied">Ablehnen</button>' +
      "</div>";

    function onClick(event) {
      var target = event.target;
      if (!(target instanceof Element)) return;
      var value = target.getAttribute("data-consent");
      if (value === "granted" || value === "denied") setConsent(value);
    }

    // ✅ ESC nur solange Banner existiert
    keydownHandler = function (event) {
      if (event.key !== "Escape") return;
      if (!document.getElementById("gc-consent-banner")) return;
      setConsent("denied");
    };

    banner.addEventListener("click", onClick);
    document.addEventListener("keydown", keydownHandler);

    document.body.appendChild(banner);

    // Fokus auf primär
    var primary = banner.querySelector('[data-consent="granted"]');
    if (primary && primary.focus) primary.focus();
  }

  window.gcConsent = {
    hasConsent: hasConsent,
    loadGa: loadGa,
    setConsent: setConsent
  };

  if (hasConsent() && !shouldAskAgain()) {
    loadGa();
  } else {
    renderBanner();
  }
})();