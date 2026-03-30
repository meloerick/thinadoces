import { AdminHeader } from "@/components/admin/header";
import { AdminShell } from "@/components/admin/admin-shell";
import { DashboardCards } from "@/components/admin/dashboard-cards";
import { requireAdminUser } from "@/lib/auth/page-guards";
import { getDashboardSummary } from "@/lib/db/queries";

export default async function AdminDashboardPage() {
  const { supabase, adminUser } = await requireAdminUser();
  const summary = await getDashboardSummary(supabase);

  return (
    <AdminShell
      header={
        <AdminHeader
          title="Dashboard"
          subtitle="Visao geral da operacao da loja e atalhos de gestao."
          userEmail={adminUser.email}
        />
      }
    >
      <DashboardCards summary={summary} />
    </AdminShell>
  );
}

