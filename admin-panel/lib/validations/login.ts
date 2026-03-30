import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Informe o e-mail." })
    .email("Digite um e-mail valido."),
  password: z
    .string({ required_error: "Informe a senha." })
    .min(6, "A senha precisa ter pelo menos 6 caracteres."),
});

export type LoginInput = z.infer<typeof loginSchema>;
