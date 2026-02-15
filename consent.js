(function () {
  var CONSENT_KEY = "gc_consent";
  var GA_SCRIPT_ID = "gc-ga4-script";

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

    window.gtag("js", new Date());
    window.gtag("config", gaId, { anonymize_ip: true });

    if (!document.getElementById(GA_SCRIPT_ID)) {
      var script = document.createElement("script");
      script.id = GA_SCRIPT_ID;
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(gaId);
      document.head.appendChild(script);
    }
  }

  function removeBanner() {
    var banner = document.getElementById("gc-consent-banner");
    if (banner) banner.remove();
  }

  function setConsent(value) {
    window.localStorage.setItem(CONSENT_KEY, value);
    if (value === "granted") loadGa();
    removeBanner();
  }

  function renderBanner() {
    if (getConsent()) return;
    if (!document.body) return;

    var banner = document.createElement("div");
    banner.id = "gc-consent-banner";
    banner.className = "gc-consent-banner";
    banner.innerHTML =
      '<p>Wir verwenden Google Analytics nur mit Ihrer Einwilligung.</p>' +
      '<div class="gc-consent-actions">' +
      '<button type="button" class="secondary" data-consent="denied">Ablehnen</button>' +
      '<button type="button" data-consent="granted">Akzeptieren</button>' +
      "</div>";

    banner.addEventListener("click", function (event) {
      var target = event.target;
      if (!(target instanceof Element)) return;
      var value = target.getAttribute("data-consent");
      if (value === "granted" || value === "denied") setConsent(value);
    });

    document.body.appendChild(banner);
  }

  window.gcConsent = {
    hasConsent: hasConsent,
    loadGa: loadGa
  };

  if (hasConsent()) {
    loadGa();
  } else {
    renderBanner();
  }
})();
