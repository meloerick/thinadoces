import { AlertTriangle, Lock } from "lucide-react";

import { LoginForm } from "@/components/admin/login-form";
import { Card } from "@/components/ui/card";
import { redirectAuthenticatedFromLogin } from "@/lib/auth/page-guards";
import { ALLOWED_ADMIN_EMAIL } from "@/lib/utils/constants";

interface LoginPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  await redirectAuthenticatedFromLogin();

  const params = searchParams ? await searchParams : {};
  const isForbidden = params.error === "forbidden";

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">Admin privado</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Painel Thina Doces</h1>
          <p className="mt-1 text-sm text-slate-500">Acesso exclusivo para administradores autorizados.</p>
        </div>

        {isForbidden ? (
          <Card className="border-amber-200 bg-amber-50/80">
            <div className="flex items-start gap-2 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <p>Acesso restrito. Apenas {ALLOWED_ADMIN_EMAIL} pode acessar o painel.</p>
            </div>
          </Card>
        ) : null}

        <Card>
          <div className="mb-4 flex items-center gap-2 text-slate-700">
            <Lock className="h-4 w-4" />
            <p className="text-sm font-semibold">Login seguro</p>
          </div>
          <LoginForm />
        </Card>
      </div>
    </div>
  );
}

