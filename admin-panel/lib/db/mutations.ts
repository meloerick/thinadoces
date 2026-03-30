import { normalizeOptionalText, normalizePrice } from "@/lib/utils/format";
import type { OrderStatus, OrderWithItems, Product } from "@/types";
import type { Database } from "@/types/database";

import type { DbClient } from "./queries";

export async function updateStoreSettings(
  client: DbClient,
  input: Database["public"]["Tables"]["store_settings"]["Update"],
) {
  const { data, error } = await client
    .from("store_settings")
    .update({
      orders_enabled: input.orders_enabled,
      store_open: input.store_open,
      warning_message: input.warning_message,
    })
    .eq("id", input.id as string)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateOrderStatus(client: DbClient, orderId: string, status: OrderStatus) {
  const { data, error } = await client
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createOrder(
  client: DbClient,
  input: Database["public"]["Tables"]["orders"]["Insert"],
): Promise<OrderWithItems> {
  const { data, error } = await client
    .from("orders")
    .insert({
      customer_name: input.customer_name.trim(),
      customer_phone: input.customer_phone.trim(),
      customer_address: input.customer_address.trim(),
      note: normalizeOptionalText(input.note ?? ""),
      payment_method: input.payment_method.trim(),
      status: input.status ?? "pendente",
      total_price: normalizePrice(Number(input.total_price)),
    })
    .select(
      `
      *,
      order_items (
        id,
        order_id,
        product_id,
        product_name,
        unit_price,
        quantity,
        subtotal
      )
      `,
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as OrderWithItems;
}

export async function deleteOrder(client: DbClient, orderId: string) {
  const { error } = await client.from("orders").delete().eq("id", orderId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createProduct(
  client: DbClient,
  input: Database["public"]["Tables"]["products"]["Insert"],
): Promise<Product> {
  const { data, error } = await client
    .from("products")
    .insert({
      name: input.name,
      description: normalizeOptionalText(input.description ?? ""),
      price: normalizePrice(Number(input.price)),
      image_url: normalizeOptionalText(input.image_url ?? ""),
      category: normalizeOptionalText(input.category ?? ""),
      active: input.active ?? true,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateProduct(
  client: DbClient,
  productId: string,
  input: Database["public"]["Tables"]["products"]["Update"],
): Promise<Product> {
  const payload: Database["public"]["Tables"]["products"]["Update"] = {};

  if (typeof input.name === "string") payload.name = input.name;
  if (typeof input.description === "string") payload.description = normalizeOptionalText(input.description);
  if (typeof input.image_url === "string") payload.image_url = normalizeOptionalText(input.image_url);
  if (typeof input.category === "string") payload.category = normalizeOptionalText(input.category);
  if (typeof input.active === "boolean") payload.active = input.active;
  if (typeof input.price === "number") payload.price = normalizePrice(input.price);

  const { data, error } = await client
    .from("products")
    .update(payload)
    .eq("id", productId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteProduct(client: DbClient, productId: string) {
  const { error } = await client.from("products").delete().eq("id", productId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function toggleProductActive(client: DbClient, productId: string, active: boolean): Promise<Product> {
  const { data, error } = await client
    .from("products")
    .update({ active })
    .eq("id", productId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
