"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bell, PackageCheck, ShoppingCart, Store } from "lucide-react";
import { toast } from "sonner";

import type { DashboardSummary } from "@/types";

import { createClient } from "@/lib/supabase/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface DashboardCardsProps {
  summary: DashboardSummary;
}

export function DashboardCards({ summary }: DashboardCardsProps) {
  const [state, setState] = useState(summary);
  const [saving, setSaving] = useState(false);

  const refreshSettings = useCallback(async () => {
    const response = await fetch("/api/admin/settings", { cache: "no-store" });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message ?? "Falha ao sincronizar configuracoes.");
    }

    setState((current) => ({ ...current, settings: payload.data }));
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-settings-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "store_settings" },
        () => {
          void refreshSettings().catch(() => {
            toast.error("Nao foi possivel atualizar as configuracoes em tempo real.");
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refreshSettings]);

  async function updateSetting(patch: { orders_enabled?: boolean; store_open?: boolean }) {
    try {
      setSaving(true);
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orders_enabled: patch.orders_enabled ?? state.settings.orders_enabled,
          store_open: patch.store_open ?? state.settings.store_open,
          warning_message: state.settings.warning_message,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message ?? "Falha ao atualizar configuracao.");
      }

      setState((current) => ({ ...current, settings: payload.data }));
      toast.success("Configuracao atualizada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar configuracao.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Pedidos</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{state.settings.orders_enabled ? "Ativados" : "Desativados"}</p>
            </div>
            <span className="rounded-xl bg-brand-50 p-3 text-brand-700">
              <ShoppingCart className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <Badge className={state.settings.orders_enabled ? "border-emerald-200 bg-emerald-100 text-emerald-700" : "border-rose-200 bg-rose-100 text-rose-700"}>
              {state.settings.orders_enabled ? "Pedidos ativados" : "Pedidos desativados"}
            </Badge>
            <Switch
              checked={state.settings.orders_enabled}
              disabled={saving}
              onCheckedChange={(checked) => void updateSetting({ orders_enabled: checked })}
            />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Loja</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{state.settings.store_open ? "Aberta" : "Fechada"}</p>
            </div>
            <span className="rounded-xl bg-brand-50 p-3 text-brand-700">
              <Store className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <Badge className={state.settings.store_open ? "border-emerald-200 bg-emerald-100 text-emerald-700" : "border-rose-200 bg-rose-100 text-rose-700"}>
              {state.settings.store_open ? "Loja aberta" : "Loja fechada"}
            </Badge>
            <Switch
              checked={state.settings.store_open}
              disabled={saving}
              onCheckedChange={(checked) => void updateSetting({ store_open: checked })}
            />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total de pedidos</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{state.totalOrders}</p>
            </div>
            <span className="rounded-xl bg-brand-50 p-3 text-brand-700">
              <Bell className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">Pendentes: {state.pendingOrders} | Hoje: {state.todayOrders}</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Produtos ativos</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{state.activeProducts}</p>
            </div>
            <span className="rounded-xl bg-brand-50 p-3 text-brand-700">
              <PackageCheck className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">Catalogo publico utiliza apenas ativos.</p>
        </Card>
      </div>

      <Card title="Mensagem de aviso atual" description="Informacao exibida no site principal.">
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          {state.settings.warning_message || "Nenhuma mensagem cadastrada no momento."}
        </p>
      </Card>

      <Card title="Acoes rapidas" description="Acesse as areas principais do painel com um clique.">
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/orders">
            <Button>Gerenciar pedidos</Button>
          </Link>
          <Link href="/admin/products">
            <Button variant="secondary">Gerenciar produtos</Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="secondary">Configurar loja</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}