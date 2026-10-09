// Answer options for the English teacher application. Shared by the form (labels)
// and the server (labels written to the Google Sheet). Keep values in sync with
// the allowed lists in rules.ts; scripts/test-teacher-applications.mjs checks this.

export type ValueOf<T extends readonly { value: string }[]> = T[number]["value"];

export const WEEKLY_HOURS = [
  { value: "UNDER_SIX", label: "Less than 6 hours" },
  { value: "SIX_TO_TWELVE", label: "6–12 hours" },
  { value: "TWELVE_TO_TWENTY", label: "12–20 hours" },
  { value: "OVER_TWENTY", label: "More than 20 hours" },
] as const;

export const START_AVAILABILITY = [
  { value: "IMMEDIATELY", label: "Immediately" },
  { value: "WITHIN_TWO_WEEKS", label: "Within 2 weeks" },
  { value: "WITHIN_ONE_MONTH", label: "Within a month" },
  { value: "OVER_ONE_MONTH", label: "In more than a month" },
] as const;

export const YEARS_TEACHING = [
  { value: "UNDER_ONE", label: "Less than 1 year" },
  { value: "ONE_TO_THREE", label: "1–3 years" },
  { value: "THREE_TO_FIVE", label: "3–5 years" },
  { value: "OVER_FIVE", label: "More than 5 years" },
] as const;

export const ENGLISH_LEVELS = [
  { value: "B2_OR_BELOW", label: "B2 or below" },
  { value: "C1", label: "C1 (advanced)" },
  { value: "C2", label: "C2 (proficient)" },
  { value: "NATIVE", label: "Native or bilingual" },
] as const;

export const AGE_GROUPS = [
  { value: "KIDS", label: "Kids (6–11)" },
  { value: "TEENS", label: "Teens (12–17)" },
  { value: "ADULTS", label: "Adults" },
] as const;

export const TEACHING_SETTINGS = [
  { value: "LANGUAGE_CENTER", label: "Language center" },
  { value: "SCHOOL", label: "School" },
  { value: "ONLINE", label: "Online" },
  { value: "PRIVATE", label: "Private lessons" },
] as const;

export const COMMUNICATIVE_EXPERIENCE = [
  { value: "YES_REGULARLY", label: "Yes, it is how I usually teach" },
  { value: "SOMETIMES", label: "Sometimes" },
  { value: "NO", label: "No, not really" },
] as const;

export type WeeklyHours = ValueOf<typeof WEEKLY_HOURS>;
export type StartAvailability = ValueOf<typeof START_AVAILABILITY>;
export type YearsTeaching = ValueOf<typeof YEARS_TEACHING>;
export type EnglishLevel = ValueOf<typeof ENGLISH_LEVELS>;
export type AgeGroup = ValueOf<typeof AGE_GROUPS>;
export type TeachingSetting = ValueOf<typeof TEACHING_SETTINGS>;
export type CommunicativeExperience = ValueOf<typeof COMMUNICATIVE_EXPERIENCE>;

export function labelFor(options: readonly { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function labelsFor(options: readonly { value: string; label: string }[], values: readonly string[]) {
  return values.map((value) => labelFor(options, value)).join(", ");
}
