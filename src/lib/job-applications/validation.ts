import "server-only";

import { EXPERIENCE_CATEGORIES, type Attribution, type ExperienceCategory, type MetaTracking, type ValidatedJobApplication } from "./types";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedShifts = new Set(["MORNING", "AFTERNOON", "EITHER"]);
const allowedStarts = new Set(["IMMEDIATELY", "UNDER_ONE_WEEK", "ONE_TO_TWO_WEEKS", "OVER_TWO_WEEKS"]);
const allowedDurations = new Set(["NONE", "UNDER_SIX_MONTHS", "SIX_TO_TWELVE_MONTHS", "ONE_TO_TWO_YEARS", "OVER_TWO_YEARS"]);
const allowedPreviousProspecting = new Set(["REGULARLY", "SOMETIMES", "NEVER"]);
const allowedProspectingComfort = new Set(["YES", "WITH_TRAINING", "NO"]);
const allowedFourLevels = new Set(["BASIC", "AVERAGE", "GOOD", "VERY_GOOD"]);
const allowedDarijaLevels = new Set(["AVERAGE", "GOOD", "VERY_GOOD"]);
const allowedToolLevels = new Set(["YES", "SOMEWHAT", "NO"]);
const attributionKeys = [
  "utm_source", "utm_medium", "utm_campaign", "utm_campaign_name", "utm_adset",
  "utm_adset_name", "utm_content", "utm_ad_name", "utm_term", "placement",
  "fbclid", "landing_page", "form_page", "referrer",
] as const;

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function booleanOrNull(value: unknown) {
  return value === true ? true : value === false ? false : null;
}

function enumValue<T extends string>(value: unknown, allowed: Set<string>): T | "" {
  const cleaned = text(value, 80);
  return allowed.has(cleaned) ? cleaned as T : "";
}

function cleanAttribution(value: unknown): Attribution {
  if (!value || typeof value !== "object") return {};
  const raw = value as Record<string, unknown>;
  const result: Attribution = {};

  for (const key of attributionKeys) {
    const cleaned = text(raw[key], key === "fbclid" || key.endsWith("page") || key === "referrer" ? 1000 : 500);
    if (cleaned) result[key] = cleaned;
  }

  return result;
}

function cleanMetaTracking(value: unknown): MetaTracking {
  if (!value || typeof value !== "object") return {};
  const raw = value as Record<string, unknown>;
  return {
    fbp: text(raw.fbp, 1000) || undefined,
    fbc: text(raw.fbc, 1000) || undefined,
  };
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("00212")) return `212${digits.slice(5)}`;
  if (digits.startsWith("212")) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `212${digits.slice(1)}`;
  return digits;
}

export function validateJobApplication(raw: unknown):
  | { ok: true; value: ValidatedJobApplication; attribution: Attribution; metaTracking: MetaTracking }
  | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Candidature invalide." };
  const body = raw as Record<string, unknown>;

  const submissionKey = text(body.submissionKey, 40);
  const formToken = text(body.formToken, 300);
  const website = text(body.website, 200);
  const fullName = text(body.fullName, 120);
  const phone = text(body.phone, 30);
  const email = normalizeEmail(text(body.email, 254));
  const area = text(body.area, 100);
  const experienceOther = text(body.experienceOther, 120);
  const salesScenarioResponse = text(body.salesScenarioResponse, 700);
  const cvStoragePath = text(body.cvStoragePath, 500);
  const cvOriginalName = text(body.cvOriginalName, 200);
  const cvSizeBytes = Number(body.cvSizeBytes);

  if (website) return { ok: false, error: "Candidature invalide." };
  if (!uuidPattern.test(submissionKey) || !formToken) return { ok: false, error: "Votre session a expiré. Rechargez la page." };
  if (fullName.length < 2) return { ok: false, error: "Veuillez saisir votre nom complet." };
  if (!emailPattern.test(email)) return { ok: false, error: "Veuillez saisir une adresse e-mail valide." };
  const normalizedPhone = normalizePhone(phone);
  if (normalizedPhone.length < 9 || normalizedPhone.length > 15) return { ok: false, error: "Veuillez saisir un numéro de téléphone valide." };
  if (area.length < 2) return { ok: false, error: "Veuillez indiquer votre quartier ou zone de résidence." };

  const canCommuteAlmaz = booleanOrNull(body.canCommuteAlmaz);
  const acceptsCompensation = booleanOrNull(body.acceptsCompensation);
  const comfortableTargets = booleanOrNull(body.comfortableTargets);
  if (canCommuteAlmaz === null || acceptsCompensation === null || comfortableTargets === null) {
    return { ok: false, error: "Veuillez répondre à toutes les questions obligatoires." };
  }

  const preferredShift = enumValue<ValidatedJobApplication["preferredShift"]>(body.preferredShift, allowedShifts);
  const startAvailability = enumValue<ValidatedJobApplication["startAvailability"]>(body.startAvailability, allowedStarts);
  const salesExperienceDuration = enumValue<ValidatedJobApplication["salesExperienceDuration"]>(body.salesExperienceDuration, allowedDurations);
  const previousProspecting = enumValue<ValidatedJobApplication["previousProspecting"]>(body.previousProspecting, allowedPreviousProspecting);
  const comfortableProspecting = enumValue<ValidatedJobApplication["comfortableProspecting"]>(body.comfortableProspecting, allowedProspectingComfort);
  const frenchLevel = enumValue<ValidatedJobApplication["frenchLevel"]>(body.frenchLevel, allowedFourLevels);
  const darijaLevel = enumValue<ValidatedJobApplication["darijaLevel"]>(body.darijaLevel, allowedDarijaLevels);
  const englishLevel = enumValue<ValidatedJobApplication["englishLevel"]>(body.englishLevel, allowedFourLevels);
  const crmToolsExperience = enumValue<ValidatedJobApplication["crmToolsExperience"]>(body.crmToolsExperience, allowedToolLevels);

  if (!preferredShift || !startAvailability || !salesExperienceDuration || !previousProspecting || !comfortableProspecting || !frenchLevel || !darijaLevel || !englishLevel || !crmToolsExperience) {
    return { ok: false, error: "Veuillez répondre à toutes les questions obligatoires." };
  }

  const rawCategories = Array.isArray(body.experienceCategories) ? body.experienceCategories : [];
  const experienceCategories = [...new Set(rawCategories
    .map((item) => text(item, 40))
    .filter((item): item is ExperienceCategory => EXPERIENCE_CATEGORIES.includes(item as ExperienceCategory)))];
  if (experienceCategories.length === 0) return { ok: false, error: "Veuillez sélectionner votre expérience." };
  if (experienceCategories.includes("NONE") && experienceCategories.length > 1) {
    return { ok: false, error: "« Aucun » ne peut pas être combiné avec une autre expérience." };
  }
  if (experienceCategories.includes("OTHER") && experienceOther.length < 2) {
    return { ok: false, error: "Veuillez préciser votre autre expérience." };
  }

  if (salesScenarioResponse.length < 50 || salesScenarioResponse.length > 700) {
    return { ok: false, error: "Votre réponse à la mise en situation doit contenir entre 50 et 700 caractères." };
  }
  if (!body.privacyConsent) return { ok: false, error: "Votre consentement est requis pour envoyer la candidature." };
  if (!cvStoragePath.startsWith(`${submissionKey}/`) || !cvOriginalName.toLowerCase().endsWith(".pdf")) {
    return { ok: false, error: "Le CV doit être un fichier PDF valide." };
  }
  if (!Number.isInteger(cvSizeBytes) || cvSizeBytes < 1 || cvSizeBytes > 5 * 1024 * 1024) {
    return { ok: false, error: "Le CV doit faire moins de 5 Mo." };
  }

  const value: ValidatedJobApplication = {
    submissionKey,
    formToken,
    fullName,
    phone,
    email,
    area,
    canCommuteAlmaz,
    preferredShift,
    startAvailability,
    acceptsCompensation,
    experienceCategories,
    experienceOther,
    salesExperienceDuration,
    previousProspecting,
    comfortableProspecting,
    comfortableTargets,
    frenchLevel,
    darijaLevel,
    englishLevel,
    crmToolsExperience,
    salesScenarioResponse,
    cvStoragePath,
    cvOriginalName,
    cvSizeBytes,
    privacyConsent: true,
    attribution: body.attribution as Record<string, unknown> | undefined,
    metaTracking: body.metaTracking as Record<string, unknown> | undefined,
  };

  return { ok: true, value, attribution: cleanAttribution(body.attribution), metaTracking: cleanMetaTracking(body.metaTracking) };
}
