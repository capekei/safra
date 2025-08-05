import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <aside className="w-64 bg-white shadow-sm">
          <div className="p-4">
            <h2 className="text-lg font-semibold">Admin Panel</h2>
          </div>
        </aside>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;