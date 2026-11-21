// Shared by the /enquete-adultes form (client) and the API route (server).
// Temporary one-time adult learner survey (Nov 2026).

// Shown in "Souhaitez-vous vous inscrire à la prochaine session qui débutera le … ?"
export const NEXT_SESSION_DATE = "[DATE]";

export const RATING_QUESTIONS = [
  { key: "q1Accueil", label: "De 1 à 5, quel est votre niveau de satisfaction concernant nos services d'accueil et d'accompagnement ?" },
  { key: "q2Formateur", label: "De 1 à 5, quel est votre niveau de satisfaction concernant la pédagogie et l'animation de votre formateur ?" },
  { key: "q3Locaux", label: "De 1 à 5, quel est votre niveau de satisfaction concernant les locaux, les salles et les équipements du centre ?" },
  { key: "q4Programme", label: "De 1 à 5, quel est votre niveau de satisfaction concernant le programme, les supports de cours et les horaires proposés ?" },
  { key: "q5Ambiance", label: "De 1 à 5, quel est votre niveau de satisfaction global concernant l'ambiance et le déroulement des séances ?" },
  { key: "q6Progres", label: "De 1 à 5, quel est votre niveau de satisfaction concernant vos progrès en anglais jusqu'à présent ?" },
] as const;

export type RatingKey = (typeof RATING_QUESTIONS)[number]["key"];

export const NEXT_GROUPS = [
  { value: "debutant", label: "Groupe Débutant (Beginners)" },
  { value: "intermediaire", label: "Groupe Intermédiaire (Intermediate)" },
] as const;

export type NextGroup = (typeof NEXT_GROUPS)[number]["value"];
