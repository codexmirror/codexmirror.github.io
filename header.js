document.addEventListener("DOMContentLoaded", async () => {
  const mount = document.getElementById("site-header");
  if (!mount) return;

  try {
    const res = await fetch("/partials/header.html", { cache: "no-store" });
    if (!res.ok) return;
    mount.innerHTML = await res.text();
  } catch {
    return;
  }

  const header = mount.querySelector(".site-header");
  const nav = mount.querySelector("#site-header-nav");
  const burger = mount.querySelector(".site-header__burger");
  const toolsWrap = mount.querySelector(".site-header__tools");
  const toolsToggle = mount.querySelector(".site-header__tools-toggle");
  const toolsPanel = mount.querySelector("#site-header-tools-panel");
  const desktopQuery = window.matchMedia("(min-width: 901px)");

  // -----------------------
  // Active Link Handling
  // -----------------------
  const normalizePath = (value) => {
    if (!value) return "/";
    const withoutHash = value.split("#")[0];
    const withoutQuery = withoutHash.split("?")[0];
    let path = withoutQuery.toLowerCase();

    if (!path.startsWith("/")) path = `/${path}`;

    if (path === "/index.html") return "/";
    if (path.endsWith("/index.html")) path = path.slice(0, -"index.html".length);

    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    return path || "/";
  };

  const currentPath = normalizePath(window.location.pathname);

  mount.querySelectorAll("a[data-nav]").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const targetPath = normalizePath(href);

    const isRatgeberTarget = targetPath === "/ratgeber";
    const isRatgeberPage =
      currentPath === "/ratgeber" ||
      currentPath.startsWith("/ratgeber/") ||
      currentPath === "/ratgeber.html";

    const isMatch = isRatgeberTarget ? isRatgeberPage : targetPath === currentPath;

    if (isMatch) link.classList.add("is-active");
  });

  // -----------------------
  // Helpers
  // -----------------------
  const firstNavTarget = () => nav?.querySelector("a, button");

  const closeTools = ({ focusToggle = false } = {}) => {
    toolsWrap?.classList.remove("is-tools-open");
    toolsToggle?.setAttribute("aria-expanded", "false");
    if (focusToggle) toolsToggle?.focus();
  };

  const openTools = () => {
    toolsWrap?.classList.add("is-tools-open");
    toolsToggle?.setAttribute("aria-expanded", "true");
  };

  const closeNav = ({ focusBurger = false } = {}) => {
    header?.classList.remove("is-nav-open");
    burger?.setAttribute("aria-expanded", "false");
    closeTools();
    if (focusBurger) burger?.focus();
  };

  const openNav = () => {
    header?.classList.add("is-nav-open");
    burger?.setAttribute("aria-expanded", "true");
  };

  // -----------------------
  // Burger (Mobile Nav)
  // -----------------------
  burger?.addEventListener("click", () => {
    const isOpen = header?.classList.contains("is-nav-open");
    if (isOpen) {
      closeNav({ focusBurger: true });
      return;
    }

    openNav();

    // Mobile: Fokus auf erstes Nav-Element
    if (!desktopQuery.matches) {
      const first = firstNavTarget();
      if (first && typeof first.focus === "function") first.focus();
    }
  });

  // -----------------------
  // Tools Dropdown
  // -----------------------
  toolsToggle?.addEventListener("click", () => {
    const isOpen = toolsToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) closeTools();
    else openTools();
  });

  // Klick auf Tool-Link -> Dropdown schließen (und auf Mobile auch Nav schließen)
  toolsPanel?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const link = target.closest("a");
    if (!link) return;

    closeTools();

    if (!desktopQuery.matches) {
      closeNav();
    }
  });

  // -----------------------
  // Outside Click Handling
  // -----------------------
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    // Klick komplett außerhalb Header -> alles zu
    if (!header?.contains(target)) {
      closeNav();
      return;
    }

    // Klick im Header aber außerhalb Tools -> Tools zu
    if (!toolsWrap?.contains(target)) {
      closeTools();
    }
  });

  // -----------------------
  // Keyboard Handling
  // -----------------------
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    // ESC schließt zuerst Tools, dann Nav
    if (toolsToggle?.getAttribute("aria-expanded") === "true") {
      closeTools({ focusToggle: true });
      return;
    }

    if (burger?.getAttribute("aria-expanded") === "true") {
      closeNav({ focusBurger: true });
    }
  });

  // Klick in Nav: auf Mobile Nav schließen, auf Desktop nur Tools schließen
  nav?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!target.closest("a")) return;

    if (!desktopQuery.matches) {
      closeNav();
      return;
    }

    closeTools();
  });

  // -----------------------
  // Responsive Sync
  // -----------------------
  const syncOnBreakpoint = () => {
    // Wenn Desktop, sicherheitshalber Mobile-Nav schließen
    if (desktopQuery.matches) closeNav();
  };

  if (typeof desktopQuery.addEventListener === "function") {
    desktopQuery.addEventListener("change", syncOnBreakpoint);
  } else {
    desktopQuery.addListener(syncOnBreakpoint);
  }
});