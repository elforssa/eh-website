import Image from "next/image";
import Link from "next/link";

type ChooserSession = {
  slug: string;
  label: string;
  photos: { url: string }[];
};

/**
 * "Choose your week" screen, shown once more than one week has photos. Each card
 * uses that week's first photo as a cover and links to ?semaine=<slug>.
 *
 * Covers bypass Vercel Image Optimization (`unoptimized`) like the rest of the
 * gallery — photos are already resized to 1600px/q80 at upload time.
 */
export function WeekChooser({ sessions }: { sessions: ChooserSession[] }) {
  return (
    <div>
      <h2 className="text-center font-camp-serif text-2xl text-camp-navy sm:text-3xl">
        Choisissez votre semaine
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-center font-camp-sans text-sm text-camp-navy/60">
        Sélectionnez la semaine de votre enfant pour voir ses photos.
      </p>

      <ul className="mt-8 grid gap-6 sm:grid-cols-2">
        {sessions.map((session) => {
          const cover = session.photos[0]?.url;
          return (
            <li key={session.slug}>
              <Link
                href={`/souvenirs?semaine=${encodeURIComponent(session.slug)}`}
                className="group block overflow-hidden rounded-2xl border-2 border-camp-navy/10 bg-white shadow-sm transition-colors hover:border-camp-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-camp-gold"
              >
                <div className="relative aspect-[4/3] w-full bg-camp-navy/5">
                  {cover && (
                    <Image
                      src={cover}
                      alt=""
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-5 text-center">
                  <h3 className="font-camp-serif text-xl text-camp-navy">
                    {session.label}
                  </h3>
                  <p className="mt-1 font-camp-sans text-sm text-camp-navy/60">
                    {session.photos.length} photo
                    {session.photos.length > 1 ? "s" : ""}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
