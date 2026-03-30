"use client";

import { useMemo, useState } from "react";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { Product } from "@/types";

import { formatCurrency } from "@/lib/utils/format";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { ProductForm } from "./product-form";

interface ProductsTableProps {
  initialProducts: Product[];
}

export function ProductsTable({ initialProducts }: ProductsTableProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(normalized) ||
        (product.category ?? "").toLowerCase().includes(normalized)
      );
    });
  }, [products, query]);

  function openCreateForm() {
    setFormMode("create");
    setEditingProduct(undefined);
    setFormOpen(true);
  }

  function openEditForm(product: Product) {
    setFormMode("edit");
    setEditingProduct(product);
    setFormOpen(true);
  }

  async function toggleProduct(product: Product) {
    try {
      setLoadingProductId(product.id);

      const response = await fetch(`/api/admin/products/${product.id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !product.active }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message ?? "Erro ao alternar status.");
      }

      setProducts((current) => current.map((item) => (item.id === product.id ? payload.data : item)));
      toast.success(product.active ? "Produto desativado." : "Produto ativado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao atualizar produto.");
    } finally {
      setLoadingProductId(null);
    }
  }

  async function removeProduct(product: Product) {
    const confirmed = window.confirm(`Excluir o produto \"${product.name}\"?`);
    if (!confirmed) {
      return;
    }

    try {
      setLoadingProductId(product.id);

      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message ?? "Erro ao excluir produto.");
      }

      setProducts((current) => current.filter((item) => item.id !== product.id));
      toast.success("Produto excluido com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao excluir produto.");
    } finally {
      setLoadingProductId(null);
    }
  }

  function handleSaved(product: Product, mode: "create" | "edit") {
    if (mode === "create") {
      setProducts((current) => [product, ...current]);
      return;
    }

    setProducts((current) => current.map((item) => (item.id === product.id ? product : item)));
  }

  return (
    <Card title="Produtos" description="Cadastre, edite, ative e desative produtos com seguranca.">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative md:max-w-md md:flex-1">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou categoria"
            className="pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4" />
          Novo produto
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Preco</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredProducts.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={5}>
                  Nenhum produto encontrado.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-slate-900">{product.name}</p>
                      {product.description ? (
                        <p className="truncate text-xs text-slate-500">{product.description}</p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{product.category ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        product.active
                          ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                          : "border-slate-200 bg-slate-100 text-slate-600"
                      }
                    >
                      {product.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Button variant="secondary" onClick={() => openEditForm(product)}>
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => void toggleProduct(product)}
                        isLoading={loadingProductId === product.id}
                      >
                        {product.active ? "Desativar" : "Ativar"}
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => void removeProduct(product)}
                        isLoading={loadingProductId === product.id}
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

      <ProductForm
        open={formOpen}
        mode={formMode}
        product={editingProduct}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />
    </Card>
  );
}
