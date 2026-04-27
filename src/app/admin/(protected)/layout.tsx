import { AdminNav } from '@/components/admin/AdminNav'

export const metadata = { title: 'Admin | English Hills' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      <AdminNav />
      <main className="flex-1 p-4 sm:p-8 overflow-auto">{children}</main>
    </div>
  )
}
