export function legacyMetaCapiEnabled(value: string | undefined, vercelEnvironment = process.env.VERCEL_ENV) {
  return value === "true" && vercelEnvironment !== "preview";
}

export async function runLegacyMetaCompatibility(
  enabled: string | undefined,
  delivery: () => Promise<unknown>,
  onFailure: (error: unknown) => void,
  vercelEnvironment = process.env.VERCEL_ENV,
) {
  if (!legacyMetaCapiEnabled(enabled, vercelEnvironment)) return;
  try { await delivery(); }
  catch (error) {
    try { onFailure(error); } catch { /* Compatibility reporting is also best effort. */ }
  }
}
