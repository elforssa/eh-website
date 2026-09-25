export type HiringDraft = { name: string; phone: string; email: string; answers: Record<string, string>; consent: boolean };
export type PreparedHiring = { fingerprint: string; payload: Record<string, unknown> };

export function prepareHiringSubmission(
  previous: PreparedHiring | null,
  role: string,
  draft: HiringDraft,
  uuid: () => string = () => crypto.randomUUID(),
): PreparedHiring {
  const fingerprint = JSON.stringify({ role, ...draft });
  if (previous?.fingerprint === fingerprint) return previous;
  return { fingerprint, payload: {
    destination: "recruitment", workflow: "temporary_hiring_lead", role,
    request_key: uuid(), ...draft,
  } };
}
