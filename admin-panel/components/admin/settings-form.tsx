"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { StoreSettings } from "@/types";

import { normalizeOptionalText } from "@/lib/utils/format";
import { settingsSchema, type SettingsInput } from "@/lib/validations/settings";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface SettingsFormProps {
  settings: StoreSettings;
  onSaved: (next: StoreSettings) => void;
}

export function SettingsForm({ settings, onSaved }: SettingsFormProps) {
  const {
    handleSubmit,
    setValue,
    watch,
    register,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      orders_enabled: settings.orders_enabled,
      store_open: settings.store_open,
      warning_message: settings.warning_message ?? "",
    },
  });

  async function onSubmit(values: SettingsInput) {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          warning_message: normalizeOptionalText(values.warning_message),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message ?? "Falha ao atualizar configuracoes.");
      }

      onSaved(payload.data as StoreSettings);
      toast.success("Configuracoes atualizadas com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar configuracoes.");
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-800">Pedidos</p>
            <Switch
              checked={watch("orders_enabled")}
              onCheckedChange={(value) => setValue("orders_enabled", value, { shouldDirty: true })}
              label={watch("orders_enabled") ? "Pedidos ativados" : "Pedidos desativados"}
            />
            <Badge
              className={
                watch("orders_enabled")
                  ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                  : "border-rose-200 bg-rose-100 text-rose-700"
              }
            >
              {watch("orders_enabled") ? "Pedidos ativados" : "Pedidos desativados"}
            </Badge>
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-800">Status da loja</p>
            <Switch
              checked={watch("store_open")}
              onCheckedChange={(value) => setValue("store_open", value, { shouldDirty: true })}
              label={watch("store_open") ? "Loja aberta" : "Loja fechada"}
            />
            <Badge
              className={
                watch("store_open")
                  ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                  : "border-amber-200 bg-amber-100 text-amber-700"
              }
            >
              {watch("store_open") ? "Loja aberta" : "Loja fechada"}
            </Badge>
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-800">Mensagem atual</p>
            <p className="min-h-10 rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm text-slate-600">
              {watch("warning_message") || "Sem mensagem de aviso."}
            </p>
          </div>
        </Card>
      </div>

      <Card title="Mensagem de aviso" description="Mensagem exibida no site principal quando necessario.">
        <Textarea
          rows={4}
          placeholder="Ex: Hoje estamos com alta demanda. O prazo de entrega pode aumentar."
          {...register("warning_message")}
        />
        {errors.warning_message ? (
          <p className="mt-1 text-xs text-rose-600">{errors.warning_message.message}</p>
        ) : null}
      </Card>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting} disabled={!isDirty && !isSubmitting}>
          Salvar configuracoes
        </Button>
      </div>
    </form>
  );
}
