"use client";

import { useState } from "react";
import { Button } from "./Button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useInquirySubmission, InquiryError } from "@/lib/crm/client";
import { InquiryConsent } from "./InquiryConsent";
import { crmFormKey, type CrmWorkflow } from "@/lib/acquisition/workflow";

type FormState = {
  name: string;
  email: string;
  program: string;
  message: string;
  privacyConsent: boolean;
  website: string;
};

const initialForm: FormState = { name: "", email: "", program: "Renseignement général", message: "", privacyConsent: false, website: "" };

export function ContactForm({ campaign }: { campaign: CrmWorkflow & { formSchema: "general_contact_v1" } }) {
  const inquiry = useInquirySubmission();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) newErrors.name = "Votre nom est requis.";
    if (!form.email.trim()) {
      newErrors.email = "Votre adresse e-mail est requise.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Veuillez entrer une adresse e-mail valide.";
    }
    if (!form.message.trim()) newErrors.message = "Votre message est requis.";
    if (!form.privacyConsent) newErrors.privacyConsent = "Veuillez accepter le traitement de votre demande.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    inquiry.invalidate();
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
    if (errors[id as keyof FormState]) {
      setErrors(prev => ({ ...prev, [id]: undefined }));
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
        contact: { name: form.name, email: form.email },
        answers: { program_interest: form.program, message: form.message },
        consent: form.privacyConsent,
        website: form.website,
      });
      if (!accepted) return;
      setSuccess(true);
      setForm(initialForm);
    } catch (error) {
      setServerError(error instanceof InquiryError ? error.message : "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" aria-hidden="true" />
        </div>
        <h3 className="text-2xl font-bold text-navy mb-3">Message envoyé !</h3>
        <p className="text-gray-600 mb-8 max-w-sm">
          Merci. Votre demande a bien été reçue. Notre équipe vous recontactera au sujet de votre demande.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-navy-primary font-semibold underline underline-offset-2 hover:text-red-accent transition-colors"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <input id="website" value={form.website} onChange={handleChange} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-navy">
          Nom <span aria-hidden="true">*</span>
        </label>
        <input
          type="text"
          id="name"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          aria-required="true"
          aria-describedby={errors.name ? "name-error" : undefined}
          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-navy outline-none transition-colors ${errors.name ? "border-red-500" : "border-gray-300"}`}
          placeholder="Votre nom"
        />
        {errors.name && <p id="name-error" role="alert" className="text-red-600 text-xs mt-1">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-navy">
          E-mail <span aria-hidden="true">*</span>
        </label>
        <input
          type="email"
          id="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          aria-required="true"
          aria-describedby={errors.email ? "email-error" : undefined}
          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-navy outline-none transition-colors ${errors.email ? "border-red-500" : "border-gray-300"}`}
          placeholder="votre@email.com"
        />
        {errors.email && <p id="email-error" role="alert" className="text-red-600 text-xs mt-1">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="program" className="block text-sm font-medium text-navy">
          Programme concerné
        </label>
        <select
          id="program"
          value={form.program}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy outline-none transition-colors bg-white"
        >
          <option>Renseignement général</option>
          <option>Formation entreprise</option>
          <option>Programmes enfants</option>
          <option>Programmes adultes</option>
          <option>Préparation aux examens</option>
          <option>Formations courtes</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="block text-sm font-medium text-navy">
          Message <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="message"
          rows={4}
          value={form.message}
          onChange={handleChange}
          aria-required="true"
          aria-describedby={errors.message ? "message-error" : undefined}
          className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-navy outline-none transition-colors resize-none ${errors.message ? "border-red-500" : "border-gray-300"}`}
          placeholder="Comment pouvons-nous vous aider ?"
        />
        {errors.message && <p id="message-error" role="alert" className="text-red-600 text-xs mt-1">{errors.message}</p>}
      </div>

      <InquiryConsent checked={form.privacyConsent} onChange={(privacyConsent) => { inquiry.invalidate(); setErrors((current) => ({ ...current, privacyConsent: undefined })); setForm((current) => ({ ...current, privacyConsent })); }} error={errors.privacyConsent} />

      {serverError && (
        <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
          {serverError}
        </div>
      )}

      <Button
        type="submit"
        variant="primary-red"
        className="w-full text-lg py-4"
        disabled={submitting}
        aria-disabled={submitting}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> Envoi en cours…
          </span>
        ) : "Envoyer le message"}
      </Button>
    </form>
  );
}
