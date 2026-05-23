import { Shield } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col bg-admin-sidebar px-4 py-6 text-white">
        <div className="flex items-center gap-2 px-2">
          <Shield className="h-5 w-5 text-gray-300" />
          <span className="font-semibold">Admin Panel</span>
        </div>
        <div className="mt-8 flex flex-1 flex-col">
          <AdminNav />
        </div>
      </aside>
      <main className="min-w-0 flex-1 bg-gray-100 p-8">{children}</main>
    </div>
  );
}
