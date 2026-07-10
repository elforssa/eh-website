/**
 * One-off uploader for the /souvenirs camp gallery.
 *
 * Processes a local folder of photos and uploads them to the PRIVATE Supabase
 * Storage bucket `camp-photos` under a session prefix, using the service-role key.
 *
 * For each .jpg/.jpeg/.png/.heic (HEIC is detected by magic bytes even when it
 * carries a .jpg extension, and transcoded to JPEG via macOS `sips` first):
 *   - auto-orient, resize long edge to 1600px (downscale only)
 *   - re-encode JPEG quality 80
 *   - drop ALL metadata (strips EXIF, including GPS coordinates)
 *   - rename to a content hash (sha256 of the processed buffer, first 16 hex
 *     chars) + .jpg, so re-running is idempotent; original filenames are never
 *     kept
 *
 * Usage:
 *   npx tsx scripts/upload-camp-photos.ts <folder> <prefix>
 *   npx tsx scripts/upload-camp-photos.ts ./photos-juillet 2026-juillet/
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (loaded from
 * .env.local / .env). This is a standalone Node script, not part of the app build.
 */

import { readdir, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { randomBytes, createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const execFileAsync = promisify(execFile);

// Load env the same way the app does: .env.local wins, then .env as fallback.
// Uses Node's built-in env-file loader (no dotenv dependency needed).
for (const file of [".env", ".env.local"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    /* file absent — ignore */
  }
}

const BUCKET = "camp-photos";
const LONG_EDGE = 1600;
const JPEG_QUALITY = 80;
const CONCURRENCY = 4;
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".heic"]);
const ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

// HEIC/HEIF ftyp brands found at byte offset 4. iPhones frequently export these
// with a .jpg extension, which sharp cannot decode on macOS.
const HEIC_BRANDS = new Set(["ftypheic", "ftypheix", "ftypmif1", "ftypmsf1"]);

function fail(msg: string): never {
  console.error(`\x1b[31mError:\x1b[0m ${msg}`);
  process.exit(1);
}

/** Cryptographically-random 12-char id from [a-z0-9]. */
function randomId(len = 12): string {
  const bytes = randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += ID_ALPHABET[bytes[i]! % ID_ALPHABET.length];
  return out;
}

/** Normalize the prefix: strip leading slashes, ensure exactly one trailing slash. */
function normalizePrefix(raw: string): string {
  const trimmed = raw.replace(/^\/+/, "").replace(/\/+$/, "");
  return trimmed ? `${trimmed}/` : "";
}

/**
 * Detect HEIC/HEIF by magic bytes rather than extension (iPhones often export
 * HEIC files with a .jpg name). The ftyp brand sits at byte offset 4.
 */
function isHeic(buf: Buffer): boolean {
  if (buf.length < 12) return false;
  return HEIC_BRANDS.has(buf.subarray(4, 12).toString("latin1"));
}

/**
 * Convert a HEIC file to JPEG using macOS `sips` into `dest`. Throws a clear,
 * file-named error if `sips` is unavailable (i.e. not on macOS).
 */
async function convertHeicWithSips(
  src: string,
  dest: string,
  displayName: string,
): Promise<void> {
  try {
    await execFileAsync("sips", ["-s", "format", "jpeg", src, "--out", dest]);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      throw new Error(
        `"${displayName}" is a HEIC image and macOS \`sips\` is not available on this system. ` +
          `Please convert it to JPEG manually and re-run.`,
      );
    }
    throw new Error(`\`sips\` failed to convert HEIC "${displayName}": ${(err as Error).message}`);
  }
}

async function main() {
  const [folderArg, prefixArg] = process.argv.slice(2);
  if (!folderArg || !prefixArg) {
    fail("Usage: npx tsx scripts/upload-camp-photos.ts <folder> <prefix>");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (.env.local).");
  }

  const folder = path.resolve(folderArg);
  const prefix = normalizePrefix(prefixArg);

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Collect eligible files (top-level, non-recursive).
  const entries = await readdir(folder, { withFileTypes: true }).catch(() =>
    fail(`Cannot read folder: ${folder}`),
  );
  const files = entries
    .filter((e) => e.isFile() && ALLOWED_EXT.has(path.extname(e.name).toLowerCase()))
    .map((e) => e.name)
    .sort();

  if (files.length === 0) {
    console.log(`No .jpg/.jpeg/.png files found in ${folder}. Nothing to do.`);
    return;
  }

  // Pre-list existing objects under the prefix so we can (a) skip re-uploads and
  // (b) guarantee generated ids don't collide with what's already there.
  const existing = new Set<string>();
  {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(prefix.replace(/\/$/, ""), { limit: 10000 });
    if (error) fail(`Failed to list bucket "${BUCKET}/${prefix}": ${error.message}`);
    for (const obj of data ?? []) existing.add(obj.name);
  }

  console.log(
    `Found ${files.length} image(s) in ${folder}\n` +
      `Uploading to ${BUCKET}/${prefix} (concurrency ${CONCURRENCY})…\n`,
  );

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  let totalBytes = 0;
  let cursor = 0;

  async function processOne(sourceName: string, index: number) {
    const srcPath = path.join(folder, sourceName);
    let tempPath: string | null = null;
    try {
      let input = await readFile(srcPath);

      // Detect HEIC by content (not extension). sharp can't decode HEIC on macOS,
      // so transcode to JPEG via `sips` into a temp file first, then feed sharp.
      if (isHeic(input)) {
        tempPath = path.join(tmpdir(), `camp-heic-${randomId()}.jpg`);
        await convertHeicWithSips(srcPath, tempPath, sourceName);
        input = await readFile(tempPath);
      }

      // Auto-orient from EXIF, downscale to long edge, re-encode, strip metadata.
      // Not calling .withMetadata() means sharp drops EXIF/GPS entirely.
      const output = await sharp(input)
        .rotate()
        .resize(LONG_EDGE, LONG_EDGE, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
        .toBuffer();

      // Content-addressed name: same source photo → same processed buffer →
      // same hash → same name, so re-running is idempotent (original filenames
      // are never kept). NOTE: not reversible for photos already uploaded under
      // the old random names.
      const name = `${createHash("sha256").update(output).digest("hex").slice(0, 16)}.jpg`;
      const destPath = `${prefix}${name}`;

      // Fast path: already present from a prior run (or earlier in this one).
      if (existing.has(name)) {
        skipped++;
        console.log(`[${index + 1}/${files.length}] skip (exists) ${sourceName}`);
        return;
      }

      const { error } = await supabase.storage.from(BUCKET).upload(destPath, output, {
        contentType: "image/jpeg",
        upsert: false,
      });

      if (error) {
        // upsert:false → an existing object (e.g. a race with another worker on
        // an identical photo) reports as already-existing; skip it.
        if (/exist|duplicate|409/i.test(error.message)) {
          existing.add(name);
          skipped++;
          console.log(`[${index + 1}/${files.length}] skip (exists) ${sourceName}`);
          return;
        }
        throw new Error(error.message);
      }
      existing.add(name);

      uploaded++;
      totalBytes += output.byteLength;
      console.log(
        `[${index + 1}/${files.length}] ok   ${sourceName} → ${destPath} ` +
          `(${(output.byteLength / 1024 / 1024).toFixed(2)} MB)`,
      );
    } catch (err) {
      failed++;
      console.error(
        `[${index + 1}/${files.length}] FAIL ${sourceName}: ${(err as Error).message}`,
      );
    } finally {
      // Always remove the temp JPEG produced from a HEIC source.
      if (tempPath) await unlink(tempPath).catch(() => {});
    }
  }

  // Simple fixed-size worker pool for concurrency.
  async function worker() {
    while (cursor < files.length) {
      const i = cursor++;
      await processOne(files[i]!, i);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  const totalMB = (totalBytes / 1024 / 1024).toFixed(2);
  const avgKB = uploaded ? (totalBytes / uploaded / 1024).toFixed(0) : "0";
  console.log(
    `\nDone. Uploaded ${uploaded} file(s), ${totalMB} MB total, avg ${avgKB} KB/file.` +
      (skipped ? ` Skipped ${skipped} (already existed).` : "") +
      (failed ? ` \x1b[31m${failed} failed.\x1b[0m` : ""),
  );
  if (failed) process.exit(1);
}

main().catch((err) => fail((err as Error).message));
