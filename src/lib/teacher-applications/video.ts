// Video-intro link handling for the English teacher application.
// Applicants host their own video (Drive, YouTube, Loom, Vimeo, Dropbox); we only
// store the link. Pure module: no runtime imports, fetch is injected for tests.

export type VideoProvider = "GOOGLE_DRIVE" | "YOUTUBE" | "LOOM" | "VIMEO" | "DROPBOX";

export type ParsedVideoLink = {
  provider: VideoProvider;
  /** Normalized URL written to the sheet. */
  url: string;
  /** Provider video id when we can extract one (Drive, YouTube, Vimeo). */
  id: string | null;
};

export type VideoAccess = "PUBLIC" | "PRIVATE" | "UNKNOWN";

const idPattern = /^[A-Za-z0-9_-]{6,80}$/;

function hostMatches(host: string, domain: string) {
  return host === domain || host.endsWith(`.${domain}`);
}

export function parseVideoLink(raw: string): ParsedVideoLink | null {
  const input = raw.trim();
  if (!input || input.length > 500) return null;
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password) return null;

  const host = url.hostname.toLowerCase();
  const segments = url.pathname.split("/").filter(Boolean);

  if (host === "drive.google.com") {
    // /file/d/<id>/view, /file/u/0/d/<id>/view, /open?id=<id>. Folders are rejected.
    const dIndex = segments.indexOf("d");
    if (segments[0] === "file" && dIndex >= 0 && idPattern.test(segments[dIndex + 1] ?? "")) {
      const id = segments[dIndex + 1];
      return { provider: "GOOGLE_DRIVE", id, url: `https://drive.google.com/file/d/${id}/view` };
    }
    if (segments[0] === "open") {
      const id = url.searchParams.get("id") ?? "";
      if (idPattern.test(id)) return { provider: "GOOGLE_DRIVE", id, url: `https://drive.google.com/file/d/${id}/view` };
    }
    return null;
  }

  if (hostMatches(host, "youtube.com") || host === "youtu.be") {
    let id = "";
    if (host === "youtu.be") id = segments[0] ?? "";
    else if (segments[0] === "watch") id = url.searchParams.get("v") ?? "";
    else if (["shorts", "embed", "live"].includes(segments[0] ?? "")) id = segments[1] ?? "";
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    return { provider: "YOUTUBE", id, url: `https://www.youtube.com/watch?v=${id}` };
  }

  if (hostMatches(host, "loom.com")) {
    const id = segments[0] === "share" ? segments[1] ?? "" : "";
    if (!/^[A-Za-z0-9]{16,64}$/.test(id)) return null;
    return { provider: "LOOM", id, url: `https://www.loom.com/share/${id}` };
  }

  if (host === "vimeo.com" || host === "www.vimeo.com" || host === "player.vimeo.com") {
    const numeric = segments.find((segment) => /^\d{6,12}$/.test(segment));
    if (!numeric) return null;
    // Unlisted videos carry a hash as the next segment; keep it so the link works.
    const next = segments[segments.indexOf(numeric) + 1];
    const hash = next && /^[a-f0-9]{8,16}$/i.test(next) ? next : url.searchParams.get("h");
    const suffix = hash && /^[a-f0-9]{8,16}$/i.test(hash) ? `/${hash}` : "";
    return { provider: "VIMEO", id: numeric, url: `https://vimeo.com/${numeric}${suffix}` };
  }

  if (hostMatches(host, "dropbox.com")) {
    if (!["s", "scl", "sh"].includes(segments[0] ?? "") || segments.length < 2) return null;
    return { provider: "DROPBOX", id: null, url: `https://www.dropbox.com${url.pathname}${url.search}` };
  }

  return null;
}

type FetchLike = (input: string, init?: { redirect?: "manual" | "follow"; signal?: AbortSignal; method?: string }) => Promise<{
  status: number;
  headers: { get(name: string): string | null };
}>;

// Best-effort check that the video can be opened without signing in. Only fixed
// provider hosts built from parsed ids are fetched, never the raw applicant URL.
export async function checkVideoAccessible(
  link: ParsedVideoLink,
  fetchImpl: FetchLike,
  timeoutMs = 4000,
): Promise<VideoAccess> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    if (link.provider === "YOUTUBE" && link.id) {
      const response = await fetchImpl(
        `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${link.id}`)}`,
        { signal: controller.signal },
      );
      if (response.status === 200) return "PUBLIC";
      if ([400, 401, 403, 404].includes(response.status)) return "PRIVATE";
      return "UNKNOWN";
    }

    if (link.provider === "VIMEO" && link.id) {
      const response = await fetchImpl(
        `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(link.url)}`,
        { signal: controller.signal },
      );
      if (response.status === 200) return "PUBLIC";
      if (response.status === 403 || response.status === 404) return "PRIVATE";
      return "UNKNOWN";
    }

    if (link.provider === "GOOGLE_DRIVE" && link.id) {
      const response = await fetchImpl(`https://drive.google.com/file/d/${link.id}/view`, {
        redirect: "manual",
        signal: controller.signal,
      });
      if (response.status === 200) return "PUBLIC";
      if (response.status === 404) return "PRIVATE";
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location") ?? "";
        if (location.includes("accounts.google.com")) return "PRIVATE";
      }
      return "UNKNOWN";
    }

    return "UNKNOWN";
  } catch {
    return "UNKNOWN";
  } finally {
    clearTimeout(timer);
  }
}
