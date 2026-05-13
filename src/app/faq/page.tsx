import { HelpCircle } from "lucide-react";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | English Hills Language Center",
  description: "Réponses aux questions les plus fréquentes sur les programmes, les inscriptions, les horaires et la méthode pédagogique d'English Hills.",
  openGraph: {
    title: "Questions fréquentes — English Hills",
    description: "Tout ce que vous devez savoir avant de rejoindre English Hills Language Center à Casablanca.",
  },
};

export default function FAQPage() {
  const faqs = [
    {
      question: "C'est quoi exactement l'apprentissage par projets ?",
      answer: "Au lieu des examens écrits classiques, nos apprenants progressent en faisant. Vous réalisez des projets concrets, des présentations et des tâches collaboratives qui garantissent une vraie production langagière — pas une mémorisation passive."
    },
    {
      question: "Les supports National Geographic sont-ils inclus dans les frais ?",
      answer: "Pour les programmes Enfants & Juniors, les frais annuels sont entièrement tout-compris : matériel, ressources numériques et suivi pédagogique. Pour les cours adultes, des frais uniques de matériel couvrent vos supports originaux National Geographic et l'accès aux plateformes interactives."
    },
    {
      question: "Les débutants complets peuvent-ils rejoindre la formation intensive de 10 jours ?",
      answer: "Absolument. Nos modules intensifs sont conçus pour tous les niveaux. Le format 10 jours est pensé spécifiquement pour briser la barrière linguistique et développer rapidement la confiance à l'oral, quel que soit le point de départ."
    },
    {
      question: "Le Summer Camp de juillet est-il uniquement axé sur l'apprentissage de l'anglais ?",
      answer: "L'immersion en anglais est au cœur du camp, mais il comprend aussi une grande variété d'activités créatives, de projets artistiques, de sorties et de défis en équipe. L'objectif, c'est un apprentissage naturel et ludique — pas une salle de classe."
    },
    {
      question: "Est-ce qu'il y a des examens écrits ?",
      answer: "Pour nos cours d'anglais général, l'évaluation se fait à travers des projets actifs. En revanche, nous proposons des formations de préparation ciblées pour les candidats qui souhaitent passer l'IELTS, le TOEFL ou les certifications Cambridge."
    },
    {
      question: "Quelle est la taille des groupes ?",
      answer: "Nos groupes sont volontairement réduits pour que chaque apprenant bénéficie d'un maximum de temps de parole et d'un retour personnalisé de son enseignant."
    },
    {
      question: "Proposez-vous des formations pour les entreprises ?",
      answer: "Oui. Idéalement situés dans l'axe économique de Casablanca, nous proposons des formations en Business English et des programmes B2B entièrement sur mesure, adaptés aux besoins spécifiques de chaque entreprise."
    },
    {
      question: "Peut-on changer d'horaire en cours d'année ?",
      answer: "Nous offrons une flexibilité réelle. Si votre emploi du temps évolue, contactez notre administration pour basculer vers un autre créneau disponible."
    }
  ];

  return (
    <div className="py-24 bg-surface min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-6 mx-auto">
            <HelpCircle className="w-8 h-8 text-navy-primary" aria-hidden="true" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">Questions fréquentes</h1>
          <p className="text-xl text-gray-500">Tout ce que vous devez savoir avant de commencer chez English Hills.</p>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm">
          <FaqAccordion items={faqs} />
        </div>
      </div>
    </div>
  );
}
