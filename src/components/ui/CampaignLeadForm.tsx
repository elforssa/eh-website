"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crmFormKey, type CrmWorkflow } from "@/lib/acquisition/workflow";
import { InquiryError, useInquirySubmission } from "@/lib/crm/client";
import { answerLimits, isSafeAnswerKey } from "@/lib/crm/answer-sanitizer";
import { InquiryConsent } from "./InquiryConsent";
import { InquiryTurnstile } from "./InquiryTurnstile";

type CampaignConfig = CrmWorkflow & {
  formSchema: "campaign_parent_lead_v1" | "campaign_adult_lead_v1";
  programInterest: string;
};
const questions = {
  learner_name: "Nom de l'apprenant", learner_age: "Âge de l'apprenant",
  learner_ages: "Âges des apprenants", children_count: "Nombre d'enfants",
  learner_type: "Pour qui sont les cours ?", objective: "Objectif",
  current_level: "Niveau actuel", availability: "Disponibilités",
  location_confirmed: "L'emplacement proposé vous convient-il ?",
} as const;
type Question = keyof typeof questions;
const parentQuestions = new Set<Question>(["learner_name", "learner_age", "learner_ages", "children_count", "objective", "current_level", "availability", "location_confirmed"]);
const adultQuestions = new Set<Question>(["learner_type", "objective", "current_level", "availability"]);

// Reusable UI for new education landing pages; current pages keep their bespoke layouts.
export function CampaignLeadForm({ campaign }: { campaign: CampaignConfig }) {
  const router = useRouter();
  const inquiry = useInquirySubmission();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const allowed = campaign.formSchema === "campaign_parent_lead_v1" ? parentQuestions : adultQuestions;
  const visible = campaign.visibleQuestions || [];
  const extra = campaign.extraQuestions || [];
  if (visible.length + extra.length + 1 > answerLimits.count) throw new Error("Too many CRM campaign questions");
  for (const key of visible) {
    if (!(key in questions) || !allowed.has(key as Question)) throw new Error(`Invalid CRM campaign question key: ${key}`);
  }
  const configuredKeys = new Set<string>(["program_interest", ...visible]);
  for (const question of extra) {
    if (!isSafeAnswerKey(question.key) || !question.label.trim() || configuredKeys.has(question.key) || question.key in questions) {
      throw new Error(`Invalid CRM campaign question key: ${question.key}`);
    }
    configuredKeys.add(question.key);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (inquiry.isPending()) return;
    setError("");
    if (!name.trim() || !phone.trim() || !consent || !campaign.programInterest.trim()
      || extra.some((question) => question.required && (question.inputType === "checkbox" ? answers[question.key] !== true : !String(answers[question.key] || "").trim()))) {
      setError("Veuillez compléter les champs obligatoires et accepter le traitement de votre demande.");
      return;
    }
    const answerPayload: Record<string, string | number | boolean> = { program_interest: campaign.programInterest };
    for (const key of visible as readonly Question[]) {
      const value = answers[key];
      if (key === "location_confirmed" && typeof value === "boolean") answerPayload[key] = value;
      else if ((key === "learner_age" || key === "children_count") && value) answerPayload[key] = Number(value);
      else if (typeof value === "string" && value.trim()) answerPayload[key] = value.trim();
    }
    for (const question of extra) {
      const value = answers[question.key];
      if (question.inputType === "checkbox") answerPayload[question.key] = value === true;
      else if (question.inputType === "number" && value !== undefined && value !== "") answerPayload[question.key] = Number(value);
      else if (typeof value === "string" && value.trim()) answerPayload[question.key] = value.trim();
    }
    setSubmitting(true);
    try {
      const accepted = await inquiry.submit({
        form_key: crmFormKey(campaign), contact: { name, phone, ...(email ? { email } : {}) },
        answers: answerPayload, consent, website,
      });
      if (accepted) router.push("/merci");
    } catch (cause) { setError(cause instanceof InquiryError ? cause.message : "Une erreur est survenue."); }
    finally { setSubmitting(false); }
  }
  return <form onSubmit={submit} className="space-y-5" noValidate>
    <input className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => { inquiry.invalidate(); setWebsite(e.target.value); }} />
    <label className="block">Nom complet *<input className="mt-2 w-full rounded-xl border p-3" value={name} onChange={(e) => { inquiry.invalidate(); setName(e.target.value); }} autoComplete="name" /></label>
    <label className="block">Téléphone *<input className="mt-2 w-full rounded-xl border p-3" type="tel" value={phone} onChange={(e) => { inquiry.invalidate(); setPhone(e.target.value); }} autoComplete="tel" /></label>
    <label className="block">E-mail<input className="mt-2 w-full rounded-xl border p-3" type="email" value={email} onChange={(e) => { inquiry.invalidate(); setEmail(e.target.value); }} autoComplete="email" /></label>
    {(visible as readonly Question[]).map((key) => <label className="block" key={key}>{questions[key]}
      {key === "location_confirmed"
        ? <input className="ml-3" type="checkbox" checked={answers[key] === true} onChange={(e) => { inquiry.invalidate(); setAnswers((current) => ({ ...current, [key]: e.target.checked })); }} />
        : <input className="mt-2 w-full rounded-xl border p-3" type={key === "learner_age" || key === "children_count" ? "number" : "text"} value={String(answers[key] || "")} onChange={(e) => { inquiry.invalidate(); setAnswers((current) => ({ ...current, [key]: e.target.value })); }} />}
    </label>)}
    {extra.map((question) => <label className="block" key={question.key}>{question.label}{question.required ? " *" : ""}
      {question.inputType === "checkbox"
        ? <input className="ml-3" type="checkbox" checked={answers[question.key] === true} onChange={(e) => { inquiry.invalidate(); setAnswers((current) => ({ ...current, [question.key]: e.target.checked })); }} />
        : <input className="mt-2 w-full rounded-xl border p-3" type={question.inputType === "number" ? "number" : "text"} value={String(answers[question.key] || "")} onChange={(e) => { inquiry.invalidate(); setAnswers((current) => ({ ...current, [question.key]: e.target.value })); }} />}
    </label>)}
    <InquiryConsent checked={consent} onChange={(value) => { inquiry.invalidate(); setConsent(value); }} error={!consent && error ? error : undefined} />
    <InquiryTurnstile ref={inquiry.turnstileRef} />
    {error && consent && <p role="alert" className="text-red-600">{error}</p>}
    <button disabled={submitting} className="rounded-full bg-red-accent px-6 py-3 font-bold text-white disabled:opacity-70">{submitting ? "Envoi…" : "Envoyer ma demande"}</button>
  </form>;
}
