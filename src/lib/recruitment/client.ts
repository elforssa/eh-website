"use client";

import { useRef } from "react";
import { submissionRoute, type RecruitmentWorkflow } from "@/lib/acquisition/workflow";
import { prepareHiringSubmission, type HiringDraft, type PreparedHiring } from "./prepared";

type TemporaryConfig = Extract<RecruitmentWorkflow, { workflow: "temporary_hiring_lead" }>;

export function useTemporaryRecruitmentSubmission(config: TemporaryConfig) {
  const prepared = useRef<PreparedHiring | null>(null);
  const pending = useRef(false);
  function invalidate() { prepared.current = null; }
  async function submit(draft: HiringDraft) {
    if (pending.current) return false;
    pending.current = true;
    try {
      prepared.current = prepareHiringSubmission(prepared.current, config.role, draft);
      const response = await fetch(submissionRoute(config), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prepared.current.payload),
      });
      if (!response.ok) throw new Error(response.status === 400 ? "Vérifiez vos informations." : "Service temporairement indisponible. Réessayez.");
      prepared.current = null;
      return true;
    } finally { pending.current = false; }
  }
  return { submit, invalidate, isPending: () => pending.current };
}
