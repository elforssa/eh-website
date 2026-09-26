export async function runBestEffort(delivery: () => Promise<unknown>, onFailure: (error: unknown) => void): Promise<void> {
  try { await delivery(); }
  catch (error) { onFailure(error); }
}
