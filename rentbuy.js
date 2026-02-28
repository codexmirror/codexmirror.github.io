document.addEventListener("DOMContentLoaded", async () => {
  const mount = document.getElementById("site-header");
  if (!mount) return;

  // Header laden (GitHub Pages kann das, solange es über https läuft)
  const res = await fetch("/partials/header.html", { cache: "no-store" });
  if (!res.ok) return;
  mount.innerHTML = await res.text();

  // Active Link markieren
  const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  mount.querySelectorAll("a[data-nav]").forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === current) a.classList.add("is-active");
  });

  /**
   * =========================
   * Mobile Burger (Header Panel)
   * =========================
   */
  const headerEl = mount.querySelector(".site-header") || mount; // falls mount selbst <header> ist
  const burger = mount.querySelector(".site-burger");
  const nav = mount.querySelector(".site-nav");

  const closeMobileNav = () => {
    headerEl.classList.remove("is-open");
    burger?.setAttribute("aria-expanded", "false");
  };

  const openMobileNav = () => {
    headerEl.classList.add("is-open");
    burger?.setAttribute("aria-expanded", "true");
  };

  if (burger) {
    // Startzustand sauber setzen
    burger.setAttribute("aria-expanded", "false");

    burger.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = headerEl.classList.contains("is-open");
      isOpen ? closeMobileNav() : openMobileNav();
    });
  }

  // Klick auf einen Link im Mobile-Menü -> Menü schließen
  nav?.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeMobileNav();
  });

  // ESC schließt Mobile-Menü
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobileNav();
  });

  // Bei Resize auf Desktop -> Mobile-Menü-Zustand zurücksetzen
  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 721px)").matches) closeMobileNav();
  });

  /**
   * =========================
   * Dropdown: Tools (click + outside click + ESC)
   * =========================
   */
  const dropdown = mount.querySelector(".site-nav__dropdown");
  if (!dropdown) return;

  const btn = dropdown.querySelector(".site-nav__toggle");
  const menu = dropdown.querySelector(".site-nav__menu");
  if (!btn) return;

  const closeDropdown = () => {
    btn.setAttribute("aria-expanded", "false");
    dropdown.classList.remove("is-open");
  };

  const openDropdown = () => {
    btn.setAttribute("aria-expanded", "true");
    dropdown.classList.add("is-open");
  };

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const isOpen = btn.getAttribute("aria-expanded") === "true";
    isOpen ? closeDropdown() : openDropdown();
  });

  document.addEventListener("click", (e) => {
    // wenn klick außerhalb dropdown -> schließen
    if (!dropdown.contains(e.target)) closeDropdown();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDropdown();
  });

  // optional: beim Klick auf Menüpunkt im Dropdown schließen
  menu?.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeDropdown();
  });
});