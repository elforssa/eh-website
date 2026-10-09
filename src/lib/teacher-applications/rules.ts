// Server-side validation and screening rules for the English teacher application.
// Deliberately free of runtime imports so it can be unit tested with plain node.
import type {
  AgeGroup,
  CommunicativeExperience,
  EnglishLevel,
  StartAvailability,
  TeachingSetting,
  WeeklyHours,
  YearsTeaching,
} from "./options";

export type Attribution = Record<string, string>;
export type MetaTracking = { fbp?: string; fbc?: string };

export type TeacherApplicationInput = {
  submissionKey: string;
  formToken: string;
  website: string;
  fullName: string;
  phone: string;
  email: string;
  area: string;
  canCommuteAlmaz: boolean | null;
  acceptsRate: boolean | null;
  weeklyHours: WeeklyHours | "";
  startAvailability: StartAvailability | "";
  yearsTeaching: YearsTeaching | "";
  hasCelta: boolean | null;
  otherQualifications: string;
  englishLevel: EnglishLevel | "";
  ageGroups: AgeGroup[];
  teachingSettings: TeachingSetting[];
  communicativeExperience: CommunicativeExperience | "";
  lastTeachingJob: string;
  teachingScenario: string;
  videoUrl: string;
  privacyConsent: boolean;
  attribution: Attribution;
  metaTracking: MetaTracking;
  cvStoragePath: string;
  cvOriginalName: string;
  cvSizeBytes: number;
};

export type ValidatedTeacherApplication = Omit<
  TeacherApplicationInput,
  | "canCommuteAlmaz" | "acceptsRate" | "hasCelta" | "weeklyHours" | "startAvailability"
  | "yearsTeaching" | "englishLevel" | "communicativeExperience" | "website"
> & {
  canCommuteAlmaz: boolean;
  acceptsRate: boolean;
  hasCelta: boolean;
  weeklyHours: WeeklyHours;
  startAvailability: StartAvailability;
  yearsTeaching: YearsTeaching;
  englishLevel: EnglishLevel;
  communicativeExperience: CommunicativeExperience;
};

export const TEACHER_CV_PREFIX = "teachers";
export const MAX_CV_BYTES = 5 * 1024 * 1024;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const allowedWeeklyHours: readonly WeeklyHours[] = ["UNDER_SIX", "SIX_TO_TWELVE", "TWELVE_TO_TWENTY", "OVER_TWENTY"];
const allowedStart: readonly StartAvailability[] = ["IMMEDIATELY", "WITHIN_TWO_WEEKS", "WITHIN_ONE_MONTH", "OVER_ONE_MONTH"];
const allowedYears: readonly YearsTeaching[] = ["UNDER_ONE", "ONE_TO_THREE", "THREE_TO_FIVE", "OVER_FIVE"];
const allowedEnglish: readonly EnglishLevel[] = ["B2_OR_BELOW", "C1", "C2", "NATIVE"];
const allowedAgeGroups: readonly AgeGroup[] = ["KIDS", "TEENS", "ADULTS"];
const allowedSettings: readonly TeachingSetting[] = ["LANGUAGE_CENTER", "SCHOOL", "ONLINE", "PRIVATE"];
const allowedCommunicative: readonly CommunicativeExperience[] = ["YES_REGULARLY", "SOMETIMES", "NO"];

export const ALLOWED_VALUES = {
  weeklyHours: allowedWeeklyHours,
  startAvailability: allowedStart,
  yearsTeaching: allowedYears,
  englishLevel: allowedEnglish,
  ageGroups: allowedAgeGroups,
  teachingSettings: allowedSettings,
  communicativeExperience: allowedCommunicative,
} as const;

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

function pickOne<T extends string>(value: unknown, allowed: readonly T[]): T | "" {
  const cleaned = text(value, 80);
  return (allowed as readonly string[]).includes(cleaned) ? cleaned as T : "";
}

function pickMany<T extends string>(value: unknown, allowed: readonly T[]): T[] {
  if (!Array.isArray(value)) return [];
  const picked = value.map((item) => text(item, 40)).filter((item): item is T => (allowed as readonly string[]).includes(item));
  return [...new Set(picked)];
}

function cleanAttribution(value: unknown): Attribution {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const raw = value as Record<string, unknown>;
  const result: Attribution = {};
  for (const key of attributionKeys) {
    const cleaned = text(raw[key], key === "fbclid" || key.endsWith("page") || key === "referrer" ? 1000 : 500);
    if (cleaned) result[key] = cleaned;
  }
  return result;
}

function cleanMetaTracking(value: unknown): MetaTracking {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const raw = value as Record<string, unknown>;
  return { fbp: text(raw.fbp, 1000) || undefined, fbc: text(raw.fbc, 1000) || undefined };
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

type ValidationResult =
  | { ok: true; value: ValidatedTeacherApplication; attribution: Attribution; metaTracking: MetaTracking }
  | { ok: false; error: string };

export function validateTeacherApplication(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, error: "Invalid application." };
  const body = raw as Record<string, unknown>;

  if (text(body.website, 200)) return { ok: false, error: "Invalid application." };

  const submissionKey = text(body.submissionKey, 40);
  const formToken = text(body.formToken, 300);
  if (!uuidPattern.test(submissionKey) || !formToken) return { ok: false, error: "Your session has expired. Please reload the page." };

  const fullName = text(body.fullName, 120);
  const phone = text(body.phone, 30);
  const email = normalizeEmail(text(body.email, 254));
  const area = text(body.area, 100);
  if (fullName.length < 2) return { ok: false, error: "Please enter your full name." };
  const phoneDigits = normalizePhone(phone);
  if (phoneDigits.length < 9 || phoneDigits.length > 15) return { ok: false, error: "Please enter a valid phone number." };
  if (!emailPattern.test(email)) return { ok: false, error: "Please enter a valid email address." };
  if (area.length < 2) return { ok: false, error: "Please tell us which area of Casablanca you live in." };

  const canCommuteAlmaz = booleanOrNull(body.canCommuteAlmaz);
  const acceptsRate = booleanOrNull(body.acceptsRate);
  const hasCelta = booleanOrNull(body.hasCelta);
  const weeklyHours = pickOne(body.weeklyHours, allowedWeeklyHours);
  const startAvailability = pickOne(body.startAvailability, allowedStart);
  const yearsTeaching = pickOne(body.yearsTeaching, allowedYears);
  const englishLevel = pickOne(body.englishLevel, allowedEnglish);
  const ageGroups = pickMany(body.ageGroups, allowedAgeGroups);
  const teachingSettings = pickMany(body.teachingSettings, allowedSettings);
  const communicativeExperience = pickOne(body.communicativeExperience, allowedCommunicative);

  if (
    canCommuteAlmaz === null || acceptsRate === null || hasCelta === null
    || !weeklyHours || !startAvailability
    || !yearsTeaching || !englishLevel || ageGroups.length === 0
    || teachingSettings.length === 0 || !communicativeExperience
  ) {
    return { ok: false, error: "Please answer all the required questions." };
  }

  const otherQualifications = text(body.otherQualifications, 200);
  const lastTeachingJob = text(body.lastTeachingJob, 200);
  const teachingScenario = text(body.teachingScenario, 700);
  const videoUrl = text(body.videoUrl, 500);
  if (lastTeachingJob.length < 10) return { ok: false, error: "Please describe your last teaching job (where and for how long)." };
  if (teachingScenario.length < 50) return { ok: false, error: "Your written answer must be between 50 and 700 characters." };
  if (!videoUrl) return { ok: false, error: "Please add the link to your video." };
  if (body.privacyConsent !== true) return { ok: false, error: "Your consent is required to submit the application." };

  const cvStoragePath = text(body.cvStoragePath, 500);
  const cvOriginalName = text(body.cvOriginalName, 200);
  const cvSizeBytes = Number(body.cvSizeBytes);
  const pathPattern = new RegExp(`^${TEACHER_CV_PREFIX}/${submissionKey}/[0-9a-f-]{36}\\.pdf$`, "i");
  if (!pathPattern.test(cvStoragePath) || !cvOriginalName.toLowerCase().endsWith(".pdf")) {
    return { ok: false, error: "Your CV must be a valid PDF file." };
  }
  if (!Number.isInteger(cvSizeBytes) || cvSizeBytes < 1 || cvSizeBytes > MAX_CV_BYTES) {
    return { ok: false, error: "Your CV must be smaller than 5 MB." };
  }

  const attribution = cleanAttribution(body.attribution);
  const metaTracking = cleanMetaTracking(body.metaTracking);
  return {
    ok: true,
    attribution,
    metaTracking,
    value: {
      submissionKey, formToken, fullName, phone, email, area,
      canCommuteAlmaz, acceptsRate, weeklyHours, startAvailability,
      yearsTeaching, hasCelta, otherQualifications, englishLevel, ageGroups,
      teachingSettings, communicativeExperience, lastTeachingJob, teachingScenario,
      videoUrl, privacyConsent: true, attribution, metaTracking,
      cvStoragePath, cvOriginalName, cvSizeBytes,
    },
  };
}

export type TeacherScreening = {
  automaticScore: number;
  knockoutReasons: string[];
  applicationStatus: "TO_REVIEW" | "AUTO_REJECTED";
};

// Automatic score is out of 80. The remaining weight is the manual video and
// scenario review (Video Score and Final Score columns in the sheet).
export function scoreTeacherApplication(application: ValidatedTeacherApplication): TeacherScreening {
  const knockoutReasons: string[] = [];
  if (!application.canCommuteAlmaz) knockoutReasons.push("CANNOT_COMMUTE");
  if (!application.acceptsRate) knockoutReasons.push("RATE_DECLINED");
  if (application.yearsTeaching === "UNDER_ONE" || application.yearsTeaching === "ONE_TO_THREE") knockoutReasons.push("UNDER_THREE_YEARS");
  if (!application.hasCelta) knockoutReasons.push("NO_CELTA");
  if (application.englishLevel === "B2_OR_BELOW") knockoutReasons.push("ENGLISH_BELOW_C1");

  const years = { UNDER_ONE: 0, ONE_TO_THREE: 0, THREE_TO_FIVE: 15, OVER_FIVE: 20 }[application.yearsTeaching];
  const english = { B2_OR_BELOW: 0, C1: 8, C2: 12, NATIVE: 12 }[application.englishLevel];
  const communicative = { YES_REGULARLY: 15, SOMETIMES: 8, NO: 0 }[application.communicativeExperience];
  const breadth = Math.min(3, application.ageGroups.length) * 2 + Math.min(2, application.teachingSettings.length) * 2;
  const hours = { UNDER_SIX: 4, SIX_TO_TWELVE: 10, TWELVE_TO_TWENTY: 18, OVER_TWENTY: 18 }[application.weeklyHours];
  const start = { IMMEDIATELY: 5, WITHIN_TWO_WEEKS: 4, WITHIN_ONE_MONTH: 2, OVER_ONE_MONTH: 0 }[application.startAvailability];

  return {
    automaticScore: years + english + communicative + breadth + hours + start,
    knockoutReasons,
    applicationStatus: knockoutReasons.length > 0 ? "AUTO_REJECTED" : "TO_REVIEW",
  };
}
