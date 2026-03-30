import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function normalizeOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export function normalizePrice(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
