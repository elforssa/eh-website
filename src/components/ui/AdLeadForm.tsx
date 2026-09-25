"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck2, Loader2 } from "lucide-react";
import { InquiryError, useInquirySubmission } from "@/lib/crm/client";
import { InquiryConsent } from "./InquiryConsent";
import { crmFormKey, type CrmWorkflow } from "@/lib/acquisition/workflow";

type LeadFormState = {
  name: string;
  phone: string;
  email: string;
  childrenCount: string;
  locationConfirmed: boolean;
  privacyConsent: boolean;
  website: string;
};

const initialForm: LeadFormState = {
  name: "",
  phone: "",
  email: "",
  childrenCount: "",
  locationConfirmed: false,
  privacyConsent: false,
  website: "",
};

export function AdLeadForm({ campaign }: { campaign: CrmWorkflow & { formSchema: "campaign_parent_lead_v1" } }) {
  const router = useRouter();
  const inquiry = useInquirySubmission();
  const [form, setForm] = useState<LeadFormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormState, string>>>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const nextErrors: Partial<Record<keyof LeadFormState, string>> = {};
    if (!form.name.trim()) nextErrors.name = "Votre nom est requis.";
    if (!form.phone.trim()) nextErrors.phone = "Votre numéro WhatsApp est requis.";
    if (!form.email.trim()) {
      nextErrors.email = "Votre adresse e-mail est requise.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Veuillez entrer une adresse e-mail valide.";
    }
    const childrenCount = Number(form.childrenCount);
    if (!form.childrenCount.trim() || !Number.isInteger(childrenCount) || childrenCount < 1) {
      nextErrors.childrenCount = "Veuillez indiquer le nombre d'enfants.";
    }
    if (!form.locationConfirmed) {
      nextErrors.locationConfirmed = "Veuillez confirmer que l'emplacement à Almaz 2, Casablanca vous convient.";
    }
    if (!form.privacyConsent) nextErrors.privacyConsent = "Veuillez accepter le traitement de votre demande.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    inquiry.invalidate();
    const { id, value } = e.target;
    const nextValue = e.target instanceof HTMLInputElement && e.target.type === "checkbox" ? e.target.checked : value;
    setForm((current) => ({ ...current, [id]: nextValue }));
    if (errors[id as keyof LeadFormState]) {
      setErrors((current) => ({ ...current, [id]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inquiry.isPending()) return;
    setServerError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const accepted = await inquiry.submit({
        form_key: crmFormKey(campaign),
        contact: { name: form.name, phone: form.phone, email: form.email },
        answers: { children_count: Number(form.childrenCount), location_confirmed: form.locationConfirmed, program_interest: campaign.programInterest || "" },
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <input
        id="website"
        value={form.website}
        onChange={handleChange}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="name" className="text-sm font-bold text-navy-deep">
            Nom complet <span aria-hidden="true">*</span>
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            aria-required="true"
            aria-describedby={errors.name ? "ad-lead-name-error" : undefined}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-base outline-none transition-colors focus:ring-2 focus:ring-navy-primary ${errors.name ? "border-red-500" : "border-gray-300"}`}
            placeholder="Votre nom"
          />
          {errors.name && <p id="ad-lead-name-error" className="text-xs font-medium text-red-600">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-bold text-navy-deep">
            WhatsApp / Téléphone <span aria-hidden="true">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
            aria-required="true"
            aria-describedby={errors.phone ? "ad-lead-phone-error" : undefined}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-base outline-none transition-colors focus:ring-2 focus:ring-navy-primary ${errors.phone ? "border-red-500" : "border-gray-300"}`}
            placeholder="+212 6 ..."
          />
          {errors.phone && <p id="ad-lead-phone-error" className="text-xs font-medium text-red-600">{errors.phone}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-bold text-navy-deep">
            E-mail <span aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            aria-required="true"
            aria-describedby={errors.email ? "ad-lead-email-error" : undefined}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-base outline-none transition-colors focus:ring-2 focus:ring-navy-primary ${errors.email ? "border-red-500" : "border-gray-300"}`}
            placeholder="vous@email.com"
          />
          {errors.email && <p id="ad-lead-email-error" className="text-xs font-medium text-red-600">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="childrenCount" className="text-sm font-bold text-navy-deep">
            Nombre d&apos;enfants <span aria-hidden="true">*</span>
          </label>
          <input
            id="childrenCount"
            type="number"
            inputMode="numeric"
            min="1"
            max="10"
            value={form.childrenCount}
            onChange={handleChange}
            aria-required="true"
            aria-describedby={errors.childrenCount ? "ad-lead-children-error" : undefined}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-base outline-none transition-colors focus:ring-2 focus:ring-navy-primary ${errors.childrenCount ? "border-red-500" : "border-gray-300"}`}
            placeholder="Ex: 2"
          />
          {errors.childrenCount && <p id="ad-lead-children-error" className="text-xs font-medium text-red-600">{errors.childrenCount}</p>}
        </div>
      </div>

      <div className={`rounded-2xl border p-4 ${errors.locationConfirmed ? "border-red-300 bg-red-50" : "border-navy-primary/15 bg-navy-primary/5"}`}>
        <label htmlFor="locationConfirmed" className="flex cursor-pointer items-start gap-3 text-sm font-semibold leading-6 text-navy-deep">
          <input
            id="locationConfirmed"
            type="checkbox"
            checked={form.locationConfirmed}
            onChange={handleChange}
            aria-required="true"
            aria-describedby={errors.locationConfirmed ? "ad-lead-location-error" : undefined}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-navy-primary focus:ring-navy-primary"
          />
          <span>
            Je confirme que l&apos;emplacement à Almaz 2, Casablanca me convient. <span aria-hidden="true">*</span>
          </span>
        </label>
        {errors.locationConfirmed && (
          <p id="ad-lead-location-error" className="mt-2 pl-7 text-xs font-medium text-red-600">
            {errors.locationConfirmed}
          </p>
        )}
      </div>

      <InquiryConsent checked={form.privacyConsent} onChange={(privacyConsent) => { inquiry.invalidate(); setErrors((current) => ({ ...current, privacyConsent: undefined })); setForm((current) => ({ ...current, privacyConsent })); }} error={errors.privacyConsent} />

      {serverError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        aria-disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-red-accent px-6 py-4 text-base font-bold text-white shadow-lg shadow-red-accent/20 transition-colors hover:bg-red-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Envoi en cours...
          </>
        ) : (
          <>
            <CalendarCheck2 className="h-5 w-5" aria-hidden="true" />
            Réserver une place au Summer Camp
          </>
        )}
      </button>
      <p className="text-center text-xs leading-relaxed text-gray-500">
        Vos paramètres publicitaires sont enregistrés avec la demande afin de mieux comprendre l&apos;origine du contact.
      </p>
    </form>
  );
}
