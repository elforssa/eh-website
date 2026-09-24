export const EXPERIENCE_CATEGORIES = [
  "SALES",
  "CALL_CENTER",
  "TELEPROSPECTING",
  "CUSTOMER_SERVICE",
  "RECEPTION",
  "EDUCATION_ADMISSIONS",
  "NONE",
  "OTHER",
] as const;

export type ExperienceCategory = (typeof EXPERIENCE_CATEGORIES)[number];

export type JobApplicationInput = {
  submissionKey: string;
  formToken: string;
  website: string;
  fullName: string;
  phone: string;
  email: string;
  area: string;
  canCommuteAlmaz: boolean | null;
  preferredShift: "MORNING" | "AFTERNOON" | "EITHER" | "";
  startAvailability: "IMMEDIATELY" | "UNDER_ONE_WEEK" | "ONE_TO_TWO_WEEKS" | "OVER_TWO_WEEKS" | "";
  acceptsCompensation: boolean | null;
  experienceCategories: ExperienceCategory[];
  experienceOther: string;
  salesExperienceDuration: "NONE" | "UNDER_SIX_MONTHS" | "SIX_TO_TWELVE_MONTHS" | "ONE_TO_TWO_YEARS" | "OVER_TWO_YEARS" | "";
  previousProspecting: "REGULARLY" | "SOMETIMES" | "NEVER" | "";
  comfortableProspecting: "YES" | "WITH_TRAINING" | "NO" | "";
  comfortableTargets: boolean | null;
  frenchLevel: "BASIC" | "AVERAGE" | "GOOD" | "VERY_GOOD" | "";
  darijaLevel: "AVERAGE" | "GOOD" | "VERY_GOOD" | "";
  englishLevel: "BASIC" | "AVERAGE" | "GOOD" | "VERY_GOOD" | "";
  crmToolsExperience: "YES" | "SOMEWHAT" | "NO" | "";
  salesScenarioResponse: string;
  cvStoragePath: string;
  cvOriginalName: string;
  cvSizeBytes: number;
  privacyConsent: boolean;
  attribution?: Record<string, unknown>;
  metaTracking?: Record<string, unknown>;
};

export type ValidatedJobApplication = Omit<
  JobApplicationInput,
  | "website"
  | "canCommuteAlmaz"
  | "acceptsCompensation"
  | "comfortableTargets"
  | "preferredShift"
  | "startAvailability"
  | "salesExperienceDuration"
  | "previousProspecting"
  | "comfortableProspecting"
  | "frenchLevel"
  | "darijaLevel"
  | "englishLevel"
  | "crmToolsExperience"
> & {
  canCommuteAlmaz: boolean;
  acceptsCompensation: boolean;
  comfortableTargets: boolean;
  preferredShift: "MORNING" | "AFTERNOON" | "EITHER";
  startAvailability: "IMMEDIATELY" | "UNDER_ONE_WEEK" | "ONE_TO_TWO_WEEKS" | "OVER_TWO_WEEKS";
  salesExperienceDuration: "NONE" | "UNDER_SIX_MONTHS" | "SIX_TO_TWELVE_MONTHS" | "ONE_TO_TWO_YEARS" | "OVER_TWO_YEARS";
  previousProspecting: "REGULARLY" | "SOMETIMES" | "NEVER";
  comfortableProspecting: "YES" | "WITH_TRAINING" | "NO";
  frenchLevel: "BASIC" | "AVERAGE" | "GOOD" | "VERY_GOOD";
  darijaLevel: "AVERAGE" | "GOOD" | "VERY_GOOD";
  englishLevel: "BASIC" | "AVERAGE" | "GOOD" | "VERY_GOOD";
  crmToolsExperience: "YES" | "SOMEWHAT" | "NO";
};

export type Attribution = {
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

export type MetaTracking = {
  fbp?: string;
  fbc?: string;
};

