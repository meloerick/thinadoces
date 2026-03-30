import { AdminHeader } from "@/components/admin/header";
import { AdminShell } from "@/components/admin/admin-shell";
import { OrdersTable } from "@/components/admin/orders-table";
import { requireAdminUser } from "@/lib/auth/page-guards";
import { getOrders } from "@/lib/db/queries";

export default async function AdminOrdersPage() {
  const { supabase, adminUser } = await requireAdminUser();
  const orders = await getOrders(supabase);

  return (
    <AdminShell
      header={
        <AdminHeader
          title="Pedidos"
          subtitle="Acompanhe os pedidos recebidos e atualize status em tempo real."
          userEmail={adminUser.email}
        />
      }
    >
      <OrdersTable initialOrders={orders} />
    </AdminShell>
  );
}

