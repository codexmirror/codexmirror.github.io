document.addEventListener("DOMContentLoaded", async () => {
  const mount = document.getElementById("site-header");
  if (!mount) return;

  const res = await fetch("/partials/header.html", { cache: "no-store" });
  if (!res.ok) return;
  mount.innerHTML = await res.text();

  // Active Link markieren
  const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  mount.querySelectorAll('a[data-nav]').forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === current) a.classList.add("is-active");
  });

  const header = mount.querySelector(".site-header");
  const nav = mount.querySelector("#site-nav");
  const burger = mount.querySelector(".site-burger");

  const closeAll = () => {
    // mobile nav
    burger?.setAttribute("aria-expanded", "false");
    header?.classList.remove("is-nav-open");

    // tools dropdown
    const dropdown = mount.querySelector(".site-nav__dropdown");
    const btn = dropdown?.querySelector(".site-nav__toggle");
    dropdown?.classList.remove("is-open");
    btn?.setAttribute("aria-expanded", "false");
  };

  // Burger toggle
  burger?.addEventListener("click", (e) => {
    e.preventDefault();
    const isOpen = header.classList.toggle("is-nav-open");
    burger.setAttribute("aria-expanded", isOpen ? "true" : "false");

    // Wenn Nav zu geht -> Dropdown auch zu
    if (!isOpen) closeAll();
  });

  // Dropdown toggle (Tools)
  const dropdown = mount.querySelector(".site-nav__dropdown");
  const btn = dropdown?.querySelector(".site-nav__toggle");
  const menu = dropdown?.querySelector(".site-nav__menu");

  const closeDropdown = () => {
    btn?.setAttribute("aria-expanded", "false");
    dropdown?.classList.remove("is-open");
  };
  const openDropdown = () => {
    btn?.setAttribute("aria-expanded", "true");
    dropdown?.classList.add("is-open");
  };

  btn?.addEventListener("click", (e) => {
    e.preventDefault();
    const isOpen = btn.getAttribute("aria-expanded") === "true";
    isOpen ? closeDropdown() : openDropdown();
  });

  // Outside click (nur wenn dropdown offen)
  document.addEventListener("click", (e) => {
    if (!dropdown) return;
    if (!dropdown.contains(e.target)) closeDropdown();
  });

  // ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });

  // Link click => Menüs schließen (mobile angenehm)
  nav?.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeAll();
  });

  // Beim Resize auf Desktop: Mobile-Menü sicher schließen
  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 901px)").matches) closeAll();
  });
});