import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DashboardSummary, OrderStatus, OrderWithItems, Product, StoreSettings } from "@/types";

export type DbClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

export interface OrderFilters {
  status?: OrderStatus | "all";
  search?: string;
}

export async function getStoreSettings(client: DbClient): Promise<StoreSettings> {
  const { data, error } = await client.from("store_settings").select("*").single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getProducts(client: DbClient): Promise<Product[]> {
  const { data, error } = await client
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getOrders(client: DbClient, filters: OrderFilters = {}): Promise<OrderWithItems[]> {
  let query = client
    .from("orders")
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
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.search && filters.search.trim().length > 0) {
    const sanitized = filters.search.trim();
    query = query.or(`customer_name.ilike.%${sanitized}%,customer_phone.ilike.%${sanitized}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as OrderWithItems[];
}

export async function getDashboardSummary(client: DbClient): Promise<DashboardSummary> {
  const [settings, ordersCount, activeProductsCount, pendingOrdersCount, todayOrdersCount] = await Promise.all([
    getStoreSettings(client),
    client.from("orders").select("id", { count: "exact", head: true }),
    client.from("products").select("id", { count: "exact", head: true }).eq("active", true),
    client.from("orders").select("id", { count: "exact", head: true }).eq("status", "pendente"),
    client
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ]);

  const error =
    ordersCount.error ??
    activeProductsCount.error ??
    pendingOrdersCount.error ??
    todayOrdersCount.error;

  if (error) {
    throw new Error(error.message);
  }

  return {
    settings,
    totalOrders: ordersCount.count ?? 0,
    activeProducts: activeProductsCount.count ?? 0,
    pendingOrders: pendingOrdersCount.count ?? 0,
    todayOrders: todayOrdersCount.count ?? 0,
  };
}
