// Shared by the /enquete form (client) and the API route (server).
// Temporary one-time parent survey (Nov 2026).

export const SURVEY_GROUPS = [
  "Child 1 Mardi",
  "Child 1 Mercredi",
  "Child 3 Mardi",
  "Child 3 Vendredi",
  "Child 5 Mardi",
  "Child 5 Vendredi",
  "Junior 7 Mercredi",
  "Junior 9 Mercredi",
] as const;

export type SurveyGroup = (typeof SURVEY_GROUPS)[number];

export const RATING_QUESTIONS = [
  { key: "q1Accueil", label: "De 1 à 5, quel est votre niveau de satisfaction concernant nos services d'accueil ?" },
  { key: "q2Pedagogie", label: "De 1 à 5, quel est votre niveau de satisfaction concernant les résultats et la pédagogie de nos enseignants ?" },
  { key: "q3Locaux", label: "De 1 à 5, quel est votre niveau de satisfaction concernant les locaux et équipements du centre ?" },
  { key: "q4Programme", label: "De 1 à 5, quel est votre niveau de satisfaction concernant le programme proposé ?" },
  { key: "q5Enfant", label: "De 1 à 5, quel est le niveau de satisfaction de votre/vos enfant(s) au sein du centre ?" },
  { key: "q6Progres", label: "De 1 à 5, quel est votre niveau de satisfaction concernant les progrès de votre/vos enfant(s) jusqu'à présent ?" },
] as const;

export type RatingKey = (typeof RATING_QUESTIONS)[number]["key"];

export const COMMENT_MAX_LENGTH = 2000;

export const REQUIRED_MESSAGE = "Ce champ est obligatoire.";
export const PHONE_MESSAGE = "Veuillez saisir un numéro de téléphone valide.";
export const RATE_LIMIT_MESSAGE = "Trop de tentatives. Merci de réessayer dans quelques minutes.";

// Moroccan numbers are normalized to +212XXXXXXXXX. Other numbers written with
// an international prefix (+ or 00) and 8–15 digits are kept as +digits.
export function normalizeSurveyPhone(value: string): string | null {
  const trimmed = value.trim();
  const hasInternationalPrefix = trimmed.startsWith("+") || trimmed.startsWith("00");
  let digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);

  if (/^0[5-7]\d{8}$/.test(digits)) return `+212${digits.slice(1)}`;
  if (/^[5-7]\d{8}$/.test(digits) && !hasInternationalPrefix) return `+212${digits}`;
  if (/^2120?[5-7]\d{8}$/.test(digits)) return `+212${digits.slice(-9)}`;
  if (hasInternationalPrefix && !digits.startsWith("212") && /^[1-9]\d{7,14}$/.test(digits)) return `+${digits}`;
  return null;
}
