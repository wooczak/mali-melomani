// Lightweight router for navigation links only
export function initNavRouter() {
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a[href^="/"]');

    if (link && link instanceof HTMLAnchorElement) {
      const href = link.getAttribute("href");

      if (href === "/instrukcja-gry") {
        e.preventDefault();
        window.location.href = "/instrukcja-gry";
      } else if (href === "/ciekawostki") {
        e.preventDefault();
        window.location.href = "/ciekawostki";
      }
    }
  });
}

// Auto-initialize
initNavRouter();
