import { z } from "zod";

export const settingsSchema = z.object({
  orders_enabled: z.boolean(),
  store_open: z.boolean(),
  warning_message: z
    .string()
    .max(500, "A mensagem deve ter no maximo 500 caracteres.")
    .optional()
    .transform((value) => value ?? ""),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
