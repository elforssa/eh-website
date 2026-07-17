import "server-only";

import Link from "next/link";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PhotoGrid } from "./PhotoGrid";
import { EnrollmentCTA } from "./EnrollmentCTA";
import { WeekChooser } from "./WeekChooser";

const BUCKET = "camp-photos";
const SIGNED_URL_TTL = 3600; // 1 hour
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;

type CampSession = { prefix: string; label: string; videoId?: string };
type Photo = { name: string; url: string };
type LoadedSession = CampSession & { slug: string; photos: Photo[] };

/**
 * Parse CAMP_SESSIONS (a JSON array of { prefix, label, videoId? }).
 * Returns null on missing / unparseable / wrong-shape input so the caller can
 * render the empty state instead of crashing or exposing the gallery.
 */
function parseSessions(): CampSession[] | null {
  const raw = process.env.CAMP_SESSIONS;
  if (!raw) {
    console.error("[souvenirs] CAMP_SESSIONS is not set.");
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("CAMP_SESSIONS is not an array");
    return parsed
      .filter(
        (s): s is CampSession =>
          !!s &&
          typeof s.prefix === "string" &&
          typeof s.label === "string" &&
          (s.videoId === undefined || typeof s.videoId === "string"),
      )
      .map((s) => ({
        prefix: s.prefix,
        label: s.label,
        ...(s.videoId ? { videoId: s.videoId } : {}),
      }));
  } catch (err) {
    console.error("[souvenirs] Failed to parse CAMP_SESSIONS:", (err as Error).message);
    return null;
  }
}

/** URL-safe slug for a session, used for ?semaine= and the section id. */
function sessionSlug(prefix: string): string {
  return (
    prefix
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "semaine"
  );
}

/** Fetch storage objects under one prefix and sign each one (server-side). */
async function loadPhotos(supabase: SupabaseClient, prefix: string): Promise<Photo[]> {
  const folder = prefix.replace(/^\/+/, "").replace(/\/+$/, "");

  const { data: objects, error } = await supabase.storage
    .from(BUCKET)
    .list(folder, { limit: 1000, sortBy: { column: "name", order: "asc" } });

  if (error) {
    console.error(`[souvenirs] Failed to list "${folder}":`, error.message);
    return [];
  }

  const files = (objects ?? []).filter(
    (o) => o.id !== null && IMAGE_EXT.test(o.name),
  );
  if (files.length === 0) return [];

  const paths = files.map((f) => (folder ? `${folder}/${f.name}` : f.name));
  const { data: signed, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL);

  if (signError || !signed) {
    console.error(`[souvenirs] Failed to sign URLs for "${folder}":`, signError?.message);
    return [];
  }

  return signed
    .filter((s) => !s.error && s.signedUrl)
    .map((s, i) => ({ name: files[i]?.name ?? `photo-${i}`, url: s.signedUrl! }));
}

/** Load every session's photos (in parallel) while preserving array order. */
async function loadSessions(): Promise<LoadedSession[] | null> {
  const sessions = parseSessions();
  if (!sessions) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("[souvenirs] Supabase credentials missing; cannot load photos.");
    return null;
  }

  // Service-role client stays server-side; only used to sign URLs.
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Slugs are assigned up front so duplicates can be disambiguated by index.
  const used = new Set<string>();
  const withSlugs = sessions.map((session, index) => {
    let slug = sessionSlug(session.prefix);
    if (used.has(slug)) slug = `${slug}-${index + 1}`;
    used.add(slug);
    return { ...session, slug };
  });

  return Promise.all(
    withSlugs.map(async (session) => ({
      ...session,
      photos: await loadPhotos(supabase, session.prefix),
    })),
  );
}

function VideoEmbed({ videoId, label }: { videoId: string; label: string }) {
  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-camp-navy/10 bg-black shadow-sm">
      <div className="relative aspect-video w-full">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={`Vidéo souvenir — ${label}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}

/** Sticky bar to switch weeks without going back to the chooser. */
function WeekSwitcher({
  sessions,
  activeSlug,
}: {
  sessions: LoadedSession[];
  activeSlug: string;
}) {
  return (
    <nav
      aria-label="Semaines du camp"
      className="sticky top-20 z-30 border-b border-camp-navy/10 bg-camp-cream/95 backdrop-blur-sm"
    >
      <ul className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
        {sessions.map((session) => {
          const isActive = session.slug === activeSlug;
          return (
            <li key={session.slug} className="shrink-0">
              <Link
                href={`/souvenirs?semaine=${encodeURIComponent(session.slug)}`}
                aria-current={isActive ? "page" : undefined}
                className={`border-b-2 pb-0.5 font-camp-sans text-sm font-medium transition-colors ${
                  isActive
                    ? "border-camp-gold text-camp-navy"
                    : "border-transparent text-camp-navy/70 hover:border-camp-gold hover:text-camp-navy"
                }`}
              >
                {session.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export async function Gallery({ selectedSlug }: { selectedSlug?: string | null }) {
  const loaded = await loadSessions();
  const nonEmpty = (loaded ?? []).filter((s) => s.photos.length > 0);

  // An unknown ?semaine= falls back to the chooser rather than 404ing.
  const selected = selectedSlug
    ? (nonEmpty.find((s) => s.slug === selectedSlug) ?? null)
    : null;
  // With a single week there is nothing to choose — show it directly.
  const active = selected ?? (nonEmpty.length === 1 ? nonEmpty[0]! : null);

  return (
    <main className="min-h-[70vh] bg-camp-cream font-camp-sans">
      {active && nonEmpty.length > 1 && (
        <WeekSwitcher sessions={nonEmpty} activeSlug={active.slug} />
      )}

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="font-camp-serif text-4xl leading-tight text-camp-navy sm:text-5xl">
            Les souvenirs de l&apos;été
          </h1>
          <p className="mt-2 font-camp-sans text-sm font-medium uppercase tracking-wide text-camp-gold">
            Active Minds Summer Camp
          </p>
        </header>

        {nonEmpty.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-camp-navy/20 bg-white/50 px-6 py-20 text-center">
            <p className="font-camp-serif text-2xl text-camp-navy">
              Les photos arrivent bientôt.
            </p>
            <p className="mt-2 font-camp-sans text-sm text-camp-navy/60">
              Revenez très prochainement pour revivre les meilleurs moments du camp.
            </p>
          </div>
        ) : !active ? (
          <WeekChooser sessions={nonEmpty} />
        ) : (
          <div className="space-y-16">
            <section id={active.slug} className="scroll-mt-40">
              <h2 className="mb-5 font-camp-serif text-2xl text-camp-navy sm:text-3xl">
                {active.label}
              </h2>
              {active.videoId && (
                <VideoEmbed videoId={active.videoId} label={active.label} />
              )}
              <PhotoGrid photos={active.photos} label={active.label} />
            </section>
            <EnrollmentCTA />
          </div>
        )}

        <p className="mx-auto mt-12 max-w-2xl text-center font-camp-sans text-xs text-camp-navy/60">
          Ces photos sont réservées aux familles du camp. Merci de ne pas les
          diffuser publiquement.
        </p>
      </div>
    </main>
  );
}
