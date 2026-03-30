"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  userEmail?: string;
}

export function AdminHeader({ title, subtitle, userEmail }: AdminHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Nao foi possivel sair. Tente novamente.");
      return;
    }

    toast.success("Logout realizado com sucesso.");
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-card md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-3">
        {userEmail ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
            <p className="text-xs text-slate-500">Administrador</p>
            <p className="text-sm font-semibold text-slate-800">{userEmail}</p>
          </div>
        ) : null}
        <Button variant="secondary" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  );
}
