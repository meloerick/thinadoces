import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string({ required_error: "Informe o nome do produto." })
    .min(2, "Nome muito curto.")
    .max(120, "Nome muito longo."),
  description: z
    .string()
    .max(1000, "Descricao muito longa.")
    .optional()
    .transform((value) => value ?? ""),
  price: z
    .number({ invalid_type_error: "Informe um preco valido." })
    .positive("O preco precisa ser maior que zero.")
    .max(999999.99, "Preco muito alto."),
  image_url: z
    .string()
    .url("URL da imagem invalida.")
    .or(z.literal(""))
    .optional()
    .transform((value) => value ?? ""),
  category: z
    .string()
    .max(80, "Categoria muito longa.")
    .optional()
    .transform((value) => value ?? ""),
  active: z.boolean().optional().default(true),
});

export const productUpdateSchema = productSchema.partial().extend({
  name: productSchema.shape.name.optional(),
  price: productSchema.shape.price.optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
