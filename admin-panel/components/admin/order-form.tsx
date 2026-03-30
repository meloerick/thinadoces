"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { toast } from "sonner";

import { ORDER_STATUSES } from "@/types";

import { STATUS_LABELS } from "@/lib/utils/constants";
import { normalizePrice } from "@/lib/utils/format";
import { createOrderSchema, type CreateOrderInput } from "@/lib/validations/order";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface OrderFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const DEFAULT_VALUES: CreateOrderInput = {
  customer_name: "",
  customer_phone: "",
  customer_address: "",
  payment_method: "",
  status: "pendente",
  total_price: 0,
  note: "",
};

export function OrderForm({ open, onClose, onSaved }: OrderFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) {
      reset(DEFAULT_VALUES);
    }
  }, [open, reset]);

  async function onSubmit(values: CreateOrderInput) {
    try {
      const response = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          total_price: normalizePrice(values.total_price),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message ?? "Erro ao criar pedido.");
      }

      toast.success("Pedido criado com sucesso.");
      reset(DEFAULT_VALUES);
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao criar pedido.");
    }
  }

  return (
    <Modal title="Novo pedido" open={open} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Nome do cliente</label>
            <Input placeholder="Ex: Maria da Silva" {...register("customer_name")} />
            {errors.customer_name ? (
              <p className="mt-1 text-xs text-rose-600">{errors.customer_name.message}</p>
            ) : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Telefone</label>
            <Input placeholder="(51) 99999-9999" {...register("customer_phone")} />
            {errors.customer_phone ? <p className="mt-1 text-xs text-rose-600">{errors.customer_phone.message}</p> : null}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Endereco</label>
          <Input placeholder="Rua, numero, bairro e referencia" {...register("customer_address")} />
          {errors.customer_address ? (
            <p className="mt-1 text-xs text-rose-600">{errors.customer_address.message}</p>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Pagamento</label>
            <Input placeholder="Pix, cartao, dinheiro" {...register("payment_method")} />
            {errors.payment_method ? (
              <p className="mt-1 text-xs text-rose-600">{errors.payment_method.message}</p>
            ) : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Status</label>
            <Select {...register("status")}>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
            {errors.status ? <p className="mt-1 text-xs text-rose-600">{errors.status.message}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Valor total</label>
            <Input type="number" min="0" step="0.01" placeholder="0.00" {...register("total_price", { valueAsNumber: true })} />
            {errors.total_price ? <p className="mt-1 text-xs text-rose-600">{errors.total_price.message}</p> : null}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Observacao</label>
          <Textarea rows={3} placeholder="Opcional" {...register("note")} />
          {errors.note ? <p className="mt-1 text-xs text-rose-600">{errors.note.message}</p> : null}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Criar pedido
          </Button>
        </div>
      </form>
    </Modal>
  );
}
