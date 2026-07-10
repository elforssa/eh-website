/**
 * Slim enrollment announcement, rendered inline after the first session's grid
 * (not at the top of the page). Server Component — no interactivity.
 */
export function AnnouncementBar() {
  return (
    <div className="border-y border-camp-navy bg-camp-cream py-4 text-center">
      <p className="mx-auto max-w-3xl px-4 font-camp-sans text-sm text-camp-navy">
        Les inscriptions 2026–2027 sont ouvertes. Priorité aux familles du camp
        jusqu&apos;au 31 août.{" "}
        <a
          href="https://admin.english-hills.com/inscription?s=galerie-banniere"
          target="_blank"
          rel="noopener"
          className="whitespace-nowrap font-medium text-camp-gold hover:underline"
        >
          S&apos;inscrire →
        </a>
      </p>
    </div>
  );
}
