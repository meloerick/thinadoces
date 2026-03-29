const WA_PHONE = "5551993409758";
const DEFAULT_WA_MESSAGE = "Olá! Vim pelo site e gostaria de agendar um horário 💅";

const body = document.body;
const header = document.querySelector(".header");
const navToggle = document.getElementById("navToggle");
const menu = document.getElementById("menu");
const waButtons = document.querySelectorAll("[data-wa-button]");
const revealElements = document.querySelectorAll(".reveal");
const yearEl = document.getElementById("year");

function buildWhatsAppUrl(message) {
  const finalMessage = message && message.trim() ? message.trim() : DEFAULT_WA_MESSAGE;
  return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(finalMessage)}`;
}

function getButtonMessage(button) {
  const customMessage = button.dataset.waMessage;
  if (customMessage) return customMessage;

  const service = button.dataset.service;
  if (service) {
    return `Olá! Vim pelo site e gostaria de agendar ${service} 💅`;
  }

  return DEFAULT_WA_MESSAGE;
}

function hydrateWhatsAppButtons() {
  waButtons.forEach((button) => {
    const message = getButtonMessage(button);
    button.href = buildWhatsAppUrl(message);
  });
}

function closeMenu() {
  body.classList.remove("menu-open");
  if (navToggle) navToggle.setAttribute("aria-expanded", "false");
}

function setupMenu() {
  if (!navToggle || !menu) return;

  navToggle.addEventListener("click", () => {
    const willOpen = !body.classList.contains("menu-open");
    body.classList.toggle("menu-open", willOpen);
    navToggle.setAttribute("aria-expanded", String(willOpen));
  });

  menu.querySelectorAll("a[href^='#']").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!body.classList.contains("menu-open")) return;

    const isClickInsideMenu = menu.contains(event.target);
    const isClickToggle = navToggle.contains(event.target);
    if (!isClickInsideMenu && !isClickToggle) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

function setupHeaderState() {
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function setupRevealAnimation() {
  if (!revealElements.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -60px 0px" }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function updateYear() {
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

hydrateWhatsAppButtons();
setupMenu();
setupHeaderState();
setupRevealAnimation();
updateYear();
