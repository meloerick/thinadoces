import { ORDER_STATUSES } from "@/types";

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/products", label: "Produtos" },
  { href: "/admin/settings", label: "Configuracoes" },
] as const;

export const STATUS_LABELS: Record<(typeof ORDER_STATUSES)[number], string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  "em preparo": "Em preparo",
  "saiu para entrega": "Saiu para entrega",
  concluido: "Concluido",
  cancelado: "Cancelado",
};

export const STATUS_COLORS: Record<(typeof ORDER_STATUSES)[number], string> = {
  pendente: "bg-amber-100 text-amber-800 border-amber-200",
  confirmado: "bg-sky-100 text-sky-800 border-sky-200",
  "em preparo": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "saiu para entrega": "bg-violet-100 text-violet-800 border-violet-200",
  concluido: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelado: "bg-rose-100 text-rose-800 border-rose-200",
};

export const LOGIN_REDIRECT = "/admin";

export const ALLOWED_ADMIN_EMAIL = "thinadoces@gmail.com";
