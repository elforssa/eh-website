"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, ArrowRight, Check, Loader2, Upload } from "lucide-react";
import {
  AGE_GROUPS, COMMUNICATIVE_EXPERIENCE, ENGLISH_LEVELS, START_AVAILABILITY,
  TEACHING_SETTINGS, WEEKLY_HOURS, YEARS_TEACHING,
} from "@/lib/teacher-applications/options";
import { MAX_CV_BYTES, type TeacherApplicationInput } from "@/lib/teacher-applications/rules";
import { readAttribution, readMetaTracking } from "@/lib/teacher-applications/client-attribution";

type FormState = Omit<TeacherApplicationInput, "submissionKey" | "formToken" | "cvStoragePath" | "cvOriginalName" | "cvSizeBytes">;
type UploadedCv = { signature: string; path: string };

const initialForm: FormState = {
  website: "", fullName: "", phone: "", email: "", area: "",
  canCommuteAlmaz: null, acceptsRate: null, weeklyHours: "", startAvailability: "",
  yearsTeaching: "", hasCelta: null, otherQualifications: "", englishLevel: "", ageGroups: [],
  teachingSettings: [], communicativeExperience: "", lastTeachingJob: "", teachingScenario: "",
  videoUrl: "", privacyConsent: false, attribution: {}, metaTracking: {},
};

const steps = ["Contact & hours", "Qualifications", "Teaching experience", "Video & CV"];

function fileSignature(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

export function TeacherApplicationForm() {
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
    setForm((current) => ({ ...current, attribution, metaTracking: readMetaTracking(attribution) }));
    fetch("/api/teacher-applications/session", { cache: "no-store" })
      .then(async (response) => (response.ok ? response.json() : Promise.reject()))
      .then((result) => setFormToken(result.token || ""))
      .catch(() => setError("The form is temporarily unavailable. Please reload the page."));
  }, []);

  const scenarioLength = form.teachingScenario.trim().length;
  const progress = `${((step + 1) / steps.length) * 100}%`;
  const canSubmit = useMemo(() => Boolean(formToken && submissionKey && cv && !submitting), [formToken, submissionKey, cv, submitting]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function toggle<K extends "ageGroups" | "teachingSettings">(key: K, value: string) {
    const list = form[key] as string[];
    update(key, (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]) as FormState[K]);
  }

  function validateStep(currentStep: number) {
    if (currentStep === 0) {
      if (form.fullName.trim().length < 2) return "Please enter your full name.";
      if (form.phone.replace(/\D/g, "").length < 9) return "Please enter a valid phone number.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Please enter a valid email address.";
      if (form.area.trim().length < 2) return "Please tell us which area of Casablanca you live in.";
      if (form.canCommuteAlmaz === null || form.acceptsRate === null || !form.weeklyHours || !form.startAvailability) {
        return "Please answer all the questions.";
      }
    }
    if (currentStep === 1 && (!form.yearsTeaching || form.hasCelta === null || !form.englishLevel)) {
      return "Please answer all the qualification questions.";
    }
    if (currentStep === 2) {
      if (form.ageGroups.length === 0 || form.teachingSettings.length === 0 || !form.communicativeExperience) return "Please answer all the experience questions.";
      if (form.lastTeachingJob.trim().length < 10) return "Please describe your last teaching job (where and for how long).";
      if (scenarioLength < 50 || scenarioLength > 700) return "Your written answer must be between 50 and 700 characters.";
    }
    if (currentStep === 3) {
      if (!/^https:\/\//i.test(form.videoUrl.trim())) return "Please paste the https:// link to your video.";
      if (!cv) return "Please attach your CV as a PDF.";
      if (cv.type !== "application/pdf" || !cv.name.toLowerCase().endsWith(".pdf")) return "Your CV must be a PDF file.";
      if (cv.size > MAX_CV_BYTES) return "Your CV must be smaller than 5 MB.";
      if (!form.privacyConsent) return "Please accept the processing of your application data.";
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

  async function ensureUploadedCv() {
    if (!cv) throw new Error("Please attach your CV.");
    const signature = fileSignature(cv);
    if (uploadedCv?.signature === signature) return uploadedCv;

    const prepareResponse = await fetch("/api/teacher-applications/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formToken, submissionKey, fileName: cv.name, fileType: cv.type, fileSize: cv.size, website: form.website }),
    });
    const prepared = await prepareResponse.json();
    if (!prepareResponse.ok) throw new Error(prepared.error || "Unable to prepare the CV upload.");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) throw new Error("The upload service is unavailable.");
    const supabase = createClient(supabaseUrl, anonKey);
    const { error: uploadError } = await supabase.storage
      .from("job-application-cvs")
      .uploadToSignedUrl(prepared.path, prepared.token, cv, { contentType: "application/pdf" });
    if (uploadError) throw new Error("The CV upload failed. Please try again.");

    const uploaded = { signature, path: prepared.path as string };
    setUploadedCv(uploaded);
    return uploaded;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submittingRef.current) return;
    const message = validateStep(3);
    if (message) return setError(message);
    if (!formToken || !submissionKey || !cv) return setError("Your session is not ready. Please reload the page.");

    submittingRef.current = true;
    setSubmitting(true);
    setError("");
    try {
      const upload = await ensureUploadedCv();
      const response = await fetch("/api/teacher-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, submissionKey, formToken, cvStoragePath: upload.path, cvOriginalName: cv.name, cvSizeBytes: cv.size }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send your application.");
      router.push("/merci-candidature-professeur");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Something went wrong. Please try again.");
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div ref={formTopRef} className="scroll-mt-8 rounded-lg border border-slate-200 bg-white shadow-[0_24px_80px_rgba(13,43,94,0.12)]">
      <div className="border-b border-slate-200 px-5 py-5 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-red-accent">Application</p>
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
            <SectionIntro title="Your details" text="We only use them for your application." />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField id="fullName" label="Full name" value={form.fullName} onChange={(v) => update("fullName", v)} autoComplete="name" />
              <TextField id="phone" label="Phone / WhatsApp" value={form.phone} onChange={(v) => update("phone", v)} type="tel" autoComplete="tel" placeholder="+212 6 ..." />
              <TextField id="email" label="Email" value={form.email} onChange={(v) => update("email", v)} type="email" autoComplete="email" />
              <TextField id="area" label="Area of Casablanca where you live" value={form.area} onChange={(v) => update("area", v)} autoComplete="address-level2" placeholder="e.g. Oulfa, Californie…" />
            </div>
            <RadioQuestion name="commute" label="Can you commute to Almaz, Casablanca for your classes?" value={form.canCommuteAlmaz} onChange={(v) => update("canCommuteAlmaz", v)} options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]} />
            <RadioQuestion name="rate" label="The pay is 200 DH per teaching hour, net (after tax). Is that acceptable for you?" value={form.acceptsRate} onChange={(v) => update("acceptsRate", v)} options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]} />
            <RadioQuestion name="hours" label="How many hours per week can you teach?" value={form.weeklyHours} onChange={(v) => update("weeklyHours", v as FormState["weeklyHours"])} options={WEEKLY_HOURS} />
            <RadioQuestion name="start" label="When could you start?" value={form.startAvailability} onChange={(v) => update("startAvailability", v as FormState["startAvailability"])} options={START_AVAILABILITY} />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-7">
            <SectionIntro title="Your qualifications" text="Please answer honestly. This is a part-time role with minimum requirements." />
            <RadioQuestion name="years" label="How many years have you been teaching English?" value={form.yearsTeaching} onChange={(v) => update("yearsTeaching", v as FormState["yearsTeaching"])} options={YEARS_TEACHING} />
            <RadioQuestion name="celta" label="Do you hold a CELTA certificate?" value={form.hasCelta} onChange={(v) => update("hasCelta", v)} options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]} />
            <div>
              <label htmlFor="otherQualifications" className="text-sm font-extrabold text-navy-deep">Other teaching qualifications (optional)</label>
              <input id="otherQualifications" type="text" maxLength={200} value={form.otherQualifications} onChange={(e) => update("otherQualifications", e.target.value)} placeholder="e.g. DELTA, TEFL, MA in TESOL…" className={inputClass} />
            </div>
            <RadioQuestion name="level" label="What is your own level of English?" value={form.englishLevel} onChange={(v) => update("englishLevel", v as FormState["englishLevel"])} options={ENGLISH_LEVELS} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-7">
            <SectionIntro title="Your teaching experience" text="Tell us about the classes you have actually taught." />
            <CheckGroup label="Which age groups have you taught?" hint="Select all that apply." options={AGE_GROUPS} selected={form.ageGroups} onToggle={(v) => toggle("ageGroups", v)} />
            <CheckGroup label="Where have you taught?" hint="Select all that apply." options={TEACHING_SETTINGS} selected={form.teachingSettings} onToggle={(v) => toggle("teachingSettings", v)} />
            <RadioQuestion name="communicative" label="Do you teach with a communicative, speaking-focused method (pair work, discussion, little grammar lecturing)?" value={form.communicativeExperience} onChange={(v) => update("communicativeExperience", v as FormState["communicativeExperience"])} options={COMMUNICATIVE_EXPERIENCE} />
            <div>
              <label htmlFor="lastTeachingJob" className="text-sm font-extrabold text-navy-deep">Your most recent teaching job <Required /></label>
              <input id="lastTeachingJob" type="text" maxLength={200} value={form.lastTeachingJob} onChange={(e) => update("lastTeachingJob", e.target.value)} placeholder="Where, which level, and for how long" className={inputClass} />
            </div>
            <div className="rounded-lg border-l-4 border-navy-primary bg-blue-50 px-5 py-4 text-sm leading-7 text-slate-700">
              <p className="font-extrabold text-navy-deep">Classroom scenario</p>
              <p className="mt-2">A 10-year-old in your class of 13 refuses to speak English and answers every question in Darija. The other students are starting to copy him.</p>
              <p className="mt-2">What do you do during the lesson, and what do you do afterwards?</p>
            </div>
            <div>
              <label htmlFor="teachingScenario" className="text-sm font-extrabold text-navy-deep">Your answer <Required /></label>
              <textarea id="teachingScenario" rows={7} value={form.teachingScenario} onChange={(e) => update("teachingScenario", e.target.value.slice(0, 700))} className={`${inputClass} leading-7`} placeholder="Write in English, in your own words…" />
              <div className="mt-1 flex justify-between text-xs font-semibold text-slate-500"><span>Minimum 50 characters</span><span className={scenarioLength > 700 ? "text-red-600" : ""}>{scenarioLength}/700</span></div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-7">
            <SectionIntro title="Video introduction and CV" text="The video is the most important part of your application." />
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-700">
              <p className="font-extrabold text-navy-deep">Record a video of about 1 minute, in English, and tell us:</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Who you are and where you have taught.</li>
                <li>How you make students speak in your lessons.</li>
                <li>Why you want to teach at English Hills.</li>
              </ol>
              <p className="mt-3 font-extrabold text-navy-deep">Then share it with a link:</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Upload the video to Google Drive (or YouTube as &ldquo;Unlisted&rdquo;, Loom, Vimeo or Dropbox).</li>
                <li>On Google Drive, click Share, then set General access to <strong>&ldquo;Anyone with the link&rdquo;</strong>.</li>
                <li>Copy the link and paste it below. We cannot open private links.</li>
              </ol>
            </div>
            <div>
              <label htmlFor="videoUrl" className="text-sm font-extrabold text-navy-deep">Link to your video <Required /></label>
              <input id="videoUrl" type="url" inputMode="url" maxLength={500} value={form.videoUrl} onChange={(e) => update("videoUrl", e.target.value)} placeholder="https://drive.google.com/file/d/…" className={inputClass} />
            </div>
            <div>
              <label htmlFor="cv" className="text-sm font-extrabold text-navy-deep">CV — PDF <Required /></label>
              <label htmlFor="cv" className="mt-2 flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-5 transition hover:border-navy-primary hover:bg-blue-50">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-white text-navy-primary shadow-sm"><Upload className="h-5 w-5" aria-hidden="true" /></span>
                <span className="min-w-0"><span className="block truncate text-sm font-bold text-navy-deep">{cv ? cv.name : "Select your CV"}</span><span className="mt-1 block text-xs text-slate-500">PDF only · 5 MB maximum</span></span>
              </label>
              <input id="cv" type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(e) => { setCv(e.target.files?.[0] || null); setUploadedCv(null); setError(""); }} />
            </div>
            <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
              <input type="checkbox" checked={form.privacyConsent} onChange={(e) => update("privacyConsent", e.target.checked)} className="mt-1 h-4 w-4 flex-none accent-navy-primary" />
              <span>I agree that English Hills may use my information, CV and video to review my application, in line with the <Link href="/privacy" target="_blank" className="font-bold text-navy-primary underline underline-offset-2">privacy policy</Link>. <Required /></span>
            </label>
          </div>
        )}

        {error && <div role="alert" aria-live="polite" className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-6">
          {step > 0 ? (
            <button type="button" onClick={() => { setStep((current) => current - 1); setError(""); }} disabled={submitting} className="inline-flex items-center gap-2 px-2 py-3 text-sm font-bold text-slate-600 hover:text-navy-deep disabled:opacity-50"><ArrowLeft className="h-4 w-4" /> Back</button>
          ) : <span />}
          {step < steps.length - 1 ? (
            <button type="button" onClick={nextStep} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-navy-primary px-6 py-3 text-sm font-extrabold text-white transition hover:bg-navy-deep">Continue <ArrowRight className="h-4 w-4" /></button>
          ) : (
            <button type="submit" disabled={!canSubmit} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-red-accent px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#991b2b] disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><Check className="h-4 w-4" /> Submit application</>}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

const inputClass = "mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-navy-primary focus:ring-2 focus:ring-blue-100";

function Required() {
  return <span className="text-red-accent" aria-label="required">*</span>;
}

function SectionIntro({ title, text }: { title: string; text: string }) {
  return <div><h3 className="text-xl font-black text-navy-deep">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{text}</p></div>;
}

function TextField({ id, label, value, onChange, type = "text", autoComplete, placeholder }: { id: string; label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete?: string; placeholder?: string }) {
  return (
    <div><label htmlFor={id} className="text-sm font-extrabold text-navy-deep">{label} <Required /></label><input id={id} type={type} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} /></div>
  );
}

function RadioQuestion<T extends string | boolean>({ name, label, value, onChange, options }: { name: string; label: string; value: T | "" | null; onChange: (value: T) => void; options: ReadonlyArray<{ value: T; label: string }> }) {
  return (
    <fieldset><legend className="text-sm font-extrabold leading-6 text-navy-deep">{label} <Required /></legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{options.map((option) => {
      const selected = value === option.value;
      return <label key={String(option.value)} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition ${selected ? "border-navy-primary bg-blue-50 text-navy-deep" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}><input type="radio" name={name} checked={selected} onChange={() => onChange(option.value)} className="h-4 w-4 accent-navy-primary" />{option.label}</label>;
    })}</div></fieldset>
  );
}

function CheckGroup({ label, hint, options, selected, onToggle }: { label: string; hint: string; options: ReadonlyArray<{ value: string; label: string }>; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <fieldset>
      <legend className="text-sm font-extrabold leading-6 text-navy-deep">{label} <Required /></legend>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{options.map((option) => {
        const checked = selected.includes(option.value);
        return <label key={option.value} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition ${checked ? "border-navy-primary bg-blue-50 text-navy-deep" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}><input type="checkbox" checked={checked} onChange={() => onToggle(option.value)} className="h-4 w-4 accent-navy-primary" />{option.label}</label>;
      })}</div>
    </fieldset>
  );
}
