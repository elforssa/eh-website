import type { Attribution } from "./attribution";
import type { InquiryDraft } from "./client";

export type PreparedInquiry = {
  fingerprint: string;
  payload: InquiryDraft & { request_key: string };
};

export function prepareSubmission(
  previous: PreparedInquiry | null,
  draft: Omit<InquiryDraft, "attribution">,
  attribution: Attribution,
  uuid: () => string = () => crypto.randomUUID(),
): PreparedInquiry {
  const fingerprint = JSON.stringify(draft);
  if (previous?.fingerprint === fingerprint) return previous;
  return {
    fingerprint,
    payload: { ...draft, request_key: uuid(), attribution: { ...attribution } },
  };
}
