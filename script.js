const WA_PHONE = "5512991468346";
const DEFAULT_WA_MESSAGE = "Ol\u00e1, gostaria de agendar um hor\u00e1rio.";
const MOBILE_BREAKPOINT = 860;
const AVAILABLE_TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const prefersFinePointer = window.matchMedia("(pointer:fine)").matches;

const siteHeader = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const navList = document.getElementById("navList");
const scrollProgress = document.getElementById("scrollProgress");
const heroParallax = document.getElementById("heroParallax");
const counters = document.querySelectorAll(".counter");
const revealElements = document.querySelectorAll(".reveal");
const bookingForm = document.getElementById("bookingForm");
const formFeedback = document.getElementById("formFeedback");
const dateInput = document.getElementById("data");
const phoneInput = document.getElementById("telefone");
const timeInput = document.getElementById("horario");

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

function syncWhatsappLinks() {
  document.querySelectorAll("[data-wa-link]").forEach((link) => {
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
    const nextState = !navList.classList.contains("is-open");
    setMenuState(nextState);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const clickedInsideMenu = navList.contains(target);
    const clickedToggle = menuToggle.contains(target);
    if (!clickedInsideMenu && !clickedToggle) {
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

function setupScrollUI() {
  let isTicking = false;

  function render() {
    const scrollTop = window.scrollY;
    if (siteHeader) {
      siteHeader.classList.toggle("scrolled", scrollTop > 14);
    }

    if (scrollProgress) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = maxScroll > 0 ? scrollTop / maxScroll : 0;
      const clamped = Math.max(0, Math.min(1, ratio));
      scrollProgress.style.transform = `scaleX(${clamped})`;
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
      return section ? { id, link, section } : null;
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
      rootMargin: "-30% 0px -55% 0px",
      threshold: [0.2, 0.45, 0.7],
    }
  );

  observedSections.forEach((item) => observer.observe(item.section));
  setActive("home");
}

function setupRevealAnimation() {
  if (!revealElements.length) return;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const delay = Number(element.dataset.delay || 0);
        element.style.transitionDelay = `${delay}ms`;
        element.classList.add("is-visible");
        observer.unobserve(element);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -7% 0px",
    }
  );

  revealElements.forEach((element, index) => {
    element.dataset.delay = String((index % 4) * 55);
    revealObserver.observe(element);
  });
}

function formatCounterValue(rawTarget) {
  const hasDecimal = rawTarget.includes(".");
  const parsed = Number(rawTarget);
  if (Number.isNaN(parsed)) return rawTarget;
  if (hasDecimal) return parsed.toFixed(1).replace(".", ",");
  if (parsed >= 1000) return `+${Math.round(parsed).toLocaleString("pt-BR")}`;
  return Math.round(parsed).toLocaleString("pt-BR");
}

function animateCounter(counterElement) {
  const rawTarget = counterElement.dataset.target || "";
  const target = Number(rawTarget);
  if (Number.isNaN(target)) return;

  const hasDecimal = rawTarget.includes(".");
  const duration = 1300;
  const start = performance.now();

  function render(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;

    if (hasDecimal) {
      counterElement.textContent = value.toFixed(1).replace(".", ",");
    } else {
      counterElement.textContent = Math.floor(value).toLocaleString("pt-BR");
    }

    if (progress < 1) {
      window.requestAnimationFrame(render);
      return;
    }

    counterElement.textContent = formatCounterValue(rawTarget);
  }

  window.requestAnimationFrame(render);
}

function setupCounterAnimation() {
  if (!counters.length) return;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    counters.forEach((counter) => {
      counter.textContent = formatCounterValue(counter.dataset.target || "");
    });
    return;
  }

  const metrics = document.getElementById("metrics");
  if (!metrics) return;

  const observer = new IntersectionObserver(
    (entries, intersectionObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        counters.forEach((counter) => animateCounter(counter));
        intersectionObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.28 }
  );

  observer.observe(metrics);
}

function setupHeroParallax() {
  if (!heroParallax || prefersReducedMotion || !prefersFinePointer || window.innerWidth <= MOBILE_BREAKPOINT) {
    return;
  }

  let rafId = 0;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  function animate() {
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;
    heroParallax.style.setProperty("--shift-x", `${currentX.toFixed(2)}px`);
    heroParallax.style.setProperty("--shift-y", `${currentY.toFixed(2)}px`);

    if (Math.abs(currentX - targetX) > 0.1 || Math.abs(currentY - targetY) > 0.1) {
      rafId = window.requestAnimationFrame(animate);
    } else {
      rafId = 0;
    }
  }

  function requestAnimation() {
    if (rafId) return;
    rafId = window.requestAnimationFrame(animate);
  }

  heroParallax.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch") return;
      const rect = heroParallax.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = px * 14;
      targetY = py * 10;
      requestAnimation();
    },
    { passive: true }
  );

  heroParallax.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
    requestAnimation();
  });
}

function setupGalleryShowcase() {
  const showcase = document.getElementById("galleryShowcase");
  const galleryTrack = document.getElementById("galleryTrack");
  const galleryDots = document.getElementById("galleryDots");
  if (!showcase || !galleryTrack || !galleryDots) return;

  const slides = Array.from(galleryTrack.querySelectorAll(".gallery-slide"));
  const prevButton = showcase.querySelector(".gallery-prev");
  const nextButton = showcase.querySelector(".gallery-next");
  if (!slides.length) return;

  let currentIndex = 0;
  let autoplayId = 0;
  const dots = [];

  function setSlide(nextIndex) {
    currentIndex = (nextIndex + slides.length) % slides.length;
    galleryTrack.style.transform = `translateX(-${currentIndex * 100}%)`;

    slides.forEach((slide, index) => {
      const isActive = index === currentIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach((dot, index) => {
      const isActive = index === currentIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  slides.forEach((_, index) => {
    const dotButton = document.createElement("button");
    dotButton.type = "button";
    dotButton.className = "gallery-dot";
    dotButton.setAttribute("aria-label", `Ver imagem ${index + 1}`);
    dotButton.addEventListener("click", () => {
      setSlide(index);
      restartAutoplay();
    });
    galleryDots.appendChild(dotButton);
    dots.push(dotButton);
  });

  function nextSlide() {
    setSlide(currentIndex + 1);
  }

  function previousSlide() {
    setSlide(currentIndex - 1);
  }

  function stopAutoplay() {
    if (!autoplayId) return;
    window.clearInterval(autoplayId);
    autoplayId = 0;
  }

  function startAutoplay() {
    if (prefersReducedMotion || slides.length < 2) return;
    stopAutoplay();
    autoplayId = window.setInterval(nextSlide, 4300);
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  prevButton?.addEventListener("click", () => {
    previousSlide();
    restartAutoplay();
  });

  nextButton?.addEventListener("click", () => {
    nextSlide();
    restartAutoplay();
  });

  showcase.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      previousSlide();
      restartAutoplay();
    }
    if (event.key === "ArrowRight") {
      nextSlide();
      restartAutoplay();
    }
  });

  showcase.addEventListener("pointerenter", stopAutoplay);
  showcase.addEventListener("pointerleave", startAutoplay);
  showcase.addEventListener("focusin", stopAutoplay);
  showcase.addEventListener("focusout", (event) => {
    const nextTarget = event.relatedTarget;
    if (!(nextTarget instanceof Element) || !showcase.contains(nextTarget)) {
      startAutoplay();
    }
  });

  setSlide(0);
  startAutoplay();
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

function setupBookingDate() {
  if (!dateInput) return;
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  const localDate = new Date(now.getTime() - timezoneOffset).toISOString().split("T")[0];
  dateInput.min = localDate;
}

function setupBookingFormValidation() {
  if (!bookingForm) return;

  const fields = bookingForm.querySelectorAll("input[required], select[required]");
  fields.forEach((field) => {
    field.addEventListener("input", () => {
      field.setAttribute("aria-invalid", "false");
    });

    field.addEventListener("change", () => {
      field.setAttribute("aria-invalid", "false");
    });
  });
}

function setupTimeSlots() {
  if (!timeInput) return;

  const timeSlots = Array.from(document.querySelectorAll(".time-slot"));
  if (!timeSlots.length) return;

  function syncActiveTimeSlot(value) {
    timeSlots.forEach((slot) => {
      slot.classList.toggle("is-active", slot.dataset.time === value);
    });
  }

  timeSlots.forEach((slot) => {
    slot.addEventListener("click", () => {
      const selectedTime = slot.dataset.time || "";
      if (!AVAILABLE_TIME_SLOTS.includes(selectedTime)) return;
      timeInput.value = selectedTime;
      timeInput.setAttribute("aria-invalid", "false");
      syncActiveTimeSlot(selectedTime);
      timeInput.focus();
    });
  });

  timeInput.addEventListener("input", () => {
    syncActiveTimeSlot(timeInput.value);
  });
}

function isPhoneValid(phoneValue) {
  const digits = phoneValue.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 13;
}

function isTimeSlotValid(timeValue) {
  return AVAILABLE_TIME_SLOTS.includes(timeValue);
}

function validateBookingForm() {
  if (!bookingForm) return false;
  const fields = Array.from(bookingForm.querySelectorAll("input[required], select[required]"));
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

  if (timeInput) {
    const timeValid = isTimeSlotValid(timeInput.value);
    timeInput.setAttribute("aria-invalid", String(!timeValid));
    if (!timeValid) isValid = false;
  }

  return isValid;
}

function setupBookingForm() {
  if (!bookingForm) return;

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateBookingForm()) {
      setFormFeedback("Revise os campos destacados para continuar.", "error");
      bookingForm.reportValidity();
      return;
    }

    const formData = new FormData(bookingForm);
    const nome = String(formData.get("nome") || "").trim();
    const servico = String(formData.get("servico") || "").trim();
    const dataDesejada = formatDatePtBr(String(formData.get("data") || "").trim());
    const horario = String(formData.get("horario") || "").trim();

    const message = `Ol\u00e1, meu nome \u00e9 ${nome}, gostaria de agendar ${servico} no dia ${dataDesejada} \u00e0s ${horario}.`;

    const waUrl = buildWaUrl(message);
    const popup = window.open(waUrl, "_blank", "noopener,noreferrer");
    if (!popup) {
      setFormFeedback("Nao foi possivel abrir o WhatsApp automaticamente. Use o botao de WhatsApp.", "error");
      return;
    }

    setFormFeedback("Agendamento pronto. Abrindo o WhatsApp para confirmacao.", "success");
    bookingForm.reset();
    setupBookingDate();
    document.querySelectorAll(".time-slot").forEach((slot) => slot.classList.remove("is-active"));
  });
}

syncWhatsappLinks();
setupMenu();
setupScrollUI();
setupActiveSectionTracking();
setupRevealAnimation();
setupCounterAnimation();
setupHeroParallax();
setupGalleryShowcase();
setupFaq();
setupBookingDate();
setupBookingFormValidation();
setupTimeSlots();
setupBookingForm();
