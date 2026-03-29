const WA_PHONE = "5551993446956";
const DEFAULT_WA_MESSAGE = "Ola! Quero fazer um pedido na Thina Doces.";
const MOBILE_BREAKPOINT = 860;

const siteHeader = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const navList = document.getElementById("navList");
const scrollProgress = document.getElementById("scrollProgress");
const revealElements = document.querySelectorAll(".reveal");
const orderButtons = document.querySelectorAll(".order-btn");
const orderForm = document.getElementById("orderForm");
const formFeedback = document.getElementById("formFeedback");
const dateInput = document.getElementById("data");
const phoneInput = document.getElementById("telefone");
const productSelect = document.getElementById("produto");

function buildWaUrl(message) {
  return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`;
}

function formatDatePtBr(isoDate) {
  if (!isoDate) return "";
  const safeDate = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(safeDate.getTime())) return isoDate;
  return safeDate.toLocaleDateString("pt-BR");
}

function setFormFeedback(message, state = "success") {
  if (!formFeedback) return;
  formFeedback.textContent = message;
  formFeedback.dataset.state = state;
}

function isPhoneValid(phoneValue) {
  const digits = phoneValue.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 13;
}

function syncDefaultWaLinks() {
  document.querySelectorAll("[data-wa-default]").forEach((link) => {
    link.href = buildWaUrl(DEFAULT_WA_MESSAGE);
  });
}

function setupMenu() {
  if (!menuToggle || !navList) return;

  const navLinks = Array.from(navList.querySelectorAll("a"));

  function isMobileViewport() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  function syncMenuAccessibility(isOpen) {
    if (isMobileViewport()) {
      navList.setAttribute("aria-hidden", String(!isOpen));
      navLinks.forEach((link) => {
        link.tabIndex = isOpen ? 0 : -1;
      });
      return;
    }

    navList.removeAttribute("aria-hidden");
    navLinks.forEach((link) => {
      link.tabIndex = 0;
    });
  }

  function setMenuState(isOpen) {
    navList.classList.toggle("is-open", isOpen);
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    syncMenuAccessibility(isOpen);
  }

  function closeMenu() {
    setMenuState(false);
  }

  menuToggle.addEventListener("click", () => {
    setMenuState(!navList.classList.contains("is-open"));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!navList.contains(target) && !menuToggle.contains(target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      menuToggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (!isMobileViewport()) {
      closeMenu();
      syncMenuAccessibility(false);
    } else {
      syncMenuAccessibility(navList.classList.contains("is-open"));
    }
  });

  syncMenuAccessibility(false);
}

function setupScrollUi() {
  let isTicking = false;

  function render() {
    const scrollTop = window.scrollY;

    if (siteHeader) {
      siteHeader.classList.toggle("scrolled", scrollTop > 14);
    }

    if (scrollProgress) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = maxScroll > 0 ? scrollTop / maxScroll : 0;
      scrollProgress.style.transform = `scaleX(${Math.max(0, Math.min(1, ratio))})`;
    }

    isTicking = false;
  }

  function requestRender() {
    if (isTicking) return;
    isTicking = true;
    window.requestAnimationFrame(render);
  }

  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener("resize", requestRender);
  render();
}

function setupActiveSectionTracking() {
  if (!navList || !("IntersectionObserver" in window)) return;

  const navLinks = Array.from(navList.querySelectorAll('a[href^="#"]'));
  const observedSections = navLinks
    .map((link) => {
      const id = link.getAttribute("href")?.slice(1);
      if (!id) return null;
      const section = document.getElementById(id);
      return section ? { id, section, link } : null;
    })
    .filter(Boolean);

  if (!observedSections.length) return;

  function setActive(id) {
    observedSections.forEach((item) => {
      if (item.id === id) {
        item.link.setAttribute("aria-current", "page");
      } else {
        item.link.removeAttribute("aria-current");
      }
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (!visibleEntries.length) return;
      setActive(visibleEntries[0].target.id);
    },
    {
      threshold: [0.2, 0.45, 0.7],
      rootMargin: "-30% 0px -55% 0px",
    }
  );

  observedSections.forEach((item) => observer.observe(item.section));
  setActive("home");
}

function setupRevealAnimation() {
  if (!revealElements.length) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, internalObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const delay = Number(element.dataset.delay || 0);
        element.style.transitionDelay = `${delay}ms`;
        element.classList.add("is-visible");
        internalObserver.unobserve(element);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -6% 0px",
    }
  );

  revealElements.forEach((element, index) => {
    element.dataset.delay = String((index % 4) * 55);
    observer.observe(element);
  });
}

function setupFaq() {
  const questions = Array.from(document.querySelectorAll(".faq-question"));
  if (!questions.length) return;

  function closeQuestion(question) {
    const controlsId = question.getAttribute("aria-controls");
    if (!controlsId) return;
    const answer = document.getElementById(controlsId);
    if (!answer) return;
    question.setAttribute("aria-expanded", "false");
    answer.hidden = true;
  }

  function openQuestion(question) {
    const controlsId = question.getAttribute("aria-controls");
    if (!controlsId) return;
    const answer = document.getElementById(controlsId);
    if (!answer) return;
    question.setAttribute("aria-expanded", "true");
    answer.hidden = false;
  }

  questions.forEach((question) => {
    question.addEventListener("click", () => {
      const isExpanded = question.getAttribute("aria-expanded") === "true";
      questions.forEach((item) => closeQuestion(item));
      if (!isExpanded) openQuestion(question);
    });
  });
}

function setupProductButtons() {
  if (!orderButtons.length) return;

  orderButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const product = button.dataset.product || "produto";
      const price = button.dataset.price || "";
      const message = `Ola! Quero pedir ${product}${price ? ` (${price})` : ""}. Pode me confirmar disponibilidade?`;
      window.open(buildWaUrl(message), "_blank", "noopener,noreferrer");

      if (productSelect) {
        const optionText = `${product}${price ? ` - ${price}` : ""}`;
        const option = Array.from(productSelect.options).find((item) => item.textContent === optionText);
        if (option) {
          productSelect.value = optionText;
        }
      }
    });
  });
}

function setupOrderDate() {
  if (!dateInput) return;
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  const localDate = new Date(now.getTime() - timezoneOffset).toISOString().split("T")[0];
  dateInput.min = localDate;
}

function setupOrderFormValidation() {
  if (!orderForm) return;

  const fields = orderForm.querySelectorAll("input[required], select[required]");
  fields.forEach((field) => {
    field.addEventListener("input", () => field.setAttribute("aria-invalid", "false"));
    field.addEventListener("change", () => field.setAttribute("aria-invalid", "false"));
  });
}

function validateOrderForm() {
  if (!orderForm) return false;

  const fields = Array.from(orderForm.querySelectorAll("input[required], select[required]"));
  let isValid = true;

  fields.forEach((field) => {
    const fieldValid = field.checkValidity();
    field.setAttribute("aria-invalid", String(!fieldValid));
    if (!fieldValid) isValid = false;
  });

  if (phoneInput) {
    const phoneValid = isPhoneValid(phoneInput.value);
    phoneInput.setAttribute("aria-invalid", String(!phoneValid));
    if (!phoneValid) isValid = false;
  }

  return isValid;
}

function setupOrderForm() {
  if (!orderForm) return;

  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateOrderForm()) {
      setFormFeedback("Revise os campos destacados para continuar.", "error");
      orderForm.reportValidity();
      return;
    }

    const formData = new FormData(orderForm);
    const nome = String(formData.get("nome") || "").trim();
    const telefone = String(formData.get("telefone") || "").trim();
    const produto = String(formData.get("produto") || "").trim();
    const data = formatDatePtBr(String(formData.get("data") || "").trim());
    const horario = String(formData.get("horario") || "").trim();
    const obs = String(formData.get("obs") || "").trim();

    const message = [
      `Ola! Meu nome e ${nome}.`,
      `Quero pedir: ${produto}.`,
      `Data: ${data} as ${horario}.`,
      `Telefone: ${telefone}.`,
      obs ? `Observacoes: ${obs}.` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const popup = window.open(buildWaUrl(message), "_blank", "noopener,noreferrer");
    if (!popup) {
      setFormFeedback("Nao foi possivel abrir o WhatsApp automaticamente.", "error");
      return;
    }

    setFormFeedback("Pedido pronto. Abrindo o WhatsApp para confirmacao.", "success");
    orderForm.reset();
    setupOrderDate();
  });
}

syncDefaultWaLinks();
setupMenu();
setupScrollUi();
setupActiveSectionTracking();
setupRevealAnimation();
setupFaq();
setupProductButtons();
setupOrderDate();
setupOrderFormValidation();
setupOrderForm();
