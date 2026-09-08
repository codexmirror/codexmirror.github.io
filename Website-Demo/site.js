/* Deine Fahrschule — prototype site behaviour.
   Standalone, no dependencies, isolated to /Website-Demo/.
   1) mobile navigation drawer
   2) filter chips on the licence-class page (progressive enhancement) */

(function () {
  "use strict";

  /* ---------- Mobile navigation ---------- */

  var toggle = document.querySelector(".menu-btn");
  var drawer = document.getElementById("mobile-nav");

  if (toggle && drawer) {
    var setOpen = function (open) {
      drawer.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    };

    setOpen(false);
    toggle.setAttribute("aria-controls", "mobile-nav");

    toggle.addEventListener("click", function () {
      setOpen(drawer.hidden);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !drawer.hidden) {
        setOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1000 && !drawer.hidden) {
        setOpen(false);
      }
    });
  }

  /* ---------- Class filter ---------- */

  var filterBar = document.querySelector("[data-filter-bar]");

  if (filterBar) {
    var items = Array.prototype.slice.call(
      document.querySelectorAll("[data-group]")
    );
    var buttons = Array.prototype.slice.call(
      filterBar.querySelectorAll("[data-filter]")
    );

    var apply = function (value) {
      buttons.forEach(function (button) {
        button.setAttribute(
          "aria-pressed",
          button.getAttribute("data-filter") === value ? "true" : "false"
        );
      });
      items.forEach(function (item) {
        var groups = (item.getAttribute("data-group") || "").split(" ");
        item.hidden = value !== "alle" && groups.indexOf(value) === -1;
      });
    };

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        apply(button.getAttribute("data-filter"));
      });
    });

    apply("alle");
  }
})();
