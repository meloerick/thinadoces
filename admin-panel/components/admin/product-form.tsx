"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { Product } from "@/types";

import { normalizePrice } from "@/lib/utils/format";
import { productSchema, type ProductInput } from "@/lib/validations/product";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface ProductFormProps {
  open: boolean;
  mode: "create" | "edit";
  product?: Product;
  onClose: () => void;
  onSaved: (product: Product, mode: "create" | "edit") => void;
}

const EMPTY_VALUES: ProductInput = {
  name: "",
  description: "",
  price: 0,
  image_url: "",
  category: "",
  active: true,
};

export function ProductForm({ open, mode, product, onClose, onSaved }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (mode === "edit" && product) {
      reset({
        name: product.name,
        description: product.description ?? "",
        price: product.price,
        image_url: product.image_url ?? "",
        category: product.category ?? "",
        active: product.active,
      });
      return;
    }

    reset(EMPTY_VALUES);
  }, [mode, product, reset]);

  async function onSubmit(values: ProductInput) {
    try {
      const endpoint = mode === "create" ? "/api/admin/products" : `/api/admin/products/${product?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, price: normalizePrice(values.price) }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message ?? "Erro ao salvar produto.");
      }

      onSaved(payload.data as Product, mode);
      toast.success(mode === "create" ? "Produto criado com sucesso." : "Produto atualizado com sucesso.");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar produto.");
    }
  }

  return (
    <Modal title={mode === "create" ? "Novo produto" : "Editar produto"} open={open} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Nome</label>
          <Input placeholder="Ex: Bolo de Ninho com Morango" {...register("name")} />
          {errors.name ? <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Descricao</label>
          <Textarea rows={3} placeholder="Descricao curta do produto" {...register("description")} />
          {errors.description ? <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p> : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Preco</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price ? <p className="mt-1 text-xs text-rose-600">{errors.price.message}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Categoria</label>
            <Input placeholder="Ex: Bolos" {...register("category")} />
            {errors.category ? <p className="mt-1 text-xs text-rose-600">{errors.category.message}</p> : null}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">URL da imagem</label>
          <Input placeholder="https://..." {...register("image_url")} />
          {errors.image_url ? <p className="mt-1 text-xs text-rose-600">{errors.image_url.message}</p> : null}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <Switch
            checked={watch("active")}
            onCheckedChange={(checked) => setValue("active", checked, { shouldDirty: true })}
            label="Produto ativo"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {mode === "create" ? "Criar produto" : "Salvar alteracoes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
