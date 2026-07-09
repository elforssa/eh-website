import "server-only";

import Image from "next/image";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "camp-photos";
const SIGNED_URL_TTL = 3600; // 1 hour
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;

type CampSession = { prefix: string; label: string; videoId?: string };
type Photo = { name: string; url: string };
type LoadedSession = CampSession & { id: string; photos: Photo[] };

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

/** Stable anchor id for a session (index-prefixed to guarantee uniqueness). */
function sessionAnchor(prefix: string, index: number): string {
  const slug = prefix
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `session-${index}-${slug || "sans-nom"}`;
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

  return Promise.all(
    sessions.map(async (session, index) => ({
      ...session,
      id: sessionAnchor(session.prefix, index),
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

function PhotoGrid({ photos, label }: { photos: Photo[]; label: string }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo) => (
        <li
          key={photo.name}
          className="group relative aspect-square overflow-hidden rounded-xl border border-camp-navy/10 bg-camp-navy/5 shadow-sm"
        >
          <Image
            src={photo.url}
            alt={`Photo souvenir — ${label}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </li>
      ))}
    </ul>
  );
}

export async function Gallery() {
  const loaded = await loadSessions();
  const nonEmpty = (loaded ?? []).filter((s) => s.photos.length > 0);

  return (
    <main className="min-h-[70vh] bg-camp-cream font-camp-sans">
      {/* Sticky sub-nav: one anchor per non-empty session (hidden when only one). */}
      {nonEmpty.length > 1 && (
        <nav
          aria-label="Semaines du camp"
          className="sticky top-20 z-30 border-b border-camp-navy/10 bg-camp-cream/95 backdrop-blur-sm"
        >
          <ul className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
            {nonEmpty.map((session) => (
              <li key={session.id} className="shrink-0">
                <a
                  href={`#${session.id}`}
                  className="border-b-2 border-transparent pb-0.5 font-camp-sans text-sm font-medium text-camp-navy transition-colors hover:border-camp-gold"
                >
                  {session.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
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
        ) : (
          <div className="space-y-16">
            {nonEmpty.map((session) => (
              <section key={session.id} id={session.id} className="scroll-mt-40">
                <h2 className="mb-5 font-camp-serif text-2xl text-camp-navy sm:text-3xl">
                  {session.label}
                </h2>
                {session.videoId && (
                  <VideoEmbed videoId={session.videoId} label={session.label} />
                )}
                <PhotoGrid photos={session.photos} label={session.label} />
              </section>
            ))}
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
