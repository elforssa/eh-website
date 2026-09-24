"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, ArrowRight, Check, Loader2, Upload } from "lucide-react";
import type { ExperienceCategory, JobApplicationInput } from "@/lib/job-applications/types";

type FormState = Omit<JobApplicationInput, "submissionKey" | "formToken" | "cvStoragePath" | "cvOriginalName" | "cvSizeBytes">;
type UploadedCv = { signature: string; path: string; token: string };

const initialForm: FormState = {
  website: "",
  fullName: "",
  phone: "",
  email: "",
  area: "",
  canCommuteAlmaz: null,
  preferredShift: "",
  startAvailability: "",
  acceptsCompensation: null,
  experienceCategories: [],
  experienceOther: "",
  salesExperienceDuration: "",
  previousProspecting: "",
  comfortableProspecting: "",
  comfortableTargets: null,
  frenchLevel: "",
  darijaLevel: "",
  englishLevel: "",
  crmToolsExperience: "",
  salesScenarioResponse: "",
  privacyConsent: false,
  attribution: {},
  metaTracking: {},
};

const steps = ["Coordonnées", "Expérience", "Langues & outils", "Situation & CV"];
const attributionKeys = [
  "utm_source", "utm_medium", "utm_campaign", "utm_campaign_name", "utm_adset",
  "utm_adset_name", "utm_content", "utm_ad_name", "utm_term", "placement", "fbclid",
] as const;
const attributionStorageKey = "english_hills_recruitment_attribution";

const experienceOptions: Array<{ value: ExperienceCategory; label: string }> = [
  { value: "SALES", label: "Vente / commercial" },
  { value: "CALL_CENTER", label: "Centre d'appel" },
  { value: "TELEPROSPECTING", label: "Téléprospection" },
  { value: "CUSTOMER_SERVICE", label: "Service client" },
  { value: "RECEPTION", label: "Réception" },
  { value: "EDUCATION_ADMISSIONS", label: "Éducation / admissions" },
  { value: "NONE", label: "Aucun de ces domaines" },
  { value: "OTHER", label: "Autre" },
];

function readCookie(name: string) {
  return document.cookie.split("; ").find((row) => row.startsWith(`${name}=`))?.split("=").slice(1).join("=");
}

function readAttribution(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const fresh: Record<string, string> = {};
  for (const key of attributionKeys) {
    const value = params.get(key);
    if (value) fresh[key] = value.slice(0, 500);
  }

  let saved: Record<string, string> = {};
  try { saved = JSON.parse(window.localStorage.getItem(attributionStorageKey) || "{}"); } catch { saved = {}; }
  const hasFresh = Object.keys(fresh).length > 0;
  const attribution: Record<string, string> = {
    ...saved,
    ...fresh,
    landing_page: hasFresh ? window.location.href : saved.landing_page || window.location.href,
    form_page: window.location.href,
    referrer: saved.referrer || document.referrer || "",
  };
  if (hasFresh) {
    try { window.localStorage.setItem(attributionStorageKey, JSON.stringify(attribution)); } catch { /* Optional attribution persistence. */ }
  }
  return attribution;
}

function metaTracking(attribution: Record<string, string>) {
  const fbp = readCookie("_fbp");
  const fbcCookie = readCookie("_fbc");
  const fbclid = attribution.fbclid;
  return {
    fbp,
    fbc: fbcCookie || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined),
  };
}

function fileSignature(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

export function JobApplicationForm() {
  const router = useRouter();
  const formTopRef = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [step, setStep] = useState(0);
  const [formToken, setFormToken] = useState("");
  const [submissionKey, setSubmissionKey] = useState("");
  const [cv, setCv] = useState<File | null>(null);
  const [uploadedCv, setUploadedCv] = useState<UploadedCv | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSubmissionKey(crypto.randomUUID());
    const attribution = readAttribution();
    setForm((current) => ({ ...current, attribution, metaTracking: metaTracking(attribution) }));
    fetch("/api/job-applications/session", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : Promise.reject())
      .then((result) => setFormToken(result.token || ""))
      .catch(() => setError("Le formulaire est temporairement indisponible. Rechargez la page."));
  }, []);

  const scenarioLength = form.salesScenarioResponse.trim().length;
  const progress = `${((step + 1) / steps.length) * 100}%`;
  const canSubmit = useMemo(() => Boolean(formToken && submissionKey && cv && !submitting), [formToken, submissionKey, cv, submitting]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function validateStep(currentStep: number) {
    if (currentStep === 0) {
      if (form.fullName.trim().length < 2) return "Veuillez saisir votre nom complet.";
      if (form.phone.replace(/\D/g, "").length < 9) return "Veuillez saisir un numéro de téléphone valide.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Veuillez saisir une adresse e-mail valide.";
      if (form.area.trim().length < 2) return "Veuillez indiquer votre quartier ou zone de résidence.";
      if (form.canCommuteAlmaz === null || !form.preferredShift || !form.startAvailability || form.acceptsCompensation === null) return "Veuillez répondre à toutes les questions de disponibilité.";
    }
    if (currentStep === 1) {
      if (form.experienceCategories.length === 0) return "Veuillez sélectionner au moins une expérience.";
      if (form.experienceCategories.includes("NONE") && form.experienceCategories.length > 1) return "« Aucun » ne peut pas être combiné avec une autre expérience.";
      if (form.experienceCategories.includes("OTHER") && form.experienceOther.trim().length < 2) return "Veuillez préciser votre autre expérience.";
      if (!form.salesExperienceDuration || !form.previousProspecting || !form.comfortableProspecting || form.comfortableTargets === null) return "Veuillez répondre à toutes les questions d’expérience.";
    }
    if (currentStep === 2 && (!form.frenchLevel || !form.darijaLevel || !form.englishLevel || !form.crmToolsExperience)) {
      return "Veuillez répondre à toutes les questions de langue et d’outils.";
    }
    if (currentStep === 3) {
      if (scenarioLength < 50 || scenarioLength > 700) return "Votre réponse doit contenir entre 50 et 700 caractères.";
      if (!cv) return "Veuillez joindre votre CV au format PDF.";
      if (cv.type !== "application/pdf" || !cv.name.toLowerCase().endsWith(".pdf")) return "Le CV doit être un fichier PDF.";
      if (cv.size > 5 * 1024 * 1024) return "Le CV doit faire moins de 5 Mo.";
      if (!form.privacyConsent) return "Veuillez accepter le traitement de vos données de candidature.";
    }
    return "";
  }

  function nextStep() {
    const message = validateStep(step);
    if (message) return setError(message);
    setError("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleExperience(value: ExperienceCategory) {
    const selected = form.experienceCategories;
    if (selected.includes(value)) return update("experienceCategories", selected.filter((item) => item !== value));
    if (value === "NONE") return update("experienceCategories", ["NONE"]);
    update("experienceCategories", [...selected.filter((item) => item !== "NONE"), value]);
  }

  async function ensureUploadedCv() {
    if (!cv) throw new Error("Veuillez joindre votre CV.");
    const signature = fileSignature(cv);
    if (uploadedCv?.signature === signature) return uploadedCv;

    const prepareResponse = await fetch("/api/job-applications/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formToken,
        submissionKey,
        fileName: cv.name,
        fileType: cv.type,
        fileSize: cv.size,
        website: form.website,
      }),
    });
    const prepared = await prepareResponse.json();
    if (!prepareResponse.ok) throw new Error(prepared.error || "Impossible de préparer l’envoi du CV.");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) throw new Error("Le service d’envoi est indisponible.");
    const supabase = createClient(supabaseUrl, anonKey);
    const { error: uploadError } = await supabase.storage
      .from("job-application-cvs")
      .uploadToSignedUrl(prepared.path, prepared.token, cv, { contentType: "application/pdf" });
    if (uploadError) throw new Error("L’envoi du CV a échoué. Veuillez réessayer.");

    const uploaded = { signature, path: prepared.path as string, token: prepared.token as string };
    setUploadedCv(uploaded);
    return uploaded;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submittingRef.current) return;
    const message = validateStep(3);
    if (message) return setError(message);
    if (!formToken || !submissionKey || !cv) return setError("Votre session n’est pas prête. Rechargez la page.");

    submittingRef.current = true;
    setSubmitting(true);
    setError("");
    try {
      const upload = await ensureUploadedCv();
      const response = await fetch("/api/job-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          submissionKey,
          formToken,
          cvStoragePath: upload.path,
          cvOriginalName: cv.name,
          cvSizeBytes: cv.size,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Impossible d’envoyer votre candidature.");

      if (result.duplicate) {
        router.push("/merci-candidature?duplicate=1");
        return;
      }
      if (!result.applicationId || !result.thankYouToken) throw new Error("La candidature a été enregistrée, mais la redirection a échoué.");
      router.push(`/merci-candidature?application_id=${encodeURIComponent(result.applicationId)}&token=${encodeURIComponent(result.thankYouToken)}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Une erreur est survenue. Veuillez réessayer.");
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div ref={formTopRef} className="scroll-mt-8 rounded-lg border border-slate-200 bg-white shadow-[0_24px_80px_rgba(13,43,94,0.12)]">
      <div className="border-b border-slate-200 px-5 py-5 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-red-accent">Candidature</p>
            <h2 className="mt-1 text-2xl font-black text-navy-deep">{steps[step]}</h2>
          </div>
          <span className="text-sm font-bold text-slate-500">{step + 1}/{steps.length}</span>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
          <div className="h-full bg-navy-primary transition-[width] duration-300" style={{ width: progress }} />
        </div>
      </div>

      <form onSubmit={submit} className="p-5 md:p-8" noValidate>
        <input className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={(event) => update("website", event.target.value)} />

        {step === 0 && (
          <div className="space-y-7">
            <SectionIntro title="Vos coordonnées" text="Nous les utiliserons uniquement pour votre candidature." />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Nom complet" value={form.fullName} onChange={(value) => update("fullName", value)} autoComplete="name" />
              <TextField label="Téléphone / WhatsApp" value={form.phone} onChange={(value) => update("phone", value)} type="tel" autoComplete="tel" placeholder="+212 6 ..." />
              <TextField label="E-mail" value={form.email} onChange={(value) => update("email", value)} type="email" autoComplete="email" />
              <TextField label="Quartier / zone de résidence" value={form.area} onChange={(value) => update("area", value)} autoComplete="address-level2" placeholder="Ex. Oulfa, Californie…" />
            </div>
            <RadioQuestion label="Pouvez-vous vous déplacer quotidiennement à Almaz, Casablanca ?" value={form.canCommuteAlmaz} onChange={(value) => update("canCommuteAlmaz", value)} options={[{ value: true, label: "Oui" }, { value: false, label: "Non" }]} />
            <RadioQuestion label="Quel horaire vous convient ?" value={form.preferredShift} onChange={(value) => update("preferredShift", value as FormState["preferredShift"])} options={[
              { value: "MORNING", label: "Matin — 09h00–15h00" },
              { value: "AFTERNOON", label: "Après-midi — 15h00–20h00" },
              { value: "EITHER", label: "Les deux me conviennent" },
            ]} />
            <RadioQuestion label="Quand pouvez-vous commencer ?" value={form.startAvailability} onChange={(value) => update("startAvailability", value as FormState["startAvailability"])} options={[
              { value: "IMMEDIATELY", label: "Immédiatement" },
              { value: "UNDER_ONE_WEEK", label: "Dans moins d'une semaine" },
              { value: "ONE_TO_TWO_WEEKS", label: "Dans 1–2 semaines" },
              { value: "OVER_TWO_WEEKS", label: "Dans plus de 2 semaines" },
            ]} />
            <RadioQuestion label="La rémunération proposée est de 4 000 DH + commissions sur les inscriptions. Cela vous convient-il ?" value={form.acceptsCompensation} onChange={(value) => update("acceptsCompensation", value)} options={[{ value: true, label: "Oui" }, { value: false, label: "Non" }]} />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-7">
            <SectionIntro title="Votre expérience" text="L’expérience est utile, mais elle n’est pas le seul critère de sélection." />
            <fieldset>
              <legend className="text-sm font-extrabold text-navy-deep">Avez-vous déjà travaillé dans l’un de ces domaines ? <Required /></legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {experienceOptions.map((option) => {
                  const checked = form.experienceCategories.includes(option.value);
                  return (
                    <label key={option.value} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition ${checked ? "border-navy-primary bg-blue-50 text-navy-deep" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleExperience(option.value)} className="h-4 w-4 accent-navy-primary" />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
            {form.experienceCategories.includes("OTHER") && <TextField label="Précisez votre autre expérience" value={form.experienceOther} onChange={(value) => update("experienceOther", value)} />}
            <RadioQuestion label="Combien de temps d'expérience avez-vous en vente, prospection ou relation client ?" value={form.salesExperienceDuration} onChange={(value) => update("salesExperienceDuration", value as FormState["salesExperienceDuration"])} options={[
              { value: "NONE", label: "Aucune expérience" }, { value: "UNDER_SIX_MONTHS", label: "Moins de 6 mois" },
              { value: "SIX_TO_TWELVE_MONTHS", label: "6–12 mois" }, { value: "ONE_TO_TWO_YEARS", label: "1–2 ans" },
              { value: "OVER_TWO_YEARS", label: "Plus de 2 ans" },
            ]} />
            <RadioQuestion label="Avez-vous déjà appelé des prospects qui avaient demandé des informations mais n'avaient pas encore acheté ?" value={form.previousProspecting} onChange={(value) => update("previousProspecting", value as FormState["previousProspecting"])} options={[
              { value: "REGULARLY", label: "Oui, régulièrement" }, { value: "SOMETIMES", label: "Oui, quelques fois" }, { value: "NEVER", label: "Non" },
            ]} />
            <RadioQuestion label="Le poste demande d'appeler et relancer quotidiennement des prospects intéressés par nos cours. Êtes-vous à l'aise avec cela ?" value={form.comfortableProspecting} onChange={(value) => update("comfortableProspecting", value as FormState["comfortableProspecting"])} options={[
              { value: "YES", label: "Oui, tout à fait" }, { value: "WITH_TRAINING", label: "Oui, avec une formation" }, { value: "NO", label: "Non" },
            ]} />
            <RadioQuestion label="Êtes-vous à l'aise avec des objectifs d'inscriptions et une rémunération comprenant des commissions ?" value={form.comfortableTargets} onChange={(value) => update("comfortableTargets", value)} options={[{ value: true, label: "Oui" }, { value: false, label: "Non" }]} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-7">
            <SectionIntro title="Langues et outils" text="Indiquez le niveau qui correspond le mieux à votre aisance réelle." />
            <RadioQuestion label="Français" value={form.frenchLevel} onChange={(value) => update("frenchLevel", value as FormState["frenchLevel"])} options={levelOptions(true)} />
            <RadioQuestion label="Darija" value={form.darijaLevel} onChange={(value) => update("darijaLevel", value as FormState["darijaLevel"])} options={levelOptions(false)} />
            <RadioQuestion label="Anglais" value={form.englishLevel} onChange={(value) => update("englishLevel", value as FormState["englishLevel"])} options={levelOptions(true)} />
            <RadioQuestion label="Êtes-vous à l'aise avec WhatsApp Business, Google Sheets et les outils informatiques de base ?" value={form.crmToolsExperience} onChange={(value) => update("crmToolsExperience", value as FormState["crmToolsExperience"])} options={[
              { value: "YES", label: "Oui" }, { value: "SOMEWHAT", label: "Un peu" }, { value: "NO", label: "Non" },
            ]} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-7">
            <SectionIntro title="Mise en situation" text="Nous souhaitons comprendre votre manière de communiquer avec un parent intéressé." />
            <div className="rounded-lg border-l-4 border-navy-primary bg-blue-50 px-5 py-4 text-sm leading-7 text-slate-700">
              <p>Un parent a rempli notre formulaire Facebook pour demander des informations sur les cours d&apos;anglais de son enfant. Vous l&apos;appelez et il vous dit :</p>
              <p className="mt-2 font-extrabold text-navy-deep">« Je voulais seulement connaître le prix. Je vais réfléchir. »</p>
              <p className="mt-2">Que lui répondez-vous pour poursuivre naturellement la conversation et essayer de l&apos;inviter au centre pour un test de niveau gratuit ?</p>
            </div>
            <div>
              <label htmlFor="sales-scenario" className="text-sm font-extrabold text-navy-deep">Votre réponse <Required /></label>
              <textarea id="sales-scenario" rows={8} value={form.salesScenarioResponse} onChange={(event) => update("salesScenarioResponse", event.target.value.slice(0, 700))} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-base leading-7 outline-none transition focus:border-navy-primary focus:ring-2 focus:ring-blue-100" placeholder="Rédigez la réponse que vous donneriez au parent…" />
              <div className="mt-1 flex justify-between text-xs font-semibold text-slate-500"><span>Minimum 50 caractères</span><span className={scenarioLength > 700 ? "text-red-600" : ""}>{scenarioLength}/700</span></div>
            </div>
            <div>
              <label htmlFor="cv" className="text-sm font-extrabold text-navy-deep">CV — PDF <Required /></label>
              <label htmlFor="cv" className="mt-2 flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-5 transition hover:border-navy-primary hover:bg-blue-50">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-white text-navy-primary shadow-sm"><Upload className="h-5 w-5" aria-hidden="true" /></span>
                <span className="min-w-0"><span className="block truncate text-sm font-bold text-navy-deep">{cv ? cv.name : "Sélectionner votre CV"}</span><span className="mt-1 block text-xs text-slate-500">PDF uniquement · 5 Mo maximum</span></span>
              </label>
              <input id="cv" type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => { setCv(event.target.files?.[0] || null); setUploadedCv(null); setError(""); }} />
            </div>
            <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
              <input type="checkbox" checked={form.privacyConsent} onChange={(event) => update("privacyConsent", event.target.checked)} className="mt-1 h-4 w-4 flex-none accent-navy-primary" />
              <span>J’accepte que mes informations et mon CV soient utilisés par English Hills pour étudier ma candidature, conformément à la <Link href="/privacy" target="_blank" className="font-bold text-navy-primary underline underline-offset-2">politique de confidentialité</Link>. <Required /></span>
            </label>
          </div>
        )}

        {error && <div role="alert" aria-live="polite" className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-6">
          {step > 0 ? (
            <button type="button" onClick={() => { setStep((current) => current - 1); setError(""); }} disabled={submitting} className="inline-flex items-center gap-2 px-2 py-3 text-sm font-bold text-slate-600 hover:text-navy-deep disabled:opacity-50"><ArrowLeft className="h-4 w-4" /> Retour</button>
          ) : <span />}
          {step < steps.length - 1 ? (
            <button type="button" onClick={nextStep} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-navy-primary px-6 py-3 text-sm font-extrabold text-white transition hover:bg-navy-deep">Continuer <ArrowRight className="h-4 w-4" /></button>
          ) : (
            <button type="submit" disabled={!canSubmit} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-red-accent px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#991b2b] disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours…</> : <><Check className="h-4 w-4" /> Envoyer ma candidature</>}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Required() {
  return <span className="text-red-accent" aria-label="obligatoire">*</span>;
}

function SectionIntro({ title, text }: { title: string; text: string }) {
  return <div><h3 className="text-xl font-black text-navy-deep">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{text}</p></div>;
}

function TextField({ label, value, onChange, type = "text", autoComplete, placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete?: string; placeholder?: string }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <div><label htmlFor={id} className="text-sm font-extrabold text-navy-deep">{label} <Required /></label><input id={id} type={type} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-navy-primary focus:ring-2 focus:ring-blue-100" /></div>
  );
}

function RadioQuestion<T extends string | boolean>({ label: question, value, onChange, options }: { label: string; value: T | "" | null; onChange: (value: T) => void; options: Array<{ value: T; label: string }> }) {
  const name = question.slice(0, 24).replace(/\s+/g, "-");
  return (
    <fieldset><legend className="text-sm font-extrabold leading-6 text-navy-deep">{question} <Required /></legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{options.map((option) => {
      const selected = value === option.value;
      return <label key={String(option.value)} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition ${selected ? "border-navy-primary bg-blue-50 text-navy-deep" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}><input type="radio" name={name} checked={selected} onChange={() => onChange(option.value)} className="h-4 w-4 accent-navy-primary" />{option.label}</label>;
    })}</div></fieldset>
  );
}

function levelOptions(includeBasic: boolean) {
  return [
    ...(includeBasic ? [{ value: "BASIC", label: "Basique" }] : []),
    { value: "AVERAGE", label: "Moyen" }, { value: "GOOD", label: "Bon" }, { value: "VERY_GOOD", label: "Très bon" },
  ];
}
