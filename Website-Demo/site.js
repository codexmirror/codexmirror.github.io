/* Deine Fahrschule — Verhalten des Prototyps.
   Ohne Abhängigkeiten, isoliert in /Website-Demo/.

   1) Zustand der Kopfzeile beim Scrollen
   2) Mobiles Navigationspanel (Overlay, Fokusführung, Scroll-Sperre)
   3) Filter auf der Klassenseite (progressive Verbesserung)
   4) Nur ein offenes Detail je Disclosure-Gruppe                       */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- 1  Kopfzeile ---------- */

  var header = document.querySelector("[data-header]");

  if (header) {
    var syncHeader = function () {
      header.setAttribute("data-scrolled", window.scrollY > 8 ? "true" : "false");
    };
    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
  }

  /* ---------- 2  Mobiles Navigationspanel ---------- */

  var toggle = document.querySelector(".menu-btn");
  var overlay = document.getElementById("mobile-nav");

  if (toggle && overlay) {
    var panel = overlay.querySelector(".nav-panel");
    var closeBtn = overlay.querySelector(".nav-close");
    var lastFocused = null;
    var closeTimer = null;

    var focusables = function () {
      return Array.prototype.filter.call(
        overlay.querySelectorAll("a[href], button:not([disabled])"),
        function (el) { return el.offsetParent !== null; }
      );
    };

    var open = function () {
      window.clearTimeout(closeTimer);
      lastFocused = document.activeElement;
      overlay.hidden = false;
      document.body.classList.add("is-locked");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Menü schließen");
      // Der Klassenwechsel im nächsten Frame startet die Einblendung.
      window.requestAnimationFrame(function () {
        overlay.classList.add("is-open");
      });
      if (closeBtn) closeBtn.focus();
    };

    var close = function (returnFocus) {
      overlay.classList.remove("is-open");
      document.body.classList.remove("is-locked");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Menü öffnen");
      var hide = function () { overlay.hidden = true; };
      window.clearTimeout(closeTimer);
      if (reduceMotion.matches) hide();
      else closeTimer = window.setTimeout(hide, 320);
      if (returnFocus) (lastFocused || toggle).focus();
    };

    var isOpen = function () {
      return !overlay.hidden;
    };

    toggle.addEventListener("click", function () {
      if (isOpen()) close(true);
      else open();
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function () { close(true); });
    }

    // Klick auf die abgedunkelte Fläche neben dem Panel schließt das Menü.
    overlay.addEventListener("click", function (event) {
      if (panel && !panel.contains(event.target)) close(true);
    });

    // Ein Navigationsziel schließt das Panel — wichtig für Sprungmarken,
    // bei denen die Seite nicht neu geladen wird.
    overlay.addEventListener("click", function (event) {
      var link = event.target.closest ? event.target.closest("a[href]") : null;
      if (link) close(false);
    });

    document.addEventListener("keydown", function (event) {
      if (!isOpen()) return;

      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
        return;
      }

      if (event.key !== "Tab") return;

      // Fokus im geöffneten Panel halten.
      var items = focusables();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!overlay.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    });

    // Beim Wechsel auf die Desktop-Navigation darf kein Panel offen bleiben.
    var desktop = window.matchMedia("(min-width: 1000px)");
    var onBreakpoint = function () {
      if (desktop.matches && isOpen()) close(false);
    };
    if (desktop.addEventListener) desktop.addEventListener("change", onBreakpoint);
    else if (desktop.addListener) desktop.addListener(onBreakpoint);
  }

  /* ---------- 3  Klassenfilter ---------- */

  var filterBar = document.querySelector("[data-filter-bar]");

  if (filterBar) {
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-group]"));
    var buttons = Array.prototype.slice.call(filterBar.querySelectorAll("[data-filter]"));
    var status = document.querySelector("[data-filter-status]");

    var apply = function (value) {
      var shown = 0;

      buttons.forEach(function (button) {
        button.setAttribute(
          "aria-pressed",
          button.getAttribute("data-filter") === value ? "true" : "false"
        );
      });

      items.forEach(function (item) {
        var groups = (item.getAttribute("data-group") || "").split(" ");
        var visible = value === "alle" || groups.indexOf(value) !== -1;
        item.hidden = !visible;
        if (visible) shown += 1;
      });

      if (status) {
        status.textContent =
          shown === items.length
            ? items.length + " Klassen und Erweiterungen"
            : shown + " von " + items.length + " werden angezeigt";
      }
    };

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        apply(button.getAttribute("data-filter"));
      });
    });

    apply("alle");
  }

  /* ---------- 4  Disclosure-Gruppen ---------- */

  Array.prototype.forEach.call(
    document.querySelectorAll("[data-accordion]"),
    function (group) {
      var all = Array.prototype.slice.call(group.querySelectorAll("details"));
      all.forEach(function (item) {
        item.addEventListener("toggle", function () {
          if (!item.open) return;
          all.forEach(function (other) {
            if (other !== item) other.open = false;
          });
        });
      });
    }
  );
})();
