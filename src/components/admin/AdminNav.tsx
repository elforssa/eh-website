'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'
import { LayoutDashboard, FilePlus, LogOut } from 'lucide-react'

const navLinks = [
  { href: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/receipts/new', label: 'Nouveau reçu', icon: FilePlus },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <aside className="no-print w-56 bg-navy-deep flex flex-col shrink-0 min-h-screen">
      <div className="flex flex-col items-center gap-2 px-4 py-6 border-b border-white/10">
        <Image src="/eh-logo-new.png" alt="English Hills" width={48} height={48} />
        <p className="text-white font-bold text-sm text-center leading-tight">English Hills</p>
        <p className="text-white/50 text-[10px] uppercase tracking-widest">Admin</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors w-full"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  )
}
