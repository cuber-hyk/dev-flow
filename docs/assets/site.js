const menuButton = document.querySelector("[data-menu-button]");
const toast = document.querySelector("[data-toast]");

if (menuButton) {
  menuButton.addEventListener("click", () => {
    const nextState = !document.body.classList.contains("menu-open");
    document.body.classList.toggle("menu-open", nextState);
    menuButton.setAttribute("aria-expanded", String(nextState));
  });
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const text = button.getAttribute("data-copy") || "";
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }

    if (toast) {
      toast.classList.add("show");
      window.setTimeout(() => toast.classList.remove("show"), 1200);
    }
  });
});

const page = document.body.getAttribute("data-page");
document.querySelectorAll("[data-nav]").forEach((link) => {
  link.classList.toggle("active", link.getAttribute("data-nav") === page);
});

const sections = document.querySelectorAll(".page-section[id]");
const tocLinks = document.querySelectorAll(".toc a[href^='#']");

if (sections.length && tocLinks.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      tocLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
      });
    },
    { rootMargin: "-20% 0px -70% 0px", threshold: [0.1, 0.35, 0.7] }
  );

  sections.forEach((section) => observer.observe(section));
}
