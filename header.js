document.addEventListener("DOMContentLoaded", async () => {
  const mount = document.getElementById("site-header");
  if (!mount) return;

  // Header laden (GitHub Pages kann das, solange es über https läuft)
  const res = await fetch("/partials/header.html", { cache: "no-store" });
  if (!res.ok) return;
  mount.innerHTML = await res.text();

  // Active Link markieren
  const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  mount.querySelectorAll('a[data-nav]').forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === current) a.classList.add("is-active");
  });

  // Dropdown: click + outside click + ESC
  const dropdown = mount.querySelector(".site-nav__dropdown");
  if (!dropdown) return;

  const btn = dropdown.querySelector(".site-nav__toggle");
  const menu = dropdown.querySelector(".site-nav__menu");

  const close = () => {
    btn.setAttribute("aria-expanded", "false");
    dropdown.classList.remove("is-open");
  };

  const open = () => {
    btn.setAttribute("aria-expanded", "true");
    dropdown.classList.add("is-open");
  };

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const isOpen = btn.getAttribute("aria-expanded") === "true";
    isOpen ? close() : open();
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // optional: beim Klick auf Menüpunkt schließen
  menu?.addEventListener("click", (e) => {
    if (e.target.closest("a")) close();
  });
});