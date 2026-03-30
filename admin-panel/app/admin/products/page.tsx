import { AdminHeader } from "@/components/admin/header";
import { AdminShell } from "@/components/admin/admin-shell";
import { ProductsTable } from "@/components/admin/products-table";
import { requireAdminUser } from "@/lib/auth/page-guards";
import { getProducts } from "@/lib/db/queries";

export default async function AdminProductsPage() {
  const { supabase, adminUser } = await requireAdminUser();
  const products = await getProducts(supabase);

  return (
    <AdminShell
      header={
        <AdminHeader
          title="Produtos"
          subtitle="Gerencie catalogo, disponibilidade e dados dos produtos."
          userEmail={adminUser.email}
        />
      }
    >
      <ProductsTable initialProducts={products} />
    </AdminShell>
  );
}

