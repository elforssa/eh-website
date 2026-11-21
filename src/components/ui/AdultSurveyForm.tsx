"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { COMMENT_MAX_LENGTH, PHONE_MESSAGE, REQUIRED_MESSAGE, normalizeSurveyPhone } from "@/lib/parent-survey/constants";
import { NEXT_GROUPS, NEXT_SESSION_DATE, RATING_QUESTIONS, type NextGroup, type RatingKey } from "@/lib/adult-survey/constants";

// Temporary one-time adult learner survey (Nov 2026). Same behaviour as /enquete.
// Deliberately imports nothing from analytics: no Meta Lead / conversion event on submit.

type Ratings = Record<RatingKey, number | null>;

type FormState = {
  website: string;
  learnerName: string;
  levelSlot: string;
  phone: string;
  imageRights: boolean | null;
  ratings: Ratings;
  liked: string;
  improve: string;
  nextGroup: NextGroup | null;
  reenroll: boolean | null;
  testimonial: boolean | null;
};

type Token = { value: string; fetchedAt: number };

const initialRatings = Object.fromEntries(RATING_QUESTIONS.map((question) => [question.key, null])) as Ratings;

const initialForm: FormState = {
  website: "",
  learnerName: "",
  levelSlot: "",
  phone: "",
  imageRights: null,
  ratings: initialRatings,
  liked: "",
  improve: "",
  nextGroup: null,
  reenroll: null,
  testimonial: null,
};

const scale = [
  { value: 1, label: "Très insatisfait" },
  { value: 2, label: "Insatisfait" },
  { value: 3, label: "Neutre" },
  { value: 4, label: "Satisfait" },
  { value: 5, label: "Très satisfait" },
];

// Tokens must be at least 4s old server-side; refresh them proactively once they get old.
const minimumTokenAgeMs = 4_500;
const staleTokenMs = 6 * 60 * 60 * 1000;

const fieldOrder = ["learnerName", "levelSlot", "phone", "imageRights", ...RATING_QUESTIONS.map((question) => question.key), "nextGroup", "reenroll"];

function fieldId(field: string) {
  return `enquete-adultes-${field}`;
}

async function fetchToken(): Promise<Token> {
  const response = await fetch("/api/adult-survey/session", { cache: "no-store" });
  if (!response.ok) throw new Error("token");
  const result = await response.json();
  if (!result.token) throw new Error("token");
  return { value: result.token as string, fetchedAt: Date.now() };
}

export function AdultSurveyForm() {
  const topRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef<Token | null>(null);
  const submittingRef = useRef(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetchToken().then((token) => { tokenRef.current = token; }).catch(() => { /* Retried at submit. */ });

    function refreshIfStale() {
      if (document.visibilityState !== "visible") return;
      const current = tokenRef.current;
      if (current && Date.now() - current.fetchedAt < staleTokenMs) return;
      fetchToken().then((token) => { tokenRef.current = token; }).catch(() => { /* Retried at submit. */ });
    }
    document.addEventListener("visibilitychange", refreshIfStale);
    return () => document.removeEventListener("visibilitychange", refreshIfStale);
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    clearError(key);
  }

  function clearError(field: string) {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setFormError("");
  }

  function setRating(key: RatingKey, value: number) {
    setForm((current) => ({ ...current, ratings: { ...current.ratings, [key]: value } }));
    clearError(key);
  }

  function focusField(field: string) {
    const element = document.getElementById(fieldId(field));
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    const focusable = element.matches("input, textarea") ? element : element.querySelector<HTMLElement>("input, textarea");
    focusable?.focus({ preventScroll: true });
  }

  function validate() {
    const found: Record<string, string> = {};
    if (form.learnerName.trim().length < 2) found.learnerName = REQUIRED_MESSAGE;
    if (form.levelSlot.trim().length < 2) found.levelSlot = REQUIRED_MESSAGE;
    if (!form.phone.trim()) found.phone = REQUIRED_MESSAGE;
    else if (!normalizeSurveyPhone(form.phone)) found.phone = PHONE_MESSAGE;
    if (form.imageRights === null) found.imageRights = REQUIRED_MESSAGE;
    for (const question of RATING_QUESTIONS) {
      if (form.ratings[question.key] === null) found[question.key] = REQUIRED_MESSAGE;
    }
    if (form.nextGroup === null) found.nextGroup = REQUIRED_MESSAGE;
    if (form.reenroll === null) found.reenroll = REQUIRED_MESSAGE;
    return found;
  }

  async function freshToken() {
    const token = await fetchToken();
    tokenRef.current = token;
    const wait = token.fetchedAt + minimumTokenAgeMs - Date.now();
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    return token;
  }

  async function send(token: string) {
    const response = await fetch("/api/adult-survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formToken: token,
        website: form.website,
        learnerName: form.learnerName,
        levelSlot: form.levelSlot,
        phone: form.phone,
        imageRights: form.imageRights,
        ...form.ratings,
        liked: form.liked,
        improve: form.improve,
        nextGroup: form.nextGroup,
        reenroll: form.reenroll,
        testimonial: form.testimonial,
      }),
    });
    const result = await response.json().catch(() => ({}));
    return { ok: response.ok, ...result } as { ok: boolean; error?: string; code?: string; field?: string };
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submittingRef.current) return;

    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setFormError("");
      focusField(fieldOrder.find((field) => found[field]) || "learnerName");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setFormError("");
    try {
      const token = tokenRef.current ?? await freshToken();
      let result = await send(token.value);
      if (!result.ok && result.code === "TOKEN") {
        result = await send((await freshToken()).value);
      }

      if (result.ok) {
        setDone(true);
        topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (result.field && fieldOrder.includes(result.field)) {
        setErrors({ [result.field]: result.error || REQUIRED_MESSAGE });
        focusField(result.field);
      } else {
        setFormError(result.error || "Une erreur est survenue. Veuillez réessayer.");
      }
    } catch {
      setFormError("Connexion impossible. Vérifiez votre connexion internet et réessayez.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div ref={topRef} className="scroll-mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_60px_rgba(13,43,94,0.10)]">
      <div className="h-1.5 bg-[linear-gradient(90deg,#b91c2e_0_26%,#0d2b5e_26%_74%,#2c7a69_74%)]" aria-hidden="true" />
      <div className="px-5 pb-6 pt-6 sm:px-8 sm:pt-8">
        <Image src="/eh-logo-new.png" alt="English Hills" width={677} height={369} className="h-11 w-auto" priority />
        <h1 className="mt-5 text-2xl font-black leading-tight text-navy-deep sm:text-3xl">Enquête de satisfaction client – Apprenants Adultes</h1>
        {!done && (
          <p className="mt-3 text-base leading-7 text-slate-600">
            Votre avis compte ! Merci de prendre quelques minutes pour évaluer votre expérience au sein d&apos;English Hills. <span className="whitespace-nowrap text-sm font-semibold text-slate-500">(<Required /> Champs obligatoires)</span>
          </p>
        )}
      </div>

      {done ? (
        <div role="status" className="border-t border-slate-200 px-5 py-12 text-center sm:px-8">
          <CheckCircle2 className="mx-auto h-12 w-12 text-[#2c7a69]" aria-hidden="true" />
          <p className="mt-4 text-xl font-black text-navy-deep">Merci ! Votre avis a bien été enregistré.</p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={(event) => update("website", event.target.value)} />

          <Section title="Section 1 : Informations générales">
            <TextField field="learnerName" label="Nom et prénom de l'apprenant(e)" value={form.learnerName} error={errors.learnerName} onChange={(value) => update("learnerName", value)} autoComplete="name" maxLength={120} />
            <TextField field="levelSlot" label="Niveau et créneau de cours" value={form.levelSlot} error={errors.levelSlot} onChange={(value) => update("levelSlot", value)} autoComplete="off" maxLength={200} />
            <TextField field="phone" label="Téléphone" type="tel" inputMode="tel" value={form.phone} error={errors.phone} onChange={(value) => update("phone", value)} autoComplete="tel" placeholder="06 12 34 56 78" maxLength={30} />

            <ChoiceQuestion
              field="imageRights"
              label="Droit d'image"
              required
              description="Vous êtes susceptible d'apparaître dans l'une de nos vidéos de classe en activité destinées à nos réseaux sociaux."
              value={form.imageRights}
              error={errors.imageRights}
              onChange={(value) => update("imageRights", value)}
              options={[{ value: true, label: "OUI, j'autorise" }, { value: false, label: "NON, je n'autorise pas" }]}
            />
          </Section>

          <Section title="Section 2 : Évaluation de votre satisfaction">
            <div className="rounded-lg bg-slate-50 px-4 py-3">
              <ul className="grid gap-1 text-sm text-slate-700 sm:grid-cols-2">
                {scale.map((item) => <li key={item.value}><span className="font-extrabold text-navy-deep">{item.value}</span> = {item.label}</li>)}
              </ul>
            </div>
            {RATING_QUESTIONS.map((question, index) => (
              <RatingQuestion
                key={question.key}
                field={question.key}
                number={index + 1}
                label={question.label}
                value={form.ratings[question.key]}
                error={errors[question.key]}
                onChange={(value) => setRating(question.key, value)}
              />
            ))}
          </Section>

          <Section title="Section 3 : Vos commentaires">
            <TextAreaField field="liked" label="Qu'appréciez-vous le plus chez English Hills ? (Facultatif)" value={form.liked} onChange={(value) => update("liked", value)} />
            <TextAreaField field="improve" label="Selon vous, que devrions-nous améliorer ? (Facultatif)" value={form.improve} onChange={(value) => update("improve", value)} />
          </Section>

          <Section title="Section 4 : Témoignage et réinscription">
            <ChoiceQuestion
              field="nextGroup"
              label="Nous réorganisons les groupes à partir de la prochaine session ; dans quel groupe vous situez-vous ?"
              required
              value={form.nextGroup}
              error={errors.nextGroup}
              onChange={(value) => update("nextGroup", value)}
              options={NEXT_GROUPS.map((group) => ({ value: group.value, label: group.label }))}
            />
            <ChoiceQuestion
              field="reenroll"
              label={`Souhaitez-vous vous inscrire à la prochaine session qui débutera le ${NEXT_SESSION_DATE} ?`}
              required
              value={form.reenroll}
              error={errors.reenroll}
              onChange={(value) => update("reenroll", value)}
              options={[{ value: true, label: "Oui" }, { value: false, label: "Non" }]}
            />
            <ChoiceQuestion
              field="testimonial"
              label="Accepteriez-vous de nous aider à promouvoir le centre en partageant votre témoignage en vidéo à l'issue d'un cours ? (Facultatif)"
              value={form.testimonial}
              onChange={(value) => update("testimonial", value)}
              options={[{ value: true, label: "Oui" }, { value: false, label: "Non" }]}
            />
          </Section>

          <div className="border-t border-slate-200 px-5 py-6 sm:px-8">
            {formError && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{formError}</div>}
            <button type="submit" disabled={submitting} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-red-accent px-6 py-3 text-base font-extrabold text-white transition hover:bg-[#991b2b] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Envoi en cours…</> : <><Send className="h-4 w-4" aria-hidden="true" /> Envoyer mes réponses</>}
            </button>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Vos réponses sont utilisées uniquement pour améliorer nos services. Elles seront supprimées après analyse, à l&apos;exception de votre réponse sur le droit d&apos;image, conservée tant que les vidéos sont utilisées.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}

function Required() {
  return <span className="text-red-accent" aria-hidden="true">*</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-slate-200 px-5 py-7 sm:px-8">
      <h2 className="text-lg font-black text-navy-deep">{title}</h2>
      <div className="mt-5 space-y-6">{children}</div>
    </section>
  );
}

function FieldError({ field, error }: { field: string; error?: string }) {
  if (!error) return null;
  return <p id={`${fieldId(field)}-error`} className="mt-2 text-sm font-semibold text-red-700">{error}</p>;
}

function TextField({ field, label, value, error, onChange, type = "text", inputMode, autoComplete, placeholder, maxLength }: {
  field: string; label: string; value: string; error?: string; onChange: (value: string) => void;
  type?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; autoComplete?: string; placeholder?: string; maxLength?: number;
}) {
  const id = fieldId(field);
  return (
    <div>
      <label htmlFor={id} className="text-sm font-extrabold text-navy-deep">{label} <Required /></label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-required="true"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-2 w-full scroll-mt-24 rounded-lg border px-4 py-3 text-base outline-none transition focus:border-navy-primary focus:ring-2 focus:ring-blue-100 ${error ? "border-red-400" : "border-slate-300"}`}
      />
      <FieldError field={field} error={error} />
    </div>
  );
}

function TextAreaField({ field, label, value, onChange }: { field: string; label: string; value: string; onChange: (value: string) => void }) {
  const id = fieldId(field);
  return (
    <div>
      <label htmlFor={id} className="text-sm font-extrabold text-navy-deep">{label}</label>
      <textarea id={id} rows={4} value={value} maxLength={COMMENT_MAX_LENGTH} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-base leading-7 outline-none transition focus:border-navy-primary focus:ring-2 focus:ring-blue-100" />
    </div>
  );
}

function ChoiceQuestion<T extends string | boolean>({ field, label, description, required, value, error, onChange, options }: {
  field: string; label: string; description?: string; required?: boolean; value: T | null; error?: string;
  onChange: (value: T) => void; options: Array<{ value: T; label: string }>;
}) {
  const id = fieldId(field);
  return (
    <fieldset id={id} className="scroll-mt-24" aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="text-sm font-extrabold leading-6 text-navy-deep">{label} {required && <Required />}</legend>
      {description && <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <label key={String(option.value)} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-navy-primary/40 ${selected ? "border-navy-primary bg-blue-50 text-navy-deep" : error ? "border-red-300 text-slate-700" : "border-slate-200 text-slate-700"}`}>
              <input type="radio" name={field} checked={selected} onChange={() => onChange(option.value)} className="h-4 w-4 flex-none accent-navy-primary" />
              {option.label}
            </label>
          );
        })}
      </div>
      <FieldError field={field} error={error} />
    </fieldset>
  );
}

function RatingQuestion({ field, number, label, value, error, onChange }: {
  field: string; number: number; label: string; value: number | null; error?: string; onChange: (value: number) => void;
}) {
  const id = fieldId(field);
  return (
    <fieldset id={id} className="scroll-mt-24" aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="text-sm font-extrabold leading-6 text-navy-deep">{number}. {label} <Required /></legend>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {scale.map((item) => {
          const selected = value === item.value;
          return (
            <label key={item.value} className={`flex h-12 cursor-pointer items-center justify-center rounded-lg border text-lg font-black transition has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-navy-primary/40 ${selected ? "border-navy-primary bg-navy-primary text-white" : error ? "border-red-300 bg-white text-navy-deep" : "border-slate-200 bg-white text-navy-deep"}`}>
              <input type="radio" name={field} value={item.value} checked={selected} onChange={() => onChange(item.value)} className="sr-only" aria-label={`${item.value} – ${item.label}`} />
              {item.value}
            </label>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-xs font-semibold text-slate-500" aria-hidden="true">
        <span>Très insatisfait</span>
        <span>Très satisfait</span>
      </div>
      <FieldError field={field} error={error} />
    </fieldset>
  );
}
