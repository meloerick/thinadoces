const express = require("express");
const compression = require("compression");
const helmet = require("helmet");
const fs = require("node:fs/promises");
const fsSync = require("node:fs");
const path = require("node:path");

const app = express();
const PORT = Number(process.env.PORT || 3000);

const DATA_DIR = path.join(__dirname, "data");
const MENU_FILE = path.join(DATA_DIR, "menu.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const PUBLIC_DIR = path.join(__dirname, "public");

const PAYMENT_LABELS = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  cartao: "Cartão"
};

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(
  express.static(PUBLIC_DIR, {
    index: "index.html",
    maxAge: process.env.NODE_ENV === "production" ? "1d" : 0
  })
);

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function parseMoney(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueList(list) {
  return [...new Set(list)];
}

async function ensureJsonFile(filePath, fallbackContent) {
  if (!fsSync.existsSync(filePath)) {
    await fs.writeFile(filePath, JSON.stringify(fallbackContent, null, 2), "utf8");
  }
}

async function readJsonFile(filePath, fallbackContent) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    return fallbackContent;
  }
}

async function writeJsonFile(filePath, content) {
  await fs.writeFile(filePath, JSON.stringify(content, null, 2), "utf8");
}

function validateCustomer(customer) {
  if (!customer || typeof customer !== "object") {
    return { ok: false, message: "Dados do cliente ausentes." };
  }

  const name = normalizeText(customer.name);
  const address = normalizeText(customer.address);
  const paymentMethod = normalizeText(customer.paymentMethod).toLowerCase();
  const reference = normalizeText(customer.reference);
  let changeFor = customer.changeFor;

  if (name.length < 3) {
    return { ok: false, message: "Nome do cliente inválido." };
  }

  if (address.length < 8) {
    return { ok: false, message: "Endereço inválido." };
  }

  if (!PAYMENT_LABELS[paymentMethod]) {
    return { ok: false, message: "Forma de pagamento inválida." };
  }

  if (paymentMethod === "dinheiro") {
    const parsed = parseMoney(changeFor);
    if (parsed === null || parsed <= 0) {
      return { ok: false, message: "Informe o troco para pagamento em dinheiro." };
    }
    changeFor = parsed;
  } else {
    changeFor = null;
  }

  return {
    ok: true,
    value: {
      name,
      address,
      paymentMethod,
      reference: reference || "",
      changeFor
    }
  };
}

function buildOrderFromMenu(menu, cart) {
  const menuSizes = ensureArray(menu.sizes);
  const menuToppings = ensureArray(menu.toppings);

  if (!Array.isArray(cart) || cart.length === 0) {
    return { ok: false, message: "Carrinho vazio." };
  }

  const items = [];
  let total = 0;

  for (const rawItem of cart) {
    const quantity = Math.max(1, Number.parseInt(rawItem.quantity, 10) || 1);
    const sizeId = normalizeText(rawItem.sizeId);
    const toppingIds = uniqueList(ensureArray(rawItem.toppingIds).map((id) => normalizeText(id))).filter(Boolean);

    const size = menuSizes.find((option) => option.id === sizeId);
    if (!size) {
      return { ok: false, message: "Tamanho de açaí inválido no carrinho." };
    }

    const toppings = toppingIds.map((id) => menuToppings.find((item) => item.id === id)).filter(Boolean);
    if (toppings.length !== toppingIds.length) {
      return { ok: false, message: "Um ou mais adicionais são inválidos." };
    }

    const toppingTotal = toppings.reduce((sum, topping) => sum + Number(topping.price || 0), 0);
    const unitPrice = Number(size.price || 0) + toppingTotal;
    const itemTotal = unitPrice * quantity;

    total += itemTotal;

    items.push({
      sizeId: size.id,
      sizeLabel: size.label,
      sizeMl: size.ml,
      quantity,
      unitPrice,
      itemTotal,
      toppings: toppings.map((topping) => ({
        id: topping.id,
        name: topping.name,
        price: Number(topping.price || 0)
      }))
    });
  }

  return {
    ok: true,
    value: {
      items,
      total
    }
  };
}

function buildWhatsAppMessage(orderNumber, orderData) {
  const lines = [`Pedido #${orderNumber}:`];

  orderData.items.forEach((item) => {
    lines.push(`${item.quantity}x ${item.sizeLabel}`);
    lines.push(
      `Adicionais: ${item.toppings.length > 0 ? item.toppings.map((topping) => topping.name).join(", ") : "Sem adicionais"}`
    );
    lines.push(`Subtotal: ${formatCurrency(item.itemTotal)}`);
    lines.push("");
  });

  lines.push(`Total: ${formatCurrency(orderData.total)}`);
  lines.push(`Nome: ${orderData.customer.name}`);
  lines.push(`Endereço: ${orderData.customer.address}`);
  lines.push(`Pagamento: ${PAYMENT_LABELS[orderData.customer.paymentMethod]}`);

  if (orderData.customer.paymentMethod === "dinheiro" && orderData.customer.changeFor) {
    lines.push(`Troco para: ${formatCurrency(orderData.customer.changeFor)}`);
  }

  if (orderData.customer.reference) {
    lines.push(`Referência: ${orderData.customer.reference}`);
  }

  lines.push("Pedido enviado pelo site Açaí do Parque.");

  return lines.join("\n");
}

async function ensureDataFiles() {
  if (!fsSync.existsSync(DATA_DIR)) {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  await ensureJsonFile(MENU_FILE, {
    store: {},
    sizes: [],
    toppings: []
  });

  await ensureJsonFile(ORDERS_FILE, []);
}

app.get("/api/menu", async (_request, response) => {
  const menu = await readJsonFile(MENU_FILE, null);
  if (!menu) {
    response.status(500).json({ message: "Não foi possível carregar o cardápio." });
    return;
  }

  response.json(menu);
});

app.post("/api/orders", async (request, response) => {
  const menu = await readJsonFile(MENU_FILE, null);
  if (!menu) {
    response.status(500).json({ message: "Não foi possível validar o pedido." });
    return;
  }

  const customerValidation = validateCustomer(request.body?.customer);
  if (!customerValidation.ok) {
    response.status(400).json({ message: customerValidation.message });
    return;
  }

  const orderBuild = buildOrderFromMenu(menu, request.body?.cart);
  if (!orderBuild.ok) {
    response.status(400).json({ message: orderBuild.message });
    return;
  }

  const orders = await readJsonFile(ORDERS_FILE, []);
  const orderNumber = orders.length + 1;
  const createdAt = new Date().toISOString();
  const orderId = `acai-${Date.now()}-${orderNumber}`;

  const normalizedOrder = {
    id: orderId,
    orderNumber,
    createdAt,
    customer: customerValidation.value,
    items: orderBuild.value.items,
    total: orderBuild.value.total,
    status: "novo"
  };

  orders.push(normalizedOrder);
  await writeJsonFile(ORDERS_FILE, orders);

  const whatsappMessage = buildWhatsAppMessage(orderNumber, normalizedOrder);

  response.status(201).json({
    message: "Pedido criado com sucesso.",
    orderId,
    orderNumber,
    total: normalizedOrder.total,
    formattedTotal: formatCurrency(normalizedOrder.total),
    whatsappMessage
  });
});

app.get("/healthz", (_request, response) => {
  response.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("*", (request, response) => {
  if (request.path.startsWith("/api/")) {
    response.status(404).json({ message: "Rota não encontrada." });
    return;
  }

  response.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.use((error, _request, response, _next) => {
  // eslint-disable-next-line no-console
  console.error("[server-error]", error);
  response.status(500).json({ message: "Erro interno do servidor." });
});

ensureDataFiles()
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Açaí do Parque rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Falha ao iniciar servidor:", error);
    process.exit(1);
  });
