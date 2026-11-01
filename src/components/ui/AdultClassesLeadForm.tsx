"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck2, Loader2 } from "lucide-react";
import { InquiryError, useInquirySubmission } from "@/lib/crm/client";
import { InquiryConsent } from "./InquiryConsent";
import { InquiryErrorText } from "./InquiryErrorText";
import { InquiryTurnstile } from "./InquiryTurnstile";
import { crmFormKey, type CrmWorkflow } from "@/lib/acquisition/workflow";

// The formule is sent as program_interest, so the receptionist sees it as the
// lead's declared interest in the CRM. Labels stay short; values carry context.
const formules = [
  { label: "Standard — 3h par semaine", value: "Cours adultes – Standard (3h/semaine)" },
  { label: "Intensif — 6h par semaine", value: "Cours adultes – Intensif (6h/semaine)" },
] as const;

const levels = ["Débutant", "Intermédiaire", "Avancé", "Je ne sais pas"];
const commuteOptions = ["Oui", "Non, c'est trop loin"];

type FormState = {
  name: string;
  phone: string;
  email: string;
  formule: string;
  currentLevel: string;
  commute: string;
  privacyConsent: boolean;
  website: string;
};

const initialForm: FormState = {
  name: "",
  phone: "",
  email: "",
  formule: "",
  currentLevel: "",
  commute: "",
  privacyConsent: false,
  website: "",
};

export function AdultClassesLeadForm({ campaign }: { campaign: CrmWorkflow & { formSchema: "campaign_adult_lead_v1" } }) {
  const router = useRouter();
  const inquiry = useInquirySubmission();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Votre nom est requis.";
    const digits = form.phone.replace(/\D/g, "").length;
    if (!form.phone.trim()) next.phone = "Votre numéro de téléphone est requis.";
    else if (digits < 9 || digits > 15) next.phone = "Veuillez entrer un numéro valide.";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Veuillez entrer une adresse e-mail valide.";
    if (!form.formule) next.formule = "Veuillez choisir une formule.";
    if (!form.currentLevel) next.currentLevel = "Veuillez choisir votre niveau.";
    if (!form.commute) next.commute = "Veuillez répondre à cette question.";
    if (!form.privacyConsent) next.privacyConsent = "Veuillez accepter le traitement de votre demande.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    inquiry.invalidate();
    const { id, value } = e.target;
    setForm((current) => ({ ...current, [id]: value }));
    if (errors[id as keyof FormState]) setErrors((current) => ({ ...current, [id]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inquiry.isPending()) return;
    setServerError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const email = form.email.trim();
      const accepted = await inquiry.submit({
        form_key: crmFormKey(campaign),
        contact: { name: form.name, phone: form.phone, ...(email ? { email } : {}) },
        answers: {
          program_interest: form.formule,
          current_level: form.currentLevel,
          // Page-specific answer: passes through to the CRM form answers.
          deplacement_centre: form.commute,
        },
        consent: form.privacyConsent,
        website: form.website,
      });
      if (!accepted) return;
      setForm(initialForm);
      router.push("/merci");
    } catch (error) {
      setServerError(error instanceof InquiryError ? error.message : "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-base outline-none transition-colors focus:ring-2 focus:ring-navy-primary ${hasError ? "border-red-500" : "border-gray-300"}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <input id="website" value={form.website} onChange={handleChange} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-black text-navy-deep">
          Nom complet <span aria-hidden="true">*</span>
        </label>
        <input id="name" type="text" autoComplete="name" value={form.name} onChange={handleChange} aria-required="true"
          aria-describedby={errors.name ? "adult-name-error" : undefined} className={inputClass(Boolean(errors.name))} placeholder="Votre nom" />
        {errors.name && <p id="adult-name-error" className="text-xs font-medium text-red-600">{errors.name}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-black text-navy-deep">
            Téléphone / WhatsApp <span aria-hidden="true">*</span>
          </label>
          <input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange} aria-required="true"
            aria-describedby={errors.phone ? "adult-phone-error" : undefined} className={inputClass(Boolean(errors.phone))} placeholder="+212 6 ..." />
          {errors.phone && <p id="adult-phone-error" className="text-xs font-medium text-red-600">{errors.phone}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-black text-navy-deep">
            E-mail <span className="font-semibold text-gray-500">(facultatif)</span>
          </label>
          <input id="email" type="email" autoComplete="email" value={form.email} onChange={handleChange}
            aria-describedby={errors.email ? "adult-email-error" : undefined} className={inputClass(Boolean(errors.email))} placeholder="vous@email.com" />
          {errors.email && <p id="adult-email-error" className="text-xs font-medium text-red-600">{errors.email}</p>}
        </div>
      </div>

      <SelectField id="formule" label="Quelle formule vous intéresse ?" value={form.formule} error={errors.formule} onChange={handleChange}
        options={formules.map(({ label, value }) => ({ label, value }))} />

      <SelectField id="currentLevel" label="Votre niveau actuel en anglais" value={form.currentLevel} error={errors.currentLevel} onChange={handleChange}
        options={levels.map((level) => ({ label: level, value: level }))} />

      <SelectField id="commute" label="Le centre est situé au Quartier Almaz, Casablanca. Pouvez-vous vous y rendre facilement ?" value={form.commute}
        error={errors.commute} onChange={handleChange} options={commuteOptions.map((option) => ({ label: option, value: option }))} />

      <InquiryConsent checked={form.privacyConsent} onChange={(privacyConsent) => { inquiry.invalidate(); setErrors((current) => ({ ...current, privacyConsent: undefined })); setForm((current) => ({ ...current, privacyConsent })); }} error={errors.privacyConsent} />
      <InquiryTurnstile ref={inquiry.turnstileRef} />

      {serverError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          <InquiryErrorText message={serverError} />
        </div>
      )}

      <button type="submit" disabled={submitting} aria-disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-red-accent px-6 py-4 text-base font-black text-white shadow-lg shadow-red-accent/20 transition-colors hover:bg-[#9d1726] disabled:cursor-not-allowed disabled:opacity-70">
        {submitting ? (
          <><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />Envoi en cours...</>
        ) : (
          <><CalendarCheck2 className="h-5 w-5" aria-hidden="true" />Réserver mon test de niveau gratuit</>
        )}
      </button>
      <p className="text-center text-xs leading-relaxed text-gray-500">
        Un conseiller vous appelle pour fixer votre test de niveau, gratuit et sans engagement.
      </p>
    </form>
  );
}

function SelectField({ id, label, value, options, error, onChange }: {
  id: keyof FormState;
  label: string;
  value: string;
  options: { label: string; value: string }[];
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-black text-navy-deep">
        {label} <span aria-hidden="true">*</span>
      </label>
      <select id={id} value={value} onChange={onChange} aria-required="true" aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-base outline-none transition-colors focus:ring-2 focus:ring-navy-primary ${error ? "border-red-500" : "border-gray-300"}`}>
        <option value="">Sélectionner</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && <p id={`${id}-error`} className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
