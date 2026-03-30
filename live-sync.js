(function () {
  const STORAGE_URL_KEY = "thina_supabase_url";
  const STORAGE_ANON_KEY = "thina_supabase_anon_key";
  let realtimeClient = null;

  function getMeta(name) {
    return document.querySelector(`meta[name="${name}"]`)?.getAttribute("content") ?? "";
  }

  function getConfig() {
    const url = (localStorage.getItem(STORAGE_URL_KEY) || getMeta("supabase-url") || "").trim();
    const anonKey = (localStorage.getItem(STORAGE_ANON_KEY) || getMeta("supabase-anon-key") || "").trim();
    return { url, anonKey };
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(Number(value) || 0);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function ensureBanner() {
    let banner = document.getElementById("liveStoreBanner");
    if (banner) return banner;

    banner = document.createElement("div");
    banner.id = "liveStoreBanner";
    banner.className = "live-store-banner";
    banner.hidden = true;

    const header = document.querySelector(".site-header");
    if (header?.parentNode) {
      header.parentNode.insertBefore(banner, header.nextSibling);
    } else {
      document.body.prepend(banner);
    }

    return banner;
  }

  function lockOrderControls(locked, reason) {
    const selectors = [".order-btn", "#checkoutBtn", "#goToCheckoutBtn", "#addToCartBtn"];

    for (const selector of selectors) {
      const nodes = document.querySelectorAll(selector);
      for (const node of nodes) {
        if (!(node instanceof HTMLButtonElement)) continue;
        if (!node.dataset.originalText) {
          node.dataset.originalText = node.textContent || "";
        }
        if (locked) {
          node.disabled = true;
          if (node.id === "checkoutBtn" || node.id === "goToCheckoutBtn") {
            node.textContent = reason || "Pedidos indisponÃ­veis";
          }
        } else {
          node.disabled = false;
          if (node.dataset.originalText) {
            node.textContent = node.dataset.originalText;
          }
        }
      }
    }
  }

  function applySettings(settings) {
    const banner = ensureBanner();
    const notice = String(settings?.warning_message || "").trim();
    const isOpen = Boolean(settings?.store_open);
    const ordersEnabled = Boolean(settings?.orders_enabled);

    if (!isOpen && notice) {
      banner.textContent = `Loja fechada no momento. ${notice}`;
      banner.hidden = false;
    } else if (!isOpen) {
      banner.textContent = "Loja fechada no momento.";
      banner.hidden = false;
    } else if (notice) {
      banner.textContent = notice;
      banner.hidden = false;
    } else {
      banner.hidden = true;
    }

    const shouldLockOrders = !isOpen || !ordersEnabled;
    const reason = !isOpen ? "Loja fechada no momento" : "Pedidos temporariamente desativados";
    lockOrderControls(shouldLockOrders, reason);
  }

  function ensureLiveCatalogSection() {
    const section = document.getElementById("liveCatalogRealtime");
    if (section) {
      section.remove();
    }
    return null;
  }

  function renderLiveProducts(products) {
    const section = ensureLiveCatalogSection();
    if (!section) return;

    const grid = section.querySelector("#liveProductsGrid");
    if (!grid) return;

    if (!products.length) {
      grid.innerHTML = `<p class="live-products-empty">Nenhum produto ativo no momento.</p>`;
      return;
    }

    const cards = products
      .map((product) => {
        const image = product.image_url
          ? `<img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}" loading="lazy" width="320" height="240" />`
          : `<div class="live-product-placeholder">Sem imagem</div>`;

        return `
          <article class="live-product-card">
            ${image}
            <div class="live-product-body">
              <p class="live-product-category">${escapeHtml(product.category || "Sem categoria")}</p>
              <h3>${escapeHtml(product.name)}</h3>
              <p>${escapeHtml(product.description || "Sem descriÃ§Ã£o")}</p>
              <strong>${formatCurrency(product.price)}</strong>
            </div>
          </article>
        `;
      })
      .join("");

    grid.innerHTML = cards;
  }

  async function persistOrderFromSite(payload) {
    if (!realtimeClient || !payload) return;

    const customerName = String(payload.customer_name || "").trim();
    const customerPhone = String(payload.customer_phone || "").trim();
    const customerAddress = String(payload.customer_address || "").trim();
    const paymentMethod = String(payload.payment_method || "WhatsApp").trim();
    const status = String(payload.status || "pendente").trim();
    const totalPrice = Number(payload.total_price || 0);
    const note = String(payload.note || "").trim();

    if (!customerName || !customerPhone || !customerAddress) return;
    if (!Number.isFinite(totalPrice) || totalPrice < 0) return;

    const { data: orderData, error: orderError } = await realtimeClient
      .from("orders")
      .insert({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        payment_method: paymentMethod,
        status: status || "pendente",
        total_price: totalPrice,
        note: note || null,
      })
      .select("id")
      .single();

    if (orderError || !orderData?.id) {
      return;
    }

    const items = Array.isArray(payload.items) ? payload.items : [];
    const rows = items
      .map((item) => {
        const quantity = Number(item.quantity || 0);
        const unitPrice = Number(item.unit_price || 0);
        const subtotal = Number(item.subtotal || 0);
        const productName = String(item.product_name || "").trim();

        if (!productName || !Number.isFinite(quantity) || quantity <= 0) return null;
        if (!Number.isFinite(unitPrice) || unitPrice < 0) return null;
        if (!Number.isFinite(subtotal) || subtotal < 0) return null;

        return {
          order_id: orderData.id,
          product_id: null,
          product_name: productName,
          unit_price: unitPrice,
          quantity,
          subtotal,
        };
      })
      .filter(Boolean);

    if (rows.length > 0) {
      await realtimeClient.from("order_items").insert(rows);
    }
  }

  async function init() {
    const config = getConfig();
    if (!config.url || !config.anonKey) return;
    if (!window.supabase || typeof window.supabase.createClient !== "function") return;

    const client = window.supabase.createClient(config.url, config.anonKey);
    realtimeClient = client;

    const loadSettings = async () => {
      const { data } = await client.from("store_settings").select("*").limit(1).maybeSingle();
      if (data) {
        applySettings(data);
      }
    };

    const loadProducts = async () => {
      const { data } = await client
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

      renderLiveProducts(data || []);
    };

    await Promise.all([loadSettings(), loadProducts()]);

    client
      .channel("public-live-settings")
      .on("postgres_changes", { event: "*", schema: "public", table: "store_settings" }, () => {
        loadSettings().catch(() => {});
      })
      .subscribe();

    client
      .channel("public-live-products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        loadProducts().catch(() => {});
      })
      .subscribe();

    document.addEventListener("thina:order-submitted", (event) => {
      persistOrderFromSite(event?.detail).catch(() => {});
    });
  }

  init().catch(() => {});
})();

