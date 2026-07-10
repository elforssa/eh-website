/**
 * Enrollment call-to-action, rendered below the last session's grid (above the
 * family note). Server Component — links only, no interactivity.
 *
 * The primary link points at the /contact-camp route handler (which logs the
 * click and redirects), so it uses a plain <a> rather than next/link to avoid
 * prefetch triggering the redirect/logging.
 */
export function EnrollmentCTA() {
  return (
    <section
      id="inscription"
      className="scroll-mt-40 rounded-2xl bg-camp-navy px-6 py-12 text-center text-camp-cream sm:px-12 sm:py-14"
    >
      <h2 className="font-camp-serif text-3xl sm:text-4xl">Et après l&apos;été ?</h2>
      <p className="mx-auto mt-4 max-w-2xl font-camp-sans text-base leading-relaxed text-camp-cream/90">
        Votre enfant a passé l&apos;été à parler anglais sans s&apos;en rendre
        compte. C&apos;est exactement ce que nous faisons toute l&apos;année. Les
        inscriptions pour l&apos;année 2026–2027 sont ouvertes, avec une priorité
        réservée aux familles du camp jusqu&apos;au 31 août.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href="/contact-camp?s=galerie-cta"
          className="w-full rounded-lg bg-camp-gold px-6 py-3 font-camp-sans font-semibold text-camp-navy transition-colors hover:bg-camp-gold/90 sm:w-auto"
        >
          Parler à un conseiller
        </a>
        <a
          href="https://admin.english-hills.com/inscription?s=galerie-cta"
          target="_blank"
          rel="noopener"
          className="w-full rounded-lg border border-camp-cream px-6 py-3 font-camp-sans font-semibold text-camp-cream transition-colors hover:bg-camp-cream/10 sm:w-auto"
        >
          S&apos;inscrire en ligne
        </a>
      </div>
    </section>
  );
}
