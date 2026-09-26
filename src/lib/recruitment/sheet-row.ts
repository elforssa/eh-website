export type KeyedHiringLead = {
  request_key: string;
  role: string;
  name: string;
  phone?: string;
  email?: string;
  answers: Record<string, string>;
};

export async function deliverKeyedRecruitmentRow(
  lead: KeyedHiringLead,
  readKeys: () => Promise<string[]>,
  appendRow: (row: string[]) => Promise<void>,
  now: () => string = () => new Date().toISOString(),
) {
  if ((await readKeys()).includes(lead.request_key)) return false;
  await appendRow([lead.request_key, now(), lead.role, lead.name, lead.phone || "", lead.email || "", JSON.stringify(lead.answers)]);
  return true;
}
