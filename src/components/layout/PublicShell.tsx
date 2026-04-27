'use client'
import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
