"use client";

import { useEffect, useRef } from "react";
import { readAttribution, type Attribution } from "./attribution";
import { prepareSubmission, type PreparedInquiry } from "./prepared";
import { sendPreparedInquiry, TurnstileError } from "./transport";
import type { InquiryTurnstileHandle } from "@/components/ui/InquiryTurnstile";
import type { AnswerValue } from "./answer-sanitizer";

import type { CrmSchema } from "@/lib/acquisition/workflow";

export type FormKey = CrmSchema;
export type InquiryDraft = {
  form_key: FormKey;
  contact: { name?: string; phone?: string; email?: string };
  answers: Record<string, AnswerValue>;
  consent: boolean;
  website: string;
  attribution?: Attribution;
};

export class InquiryError extends Error {
  constructor(public readonly kind: "validation" | "rate_limit" | "temporary", message: string) { super(message); }
}

export function useInquirySubmission() {
  const attribution = useRef<Attribution>({});
  const prepared = useRef<PreparedInquiry | null>(null);
  const pending = useRef(false);
  const turnstileRef = useRef<InquiryTurnstileHandle>(null);

  useEffect(() => { attribution.current = readAttribution(); }, []);

  async function submit(draft: Omit<InquiryDraft, "attribution">) {
    if (pending.current) return false;
    pending.current = true;
    try {
      prepared.current = prepareSubmission(prepared.current, draft, attribution.current);
      // One network submission per token. An uncertain response is retried by
      // the visitor with the same UUID and a newly executed challenge.
      const response = await sendPreparedInquiry(prepared.current, () => {
        if (!turnstileRef.current) throw new TurnstileError();
        return turnstileRef.current.requestToken();
      });
      if (!response.ok) {
        const kind = response.status === 400 || response.status === 422 ? "validation"
          : response.status === 429 ? "rate_limit" : "temporary";
        const message = kind === "rate_limit" ? "Trop de tentatives. Veuillez réessayer plus tard."
          : kind === "validation" ? "Vérifiez vos informations et réessayez."
          : "Le service est temporairement indisponible. Réessayez avec les mêmes informations.";
        throw new InquiryError(kind, message);
      }
      prepared.current = null;
      return true;
    } catch (error) {
      if (error instanceof InquiryError) throw error;
      if (error instanceof TurnstileError) throw new InquiryError("validation", error.message);
      throw new InquiryError("temporary", "Erreur réseau. Vérifiez votre connexion et réessayez.");
    } finally {
      pending.current = false;
    }
  }

  return { submit, turnstileRef, isPending: () => pending.current, invalidate: () => { prepared.current = null; } };
}
