"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Package, Settings, ShoppingBag } from "lucide-react";

import { ADMIN_NAV_ITEMS } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/format";

const NAV_ICONS = {
  "/admin": LayoutGrid,
  "/admin/orders": ShoppingBag,
  "/admin/products": Package,
  "/admin/settings": Settings,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-200 bg-white/85 px-4 py-6 backdrop-blur md:flex">
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Painel Privado</p>
        <h1 className="mt-1 text-lg font-bold">Thina Doces Admin</h1>
        <p className="mt-2 text-sm text-white/85">Controle total de pedidos, produtos e loja.</p>
      </div>

      <nav className="space-y-1.5">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.href as keyof typeof NAV_ICONS] ?? LayoutGrid;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
