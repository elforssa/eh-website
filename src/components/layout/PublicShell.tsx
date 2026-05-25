"use client";

import { usePathname } from "next/navigation";
import { Header } from './Header'
import { Footer } from './Footer'

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFocusedLandingFlow = pathname === "/anglais-casablanca" || pathname === "/merci";

  return (
    <>
      {!isFocusedLandingFlow && <Header />}
      <main className="flex-1">{children}</main>
      {!isFocusedLandingFlow && <Footer />}
    </>
  )
}
