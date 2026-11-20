import "server-only";

import {
  COMMENT_MAX_LENGTH,
  PHONE_MESSAGE,
  RATING_QUESTIONS,
  REQUIRED_MESSAGE,
  SURVEY_GROUPS,
  normalizeSurveyPhone,
  type SurveyGroup,
} from "./constants";

export type ParentSurveyRow = {
  parent_name: string;
  children_names: string;
  groups: SurveyGroup[];
  phone: string;
  image_rights: boolean;
  q1_accueil: number;
  q2_pedagogie: number;
  q3_locaux: number;
  q4_programme: number;
  q5_enfant: number;
  q6_progres: number;
  liked: string | null;
  improve: string | null;
  wants_session: boolean | null;
  testimonial: boolean | null;
};

type Result =
  | { ok: true; row: ParentSurveyRow }
  | { ok: false; error: string; field?: string };

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function optionalBoolean(value: unknown) {
  return value === true ? true : value === false ? false : null;
}

function rating(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5 ? value : null;
}

export function validateParentSurvey(body: Record<string, unknown>): Result {
  const parentName = text(body.parentName, 120);
  if (parentName.length < 2) return { ok: false, error: REQUIRED_MESSAGE, field: "parentName" };

  const childrenNames = text(body.childrenNames, 300);
  if (childrenNames.length < 2) return { ok: false, error: REQUIRED_MESSAGE, field: "childrenNames" };

  const rawGroups = Array.isArray(body.groups) ? body.groups : [];
  const groups = SURVEY_GROUPS.filter((group) => rawGroups.includes(group));
  if (groups.length === 0) return { ok: false, error: REQUIRED_MESSAGE, field: "groups" };

  const rawPhone = text(body.phone, 40);
  if (!rawPhone) return { ok: false, error: REQUIRED_MESSAGE, field: "phone" };
  const phone = normalizeSurveyPhone(rawPhone);
  if (!phone) return { ok: false, error: PHONE_MESSAGE, field: "phone" };

  const imageRights = optionalBoolean(body.imageRights);
  if (imageRights === null) return { ok: false, error: REQUIRED_MESSAGE, field: "imageRights" };

  const ratings: Partial<Record<string, number>> = {};
  for (const question of RATING_QUESTIONS) {
    const value = rating(body[question.key]);
    if (value === null) return { ok: false, error: REQUIRED_MESSAGE, field: question.key };
    ratings[question.key] = value;
  }

  const wantsSession = optionalBoolean(body.wantsSession);
  const testimonial = optionalBoolean(body.testimonial);
  if (testimonial !== null && wantsSession !== true) {
    return { ok: false, error: "Réponse invalide.", field: "testimonial" };
  }

  return {
    ok: true,
    row: {
      parent_name: parentName,
      children_names: childrenNames,
      groups,
      phone,
      image_rights: imageRights,
      q1_accueil: ratings.q1Accueil!,
      q2_pedagogie: ratings.q2Pedagogie!,
      q3_locaux: ratings.q3Locaux!,
      q4_programme: ratings.q4Programme!,
      q5_enfant: ratings.q5Enfant!,
      q6_progres: ratings.q6Progres!,
      liked: text(body.liked, COMMENT_MAX_LENGTH) || null,
      improve: text(body.improve, COMMENT_MAX_LENGTH) || null,
      wants_session: wantsSession,
      testimonial,
    },
  };
}
