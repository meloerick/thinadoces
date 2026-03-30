"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { OrderStatus, OrderWithItems } from "@/types";
import { ORDER_STATUSES } from "@/types";

import { STATUS_LABELS } from "@/lib/utils/constants";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/client";
import { updateOrderStatusSchema } from "@/lib/validations/order";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

import { OrderDetailsModal } from "./order-details-modal";
import { OrderForm } from "./order-form";
import { StatusBadge } from "./status-badge";

interface OrdersTableProps {
  initialOrders: OrderWithItems[];
}

export function OrdersTable({ initialOrders }: OrdersTableProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOrders = useCallback(async () => {
    const response = await fetch("/api/admin/orders", { cache: "no-store" });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message ?? "Falha ao sincronizar pedidos.");
    }

    const nextOrders = (payload?.data ?? []) as OrderWithItems[];
    setOrders(nextOrders);
    setSelectedOrder((current) => {
      if (!current) {
        return current;
      }
      return nextOrders.find((order) => order.id === current.id) ?? null;
    });
  }, []);

  const scheduleOrdersRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    refreshTimerRef.current = setTimeout(() => {
      void fetchOrders().catch(() => {
        toast.error("Nao foi possivel atualizar os pedidos em tempo real.");
      });
    }, 250);
  }, [fetchOrders]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-orders-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => scheduleOrdersRefresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_items" },
        () => scheduleOrdersRefresh(),
      )
      .subscribe();

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      void supabase.removeChannel(channel);
    };
  }, [scheduleOrdersRefresh]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const statusMatches = statusFilter === "all" || order.status === statusFilter;
      const queryNormalized = query.trim().toLowerCase();
      const queryMatches =
        !queryNormalized ||
        order.customer_name.toLowerCase().includes(queryNormalized) ||
        order.customer_phone.toLowerCase().includes(queryNormalized);

      return statusMatches && queryMatches;
    });
  }, [orders, query, statusFilter]);

  async function handleStatusChange(orderId: string, status: string) {
    const parsed = updateOrderStatusSchema.safeParse({ status });

    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Status invalido.");
      return;
    }

    try {
      setSavingOrderId(orderId);

      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message ?? "Falha ao atualizar status.");
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, status: parsed.data.status } : order,
        ),
      );

      setSelectedOrder((current) =>
        current?.id === orderId ? { ...current, status: parsed.data.status } : current,
      );

      toast.success("Status atualizado com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar status.");
    } finally {
      setSavingOrderId(null);
    }
  }

  async function removeOrder(order: OrderWithItems) {
    const confirmed = window.confirm(`Excluir o pedido de ${order.customer_name}?`);
    if (!confirmed) {
      return;
    }

    try {
      setDeletingOrderId(order.id);

      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "DELETE",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message ?? "Erro ao excluir pedido.");
      }

      setOrders((current) => current.filter((item) => item.id !== order.id));
      setSelectedOrder((current) => (current?.id === order.id ? null : current));
      toast.success("Pedido removido com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao excluir pedido.");
    } finally {
      setDeletingOrderId(null);
    }
  }

  return (
    <Card title="Pedidos" description="Visualize e atualize os pedidos recebidos em tempo real.">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou telefone"
            className="pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Select
          className="md:w-56"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as OrderStatus | "all")}
        >
          <option value="all">Todos os status</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo pedido
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredOrders.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                  Nenhum pedido encontrado para os filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{order.customer_name}</td>
                  <td className="px-4 py-3 text-slate-700">{order.customer_phone}</td>
                  <td className="px-4 py-3 text-slate-700">{formatCurrency(order.total_price)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status as OrderStatus} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">{formatDateTime(order.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Button variant="secondary" onClick={() => setSelectedOrder(order)}>
                        Detalhes
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => void removeOrder(order)}
                        isLoading={deletingOrderId === order.id}
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <OrderForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          void fetchOrders().catch((error) => {
            toast.error(error instanceof Error ? error.message : "Nao foi possivel recarregar os pedidos.");
          });
        }}
      />

      <OrderDetailsModal
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        saving={savingOrderId === selectedOrder?.id}
        onStatusChange={(status) => {
          if (!selectedOrder) return;
          void handleStatusChange(selectedOrder.id, status);
        }}
      />
    </Card>
  );
}
