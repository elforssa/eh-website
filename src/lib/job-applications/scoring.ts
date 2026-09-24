import type { ValidatedJobApplication } from "./types";

const categoryScores: Record<string, number> = {
  SALES: 15,
  CALL_CENTER: 15,
  TELEPROSPECTING: 15,
  CUSTOMER_SERVICE: 10,
  EDUCATION_ADMISSIONS: 10,
  RECEPTION: 6,
  OTHER: 3,
  NONE: 0,
};

const durationScores: Record<ValidatedJobApplication["salesExperienceDuration"], number> = {
  NONE: 0,
  UNDER_SIX_MONTHS: 3,
  SIX_TO_TWELVE_MONTHS: 6,
  ONE_TO_TWO_YEARS: 8,
  OVER_TWO_YEARS: 10,
};

export function scoreJobApplication(application: ValidatedJobApplication) {
  const categoryScore = Math.max(...application.experienceCategories.map((category) => categoryScores[category] || 0));
  const experienceScore = Math.min(25, categoryScore + durationScores[application.salesExperienceDuration]);
  const previousProspectingScore = application.previousProspecting === "REGULARLY" ? 20 : application.previousProspecting === "SOMETIMES" ? 12 : 0;
  const prospectingComfortScore = application.comfortableProspecting === "YES" ? 15 : application.comfortableProspecting === "WITH_TRAINING" ? 8 : 0;
  const frenchScore = { BASIC: 0, AVERAGE: 2, GOOD: 4, VERY_GOOD: 6 }[application.frenchLevel];
  const darijaScore = { AVERAGE: 1, GOOD: 3, VERY_GOOD: 4 }[application.darijaLevel];
  const availabilityScore = (application.canCommuteAlmaz ? 2 : 0)
    + (application.preferredShift === "EITHER" ? 2 : 1)
    + (["IMMEDIATELY", "UNDER_ONE_WEEK"].includes(application.startAvailability) ? 1 : 0);
  const toolsScore = application.crmToolsExperience === "YES" ? 5 : application.crmToolsExperience === "SOMEWHAT" ? 2 : 0;

  const knockoutReasons: string[] = [];
  if (!application.canCommuteAlmaz) knockoutReasons.push("CANNOT_COMMUTE");
  if (!application.preferredShift) knockoutReasons.push("NO_VALID_SHIFT");
  if (!application.acceptsCompensation) knockoutReasons.push("COMPENSATION_DECLINED");
  if (application.comfortableProspecting === "NO") knockoutReasons.push("PROSPECTING_DECLINED");
  if (!application.comfortableTargets) knockoutReasons.push("TARGETS_DECLINED");

  return {
    automaticScore: experienceScore + previousProspectingScore + prospectingComfortScore + frenchScore + darijaScore + availabilityScore + toolsScore,
    knockoutReasons,
    applicationStatus: knockoutReasons.length > 0 ? "AUTO_REJECTED" as const : "TO_REVIEW" as const,
  };
}
