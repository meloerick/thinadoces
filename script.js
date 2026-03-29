const WA_PHONE = "5551993446956";
const DEFAULT_WA_MESSAGE = "Ola! Quero fazer um pedido na Thina Doces.";
const THINA_PIX = "51993446956";
const PIX_CHECKOUT_LINE = `Finalize o pagamento para este Pix: ${THINA_PIX}.`;
const MOBILE_BREAKPOINT = 860;
const MAX_RECHEIOS = 2;
const ORDER_OPEN_MINUTES = 12 * 60;
const ORDER_CLOSE_MINUTES = 24 * 60;
const ORDER_HOURS_LABEL = "12:00 as 00:00";
const ACAI_GROUPS_TEMPLATE = [
  {
    key: "complementos",
    label: "Complementos",
    min: 1,
    max: 5,
    items: [
      { name: "Leite condensado", price: 0, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/17692003386973dad23e470.jpeg" },
      { name: "Uva verde", price: 0, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/17692003386973dad28e419.jpeg" },
      { name: "Leite em po", price: 0, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/17692003386973dad2d202b.jpeg" },
      { name: "Banana", price: 0, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/17692003396973dad372c64.jpeg" },
      { name: "Abacaxi", price: 0, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/17692003406973dad411d63.jpeg" },
      { name: "Pacoca", price: 0, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/17692003406973dad466b12.jpeg" },
      { name: "Amendoim", price: 0, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/17692003406973dad4b43a2.jpeg" },
      { name: "Granola", price: 0, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/17692003416973dad50882b.jpeg" },
      { name: "Chocobool", price: 0, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/17692003416973dad5508b1.jpeg" },
      { name: "Confetes", price: 0, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/17692003416973dad5a02d8.jpeg" },
      { name: "Cobertura de morango", price: 0, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/17692003416973dad5e8a09.jpeg" },
      { name: "Cobertura de chocolate", price: 0, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/17692003426973dad63a713.jpeg" },
    ],
  },
  {
    key: "descartaveis",
    label: "Descartaveis",
    min: 0,
    max: 1,
    items: [{ name: "Colher", price: 0, image: "" }],
  },
  {
    key: "adicionais",
    label: "Adicionais",
    min: 0,
    max: 5,
    items: [
      { name: "Creme de morango", price: 5, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/1769912389697eb845ee04a.jpeg" },
      { name: "Morango", price: 4, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/1769912390697eb84647e89.jpeg" },
      { name: "Creme de ninho", price: 5, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/1769912390697eb8468eebd.jpeg" },
      { name: "Nutella", price: 7, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/1769912391697eb847386cd.jpeg" },
      { name: "Brigadeiro", price: 5, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/1769912391697eb8477ffd7.jpeg" },
      { name: "Branquinho", price: 5, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/1769912391697eb847cee5e.jpeg" },
      { name: "Mousse de maracuja", price: 5, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/1769912392697eb8481f1d3.jpeg" },
      { name: "Geleia de morango", price: 4, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/1769912392697eb8486885a.jpeg" },
      { name: "Geleia de maracuja", price: 4, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/1769912392697eb848ae8c7.jpeg" },
      { name: "Ovomaltine", price: 4, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/1769912393697eb84907a97.jpeg" },
      { name: "Negresco triturado", price: 4, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/1769912393697eb84959a2a.jpeg" },
      { name: "Oreo", price: 4, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/1769912393697eb849aab28.jpeg" },
      { name: "Laka", price: 4, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/1769912394697eb84a01bf1.jpeg" },
      { name: "Kinder Bueno", price: 5, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/1769912394697eb84a49147.jpeg" },
      { name: "Brownie", price: 5, image: "https://instadelivery-public.nyc3.cdn.digitaloceanspaces.com/complements/1769912394697eb84a8e7e8.jpeg" },
    ],
  },
];

const siteHeader = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const navList = document.getElementById("navList");
const scrollProgress = document.getElementById("scrollProgress");
const revealElements = document.querySelectorAll(".reveal");
const orderButtons = document.querySelectorAll(".order-btn");
const catalogSearchInput = document.getElementById("catalogSearch");
const catalogSearchEmpty = document.getElementById("catalogSearchEmpty");
const catalogCategories = document.querySelectorAll("#servicos .catalog-category");
const orderForm = document.getElementById("orderForm");
const formFeedback = document.getElementById("formFeedback");
const dateInput = document.getElementById("data");
const phoneInput = document.getElementById("telefone");
const productSelect = document.getElementById("produto");
const addressInput = document.getElementById("endereco");
const topperSelect = document.getElementById("topper");
const recheioOptions = document.querySelectorAll('input[name="recheios[]"]');
const adicionalSelect = document.getElementById("adicional");
const quantityInput = document.getElementById("quantidade");
const addToCartButton = document.getElementById("addToCartBtn");
const cartList = document.getElementById("cartList");
const cartEmpty = document.getElementById("cartEmpty");
const cartTotal = document.getElementById("cartTotal");
const checkoutButton = document.getElementById("checkoutBtn");
const goToCheckoutButton = document.getElementById("goToCheckoutBtn");
const mobileFinalizeButton = document.getElementById("mobileFinalizeBtn");
const acaiModal = document.getElementById("acaiModal");
const acaiModalImage = document.getElementById("acaiModalImage");
const acaiModalTitle = document.getElementById("acaiModalTitle");
const acaiModalMeta = document.getElementById("acaiModalMeta");
const acaiModalBasePrice = document.getElementById("acaiModalBasePrice");
const acaiModalFilter = document.getElementById("acaiModalFilter");
const acaiModalContent = document.getElementById("acaiModalContent");
const acaiModalFeedback = document.getElementById("acaiModalFeedback");
const acaiModalTotal = document.getElementById("acaiModalTotal");
const acaiModalConfirm = document.getElementById("acaiModalConfirm");

const cartItems = [];
let syncRecheioLimit = () => {};
let acaiModalState = null;

function buildWaUrl(message) {
  const safeMessage = encodeURIComponent(String(message || ""));
  return `https://api.whatsapp.com/send?phone=${WA_PHONE}&text=${safeMessage}`;
}

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent || "");
}

function openWhatsAppUrl(url) {
  if (!url) return false;

  if (isMobileDevice()) {
    window.location.href = url;
    return true;
  }

  const popup = window.open(url, "_blank", "noopener,noreferrer");
  if (popup) return true;

  // Fallback when popup is blocked in desktop browsers.
  window.location.href = url;
  return true;
}

function openWhatsAppMessage(message) {
  return openWhatsAppUrl(buildWaUrl(message));
}

function getMinutesOfDay(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}

function isOrderingOpen(date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const [hourText = "0", minuteText = "0"] = formatter.format(date).split(":");
    const hour = Number(hourText);
    const minute = Number(minuteText);
    const minutesNow = hour * 60 + minute;
    return minutesNow >= ORDER_OPEN_MINUTES && minutesNow < ORDER_CLOSE_MINUTES;
  } catch {
    const minutesNow = getMinutesOfDay(date);
    return minutesNow >= ORDER_OPEN_MINUTES && minutesNow < ORDER_CLOSE_MINUTES;
  }
}

function getClosedOrderMessage() {
  return `Estamos fechados agora. Pedidos somente das ${ORDER_HOURS_LABEL}.`;
}

function notifyOrderingClosed() {
  const message = getClosedOrderMessage();
  setFormFeedback(message, "error");
  setAcaiModalFeedback(message, "error");

  if (isMobileDevice() || (!formFeedback && !acaiModalFeedback)) {
    window.alert(message);
  }
}

function ensureOrderingOpen() {
  if (isOrderingOpen()) return true;
  notifyOrderingClosed();
  return false;
}

function formatDatePtBr(isoDate) {
  if (!isoDate) return "";
  const safeDate = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(safeDate.getTime())) return isoDate;
  return safeDate.toLocaleDateString("pt-BR");
}

function formatCurrencyPtBr(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function parsePricePtBr(priceText) {
  const normalized = String(priceText || "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function cloneAcaiGroups() {
  return ACAI_GROUPS_TEMPLATE.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      quantity: 0,
    })),
  }));
}

function getAcaiGroupByKey(state, key) {
  if (!state || !Array.isArray(state.groups)) return null;
  return state.groups.find((group) => group.key === key) || null;
}

function getAcaiGroupTotal(group) {
  if (!group || !Array.isArray(group.items)) return 0;
  return group.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

function getAcaiExtrasUnitPrice(state) {
  if (!state || !Array.isArray(state.groups)) return 0;
  return state.groups.reduce((sum, group) => {
    const groupTotal = group.items.reduce((innerSum, item) => innerSum + Number(item.quantity || 0) * Number(item.price || 0), 0);
    return sum + groupTotal;
  }, 0);
}

function formatSelectedNames(items) {
  if (!Array.isArray(items) || !items.length) return "";
  return items
    .map((item) => (item.quantity > 1 ? `${item.name} x${item.quantity}` : item.name))
    .join(", ");
}

function setFormFeedback(message, state = "success") {
  if (!formFeedback) return;
  formFeedback.textContent = message;
  formFeedback.dataset.state = state;
}

function setAcaiModalFeedback(message, state = "error") {
  if (!acaiModalFeedback) return;
  acaiModalFeedback.textContent = message;
  acaiModalFeedback.dataset.state = state;
}

function buildAcaiSelectionPayload(state) {
  const collect = (groupKey) => {
    const group = getAcaiGroupByKey(state, groupKey);
    if (!group) return [];
    return group.items
      .filter((item) => Number(item.quantity || 0) > 0)
      .map((item) => ({
        name: item.name,
        quantity: Number(item.quantity || 0),
        price: Number(item.price || 0),
      }));
  };

  return {
    complementos: collect("complementos"),
    adicionais: collect("adicionais"),
    descartaveis: collect("descartaveis"),
  };
}

function serializeAcaiSelection(items) {
  if (!Array.isArray(items) || !items.length) return "";
  return items.map((item) => `${item.name}:${item.quantity}`).join(";");
}

function renderAcaiModal() {
  if (!acaiModalState || !acaiModalContent || !acaiModalTotal) return;

  if (acaiModalTitle) {
    acaiModalTitle.textContent = acaiModalState.productName;
  }

  if (acaiModalMeta) {
    const includedText = acaiModalState.includedCount
      ? `${acaiModalState.includedCount} complementos gratis`
      : "Escolha os complementos do seu pedido";
    acaiModalMeta.textContent = includedText;
  }

  if (acaiModalBasePrice) {
    acaiModalBasePrice.textContent = `Preco base: ${formatCurrencyPtBr(acaiModalState.unitPrice)}`;
  }

  if (acaiModalImage) {
    acaiModalImage.src = acaiModalState.imageSrc || "./images/produtos/itens/acai-polpa-norte--300ml.jpg";
    acaiModalImage.alt = acaiModalState.productName;
  }

  const searchTerm = normalizeSearchText(acaiModalState.searchTerm);

  const groupsHtml = acaiModalState.groups
    .map((group) => {
      const selectedCount = getAcaiGroupTotal(group);
      const ruleText = group.min > 0 ? `(min ${group.min}, max ${group.max})` : `(max ${group.max})`;

      const filteredItems = group.items.filter((item) => {
        if (!searchTerm) return true;
        return normalizeSearchText(item.name).includes(searchTerm);
      });

      const itemsHtml = filteredItems.length
        ? filteredItems
            .map((item) => {
              const quantity = Number(item.quantity || 0);
              const canIncrease = selectedCount < group.max;
              const priceText = Number(item.price || 0) > 0 ? `+${formatCurrencyPtBr(item.price)}` : "Gratis";
              const hasImage = Boolean(item.image);

              return `
                <article class="acai-option-row">
                  <div class="acai-option-media">
                    ${hasImage ? `<img src="${item.image}" alt="${item.name}" loading="lazy" width="64" height="64" />` : `<span class="acai-option-fallback">${item.name.charAt(0)}</span>`}
                  </div>
                  <div class="acai-option-main">
                    <p class="acai-option-name">${item.name}</p>
                    <p class="acai-option-price">${priceText}</p>
                  </div>
                  <div class="acai-option-controls">
                    <button type="button" class="acai-qty-btn" aria-label="Diminuir ${item.name}" data-acai-action="minus" data-group-key="${group.key}" data-item-name="${item.name}" ${quantity <= 0 ? "disabled" : ""}>-</button>
                    <span>${quantity}</span>
                    <button type="button" class="acai-qty-btn" aria-label="Aumentar ${item.name}" data-acai-action="plus" data-group-key="${group.key}" data-item-name="${item.name}" ${canIncrease ? "" : "disabled"}>+</button>
                  </div>
                </article>
              `;
            })
            .join("")
        : `<p class="acai-group-empty">Nenhum item encontrado nesse filtro.</p>`;

      return `
        <section class="acai-group">
          <header class="acai-group-head">
            <h4>${group.label} <small>${ruleText}</small></h4>
            <span>${selectedCount}/${group.max}</span>
          </header>
          <div class="acai-group-items">${itemsHtml}</div>
        </section>
      `;
    })
    .join("");

  acaiModalContent.innerHTML = groupsHtml;
  acaiModalTotal.textContent = formatCurrencyPtBr(acaiModalState.unitPrice + getAcaiExtrasUnitPrice(acaiModalState));
}

function changeAcaiItemQuantity(groupKey, itemName, delta) {
  if (!acaiModalState) return;

  const group = getAcaiGroupByKey(acaiModalState, groupKey);
  if (!group) return;

  const item = group.items.find((entry) => entry.name === itemName);
  if (!item) return;

  const currentQuantity = Number(item.quantity || 0);
  const nextQuantity = currentQuantity + delta;
  if (nextQuantity < 0) return;

  const selectedCount = getAcaiGroupTotal(group);
  if (delta > 0 && selectedCount >= group.max) {
    setAcaiModalFeedback(`Limite atingido em ${group.label}: maximo ${group.max}.`, "error");
    return;
  }

  item.quantity = nextQuantity;
  setAcaiModalFeedback("", "success");
  renderAcaiModal();
}

function openAcaiModalFromButton(button, productName, priceText) {
  if (!acaiModal) {
    addCatalogItemToCart(productName, priceText);
    return;
  }

  const card = button.closest(".catalog-item");
  const imageSrc = card?.querySelector("img")?.getAttribute("src") || "./images/produtos/itens/acai-polpa-norte--300ml.jpg";
  const description = card?.querySelector(".catalog-item-description")?.textContent || "";
  const descriptionMatch = description.match(/\d+/);
  const includedCount = Number(button.dataset.acaiIncluded || descriptionMatch?.[0] || 0);
  const groups = cloneAcaiGroups();
  const complementosGroup = groups.find((group) => group.key === "complementos");
  if (complementosGroup && includedCount > 0) {
    complementosGroup.max = includedCount;
  }

  acaiModalState = {
    triggerButton: button,
    productName,
    unitPrice: parsePricePtBr(priceText),
    imageSrc,
    includedCount,
    searchTerm: "",
    groups,
  };

  if (acaiModalFilter) acaiModalFilter.value = "";
  setAcaiModalFeedback("", "success");
  renderAcaiModal();

  acaiModal.hidden = false;
  document.body.classList.add("modal-open");

  if (acaiModalFilter) {
    window.setTimeout(() => acaiModalFilter.focus(), 0);
  }
}

function closeAcaiModal() {
  if (!acaiModal || acaiModal.hidden) return;
  acaiModal.hidden = true;
  document.body.classList.remove("modal-open");

  const triggerButton = acaiModalState?.triggerButton;
  acaiModalState = null;

  if (triggerButton instanceof HTMLElement) {
    triggerButton.focus();
  }
}

function setupAcaiModal() {
  if (!acaiModal || !acaiModalContent || !acaiModalConfirm) return;

  acaiModal.addEventListener("click", (event) => {
    const rawTarget = event.target;
    const target =
      rawTarget instanceof Element
        ? rawTarget
        : rawTarget instanceof Node
          ? rawTarget.parentElement
          : null;
    if (!target) return;

    const closeButton = target.closest("[data-acai-close]");
    if (closeButton) {
      closeAcaiModal();
      return;
    }

    const quantityButton = target.closest("button[data-acai-action]");
    if (!(quantityButton instanceof HTMLButtonElement)) return;

    const action = quantityButton.dataset.acaiAction;
    const groupKey = String(quantityButton.dataset.groupKey || "");
    const itemName = String(quantityButton.dataset.itemName || "");

    if (!groupKey || !itemName) return;
    if (action === "plus") {
      changeAcaiItemQuantity(groupKey, itemName, 1);
    } else if (action === "minus") {
      changeAcaiItemQuantity(groupKey, itemName, -1);
    }
  });

  if (acaiModalFilter) {
    acaiModalFilter.addEventListener("input", () => {
      if (!acaiModalState) return;
      acaiModalState.searchTerm = acaiModalFilter.value;
      renderAcaiModal();
    });
  }

  acaiModalConfirm.addEventListener("click", () => {
    if (!acaiModalState) return;

    const complementosGroup = getAcaiGroupByKey(acaiModalState, "complementos");
    const complementosTotal = getAcaiGroupTotal(complementosGroup);

    if (complementosGroup && complementosTotal < complementosGroup.min) {
      setAcaiModalFeedback(`Selecione no minimo ${complementosGroup.min} complemento(s).`, "error");
      return;
    }

    const selection = buildAcaiSelectionPayload(acaiModalState);
    const extraUnitPrice = getAcaiExtrasUnitPrice(acaiModalState);

    addAcaiItemToCart({
      productName: acaiModalState.productName,
      unitPrice: acaiModalState.unitPrice,
      acaiSelection: selection,
      extraUnitPrice,
    });

    closeAcaiModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && acaiModal && !acaiModal.hidden) {
      closeAcaiModal();
    }
  });
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

function syncOrderingAvailability() {
  const open = isOrderingOpen();
  const closedMessage = getClosedOrderMessage();

  orderButtons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    button.setAttribute("aria-disabled", String(!open));
    if (!open) {
      button.title = closedMessage;
    } else {
      button.removeAttribute("title");
    }
  });

  if (addToCartButton instanceof HTMLButtonElement) {
    addToCartButton.setAttribute("aria-disabled", String(!open));
    if (!open) {
      addToCartButton.title = closedMessage;
    } else {
      addToCartButton.removeAttribute("title");
    }
  }

  if (acaiModalConfirm instanceof HTMLButtonElement) {
    acaiModalConfirm.setAttribute("aria-disabled", String(!open));
    if (!open) {
      acaiModalConfirm.title = closedMessage;
    } else {
      acaiModalConfirm.removeAttribute("title");
    }
  }

  document.querySelectorAll("[data-wa-default]").forEach((link) => {
    if (!open) {
      link.setAttribute("aria-disabled", "true");
      link.title = closedMessage;
    } else {
      link.setAttribute("aria-disabled", "false");
      link.removeAttribute("title");
    }
  });

  if (cartList) {
    renderCart();
  }
}

function setupOrderingAvailability() {
  const waLinks = Array.from(document.querySelectorAll("[data-wa-default]"));

  waLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (isOrderingOpen()) return;
      event.preventDefault();
      notifyOrderingClosed();
    });
  });

  syncOrderingAvailability();
  window.setInterval(syncOrderingAvailability, 30000);
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

function getSelectedCakeProduct() {
  if (!productSelect || productSelect.selectedIndex < 0) return null;
  const selectedOption = productSelect.options[productSelect.selectedIndex];
  const selectedText = String(selectedOption?.textContent || "").trim();
  const productName = selectedText.split(" - ")[0]?.trim() || "";
  const unitPrice = Number(selectedOption?.dataset.price || 0);
  if (!productName || !unitPrice) return null;
  return { productName, unitPrice };
}

function getSelectedTopper() {
  if (!topperSelect || topperSelect.selectedIndex < 0) {
    return { topperName: "", topperPrice: 0 };
  }

  const selectedOption = topperSelect.options[topperSelect.selectedIndex];
  const topperText = String(selectedOption?.textContent || "").trim();
  const topperName = topperText.toLowerCase().startsWith("sem topper") ? "" : topperText.split(" (+")[0].trim();
  const topperPrice = Number(selectedOption?.dataset.price || 0);

  return { topperName, topperPrice };
}

function getSelectedRecheios() {
  if (!recheioOptions.length) return [];
  return Array.from(recheioOptions)
    .filter((input) => input.checked)
    .map((input) => String(input.value || "").trim())
    .filter(Boolean);
}

function setupRecheioLimit() {
  if (!recheioOptions.length) return;

  const getCheckedCount = () => Array.from(recheioOptions).filter((input) => input.checked).length;

  const updateDisabledState = () => {
    const checkedCount = getCheckedCount();
    recheioOptions.forEach((input) => {
      if (!input.checked) {
        input.disabled = checkedCount >= MAX_RECHEIOS;
      } else {
        input.disabled = false;
      }
    });
  };

  recheioOptions.forEach((input) => {
    input.addEventListener("change", () => {
      if (getCheckedCount() > MAX_RECHEIOS) {
        input.checked = false;
        setFormFeedback(`Voce pode escolher no maximo ${MAX_RECHEIOS} recheios.`, "error");
      }
      updateDisabledState();
    });
  });

  syncRecheioLimit = updateDisabledState;
  updateDisabledState();
}

function calculateItemSubtotal(item) {
  const unitWithExtras = Number(item.unitPrice || 0) + Number(item.topperPrice || 0) + Number(item.extraUnitPrice || 0);
  return unitWithExtras * Number(item.quantity || 0);
}

function calculateCartTotal() {
  return cartItems.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
}

function renderCart() {
  if (!cartList || !cartEmpty || !cartTotal) return;

  cartList.innerHTML = "";
  const hasItems = cartItems.length > 0;
  cartEmpty.hidden = hasItems;
  if (checkoutButton) checkoutButton.disabled = !hasItems;
  if (goToCheckoutButton instanceof HTMLButtonElement) {
    goToCheckoutButton.disabled = !hasItems;
  }
  if (mobileFinalizeButton instanceof HTMLButtonElement) {
    mobileFinalizeButton.disabled = !hasItems;
  }

  if (!hasItems) {
    cartTotal.textContent = formatCurrencyPtBr(0);
    return;
  }

  cartItems.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "cart-item";

    const notes = [];
    if (item.acaiSelection) {
      const acaiComplementos = formatSelectedNames(item.acaiSelection.complementos);
      const acaiAdicionais = formatSelectedNames(item.acaiSelection.adicionais);
      const acaiDescartaveis = formatSelectedNames(item.acaiSelection.descartaveis);
      if (acaiComplementos) notes.push(`Complementos: ${acaiComplementos}`);
      if (acaiAdicionais) notes.push(`Adicionais: ${acaiAdicionais}`);
      if (acaiDescartaveis) notes.push(`Descartaveis: ${acaiDescartaveis}`);
    }
    if (Array.isArray(item.recheios) && item.recheios.length) {
      notes.push(`Recheios: ${item.recheios.join(", ")}`);
    }
    if (item.adicional) notes.push(`Adicional: ${item.adicional}`);
    if (item.topperName) notes.push(`Topper: ${item.topperName}`);

    li.innerHTML = `
      <div class="cart-item-main">
        <strong>${item.productName}</strong>
        <p>${notes.join(" | ") || "Sem adicionais"}</p>
      </div>
      <div class="cart-item-controls">
        <button type="button" class="cart-control" data-action="decrease" data-index="${index}" aria-label="Diminuir quantidade">-</button>
        <span>${item.quantity}</span>
        <button type="button" class="cart-control" data-action="increase" data-index="${index}" aria-label="Aumentar quantidade">+</button>
      </div>
      <p class="cart-item-value">${formatCurrencyPtBr(calculateItemSubtotal(item))}</p>
      <button type="button" class="cart-remove" data-action="remove" data-index="${index}">Remover</button>
    `;

    cartList.append(li);
  });

  cartTotal.textContent = formatCurrencyPtBr(calculateCartTotal());
}

function addAcaiItemToCart({ productName, unitPrice, acaiSelection, extraUnitPrice }) {
  if (!productName || Number(unitPrice || 0) <= 0) {
    setFormFeedback("Nao foi possivel adicionar este acai ao carrinho.", "error");
    return;
  }

  const selectionKey = [
    serializeAcaiSelection(acaiSelection?.complementos || []),
    serializeAcaiSelection(acaiSelection?.adicionais || []),
    serializeAcaiSelection(acaiSelection?.descartaveis || []),
  ].join("||");

  const key = `${productName}||acai||${selectionKey}`;
  const existingItem = cartItems.find((item) => item.key === key);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({
      key,
      productName,
      unitPrice: Number(unitPrice || 0),
      topperName: "",
      topperPrice: 0,
      extraUnitPrice: Number(extraUnitPrice || 0),
      acaiSelection: {
        complementos: acaiSelection?.complementos || [],
        adicionais: acaiSelection?.adicionais || [],
        descartaveis: acaiSelection?.descartaveis || [],
      },
      recheios: [],
      adicional: "",
      quantity: 1,
    });
  }

  renderCart();
  setFormFeedback(`"${productName}" adicionado ao carrinho.`, "success");
}

function addCatalogItemToCart(productName, priceText) {
  const unitPrice = parsePricePtBr(priceText);
  if (!productName || unitPrice <= 0) {
    setFormFeedback("Nao foi possivel adicionar este item ao carrinho.", "error");
    return;
  }

  const key = `${productName}||catalog||${unitPrice.toFixed(2)}`;
  const existingItem = cartItems.find((item) => item.key === key);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({
      key,
      productName,
      unitPrice,
      topperName: "",
      topperPrice: 0,
      extraUnitPrice: 0,
      acaiSelection: null,
      recheios: [],
      adicional: "",
      quantity: 1,
    });
  }

  renderCart();
  setFormFeedback(`"${productName}" adicionado ao carrinho.`, "success");
}

function addCurrentSelectionToCart() {
  const selected = getSelectedCakeProduct();
  if (!selected) {
    setFormFeedback("Selecione um produto de bolo antes de adicionar ao carrinho.", "error");
    return;
  }

  const topper = getSelectedTopper();
  const recheios = getSelectedRecheios();
  if (recheios.length > MAX_RECHEIOS) {
    setFormFeedback(`Voce pode escolher no maximo ${MAX_RECHEIOS} recheios.`, "error");
    return;
  }

  const adicional = String(adicionalSelect?.value || "").trim();
  const quantityValue = Math.max(1, Number(quantityInput?.value || 1));
  const cartKey = `${selected.productName}||${recheios.join(",")}||${adicional}||${topper.topperName}`;

  const existingItem = cartItems.find((item) => item.key === cartKey);
  if (existingItem) {
    existingItem.quantity += quantityValue;
  } else {
    cartItems.push({
      key: cartKey,
      productName: selected.productName,
      unitPrice: selected.unitPrice,
      topperName: topper.topperName,
      topperPrice: topper.topperPrice,
      extraUnitPrice: 0,
      acaiSelection: null,
      recheios,
      adicional,
      quantity: quantityValue,
    });
  }

  if (quantityInput) quantityInput.value = "1";
  if (recheioOptions.length) {
    recheioOptions.forEach((input) => {
      input.checked = false;
    });
    syncRecheioLimit();
  }
  renderCart();
  setFormFeedback("Item adicionado ao carrinho.", "success");
}

function setupCart() {
  if (!cartList) return;
  let lastCartTouchAt = 0;
  let lastFinalizeTouchAt = 0;

  const handleCartAction = (target) => {
    const actionButton = target.closest("button[data-action]");
    if (!(actionButton instanceof HTMLButtonElement)) return false;

    const action = actionButton.dataset.action;
    const index = Number(actionButton.dataset.index);
    if (!Number.isInteger(index) || index < 0 || index >= cartItems.length) return true;

    if (action === "increase") {
      cartItems[index].quantity += 1;
    } else if (action === "decrease") {
      const nextQuantity = Number(cartItems[index].quantity || 0) - 1;
      if (nextQuantity <= 0) {
        cartItems.splice(index, 1);
      } else {
        cartItems[index].quantity = nextQuantity;
      }
    } else if (action === "remove") {
      cartItems.splice(index, 1);
    }

    renderCart();
    return true;
  };

  const onCartInteraction = (event) => {
    const rawTarget = event.target;
    const target =
      rawTarget instanceof Element
        ? rawTarget
        : rawTarget instanceof Node
          ? rawTarget.parentElement
          : null;
    if (!target) return;

    if (event.type === "click" && Date.now() - lastCartTouchAt < 500) {
      return;
    }

    if (!handleCartAction(target)) return;

    if (event.type === "touchend") {
      lastCartTouchAt = Date.now();
      event.preventDefault();
    }
  };

  const finalizeFromCart = () => {
    if (!cartItems.length) {
      setFormFeedback("Adicione itens no carrinho para continuar.", "error");
      const servicesSection = document.getElementById("servicos");
      servicesSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (!orderForm) return;
    orderForm.scrollIntoView({ behavior: "smooth", block: "start" });
    const firstField = orderForm.querySelector("input, select, textarea");
    if (firstField instanceof HTMLElement) {
      window.setTimeout(() => firstField.focus(), 250);
    }
  };

  if (addToCartButton) {
    addToCartButton.addEventListener("click", addCurrentSelectionToCart);
  }

  cartList.addEventListener("click", onCartInteraction);
  cartList.addEventListener("touchend", onCartInteraction, { passive: false });

  if (goToCheckoutButton instanceof HTMLButtonElement) {
    goToCheckoutButton.addEventListener("click", () => {
      if (Date.now() - lastFinalizeTouchAt < 500) return;
      finalizeFromCart();
    });
    goToCheckoutButton.addEventListener(
      "touchend",
      (event) => {
        lastFinalizeTouchAt = Date.now();
        event.preventDefault();
        finalizeFromCart();
      },
      { passive: false }
    );
  }

  if (mobileFinalizeButton instanceof HTMLButtonElement) {
    mobileFinalizeButton.addEventListener("click", () => {
      if (Date.now() - lastFinalizeTouchAt < 500) return;
      finalizeFromCart();
    });
    mobileFinalizeButton.addEventListener(
      "touchend",
      (event) => {
        lastFinalizeTouchAt = Date.now();
        event.preventDefault();
        finalizeFromCart();
      },
      { passive: false }
    );
  }

  renderCart();
}

function setupProductButtons() {
  if (!orderButtons.length) return;

  orderButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const product = button.dataset.product || "produto";
      const price = button.dataset.price || "";
      const isAcaiButton = button.dataset.acai === "true";
      const topper = button.dataset.topper || "";
      let matchedSomething = false;

      if (isAcaiButton) {
        openAcaiModalFromButton(button, product, price);
        return;
      }

      if (cartList && price) {
        addCatalogItemToCart(product, price);
        return;
      }

      if (productSelect) {
        const optionText = `${product}${price ? ` - ${price}` : ""}`;
        const option = Array.from(productSelect.options).find((item) => item.textContent === optionText);
        if (option) {
          productSelect.value = optionText;
          matchedSomething = true;
        }
      }

      if (topper && topperSelect) {
        const topperOption = Array.from(topperSelect.options).find((item) => item.textContent.includes(topper));
        if (topperOption) {
          topperSelect.value = topperOption.value;
          matchedSomething = true;
        }
      }

      if (matchedSomething) {
        const orderSection = document.getElementById("agendar");
        orderSection?.scrollIntoView({ behavior: "smooth", block: "start" });
        setFormFeedback("Item selecionado. Agora adicione ao carrinho.", "success");
        return;
      }

      const message = `Ola! Quero pedir ${product}${price ? ` (${price})` : ""}. Pode me confirmar disponibilidade?`;
      openWhatsAppMessage(message);
    });
  });
}

function getCatalogItemSearchText(item, categoryName) {
  const title = item.querySelector("h4")?.textContent || "";
  const description = item.querySelector(".catalog-item-description")?.textContent || "";
  const price = item.querySelector(".catalog-item-price")?.textContent || "";
  const orderProduct = item.querySelector(".order-btn")?.dataset.product || "";
  const linkText = item.querySelector("a.btn")?.textContent || "";

  return normalizeSearchText([categoryName, title, description, price, orderProduct, linkText].filter(Boolean).join(" "));
}

function applyCatalogSearchFilter(rawTerm) {
  if (!catalogCategories.length) return;

  const normalizedTerm = normalizeSearchText(rawTerm);
  let totalVisibleItems = 0;

  catalogCategories.forEach((category) => {
    const categoryName = category.querySelector(".catalog-category-title h3")?.textContent || "";
    const categoryMatches = normalizedTerm ? normalizeSearchText(categoryName).includes(normalizedTerm) : false;
    const items = Array.from(category.querySelectorAll(".catalog-item"));

    let visibleInCategory = 0;
    items.forEach((item) => {
      const itemMatches = !normalizedTerm || categoryMatches || getCatalogItemSearchText(item, categoryName).includes(normalizedTerm);
      item.hidden = !itemMatches;
      item.setAttribute("aria-hidden", String(!itemMatches));
      if (itemMatches) {
        visibleInCategory += 1;
      }
    });

    category.hidden = visibleInCategory === 0;
    category.setAttribute("aria-hidden", String(visibleInCategory === 0));
    totalVisibleItems += visibleInCategory;
  });

  if (catalogSearchEmpty) {
    catalogSearchEmpty.hidden = !normalizedTerm || totalVisibleItems > 0;
  }
}

function setupCatalogSearch() {
  if (!catalogSearchInput || !catalogCategories.length) return;

  applyCatalogSearchFilter("");

  catalogSearchInput.addEventListener("input", () => {
    applyCatalogSearchFilter(catalogSearchInput.value);
  });

  catalogSearchInput.addEventListener("search", () => {
    applyCatalogSearchFilter(catalogSearchInput.value);
  });

  catalogSearchInput.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    catalogSearchInput.value = "";
    applyCatalogSearchFilter("");
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

    if (!ensureOrderingOpen()) return;

    if (!validateOrderForm()) {
      setFormFeedback("Revise os campos destacados para continuar.", "error");
      orderForm.reportValidity();
      return;
    }

    if (!cartItems.length) {
      setFormFeedback("Adicione pelo menos 1 item ao carrinho antes de finalizar.", "error");
      return;
    }

    const formData = new FormData(orderForm);
    const nome = String(formData.get("nome") || "").trim();
    const telefone = String(formData.get("telefone") || "").trim();
    const endereco = String(formData.get("endereco") || "").trim();
    const data = formatDatePtBr(String(formData.get("data") || "").trim());
    const horario = String(formData.get("horario") || "").trim();
    const obs = String(formData.get("obs") || "").trim();
    const dateTimeLine =
      data && horario
        ? `Data desejada: ${data} as ${horario}.`
        : data
          ? `Data desejada: ${data}.`
          : horario
            ? `Horario desejado: ${horario}.`
            : "";

    const itensResumo = cartItems.map((item, index) => {
      const extras = [];
      if (item.acaiSelection) {
        const acaiComplementos = formatSelectedNames(item.acaiSelection.complementos);
        const acaiAdicionais = formatSelectedNames(item.acaiSelection.adicionais);
        const acaiDescartaveis = formatSelectedNames(item.acaiSelection.descartaveis);
        if (acaiComplementos) extras.push(`Complementos: ${acaiComplementos}`);
        if (acaiAdicionais) extras.push(`Adicionais: ${acaiAdicionais}`);
        if (acaiDescartaveis) extras.push(`Descartaveis: ${acaiDescartaveis}`);
      }
      if (Array.isArray(item.recheios) && item.recheios.length) {
        extras.push(`Recheios: ${item.recheios.join(", ")}`);
      }
      if (item.adicional) extras.push(`Adicional: ${item.adicional}`);
      if (item.topperName) extras.push(`Topper: ${item.topperName}`);
      const extraText = extras.length ? ` | ${extras.join(" | ")}` : "";
      return `${index + 1}. ${item.productName} | Qtd: ${item.quantity}${extraText} | Subtotal: ${formatCurrencyPtBr(calculateItemSubtotal(item))}`;
    });

    const total = formatCurrencyPtBr(calculateCartTotal());

    const message = [
      `Ola! Meu nome e ${nome}.`,
      productSelect ? "Quero fazer uma encomenda de bolo:" : "Quero fazer um pedido:",
      ...itensResumo.map((line) => `- ${line}`),
      `Total do pedido: ${total}.`,
      PIX_CHECKOUT_LINE,
      `Endereco: ${endereco}.`,
      dateTimeLine,
      `Telefone: ${telefone}.`,
      obs ? `Observacoes: ${obs}.` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const opened = openWhatsAppMessage(message);
    if (!opened) {
      setFormFeedback("Nao foi possivel abrir o WhatsApp automaticamente.", "error");
      return;
    }

    cartItems.length = 0;
    renderCart();
    orderForm.reset();
    syncRecheioLimit();
    setupOrderDate();
    if (quantityInput) quantityInput.value = "1";
    setFormFeedback("Pedido enviado. Abrindo o WhatsApp para confirmacao.", "success");
  });
}

syncDefaultWaLinks();
setupOrderingAvailability();
setupMenu();
setupScrollUi();
setupActiveSectionTracking();
setupRevealAnimation();
setupFaq();
setupAcaiModal();
setupProductButtons();
setupCatalogSearch();
setupRecheioLimit();
setupOrderDate();
setupOrderFormValidation();
setupCart();
setupOrderForm();
