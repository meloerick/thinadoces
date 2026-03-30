"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { ALLOWED_ADMIN_EMAIL } from "@/lib/utils/constants";
import { loginSchema, type LoginInput } from "@/lib/validations/login";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: ALLOWED_ADMIN_EMAIL,
      password: "",
    },
  });

  async function onSubmit(values: LoginInput) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword(values);

      if (error) {
        throw new Error("Credenciais invalidas.");
      }

      const userEmail = (data.user?.email ?? "").trim().toLowerCase();
      if (userEmail !== ALLOWED_ADMIN_EMAIL) {
        await supabase.auth.signOut();
        throw new Error("Acesso negado. Apenas a conta autorizada pode entrar no painel.");
      }

      toast.success("Login realizado com sucesso.");
      const redirect = searchParams.get("redirect") || "/admin";
      router.push(redirect);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel entrar.");
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">E-mail</label>
        <Input type="email" placeholder="thinadoces@gmail.com" autoComplete="email" {...register("email")} />
        {errors.email ? <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">Senha</label>
        <Input
          type="password"
          placeholder="********"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password ? <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p> : null}
      </div>

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Entrar no painel
      </Button>
    </form>
  );
}