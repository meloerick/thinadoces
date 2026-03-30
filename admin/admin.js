(function () {
  const ALLOWED_EMAIL = "thinadoces@gmail.com";
  const STORAGE_URL_KEY = "thina_supabase_url";
  const STORAGE_ANON_KEY = "thina_supabase_anon_key";
  const DISABLED_PRODUCTS_KEY = "thina_disabled_products_v1";
  const DISABLED_ACAI_COMPLEMENTS_KEY = "thina_disabled_acai_complements_v1";
  const ACAI_OPTIONS_GROUPS = [
    {
      key: "complementos",
      label: "Complementos",
      items: [
        { name: "Leite condensado", price: 0 },
        { name: "Uva verde", price: 0 },
        { name: "Leite em pó", price: 0 },
        { name: "Banana", price: 0 },
        { name: "Abacaxi", price: 0 },
        { name: "Paçoca", price: 0 },
        { name: "Amendoim", price: 0 },
        { name: "Granola", price: 0 },
        { name: "Chocobool", price: 0 },
        { name: "Confetes", price: 0 },
        { name: "Cobertura de morango", price: 0 },
        { name: "Cobertura de chocolate", price: 0 },
      ],
    },
    {
      key: "descartaveis",
      label: "Descartáveis",
      items: [
        { name: "Colher", price: 0 },
      ],
    },
    {
      key: "adicionais",
      label: "Adicionais",
      items: [
        { name: "Creme de morango", price: 5 },
        { name: "Morango", price: 4 },
        { name: "Creme de ninho", price: 5 },
        { name: "Nutella", price: 7 },
        { name: "Brigadeiro", price: 5 },
        { name: "Branquinho", price: 5 },
        { name: "Mousse de maracujá", price: 5 },
        { name: "Geleia de morango", price: 4 },
        { name: "Geleia de maracujá", price: 4 },
        { name: "Ovomaltine", price: 4 },
        { name: "Negresco triturado", price: 4 },
        { name: "Oreo", price: 4 },
        { name: "Laka", price: 4 },
        { name: "Kinder Bueno", price: 5 },
        { name: "Brownie", price: 5 },
      ],
    },
  ];

  const refs = {
    loginView: document.getElementById("loginView"),
    appView: document.getElementById("appView"),
    configBox: document.getElementById("configBox"),
    loginForm: document.getElementById("loginForm"),
    supabaseConfigForm: document.getElementById("supabaseConfigForm"),
    clearSupabaseConfigBtn: document.getElementById("clearSupabaseConfigBtn"),
    loginFeedback: document.getElementById("loginFeedback"),
    productsFeedback: document.getElementById("productsFeedback"),
    acaiFeedback: document.getElementById("acaiFeedback"),
    switchSupabaseBtn: document.getElementById("switchSupabaseBtn"),
    logoutBtn: document.getElementById("logoutBtn"),
    refreshCatalogBtn: document.getElementById("refreshCatalogBtn"),
    adminEmailBadge: document.getElementById("adminEmailBadge"),
    emailInput: document.getElementById("emailInput"),
    passwordInput: document.getElementById("passwordInput"),
    supabaseUrlInput: document.getElementById("supabaseUrlInput"),
    supabaseAnonKeyInput: document.getElementById("supabaseAnonKeyInput"),
    acaiComplementsContainer: document.getElementById("acaiComplementsContainer"),
    catalogAdminContainer: document.getElementById("catalogAdminContainer"),
    statActiveItems: document.getElementById("statActiveItems"),
    statInactiveItems: document.getElementById("statInactiveItems"),
    statTotalItems: document.getElementById("statTotalItems"),
  };

  const state = {
    categories: [],
    disabledSet: new Set(),
    disabledAcaiComplementsSet: new Set(),
  };

  let supabaseClient = null;
  let isEnteringApp = false;
  let canSyncProductsTable = null;
  let authSubscription = null;

  function getMetaContent(name) {
    return document.querySelector(`meta[name="${name}"]`)?.getAttribute("content") ?? "";
  }

  function getSupabaseConfig() {
    const url = (localStorage.getItem(STORAGE_URL_KEY) || getMetaContent("supabase-url") || "").trim();
    const anonKey = (localStorage.getItem(STORAGE_ANON_KEY) || getMetaContent("supabase-anon-key") || "").trim();
    return { url, anonKey };
  }

  function saveSupabaseConfig(url, anonKey) {
    localStorage.setItem(STORAGE_URL_KEY, String(url || "").trim());
    localStorage.setItem(STORAGE_ANON_KEY, String(anonKey || "").trim());
  }

  function clearSupabaseConfig() {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_ANON_KEY);
  }

  function normalizeSupabaseUrl(rawValue) {
    const raw = String(rawValue || "").trim();
    if (!raw) return "";

    let parsed;
    try {
      parsed = new URL(raw);
    } catch {
      return "";
    }

    if (parsed.protocol !== "https:") return "";

    parsed.pathname = "/";
    parsed.search = "";
    parsed.hash = "";

    return parsed.toString().replace(/\/$/, "");
  }

  function isSupabaseProjectUrl(url) {
    try {
      const host = new URL(url).hostname.toLowerCase();
      return host.endsWith(".supabase.co") || host.endsWith(".supabase.in");
    } catch {
      return false;
    }
  }

  function toFriendlyError(error, fallbackMessage) {
    const message = String(error?.message || "").trim();
    const lower = message.toLowerCase();

    if (lower.includes("failed to fetch") || lower.includes("networkerror")) {
      return "Falha de conexao com Supabase. Confira URL e Anon Key.";
    }

    if (lower.includes("invalid api key") || lower.includes("apikey")) {
      return "Anon Key invalida. Cole a chave anon/public completa.";
    }

    if (lower.includes("invalid login credentials")) {
      return "Email ou senha invalidos.";
    }

    if (lower.includes("email not confirmed")) {
      return "Confirme o email no Supabase Auth antes de logar.";
    }

    if (lower.includes("not authorized") || lower.includes("unauthorized")) {
      return "Usuario nao autorizado para este painel.";
    }

    return message || fallbackMessage || "Erro inesperado.";
  }

  function setFeedback(element, message, type) {
    if (!element) return;
    element.textContent = message || "";
    element.classList.remove("error", "success");
    if (type) {
      element.classList.add(type);
    }
  }

  function setLoading(button, loading, loadingText) {
    if (!button) return;

    if (loading) {
      button.dataset.originalText = button.textContent || "";
      button.textContent = loadingText;
      button.disabled = true;
      return;
    }

    button.disabled = false;
    if (button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
    }
  }

  function normalizeProductKey(name) {
    return String(name || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function parseJsonArray(text) {
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function loadDisabledSet() {
    const stored = localStorage.getItem(DISABLED_PRODUCTS_KEY);
    const list = parseJsonArray(stored);
    return new Set(
      list
        .map((item) => normalizeProductKey(item))
        .filter(Boolean),
    );
  }

  function saveDisabledSet(disabledSet) {
    const data = Array.from(disabledSet.values());
    localStorage.setItem(DISABLED_PRODUCTS_KEY, JSON.stringify(data));
    try {
      document.dispatchEvent(new CustomEvent("thina:disabled-products-updated", { detail: data }));
    } catch {
      // no-op
    }
  }

  function loadDisabledAcaiComplementsSet() {
    const stored = localStorage.getItem(DISABLED_ACAI_COMPLEMENTS_KEY);
    const list = parseJsonArray(stored);
    return new Set(
      list
        .map((item) => normalizeProductKey(item))
        .filter(Boolean),
    );
  }

  function saveDisabledAcaiComplementsSet(disabledSet) {
    const data = Array.from(disabledSet.values());
    localStorage.setItem(DISABLED_ACAI_COMPLEMENTS_KEY, JSON.stringify(data));
    try {
      document.dispatchEvent(new CustomEvent("thina:disabled-acai-complements-updated", { detail: data }));
    } catch {
      // no-op
    }
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(Number(value) || 0);
  }

  function formatAcaiOptionPrice(price) {
    const amount = Number(price || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return "Grátis";
    }
    return `+${formatCurrency(amount)}`;
  }

  function parseCatalogPrice(rawText) {
    const text = String(rawText || "");
    const matches = text.match(/\d{1,3}(?:\.\d{3})*,\d{2}/g);
    const selected = matches?.length ? matches[matches.length - 1] : text;
    const normalized = String(selected).replace(/\./g, "").replace(",", ".");
    const value = Number(normalized.replace(/[^\d.-]/g, ""));
    return Number.isFinite(value) ? value : 0;
  }

  function normalizeImageUrl(path) {
    const image = String(path || "").trim();
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://")) return image;
    if (image.startsWith("/")) return image;
    return `/${image.replace(/^\.?\//, "")}`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showLogin() {
    if (refs.loginView) refs.loginView.hidden = false;
    if (refs.appView) refs.appView.hidden = true;
  }

  function showApp(email) {
    if (refs.loginView) refs.loginView.hidden = true;
    if (refs.appView) refs.appView.hidden = false;
    if (refs.adminEmailBadge) refs.adminEmailBadge.textContent = email;
  }

  function renderStats() {
    const allItems = state.categories.flatMap((category) => category.items);
    const total = allItems.length;
    const inactive = allItems.filter((item) => state.disabledSet.has(item.key)).length;
    const active = total - inactive;

    if (refs.statActiveItems) refs.statActiveItems.textContent = String(active);
    if (refs.statInactiveItems) refs.statInactiveItems.textContent = String(inactive);
    if (refs.statTotalItems) refs.statTotalItems.textContent = String(total);
  }

  function renderAcaiComplements() {
    const container = refs.acaiComplementsContainer;
    if (!container) return;

    const groupsHtml = ACAI_OPTIONS_GROUPS.map((group) => {
      const rows = group.items.map((item) => {
        const key = normalizeProductKey(item.name);
        const isInactive = state.disabledAcaiComplementsSet.has(key);

        return `
          <article class="acai-complement-item ${isInactive ? "is-inactive" : ""}">
            <div class="acai-complement-info">
              <strong>${escapeHtml(item.name)}</strong>
              <span class="acai-complement-price">${escapeHtml(formatAcaiOptionPrice(item.price))}</span>
              <span class="status-pill ${isInactive ? "inactive" : "active"}">
                ${isInactive ? "Indisponivel" : "Disponivel"}
              </span>
            </div>
            <button
              class="btn toggle-item-btn ${isInactive ? "" : "off"}"
              type="button"
              data-action="toggle-acai-complement"
              data-complement-key="${escapeHtml(key)}"
              data-complement-name="${escapeHtml(item.name)}"
            >
              ${isInactive ? "Voltar para acai" : "Marcar como acabou"}
            </button>
          </article>
        `;
      }).join("");

      return `
        <section class="acai-group-block">
          <header class="acai-group-block-head">
            <strong>${escapeHtml(group.label)}</strong>
            <span>${group.items.length} item(ns)</span>
          </header>
          ${rows}
        </section>
      `;
    }).join("");

    container.innerHTML = groupsHtml;
  }

  function renderCatalog() {
    const container = refs.catalogAdminContainer;
    if (!container) return;

    container.innerHTML = "";

    if (!state.categories.length) {
      container.innerHTML = '<article class="empty-state">Nenhum item encontrado no cardapio principal.</article>';
      renderStats();
      return;
    }

    for (const category of state.categories) {
      const section = document.createElement("section");
      section.className = "admin-category";

      const itemsHtml = category.items
        .map((item) => {
          const isInactive = state.disabledSet.has(item.key);
          const imageHtml = item.imageUrl
            ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}" loading="lazy" />`
            : '<div class="admin-item-photo-empty">Sem imagem</div>';

          return `
            <article class="admin-item ${isInactive ? "is-inactive" : ""}">
              ${imageHtml}
              <div class="admin-item-body">
                <h4>${escapeHtml(item.name)}</h4>
                <p class="admin-item-meta">${escapeHtml(item.description || "Sem descricao")}</p>
                <p class="admin-item-price">${escapeHtml(item.priceLabel || formatCurrency(item.price))}</p>
              </div>
              <div class="admin-item-actions">
                <span class="status-pill ${isInactive ? "inactive" : "active"}">
                  ${isInactive ? "Indisponivel" : "Disponivel"}
                </span>
                <button
                  class="btn toggle-item-btn ${isInactive ? "" : "off"}"
                  type="button"
                  data-action="toggle-item"
                  data-product-key="${escapeHtml(item.key)}"
                  data-product-name="${escapeHtml(item.name)}"
                  data-product-category="${escapeHtml(item.category)}"
                  data-product-description="${escapeHtml(item.description || "")}" 
                  data-product-price="${String(item.price || 0)}"
                  data-product-image="${escapeHtml(item.imageUrl || "")}" 
                >
                  ${isInactive ? "Voltar para pedido" : "Marcar como acabou"}
                </button>
              </div>
            </article>
          `;
        })
        .join("");

      section.innerHTML = `
        <header class="admin-category-head">
          <h3>${escapeHtml(category.name)}</h3>
          <span>${category.items.length} item(ns)</span>
        </header>
        <div class="admin-items">${itemsHtml}</div>
      `;

      container.appendChild(section);
    }

    renderStats();
  }

  async function fetchCatalogFromMainSite() {
    const response = await fetch("/index.html", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Nao foi possivel ler o cardapio do site principal.");
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const categoryNodes = Array.from(doc.querySelectorAll("#servicos .catalog-category"));

    const categories = categoryNodes
      .map((categoryNode) => {
        const categoryName = String(
          categoryNode.querySelector(".catalog-category-title h3")?.textContent || "Sem categoria",
        ).trim();
        const categoryKey = normalizeProductKey(categoryName);
        const isAcaiCategory = categoryKey.includes("acai");

        const itemNodes = Array.from(categoryNode.querySelectorAll(".catalog-item"));
        const items = itemNodes
          .map((itemNode) => {
            const orderButton = itemNode.querySelector(".order-btn");
            const headingName = String(itemNode.querySelector("h4")?.textContent || "").trim();
            const buttonName = String(orderButton?.getAttribute("data-product") || "").trim();
            const name = headingName || buttonName;
            if (!name) return null;

            const description = String(itemNode.querySelector(".catalog-item-description")?.textContent || "").trim();
            const priceLabel = String(
              itemNode.querySelector(".catalog-item-price")?.textContent || orderButton?.getAttribute("data-price") || "",
            ).trim();
            const price = parseCatalogPrice(priceLabel);
            const imageUrl = normalizeImageUrl(itemNode.querySelector("img")?.getAttribute("src") || "");

            return {
              key: normalizeProductKey(name),
              name,
              description,
              price,
              priceLabel,
              imageUrl,
              category: categoryName,
            };
          })
          .filter(Boolean);

        return {
          name: categoryName,
          isAcaiCategory,
          items,
        };
      })
      .filter((category) => category.items.length > 0 && !category.isAcaiCategory);

    return categories;
  }

  async function detectProductsTableSupport() {
    if (!supabaseClient) return false;
    if (canSyncProductsTable !== null) return canSyncProductsTable;

    const { error } = await supabaseClient.from("products").select("id").limit(1);

    if (error) {
      const message = String(error.message || "").toLowerCase();
      if (error.code === "PGRST205" || message.includes("could not find the table") || message.includes("relation")) {
        canSyncProductsTable = false;
        return false;
      }

      canSyncProductsTable = false;
      return false;
    }

    canSyncProductsTable = true;
    return true;
  }

  async function syncProductStatusToSupabase(productPayload, isActive) {
    if (!supabaseClient) return;
    const supportsProducts = await detectProductsTableSupport();
    if (!supportsProducts) return;

    const payload = {
      name: productPayload.name,
      description: productPayload.description || null,
      price: Number(productPayload.price) || 0,
      image_url: productPayload.imageUrl || null,
      category: productPayload.category || null,
      active: Boolean(isActive),
    };

    const { data, error } = await supabaseClient
      .from("products")
      .update(payload)
      .eq("name", productPayload.name)
      .select("id")
      .limit(1);

    if (error) {
      const message = String(error.message || "").toLowerCase();
      if (error.code === "PGRST205" || message.includes("could not find the table") || message.includes("relation")) {
        canSyncProductsTable = false;
        return;
      }
      throw error;
    }

    if (Array.isArray(data) && data.length > 0) {
      return;
    }

    const { error: insertError } = await supabaseClient.from("products").insert(payload);
    if (insertError) {
      const message = String(insertError.message || "").toLowerCase();
      if (insertError.code === "PGRST205" || message.includes("could not find the table") || message.includes("relation")) {
        canSyncProductsTable = false;
        return;
      }
      throw insertError;
    }
  }

  async function refreshCatalog() {
    state.categories = await fetchCatalogFromMainSite();
    state.disabledSet = loadDisabledSet();
    state.disabledAcaiComplementsSet = loadDisabledAcaiComplementsSet();
    renderAcaiComplements();
    renderCatalog();
  }

  async function handleToggleItem(event) {
    const button = event.target.closest("button[data-action='toggle-item']");
    if (!button) return;

    const key = String(button.dataset.productKey || "").trim();
    const name = String(button.dataset.productName || "").trim();
    if (!key || !name) return;

    const isCurrentlyInactive = state.disabledSet.has(key);
    if (isCurrentlyInactive) {
      state.disabledSet.delete(key);
    } else {
      state.disabledSet.add(key);
    }

    saveDisabledSet(state.disabledSet);
    renderCatalog();

    const productPayload = {
      name,
      description: String(button.dataset.productDescription || "").trim(),
      category: String(button.dataset.productCategory || "").trim(),
      imageUrl: String(button.dataset.productImage || "").trim(),
      price: Number(button.dataset.productPrice || 0),
    };

    try {
      await syncProductStatusToSupabase(productPayload, !state.disabledSet.has(key));
      setFeedback(
        refs.productsFeedback,
        state.disabledSet.has(key)
          ? `${name} marcado como indisponivel.`
          : `${name} voltou para pedido.`,
        "success",
      );
    } catch (error) {
      setFeedback(refs.productsFeedback, toFriendlyError(error, "Erro ao salvar status do item."), "error");
    }
  }

  function handleToggleAcaiComplement(event) {
    const button = event.target.closest("button[data-action='toggle-acai-complement']");
    if (!button) return;

    const key = String(button.dataset.complementKey || "").trim();
    const name = String(button.dataset.complementName || "").trim();
    if (!key || !name) return;

    if (state.disabledAcaiComplementsSet.has(key)) {
      state.disabledAcaiComplementsSet.delete(key);
    } else {
      state.disabledAcaiComplementsSet.add(key);
    }

    saveDisabledAcaiComplementsSet(state.disabledAcaiComplementsSet);
    renderAcaiComplements();

    setFeedback(
      refs.acaiFeedback,
      state.disabledAcaiComplementsSet.has(key)
        ? `${name} marcado como indisponivel no acai.`
        : `${name} voltou para o acai.`,
      "success",
    );
  }

  async function enterAdminApp(email) {
    if (isEnteringApp) return;
    isEnteringApp = true;

    try {
      showApp(email);
      setFeedback(refs.loginFeedback, "", null);
      await refreshCatalog();
      setFeedback(refs.productsFeedback, "Lista carregada. Clique nos itens para ativar/desativar.", "success");
      setFeedback(refs.acaiFeedback, "Complementos do acai prontos para controle.", "success");
    } catch (error) {
      setFeedback(refs.productsFeedback, toFriendlyError(error, "Nao foi possivel carregar o cardapio."), "error");
    } finally {
      isEnteringApp = false;
    }
  }

  async function applySession(session) {
    if (!session?.user) {
      showLogin();
      return;
    }

    const email = String(session.user.email || "").trim().toLowerCase();
    if (email !== ALLOWED_EMAIL) {
      await supabaseClient.auth.signOut();
      showLogin();
      setFeedback(refs.loginFeedback, "Usuario nao autorizado para este painel.", "error");
      return;
    }

    await enterAdminApp(email);
  }

  function detachAuthListener() {
    try {
      authSubscription?.unsubscribe?.();
    } catch {
      // no-op
    }
    authSubscription = null;
  }

  function attachAuthListener() {
    if (!supabaseClient) return;
    detachAuthListener();

    const listener = supabaseClient.auth.onAuthStateChange((_event, session) => {
      applySession(session).catch((error) => {
        setFeedback(refs.loginFeedback, toFriendlyError(error, "Falha ao atualizar sessao."), "error");
      });
    });

    authSubscription = listener?.data?.subscription || null;
  }

  function createSupabaseClient(url, anonKey) {
    supabaseClient = window.supabase.createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });

    canSyncProductsTable = null;
    attachAuthListener();
  }

  async function bootSession() {
    if (!supabaseClient) {
      showLogin();
      return;
    }

    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    await applySession(data.session);
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setFeedback(refs.loginFeedback, "", null);

    if (!supabaseClient) {
      setFeedback(refs.loginFeedback, "Configure o Supabase antes do login.", "error");
      return;
    }

    const email = String(refs.emailInput?.value || "").trim().toLowerCase();
    const password = String(refs.passwordInput?.value || "");

    if (email !== ALLOWED_EMAIL) {
      setFeedback(refs.loginFeedback, "Somente o usuario autorizado pode entrar.", "error");
      return;
    }

    const loginButton = refs.loginForm?.querySelector("button[type='submit']");
    setLoading(loginButton, true, "Entrando...");

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const session = data?.session;
      if (!session?.user) {
        const sessionResult = await supabaseClient.auth.getSession();
        if (sessionResult.error) throw sessionResult.error;
        await applySession(sessionResult.data.session);
      } else {
        await applySession(session);
      }
    } catch (error) {
      setFeedback(refs.loginFeedback, toFriendlyError(error, "Falha no login."), "error");
    } finally {
      setLoading(loginButton, false, "");
    }
  }

  async function handleLogout() {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    showLogin();
  }

  async function handleSwitchSupabase() {
    clearSupabaseConfig();

    if (refs.supabaseUrlInput) refs.supabaseUrlInput.value = "";
    if (refs.supabaseAnonKeyInput) refs.supabaseAnonKeyInput.value = "";
    if (refs.configBox) refs.configBox.hidden = false;

    if (supabaseClient) {
      try {
        await supabaseClient.auth.signOut();
      } catch {
        // no-op
      }
    }

    detachAuthListener();
    supabaseClient = null;

    showLogin();
    setFeedback(refs.loginFeedback, "Key atual apagada. Cadastre a nova conexao Supabase.", "success");
  }

  async function handleSupabaseConfigSubmit(event) {
    event.preventDefault();

    const saveButton = refs.supabaseConfigForm?.querySelector("button[type='submit']");
    const url = normalizeSupabaseUrl(refs.supabaseUrlInput?.value || "");
    const anonKey = String(refs.supabaseAnonKeyInput?.value || "").trim();

    if (!url) {
      setFeedback(refs.loginFeedback, "Supabase URL invalida. Use https://SEU-PROJETO.supabase.co", "error");
      return;
    }

    if (!isSupabaseProjectUrl(url)) {
      setFeedback(refs.loginFeedback, "Supabase URL invalida. Ela precisa terminar com .supabase.co", "error");
      return;
    }

    if (!anonKey || anonKey.length < 100 || !anonKey.startsWith("eyJ")) {
      setFeedback(refs.loginFeedback, "Anon Key invalida. Cole a chave anon/public completa.", "error");
      return;
    }

    setLoading(saveButton, true, "Validando...");

    try {
      const testClient = window.supabase.createClient(url, anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      const { error } = await testClient.auth.getSession();
      if (error) throw error;

      saveSupabaseConfig(url, anonKey);
      createSupabaseClient(url, anonKey);

      if (refs.configBox) refs.configBox.hidden = true;
      setFeedback(refs.loginFeedback, "Configuracao salva com sucesso.", "success");

      await bootSession();
    } catch (error) {
      setFeedback(refs.loginFeedback, toFriendlyError(error, "Erro ao validar Supabase."), "error");
    } finally {
      setLoading(saveButton, false, "");
    }
  }

  function bindEvents() {
    if (refs.supabaseConfigForm) {
      refs.supabaseConfigForm.addEventListener("submit", (event) => {
        handleSupabaseConfigSubmit(event).catch((error) => {
          setFeedback(refs.loginFeedback, toFriendlyError(error, "Erro ao salvar configuracao."), "error");
        });
      });
    }

    if (refs.loginForm) {
      refs.loginForm.addEventListener("submit", (event) => {
        handleLoginSubmit(event).catch((error) => {
          setFeedback(refs.loginFeedback, toFriendlyError(error, "Falha no login."), "error");
        });
      });
    }

    if (refs.clearSupabaseConfigBtn) {
      refs.clearSupabaseConfigBtn.addEventListener("click", () => {
        void handleSwitchSupabase();
      });
    }

    if (refs.switchSupabaseBtn) {
      refs.switchSupabaseBtn.addEventListener("click", () => {
        void handleSwitchSupabase();
      });
    }

    if (refs.logoutBtn) {
      refs.logoutBtn.addEventListener("click", () => {
        void handleLogout();
      });
    }

    if (refs.refreshCatalogBtn) {
      refs.refreshCatalogBtn.addEventListener("click", async () => {
        setLoading(refs.refreshCatalogBtn, true, "Atualizando...");
        try {
          await refreshCatalog();
          setFeedback(refs.productsFeedback, "Lista atualizada com sucesso.", "success");
        } catch (error) {
          setFeedback(refs.productsFeedback, toFriendlyError(error, "Erro ao atualizar lista."), "error");
        } finally {
          setLoading(refs.refreshCatalogBtn, false, "");
        }
      });
    }

    if (refs.catalogAdminContainer) {
      refs.catalogAdminContainer.addEventListener("click", (event) => {
        handleToggleItem(event).catch((error) => {
          setFeedback(refs.productsFeedback, toFriendlyError(error, "Erro ao alterar item."), "error");
        });
      });
    }

    if (refs.acaiComplementsContainer) {
      refs.acaiComplementsContainer.addEventListener("click", (event) => {
        handleToggleAcaiComplement(event);
      });
    }
  }

  async function init() {
    bindEvents();

    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      setFeedback(refs.loginFeedback, "Supabase JS nao carregado.", "error");
      return;
    }

    const config = getSupabaseConfig();
    const normalizedUrl = normalizeSupabaseUrl(config.url);

    if (refs.supabaseUrlInput) refs.supabaseUrlInput.value = config.url;
    if (refs.supabaseAnonKeyInput) refs.supabaseAnonKeyInput.value = config.anonKey;

    const hasStoredConfig = Boolean(config.url || config.anonKey);
    const invalidStoredConfig =
      hasStoredConfig &&
      (!normalizedUrl || !isSupabaseProjectUrl(normalizedUrl) || !config.anonKey.startsWith("eyJ"));

    if (invalidStoredConfig) {
      clearSupabaseConfig();
      if (refs.supabaseUrlInput) refs.supabaseUrlInput.value = "";
      if (refs.supabaseAnonKeyInput) refs.supabaseAnonKeyInput.value = "";
      if (refs.configBox) refs.configBox.hidden = false;
      setFeedback(refs.loginFeedback, "Configuracao antiga removida. Informe a nova URL e Anon Key.", "success");
      showLogin();
      return;
    }

    if (!normalizedUrl || !config.anonKey) {
      if (refs.configBox) refs.configBox.hidden = false;
      setFeedback(refs.loginFeedback, "Configure o Supabase para continuar.", "error");
      showLogin();
      return;
    }

    if (refs.configBox) refs.configBox.hidden = true;

    createSupabaseClient(normalizedUrl, config.anonKey);
    await bootSession();
  }

  init().catch((error) => {
    setFeedback(refs.loginFeedback, toFriendlyError(error, "Erro ao iniciar painel."), "error");
    showLogin();
  });
})();
