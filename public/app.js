const STORAGE_KEYS = {
  cart: "acai_do_parque_cart_v1",
  checkout: "acai_do_parque_checkout_v1"
};

const PAYMENT_LABELS = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  cartao: "Cartão"
};

const DEFAULT_WHATSAPP = "5551985014767";
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const state = {
  menu: null,
  selectedSizeId: null,
  selectedToppingIds: new Set(),
  selectedQuantity: 1,
  cart: readStorage(STORAGE_KEYS.cart, []),
  checkout: readStorage(STORAGE_KEYS.checkout, {
    name: "",
    address: "",
    paymentMethod: "",
    changeFor: "",
    reference: ""
  })
};

const elements = {
  storeName: document.getElementById("storeName"),
  storeLocation: document.getElementById("storeLocation"),
  storeRating: document.getElementById("storeRating"),
  sizeOptions: document.getElementById("sizeOptions"),
  toppingGroups: document.getElementById("toppingGroups"),
  summarySize: document.getElementById("summarySize"),
  summaryToppings: document.getElementById("summaryToppings"),
  summaryUnit: document.getElementById("summaryUnit"),
  summaryQuantity: document.getElementById("summaryQuantity"),
  summaryItemTotal: document.getElementById("summaryItemTotal"),
  decreaseQty: document.getElementById("decreaseQty"),
  increaseQty: document.getElementById("increaseQty"),
  addToCartButton: document.getElementById("addToCartButton"),
  cartSheet: document.getElementById("cartSheet"),
  cartItems: document.getElementById("cartItems"),
  cartEmpty: document.getElementById("cartEmpty"),
  cartTotal: document.getElementById("cartTotal"),
  cartItemsCount: document.getElementById("cartItemsCount"),
  cartTrigger: document.getElementById("cartTrigger"),
  cartTriggerCount: document.getElementById("cartTriggerCount"),
  closeCartButton: document.getElementById("closeCartButton"),
  sheetOverlay: document.getElementById("sheetOverlay"),
  goCheckoutButton: document.getElementById("goCheckoutButton"),
  checkoutForm: document.getElementById("checkoutForm"),
  customerName: document.getElementById("customerName"),
  customerAddress: document.getElementById("customerAddress"),
  paymentMethod: document.getElementById("paymentMethod"),
  changeForWrapper: document.getElementById("changeForWrapper"),
  changeFor: document.getElementById("changeFor"),
  customerReference: document.getElementById("customerReference"),
  checkoutTotal: document.getElementById("checkoutTotal"),
  finishOrderButton: document.getElementById("finishOrderButton"),
  toast: document.getElementById("toast")
};

let toastTimer;

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatCurrency(value) {
  return currencyFormatter.format(Number(value) || 0);
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeIds(ids) {
  if (!Array.isArray(ids)) return [];
  return [...new Set(ids.map((id) => String(id || "").trim()).filter(Boolean))].sort();
}

function createCartId() {
  return `item-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function getSizeById(sizeId) {
  return state.menu?.sizes?.find((size) => size.id === sizeId) || null;
}

function getToppingById(toppingId) {
  return state.menu?.toppings?.find((topping) => topping.id === toppingId) || null;
}

function getToppingsByIds(toppingIds) {
  return normalizeIds(toppingIds).map((id) => getToppingById(id)).filter(Boolean);
}

function calculateUnitPrice(sizeId, toppingIds) {
  const size = getSizeById(sizeId);
  if (!size) return 0;

  const toppingsTotal = getToppingsByIds(toppingIds).reduce((sum, topping) => sum + Number(topping.price || 0), 0);
  return Number(size.price || 0) + toppingsTotal;
}

function calculateCartTotals() {
  return state.cart.reduce(
    (accumulator, item) => {
      const quantity = Math.max(1, Number.parseInt(item.quantity, 10) || 1);
      const unitPrice = calculateUnitPrice(item.sizeId, item.toppingIds);
      const itemTotal = unitPrice * quantity;

      accumulator.total += itemTotal;
      accumulator.itemsCount += quantity;
      return accumulator;
    },
    { total: 0, itemsCount: 0 }
  );
}

function sameConfiguration(item, sizeId, toppingIds) {
  if (item.sizeId !== sizeId) return false;
  const first = normalizeIds(item.toppingIds);
  const second = normalizeIds(toppingIds);
  if (first.length !== second.length) return false;
  return first.every((value, index) => value === second[index]);
}

function persistCart() {
  writeStorage(STORAGE_KEYS.cart, state.cart);
}

function persistCheckout() {
  writeStorage(STORAGE_KEYS.checkout, state.checkout);
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2600);
}

function animateCartTrigger() {
  elements.cartTrigger.classList.remove("is-pulse");
  void elements.cartTrigger.offsetWidth;
  elements.cartTrigger.classList.add("is-pulse");
}

function setCartOpen(shouldOpen) {
  if (window.matchMedia("(min-width: 1080px)").matches) {
    document.body.classList.remove("cart-open");
    return;
  }
  document.body.classList.toggle("cart-open", shouldOpen);
}

function closeCart() {
  setCartOpen(false);
}

function scrollToCheckout() {
  const checkoutSection = document.getElementById("checkout");
  checkoutSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  closeCart();
}

function renderStoreHeader() {
  if (!state.menu?.store) return;
  const { name, city, rating, reviews } = state.menu.store;

  elements.storeName.textContent = name || "Açaí do Parque";
  elements.storeLocation.textContent = `📍 ${city || "Canoas - RS"}`;
  elements.storeRating.textContent = `⭐ ${rating || 4.8} (${reviews || 24} avaliações)`;
}

function renderSizeOptions() {
  if (!state.menu?.sizes?.length) {
    elements.sizeOptions.innerHTML = "<p>Cardápio indisponível no momento.</p>";
    return;
  }

  elements.sizeOptions.innerHTML = state.menu.sizes
    .map((size) => {
      const isActive = state.selectedSizeId === size.id;
      return `
        <button
          type="button"
          class="size-card ${isActive ? "is-active" : ""}"
          data-size-id="${size.id}"
          role="radio"
          aria-checked="${isActive ? "true" : "false"}"
        >
          <span class="size-card__top">${size.ml}ml</span>
          <strong>${size.label}</strong>
          <small>${size.description || ""}</small>
          <span class="size-card__price">${formatCurrency(size.price)}</span>
        </button>
      `;
    })
    .join("");
}

function renderToppingGroups() {
  const toppings = state.menu?.toppings || [];
  if (!toppings.length) {
    elements.toppingGroups.innerHTML = "<p>Nenhum adicional disponível no momento.</p>";
    return;
  }

  const grouped = toppings.reduce((accumulator, topping) => {
    const category = topping.category || "Outros";
    if (!accumulator[category]) accumulator[category] = [];
    accumulator[category].push(topping);
    return accumulator;
  }, {});

  elements.toppingGroups.innerHTML = Object.keys(grouped)
    .sort()
    .map((category) => {
      const options = grouped[category]
        .map((topping) => {
          const isSelected = state.selectedToppingIds.has(topping.id);
          return `
            <label class="topping-option ${isSelected ? "is-selected" : ""}">
              <input type="checkbox" data-topping-id="${topping.id}" ${isSelected ? "checked" : ""} />
              <span class="topping-option__name">${topping.name}</span>
              <span class="topping-option__price">+ ${formatCurrency(topping.price)}</span>
            </label>
          `;
        })
        .join("");

      return `
        <div class="topping-group">
          <h4>${category}</h4>
          <div class="topping-grid">${options}</div>
        </div>
      `;
    })
    .join("");
}

function updateSummary() {
  const size = getSizeById(state.selectedSizeId);
  const toppings = getToppingsByIds([...state.selectedToppingIds]);

  const unitPrice = size ? calculateUnitPrice(size.id, toppings.map((item) => item.id)) : 0;
  const itemTotal = unitPrice * state.selectedQuantity;

  elements.summarySize.textContent = size ? `${size.ml}ml` : "Selecione um tamanho";
  elements.summaryToppings.textContent = toppings.length
    ? toppings.map((topping) => topping.name).join(", ")
    : "Sem adicionais";
  elements.summaryUnit.textContent = formatCurrency(unitPrice);
  elements.summaryQuantity.textContent = String(state.selectedQuantity);
  elements.summaryItemTotal.textContent = formatCurrency(itemTotal);
  elements.addToCartButton.disabled = !size;
}

function renderCart() {
  if (!state.menu) return;

  const { total, itemsCount } = calculateCartTotals();

  elements.cartItemsCount.textContent = `${itemsCount} ${itemsCount === 1 ? "item" : "itens"}`;
  elements.cartTriggerCount.textContent = String(itemsCount);
  elements.cartTotal.textContent = formatCurrency(total);
  elements.checkoutTotal.textContent = formatCurrency(total);
  elements.goCheckoutButton.disabled = state.cart.length === 0;

  if (!state.cart.length) {
    elements.cartItems.innerHTML = "";
    elements.cartEmpty.style.display = "block";
    return;
  }

  elements.cartEmpty.style.display = "none";
  elements.cartItems.innerHTML = state.cart
    .map((item) => {
      const size = getSizeById(item.sizeId);
      if (!size) return "";

      const toppings = getToppingsByIds(item.toppingIds);
      const quantity = Math.max(1, Number.parseInt(item.quantity, 10) || 1);
      const unitPrice = calculateUnitPrice(item.sizeId, item.toppingIds);
      const itemTotal = unitPrice * quantity;

      return `
        <li class="cart-item">
          <p class="cart-item__title">${quantity}x ${size.label}</p>
          <p class="cart-item__meta">${
            toppings.length ? toppings.map((topping) => topping.name).join(", ") : "Sem adicionais"
          }</p>
          <p class="cart-item__meta">Unitário: ${formatCurrency(unitPrice)}</p>
          <div class="cart-item__row">
            <div class="cart-item__controls">
              <button type="button" data-cart-action="decrease" data-cart-id="${item.id}" aria-label="Diminuir">-</button>
              <strong>${quantity}</strong>
              <button type="button" data-cart-action="increase" data-cart-id="${item.id}" aria-label="Aumentar">+</button>
            </div>
            <strong class="cart-item__total">${formatCurrency(itemTotal)}</strong>
          </div>
          <button type="button" class="remove-btn" data-cart-action="remove" data-cart-id="${item.id}">Remover</button>
        </li>
      `;
    })
    .join("");
}

function sanitizeCart() {
  if (!Array.isArray(state.cart)) {
    state.cart = [];
    persistCart();
    return;
  }

  state.cart = state.cart
    .map((item) => ({
      id: item.id || createCartId(),
      sizeId: normalizeText(item.sizeId),
      toppingIds: normalizeIds(item.toppingIds),
      quantity: Math.max(1, Number.parseInt(item.quantity, 10) || 1)
    }))
    .filter((item) => Boolean(getSizeById(item.sizeId)))
    .map((item) => ({
      ...item,
      toppingIds: item.toppingIds.filter((id) => Boolean(getToppingById(id)))
    }));

  persistCart();
}

function hydrateCheckoutFields() {
  elements.customerName.value = state.checkout.name || "";
  elements.customerAddress.value = state.checkout.address || "";
  elements.paymentMethod.value = state.checkout.paymentMethod || "";
  elements.changeFor.value = state.checkout.changeFor || "";
  elements.customerReference.value = state.checkout.reference || "";

  toggleChangeForField();
}

function toggleChangeForField() {
  const paymentMethod = elements.paymentMethod.value;
  const isCash = paymentMethod === "dinheiro";
  elements.changeForWrapper.classList.toggle("is-hidden", !isCash);
  elements.changeFor.required = isCash;

  if (!isCash) {
    elements.changeFor.value = "";
  }
}

function collectCustomerData() {
  const paymentMethod = elements.paymentMethod.value;
  const rawChange = String(elements.changeFor.value || "").replace(",", ".");

  return {
    name: normalizeText(elements.customerName.value),
    address: normalizeText(elements.customerAddress.value),
    paymentMethod,
    changeFor: paymentMethod === "dinheiro" ? Number(rawChange) : null,
    reference: normalizeText(elements.customerReference.value)
  };
}

function validateCustomerData(customer) {
  if (!state.cart.length) {
    showToast("Adicione ao menos 1 item no carrinho.");
    setCartOpen(true);
    return false;
  }

  if (!elements.checkoutForm.checkValidity()) {
    elements.checkoutForm.reportValidity();
    return false;
  }

  if (customer.paymentMethod === "dinheiro" && (!Number.isFinite(customer.changeFor) || customer.changeFor <= 0)) {
    showToast("Informe o valor de troco para pagamento em dinheiro.");
    elements.changeFor.focus();
    return false;
  }

  return true;
}

function buildOrderPayload(customer) {
  return {
    customer,
    cart: state.cart.map((item) => ({
      sizeId: item.sizeId,
      toppingIds: normalizeIds(item.toppingIds),
      quantity: Math.max(1, Number.parseInt(item.quantity, 10) || 1)
    }))
  };
}

function buildFallbackWhatsAppMessage(customer) {
  const lines = ["Pedido:"];

  state.cart.forEach((item) => {
    const size = getSizeById(item.sizeId);
    if (!size) return;

    const toppings = getToppingsByIds(item.toppingIds);
    lines.push(`${item.quantity}x ${size.label}`);
    lines.push(`Adicionais: ${toppings.length ? toppings.map((topping) => topping.name).join(", ") : "Sem adicionais"}`);
  });

  const totals = calculateCartTotals();
  lines.push(`Total: ${formatCurrency(totals.total)}`);
  lines.push(`Nome: ${customer.name}`);
  lines.push(`Endereço: ${customer.address}`);
  lines.push(`Pagamento: ${PAYMENT_LABELS[customer.paymentMethod] || customer.paymentMethod}`);

  if (customer.paymentMethod === "dinheiro" && customer.changeFor) {
    lines.push(`Troco para: ${formatCurrency(customer.changeFor)}`);
  }

  if (customer.reference) {
    lines.push(`Referência: ${customer.reference}`);
  }

  return lines.join("\n");
}

function redirectToWhatsApp(message) {
  const phone = state.menu?.store?.whatsapp || DEFAULT_WHATSAPP;
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const popup = window.open(whatsappUrl, "_blank");
  if (!popup) {
    window.location.href = whatsappUrl;
  }
}

function addCurrentSelectionToCart() {
  if (!state.selectedSizeId) {
    showToast("Selecione um tamanho para continuar.");
    return;
  }

  const toppingIds = normalizeIds([...state.selectedToppingIds]);
  const quantity = Math.max(1, state.selectedQuantity);

  const existingItem = state.cart.find((item) => sameConfiguration(item, state.selectedSizeId, toppingIds));
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    state.cart.push({
      id: createCartId(),
      sizeId: state.selectedSizeId,
      toppingIds,
      quantity
    });
  }

  persistCart();
  renderCart();
  animateCartTrigger();
  showToast("Item adicionado ao carrinho.");

  state.selectedQuantity = 1;
  state.selectedToppingIds.clear();
  renderToppingGroups();
  updateSummary();
}

function updateCartItem(cartId, action) {
  const index = state.cart.findIndex((item) => item.id === cartId);
  if (index < 0) return;

  if (action === "remove") {
    state.cart.splice(index, 1);
  } else if (action === "increase") {
    state.cart[index].quantity += 1;
  } else if (action === "decrease") {
    state.cart[index].quantity -= 1;
    if (state.cart[index].quantity <= 0) {
      state.cart.splice(index, 1);
    }
  }

  persistCart();
  renderCart();
}

async function submitOrder(event) {
  event.preventDefault();

  const customer = collectCustomerData();
  if (!validateCustomerData(customer)) return;

  const originalText = elements.finishOrderButton.textContent;
  elements.finishOrderButton.disabled = true;
  elements.finishOrderButton.textContent = "Enviando pedido...";

  state.checkout = {
    name: customer.name,
    address: customer.address,
    paymentMethod: customer.paymentMethod,
    changeFor: customer.paymentMethod === "dinheiro" ? String(elements.changeFor.value || "") : "",
    reference: customer.reference
  };
  persistCheckout();

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildOrderPayload(customer))
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.message || "Não foi possível finalizar o pedido.");
    }

    redirectToWhatsApp(result.whatsappMessage);
    state.cart = [];
    persistCart();
    renderCart();
    showToast(`Pedido #${result.orderNumber} criado. Abrindo WhatsApp...`);
    closeCart();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    const fallbackMessage = buildFallbackWhatsAppMessage(customer);
    redirectToWhatsApp(fallbackMessage);
    showToast("Servidor indisponível. Abrindo WhatsApp com seu pedido.");
  } finally {
    elements.finishOrderButton.disabled = false;
    elements.finishOrderButton.textContent = originalText;
  }
}

function setupRevealAnimation() {
  const revealElements = document.querySelectorAll(".reveal");
  if (!revealElements.length) return;

  const observer = new IntersectionObserver(
    (entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        instance.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function bindEvents() {
  elements.sizeOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-size-id]");
    if (!button) return;
    state.selectedSizeId = button.dataset.sizeId;
    renderSizeOptions();
    updateSummary();
  });

  elements.toppingGroups.addEventListener("change", (event) => {
    const checkbox = event.target.closest("input[data-topping-id]");
    if (!checkbox) return;

    const toppingId = checkbox.dataset.toppingId;
    if (checkbox.checked) {
      state.selectedToppingIds.add(toppingId);
    } else {
      state.selectedToppingIds.delete(toppingId);
    }

    checkbox.closest(".topping-option")?.classList.toggle("is-selected", checkbox.checked);
    updateSummary();
  });

  elements.decreaseQty.addEventListener("click", () => {
    state.selectedQuantity = Math.max(1, state.selectedQuantity - 1);
    updateSummary();
  });

  elements.increaseQty.addEventListener("click", () => {
    state.selectedQuantity += 1;
    updateSummary();
  });

  elements.addToCartButton.addEventListener("click", addCurrentSelectionToCart);

  elements.cartItems.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;

    updateCartItem(button.dataset.cartId, button.dataset.cartAction);
  });

  elements.cartTrigger.addEventListener("click", () => {
    setCartOpen(true);
  });

  elements.closeCartButton.addEventListener("click", closeCart);
  elements.sheetOverlay.addEventListener("click", closeCart);
  elements.goCheckoutButton.addEventListener("click", scrollToCheckout);

  elements.checkoutForm.addEventListener("input", () => {
    state.checkout = {
      name: elements.customerName.value,
      address: elements.customerAddress.value,
      paymentMethod: elements.paymentMethod.value,
      changeFor: elements.changeFor.value,
      reference: elements.customerReference.value
    };
    persistCheckout();
  });

  elements.paymentMethod.addEventListener("change", () => {
    toggleChangeForField();
    state.checkout.paymentMethod = elements.paymentMethod.value;
    if (elements.paymentMethod.value !== "dinheiro") {
      state.checkout.changeFor = "";
    }
    persistCheckout();
  });

  elements.checkoutForm.addEventListener("submit", submitOrder);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCart();
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 1080px)").matches) {
      closeCart();
    }
  });
}

async function loadMenu() {
  const response = await fetch("/api/menu");
  if (!response.ok) {
    throw new Error("Falha ao carregar cardápio.");
  }

  state.menu = await response.json();
  if (!state.selectedSizeId) {
    state.selectedSizeId = state.menu?.sizes?.[1]?.id || state.menu?.sizes?.[0]?.id || null;
  }

  renderStoreHeader();
  sanitizeCart();
  renderSizeOptions();
  renderToppingGroups();
  updateSummary();
  renderCart();
}

async function init() {
  bindEvents();
  setupRevealAnimation();
  hydrateCheckoutFields();

  try {
    await loadMenu();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    showToast("Não foi possível carregar o cardápio. Tente recarregar.");
  }
}

init();
