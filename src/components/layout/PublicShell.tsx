"use client";

import { usePathname } from "next/navigation";
import { Header } from './Header'
import { Footer } from './Footer'

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFocusedLandingFlow = pathname === "/anglais-casablanca" || pathname === "/anglais-en-ligne" || pathname === "/merci";
  // /souvenirs renders its own Header (in its layout) so a banner can sit above it.
  const isSouvenirs = pathname === "/souvenirs";

  return (
    <>
      {!isFocusedLandingFlow && !isSouvenirs && <Header />}
      <main className="flex-1">{children}</main>
      {!isFocusedLandingFlow && <Footer />}
    </>
  )
}
