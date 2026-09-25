"use client";

import { useState } from "react";
import type { RecruitmentWorkflow } from "@/lib/acquisition/workflow";
import { useTemporaryRecruitmentSubmission } from "@/lib/recruitment/client";
import { InquiryConsent } from "./InquiryConsent";

type Config = Extract<RecruitmentWorkflow, { workflow: "temporary_hiring_lead" }>;

// For short-lived hiring pages. The existing receptionist application keeps its own form.
export function TemporaryRecruitmentLeadForm({ campaign }: { campaign: Config }) {
  const delivery = useTemporaryRecruitmentSubmission(campaign);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (delivery.isPending()) return;
    setError("");
    if (!name.trim() || (!phone.trim() && !email.trim()) || !consent || (campaign.questions || []).some((q) => q.required && !answers[q.key]?.trim())) {
      setError("Veuillez compléter les champs obligatoires et accepter le traitement de votre demande.");
      return;
    }
    setSubmitting(true);
    try {
      if (await delivery.submit({ name, phone, email, answers, consent })) setSuccess(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Service temporairement indisponible."); }
    finally { setSubmitting(false); }
  }
  if (success) return <p role="status">Votre candidature a bien été reçue. Merci.</p>;
  return <form onSubmit={submit} className="space-y-5" noValidate>
    <label className="block">Nom complet *<input className="mt-2 w-full rounded-xl border p-3" value={name} onChange={(e) => { delivery.invalidate(); setName(e.target.value); }} autoComplete="name" /></label>
    <label className="block">Téléphone<input className="mt-2 w-full rounded-xl border p-3" value={phone} onChange={(e) => { delivery.invalidate(); setPhone(e.target.value); }} type="tel" autoComplete="tel" /></label>
    <label className="block">E-mail<input className="mt-2 w-full rounded-xl border p-3" value={email} onChange={(e) => { delivery.invalidate(); setEmail(e.target.value); }} type="email" autoComplete="email" /></label>
    {(campaign.questions || []).map((question) => <label className="block" key={question.key}>{question.label}{question.required ? " *" : ""}<input className="mt-2 w-full rounded-xl border p-3" value={answers[question.key] || ""} onChange={(e) => { delivery.invalidate(); setAnswers((current) => ({ ...current, [question.key]: e.target.value })); }} /></label>)}
    <InquiryConsent checked={consent} onChange={(value) => { delivery.invalidate(); setConsent(value); }} error={!consent && error ? error : undefined} />
    {error && consent && <p role="alert" className="text-red-600">{error}</p>}
    <button disabled={submitting} className="rounded-full bg-red-accent px-6 py-3 font-bold text-white disabled:opacity-70">{submitting ? "Envoi…" : "Envoyer ma candidature"}</button>
  </form>;
}
