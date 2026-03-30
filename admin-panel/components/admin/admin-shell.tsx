import { Sidebar } from "@/components/admin/sidebar";

interface AdminShellProps {
  header: React.ReactNode;
  children: React.ReactNode;
}

export function AdminShell({ header, children }: AdminShellProps) {
  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {header}
        {children}
      </main>
    </div>
  );
}
