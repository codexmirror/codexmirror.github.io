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
  const desktopQuery = window.matchMedia("(min-width: 901px)");

  const normalizePath = (value) => {
    if (!value) return "/";
    const withoutHash = value.split("#")[0];
    const withoutQuery = withoutHash.split("?")[0];
    let path = withoutQuery.toLowerCase();

    if (!path.startsWith("/")) {
      path = `/${path}`;
    }

    if (path === "/index.html") {
      return "/";
    }

    if (path.endsWith("/index.html")) {
      path = path.slice(0, -"index.html".length);
    }

    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }

    return path || "/";
  };

  const currentPath = normalizePath(window.location.pathname);

  mount.querySelectorAll("a[data-nav]").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const targetPath = normalizePath(href);

    const isRatgeberTarget = targetPath === "/ratgeber";
    const isRatgeberPage = currentPath === "/ratgeber" || currentPath.startsWith("/ratgeber/") || currentPath === "/ratgeber.html";
    const isMatch = isRatgeberTarget ? isRatgeberPage : targetPath === currentPath;

    if (isMatch) {
      link.classList.add("is-active");
    }
  });

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

  burger?.addEventListener("click", () => {
    const isOpen = header?.classList.contains("is-nav-open");
    if (isOpen) {
      closeNav({ focusBurger: true });
      return;
    }
    openNav();
    if (!desktopQuery.matches) {
      firstNavTarget()?.focus();
    }
  });

  toolsToggle?.addEventListener("click", () => {
    const isOpen = toolsToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeTools();
    } else {
      openTools();
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (!header?.contains(target)) {
      closeNav();
      return;
    }

    if (!toolsWrap?.contains(target)) {
      closeTools();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (toolsToggle?.getAttribute("aria-expanded") === "true") {
      closeTools({ focusToggle: true });
      return;
    }

    if (burger?.getAttribute("aria-expanded") === "true") {
      closeNav({ focusBurger: true });
    }
  });

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

  const syncOnResize = () => {
    if (!desktopQuery.matches) return;
    closeNav();
  };

  if (typeof desktopQuery.addEventListener === "function") {
    desktopQuery.addEventListener("change", syncOnResize);
  } else {
    desktopQuery.addListener(syncOnResize);
  }

  window.addEventListener("resize", syncOnResize);
});
