import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "À propos | English Hills Language Center",
  description: "Découvrez notre mission, notre méthode et ce qui fait d'English Hills un centre de langues différent à Casablanca.",
  openGraph: {
    title: "À propos d'English Hills — Centre de langues à Casablanca",
    description: "Apprentissage par projets, supports National Geographic, écrans ClearTouch. Une vision moderne de l'enseignement de l'anglais.",
  },
};

export default function AboutPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-6">À propos d&apos;English Hills</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Nous sommes un centre de formation linguistique premium à Casablanca, avec une conviction simple : l&apos;anglais doit être captivant, efficace et accessible à tous.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="relative h-[400px] rounded-3xl overflow-hidden">
            <Image src="/hero_classroom_students_1775450226096.png" alt="Salle de classe English Hills" fill className="object-cover" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-navy mb-4">Notre mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Dépasser la mémorisation passive des écoles de langues traditionnelles. Nous croyons que la langue est avant tout un outil de connexion et de leadership. En combinant technologie de pointe et apprentissage par projets, nous garantissons que nos apprenants repartent avec un anglais réel et utilisable — pas juste des notes sur un bulletin.
            </p>
            <h2 className="text-3xl font-bold text-navy mb-4">Notre approche</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              <strong className="text-navy-primary font-bold">« Vivez la langue, ne vous contentez pas de l&apos;étudier »</strong>
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Nous associons les supports <strong>National Geographic Learning</strong> aux <strong>écrans interactifs ClearTouch</strong> de dernière génération pour créer des salles de classe dynamiques et immersives. Pas d&apos;examens écrits ici. Les apprenants valident chaque module en réalisant des projets collaboratifs qu&apos;ils présentent ensuite avec confiance.
            </p>
          </div>
        </div>

        <div className="bg-navy rounded-3xl p-12 text-center text-white mb-24">
          <h2 className="text-3xl font-bold mb-6">Rejoignez notre communauté</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Que vous soyez un professionnel du couloir d&apos;affaires de Casablanca ou un jeune apprenant qui commence son parcours, votre place est ici.
          </p>
          <Button href="/placement-test" variant="primary-red" className="text-lg px-8 py-4">
            Réserver un test de niveau
          </Button>
        </div>

      </div>
    </div>
  );
}
