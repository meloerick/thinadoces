import type { User } from "@supabase/supabase-js";

import type { Database } from "./database";

export const ORDER_STATUSES = [
  "pendente",
  "confirmado",
  "em preparo",
  "saiu para entrega",
  "concluido",
  "cancelado",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type StoreSettings = Database["public"]["Tables"]["store_settings"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface DashboardSummary {
  settings: StoreSettings;
  totalOrders: number;
  activeProducts: number;
  pendingOrders: number;
  todayOrders: number;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  lastSignInAt: string | null;
}

export const toAdminUser = (user: User): AdminUser => ({
  id: user.id,
  email: user.email ?? "",
  role: (user.app_metadata?.role as string | undefined) ?? "user",
  lastSignInAt: user.last_sign_in_at ?? null,
});
