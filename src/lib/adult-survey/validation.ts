import "server-only";

import { COMMENT_MAX_LENGTH, PHONE_MESSAGE, REQUIRED_MESSAGE, normalizeSurveyPhone } from "@/lib/parent-survey/constants";
import { NEXT_GROUPS, RATING_QUESTIONS, type NextGroup } from "./constants";

export type AdultSurveyRow = {
  learner_name: string;
  level_slot: string;
  phone: string;
  image_rights: boolean;
  q1_accueil: number;
  q2_formateur: number;
  q3_locaux: number;
  q4_programme: number;
  q5_ambiance: number;
  q6_progres: number;
  liked: string | null;
  improve: string | null;
  next_group: NextGroup;
  reenroll: boolean;
  testimonial: boolean | null;
};

type Result =
  | { ok: true; row: AdultSurveyRow }
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

export function validateAdultSurvey(body: Record<string, unknown>): Result {
  const learnerName = text(body.learnerName, 120);
  if (learnerName.length < 2) return { ok: false, error: REQUIRED_MESSAGE, field: "learnerName" };

  const levelSlot = text(body.levelSlot, 200);
  if (levelSlot.length < 2) return { ok: false, error: REQUIRED_MESSAGE, field: "levelSlot" };

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

  const nextGroup = NEXT_GROUPS.find((group) => group.value === body.nextGroup)?.value;
  if (!nextGroup) return { ok: false, error: REQUIRED_MESSAGE, field: "nextGroup" };

  const reenroll = optionalBoolean(body.reenroll);
  if (reenroll === null) return { ok: false, error: REQUIRED_MESSAGE, field: "reenroll" };

  return {
    ok: true,
    row: {
      learner_name: learnerName,
      level_slot: levelSlot,
      phone,
      image_rights: imageRights,
      q1_accueil: ratings.q1Accueil!,
      q2_formateur: ratings.q2Formateur!,
      q3_locaux: ratings.q3Locaux!,
      q4_programme: ratings.q4Programme!,
      q5_ambiance: ratings.q5Ambiance!,
      q6_progres: ratings.q6Progres!,
      liked: text(body.liked, COMMENT_MAX_LENGTH) || null,
      improve: text(body.improve, COMMENT_MAX_LENGTH) || null,
      next_group: nextGroup,
      reenroll,
      testimonial: optionalBoolean(body.testimonial),
    },
  };
}
