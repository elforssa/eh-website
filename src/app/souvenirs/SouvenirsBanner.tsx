import { BannerDismiss } from "./BannerDismiss";

/**
 * Top enrollment announcement bar for the authenticated /souvenirs gallery.
 * Reuses the site announcement bar's layout (same height/font/centered layout
 * and dismiss button, see components/layout/Header.tsx) with the camp palette:
 * navy #1B2A4A background, cream text, gold link. Server Component; the dismiss
 * button is a small client island.
 */
export function SouvenirsBanner() {
  return (
    <div
      data-souvenirs-banner
      className="relative flex items-center justify-between bg-camp-navy px-6 py-3 text-sm font-medium text-camp-cream"
    >
      <div className="flex-1 text-center">
        Inscriptions 2026–2027 ouvertes — Priorité aux familles du camp
        jusqu&apos;au 31 août.{" "}
        <a
          href="https://admin.english-hills.com/inscription?s=galerie-banniere"
          target="_blank"
          rel="noopener"
          className="whitespace-nowrap font-semibold text-camp-gold hover:underline"
        >
          S&apos;inscrire →
        </a>
      </div>
      <BannerDismiss />
    </div>
  );
}
