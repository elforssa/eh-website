import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Serif_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { PublicShell } from "@/components/layout/PublicShell";
import { Analytics } from "@vercel/analytics/next";
import { MetaPixel } from "@/components/analytics/MetaPixel";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

// Used by the /souvenirs summer-camp gallery (DM Serif Display headings, DM Sans body).
const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
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
      className={`${jakarta.variable} ${dmSerifDisplay.variable} ${dmSans.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <PublicShell>{children}</PublicShell>
        <Analytics />
        <MetaPixel />
      </body>
    </html>
  );
}
