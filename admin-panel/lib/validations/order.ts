import { z } from "zod";

import { ORDER_STATUSES } from "@/types";

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES, {
    required_error: "Selecione um status.",
    invalid_type_error: "Status invalido.",
  }),
});

export const createOrderSchema = z.object({
  customer_name: z
    .string({ required_error: "Informe o nome do cliente." })
    .min(2, "Nome muito curto.")
    .max(120, "Nome muito longo."),
  customer_phone: z
    .string({ required_error: "Informe o telefone." })
    .min(8, "Telefone invalido.")
    .max(30, "Telefone invalido."),
  customer_address: z
    .string({ required_error: "Informe o endereco." })
    .min(5, "Endereco muito curto.")
    .max(220, "Endereco muito longo."),
  payment_method: z
    .string({ required_error: "Informe a forma de pagamento." })
    .min(2, "Forma de pagamento invalida.")
    .max(80, "Forma de pagamento muito longa."),
  status: z.enum(ORDER_STATUSES).optional().default("pendente"),
  total_price: z
    .number({ invalid_type_error: "Informe um valor total valido." })
    .nonnegative("O total nao pode ser negativo.")
    .max(999999.99, "Total muito alto."),
  note: z
    .string()
    .max(500, "Observacao muito longa.")
    .optional()
    .transform((value) => value ?? ""),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;