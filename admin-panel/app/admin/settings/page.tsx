import { AdminHeader } from "@/components/admin/header";
import { AdminShell } from "@/components/admin/admin-shell";
import { SettingsView } from "@/components/admin/settings-view";
import { requireAdminUser } from "@/lib/auth/page-guards";
import { getStoreSettings } from "@/lib/db/queries";

export default async function AdminSettingsPage() {
  const { supabase, adminUser } = await requireAdminUser();
  const settings = await getStoreSettings(supabase);

  return (
    <AdminShell
      header={
        <AdminHeader
          title="Configuracoes"
          subtitle="Controle global da loja, disponibilidade de pedidos e mensagens de aviso."
          userEmail={adminUser.email}
        />
      }
    >
      <SettingsView initialSettings={settings} />
    </AdminShell>
  );
}

