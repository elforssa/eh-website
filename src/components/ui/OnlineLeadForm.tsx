"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck2, Loader2 } from "lucide-react";

type LeadFormState = {
  name: string;
  phone: string;
  email: string;
  learnerType: string;
  programInterest: string;
  objective: string;
  currentLevel: string;
  availability: string;
  website: string;
};

type AttributionState = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_campaign_name?: string;
  utm_adset?: string;
  utm_adset_name?: string;
  utm_content?: string;
  utm_ad_name?: string;
  utm_term?: string;
  placement?: string;
  fbclid?: string;
  landing_page?: string;
  form_page?: string;
  referrer?: string;
};

type MetaTrackingState = {
  fbp?: string;
  fbc?: string;
};

const initialForm: LeadFormState = {
  name: "",
  phone: "",
  email: "",
  learnerType: "",
  programInterest: "",
  objective: "",
  currentLevel: "",
  availability: "",
  website: "",
};

const attributionKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_campaign_name",
  "utm_adset",
  "utm_adset_name",
  "utm_content",
  "utm_ad_name",
  "utm_term",
  "placement",
  "fbclid",
] as const;
const storageKey = "english_hills_ad_attribution";

function readAttribution(): AttributionState {
  const params = new URLSearchParams(window.location.search);
  const fromUrl: AttributionState = {};

  attributionKeys.forEach((key) => {
    const value = params.get(key);
    if (value) fromUrl[key] = value.slice(0, 500);
  });

  let saved: AttributionState = {};
  try {
    saved = JSON.parse(window.localStorage.getItem(storageKey) || "{}");
  } catch {
    saved = {};
  }

  const hasFreshAttribution = Object.keys(fromUrl).length > 0;
  const attribution = {
    ...saved,
    ...fromUrl,
    landing_page: hasFreshAttribution ? window.location.href : saved.landing_page || window.location.href,
    form_page: window.location.href,
    referrer: saved.referrer || document.referrer || undefined,
  };

  if (hasFreshAttribution) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(attribution));
    } catch {
      // Attribution is useful, but the lead form must keep working without it.
    }
  }

  return attribution;
}

function readCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");
}

function readMetaTracking(attribution: AttributionState): MetaTrackingState {
  const fbp = readCookie("_fbp");
  const fbcFromCookie = readCookie("_fbc");

  if (fbcFromCookie || !attribution.fbclid) {
    return {
      fbp,
      fbc: fbcFromCookie,
    };
  }

  return {
    fbp,
    fbc: `fb.1.${Date.now()}.${attribution.fbclid}`,
  };
}

export function OnlineLeadForm() {
  const router = useRouter();
  const [form, setForm] = useState<LeadFormState>(initialForm);
  const [attribution, setAttribution] = useState<AttributionState>({});
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormState, string>>>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setAttribution(readAttribution());
  }, []);

  const validate = () => {
    const nextErrors: Partial<Record<keyof LeadFormState, string>> = {};
    if (!form.name.trim()) nextErrors.name = "Votre nom est requis.";
    if (!form.phone.trim()) nextErrors.phone = "Votre numéro WhatsApp est requis.";
    if (!form.email.trim()) {
      nextErrors.email = "Votre adresse e-mail est requise.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Veuillez entrer une adresse e-mail valide.";
    }
    if (!form.learnerType.trim()) nextErrors.learnerType = "Veuillez choisir pour qui sont les cours.";
    if (!form.programInterest.trim()) nextErrors.programInterest = "Veuillez choisir un format.";
    if (!form.objective.trim()) nextErrors.objective = "Veuillez choisir votre objectif.";
    if (!form.currentLevel.trim()) nextErrors.currentLevel = "Veuillez choisir votre niveau.";
    if (!form.availability.trim()) nextErrors.availability = "Veuillez choisir une disponibilite.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setForm((current) => ({ ...current, [id]: value }));
    if (errors[id as keyof LeadFormState]) {
      setErrors((current) => ({ ...current, [id]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/ad-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          leadSource: "online_landing",
          locationConfirmed: true,
          attribution,
          metaTracking: readMetaTracking(attribution),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "Une erreur est survenue. Veuillez réessayer.");
        return;
      }

      if (!data.leadId || !data.thankYouToken) {
        setServerError("Votre demande a été reçue, mais la redirection a échoué. Veuillez nous contacter sur WhatsApp.");
        return;
      }

      setForm(initialForm);
      router.push(`/merci?lead_id=${encodeURIComponent(data.leadId)}&token=${encodeURIComponent(data.thankYouToken)}`);
    } catch {
      setServerError("Erreur réseau. Vérifiez votre connexion et reessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <input
        id="website"
        value={form.website}
        onChange={handleChange}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-black text-navy-deep">
          Nom complet <span aria-hidden="true">*</span>
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          aria-required="true"
          aria-describedby={errors.name ? "online-name-error" : undefined}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-base outline-none transition-colors focus:ring-2 focus:ring-[#1f8a70] ${errors.name ? "border-red-500" : "border-gray-300"}`}
          placeholder="Votre nom"
        />
        {errors.name && <p id="online-name-error" className="text-xs font-medium text-red-600">{errors.name}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-black text-navy-deep">
            WhatsApp / Téléphone <span aria-hidden="true">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
            aria-required="true"
            aria-describedby={errors.phone ? "online-phone-error" : undefined}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-base outline-none transition-colors focus:ring-2 focus:ring-[#1f8a70] ${errors.phone ? "border-red-500" : "border-gray-300"}`}
            placeholder="+212 6 ..."
          />
          {errors.phone && <p id="online-phone-error" className="text-xs font-medium text-red-600">{errors.phone}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-black text-navy-deep">
            E-mail <span aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            aria-required="true"
            aria-describedby={errors.email ? "online-email-error" : undefined}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-base outline-none transition-colors focus:ring-2 focus:ring-[#1f8a70] ${errors.email ? "border-red-500" : "border-gray-300"}`}
            placeholder="vous@email.com"
          />
          {errors.email && <p id="online-email-error" className="text-xs font-medium text-red-600">{errors.email}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          id="learnerType"
          label="Pour qui ?"
          value={form.learnerType}
          error={errors.learnerType}
          onChange={handleChange}
          options={["Pour moi", "Pour mon enfant"]}
        />
        <SelectField
          id="programInterest"
          label="Format souhaite"
          value={form.programInterest}
          error={errors.programInterest}
          onChange={handleChange}
          options={["Cours particulier 1:1", "Petit groupe en ligne (jusqu'à 8 personnes)", "Je veux être conseillé"]}
        />
      </div>

      <SelectField
        id="objective"
        label="Quel est votre objectif ?"
        value={form.objective}
        error={errors.objective}
        onChange={handleChange}
        options={[
          "Parler anglais avec aisance au travail",
          "Préparer l'IELTS / TOEFL",
          "Améliorer mon anglais général",
          "Programme personnalisé",
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          id="currentLevel"
          label="Quel est votre niveau actuel en anglais ?"
          value={form.currentLevel}
          error={errors.currentLevel}
          onChange={handleChange}
          options={["Débutant", "Intermédiaire", "Avancé", "Je ne sais pas"]}
        />
        <SelectField
          id="availability"
          label="Quand êtes-vous disponible ?"
          value={form.availability}
          error={errors.availability}
          onChange={handleChange}
          options={["Matin (8h-12h)", "Après-midi (12h-17h)", "Soir (17h-21h)", "Week-end"]}
        />
      </div>

      {serverError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        aria-disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1f8a70] px-6 py-4 text-base font-black text-white shadow-lg shadow-[#1f8a70]/20 transition-colors hover:bg-[#176d59] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Envoi en cours...
          </>
        ) : (
          <>
            <CalendarCheck2 className="h-5 w-5" aria-hidden="true" />
            Recevoir mon plan de cours
          </>
        )}
      </button>
      <p className="text-center text-xs leading-relaxed text-gray-500">
        Un conseiller vous contacte pour vérifier votre objectif et proposer le format le plus adapté.
      </p>
    </form>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  error,
  onChange,
}: {
  id: keyof LeadFormState;
  label: string;
  value: string;
  options: string[];
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-black text-navy-deep">
        {label} <span aria-hidden="true">*</span>
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        aria-required="true"
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-base outline-none transition-colors focus:ring-2 focus:ring-[#1f8a70] ${error ? "border-red-500" : "border-gray-300"}`}
      >
        <option value="">Sélectionner</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      {error && <p id={`${id}-error`} className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
