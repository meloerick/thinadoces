"use client";

import type { OrderStatus, OrderWithItems } from "@/types";
import { ORDER_STATUSES } from "@/types";

import { STATUS_LABELS } from "@/lib/utils/constants";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";

import { StatusBadge } from "./status-badge";

interface OrderDetailsModalProps {
  order: OrderWithItems | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (status: string) => void;
  saving: boolean;
}

export function OrderDetailsModal({ order, open, onClose, onStatusChange, saving }: OrderDetailsModalProps) {
  if (!order) {
    return null;
  }

  return (
    <Modal title={`Pedido ${order.id.slice(0, 8)}`} open={open} onClose={onClose}>
      <div className="space-y-4 text-sm text-slate-700">
        <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase text-slate-500">Cliente</p>
            <p className="font-semibold text-slate-900">{order.customer_name}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Telefone</p>
            <p>{order.customer_phone}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs uppercase text-slate-500">Endereco</p>
            <p>{order.customer_address}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Pagamento</p>
            <p>{order.payment_method}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Data</p>
            <p>{formatDateTime(order.created_at)}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs uppercase text-slate-500">Observacao</p>
            <p>{order.note || "Sem observacoes"}</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase text-slate-500">Itens do pedido</p>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Produto</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Qtd</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Unitario</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {order.order_items.length === 0 ? (
                  <tr>
                    <td className="px-3 py-3 text-slate-500" colSpan={4}>
                      Este pedido nao possui itens cadastrados.
                    </td>
                  </tr>
                ) : (
                  order.order_items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">{item.product_name}</td>
                      <td className="px-3 py-2">{item.quantity}</td>
                      <td className="px-3 py-2">{formatCurrency(item.unit_price)}</td>
                      <td className="px-3 py-2">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <StatusBadge status={order.status as OrderStatus} />
            <span className="text-sm text-slate-500">Total: {formatCurrency(order.total_price)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Select
              className="w-52"
              value={order.status}
              onChange={(event) => onStatusChange(event.target.value)}
              disabled={saving}
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
