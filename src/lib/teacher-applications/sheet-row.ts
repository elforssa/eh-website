// Builds the Google Sheet row for a teacher application. Column order must match
// the "Applications" tab of the Teacher Applications spreadsheet (A:AG).
// Pure module: no runtime imports.
import type { Attribution, ValidatedTeacherApplication } from "./rules";

export const TEACHER_SHEET_HEADERS = [
  "Application UUID", "Date", "Candidate", "Phone (WhatsApp)", "Email", "Area",
  "Can Commute to Almaz", "Accepts 200 DH/h Net", "Availability", "Weekly Hours",
  "Start Date", "Years Teaching", "CELTA", "Other Qualifications", "English Level",
  "Age Groups Taught", "Teaching Settings", "Communicative Method Experience",
  "Last Teaching Job", "Teaching Scenario", "Video Link", "CV", "Automatic Score",
  "Status", "Knockout Reasons", "Video Score", "Final Score", "Review Notes",
  "Next Step", "Campaign", "Ad Set", "Ad", "Lead Source",
] as const;

export const TEACHER_SHEET_COLUMN_COUNT = TEACHER_SHEET_HEADERS.length; // 33 -> A:AG

// Stops applicant text from being evaluated as a spreadsheet formula.
export function sheetText(value: string) {
  const cleaned = value.replace(/\r\n?/g, "\n");
  return /^[=+\-@\t\r]/.test(cleaned) ? `'${cleaned}` : cleaned;
}

// Ad platforms sometimes leave unresolved macros such as {{campaign.name}}.
function stripMacros(value: string | undefined) {
  return (value ?? "").replace(/\{\{[^}]*\}\}/g, "").trim();
}

function hyperlink(url: string, label: string) {
  const escape = (value: string) => value.replace(/"/g, '""');
  return `=HYPERLINK("${escape(url)}","${escape(label)}")`;
}

export type TeacherSheetLabels = {
  availability: string;
  weeklyHours: string;
  startAvailability: string;
  yearsTeaching: string;
  englishLevel: string;
  ageGroups: string;
  teachingSettings: string;
  communicativeExperience: string;
};

export type TeacherSheetInput = {
  application: ValidatedTeacherApplication;
  labels: TeacherSheetLabels;
  videoUrl: string;
  cvSignedUrl: string;
  createdAt: string;
  automaticScore: number;
  status: string;
  knockoutReasons: string[];
  attribution: Attribution;
};

export function buildTeacherSheetRow(input: TeacherSheetInput): (string | number)[] {
  const { application: a, labels, attribution } = input;
  const yesNo = (value: boolean) => (value ? "Yes" : "No");
  const row: (string | number)[] = [
    a.submissionKey,
    input.createdAt,
    sheetText(a.fullName),
    sheetText(a.phone),
    sheetText(a.email),
    sheetText(a.area),
    yesNo(a.canCommuteAlmaz),
    yesNo(a.acceptsRate),
    labels.availability,
    labels.weeklyHours,
    labels.startAvailability,
    labels.yearsTeaching,
    yesNo(a.hasCelta),
    sheetText(a.otherQualifications),
    labels.englishLevel,
    labels.ageGroups,
    labels.teachingSettings,
    labels.communicativeExperience,
    sheetText(a.lastTeachingJob),
    sheetText(a.teachingScenario),
    input.videoUrl,
    hyperlink(input.cvSignedUrl, "View CV"),
    input.automaticScore,
    input.status,
    input.knockoutReasons.join(", "),
    "", "", "", "",
    sheetText(stripMacros(attribution.utm_campaign_name) || stripMacros(attribution.utm_campaign)),
    sheetText(stripMacros(attribution.utm_adset_name) || stripMacros(attribution.utm_adset)),
    sheetText(stripMacros(attribution.utm_ad_name) || stripMacros(attribution.utm_content)),
    "teacher_hiring",
  ];
  return row;
}
