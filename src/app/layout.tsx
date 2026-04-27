import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { PublicShell } from "@/components/layout/PublicShell";
import { Analytics } from "@vercel/analytics/next";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "English Hills Language Center | Casablanca",
  description: "Centre de langues moderne à Casablanca, spécialisé dans l'apprentissage par projets avec les supports National Geographic. Programmes pour enfants, adultes et entreprises.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${jakarta.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <PublicShell>{children}</PublicShell>
        <Analytics />
      </body>
    </html>
  );
}
