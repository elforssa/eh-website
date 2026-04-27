'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { logoutAction } from '@/app/actions/auth'
import { LayoutDashboard, FilePlus, LogOut, Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/receipts/new', label: 'Nouveau reçu', icon: FilePlus },
]

function NavLinks({ pathname, onNav }: { pathname: string; onNav?: () => void }) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navLinks.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            onClick={onNav}
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
  )
}

function LogoutButton() {
  return (
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
  )
}

export function AdminNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar — hidden on mobile */}
      <aside className="no-print hidden md:flex w-56 bg-navy-deep flex-col shrink-0 min-h-screen">
        <div className="flex flex-col items-center gap-2 px-4 py-6 border-b border-white/10">
          <Image src="/eh-logo-new.png" alt="English Hills" width={48} height={48} />
          <p className="text-white font-bold text-sm text-center leading-tight">English Hills</p>
          <p className="text-white/50 text-[10px] uppercase tracking-widest">Admin</p>
        </div>
        <NavLinks pathname={pathname} />
        <LogoutButton />
      </aside>

      {/* Mobile top bar — hidden on desktop */}
      <header className="no-print md:hidden bg-navy-deep flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Image src="/eh-logo-new.png" alt="English Hills" width={32} height={32} />
          <span className="text-white font-bold text-sm">English Hills Admin</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-white/70 hover:text-white p-1"
          aria-label="Ouvrir le menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile drawer overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-navy-deep flex flex-col z-50 md:hidden shadow-xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Image src="/eh-logo-new.png" alt="English Hills" width={36} height={36} />
                <div>
                  <p className="text-white font-bold text-sm">English Hills</p>
                  <p className="text-white/50 text-[10px] uppercase tracking-widest">Admin</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/60 hover:text-white p-1"
                aria-label="Fermer le menu"
              >
                <X size={20} />
              </button>
            </div>
            <NavLinks pathname={pathname} onNav={() => setOpen(false)} />
            <LogoutButton />
          </div>
        </>
      )}
    </>
  )
}
