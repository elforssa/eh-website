import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anglais général | English Hills Language Center",
  description: "Cours d'anglais général pour adultes à Casablanca. Conversation, grammaire et aisance quotidienne grâce à une approche par projets et des supports National Geographic.",
  openGraph: {
    title: "Cours d'anglais général — English Hills",
    description: "Gagnez en aisance dans la vie de tous les jours avec des cours flexibles 7j/7, du matin au soir.",
  },
};

export default function GeneralEnglishPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-4">Anglais général</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Gagnez en aisance dans la vie quotidienne, en voyage et dans vos relations personnelles grâce à notre approche par projets, vivante et engageante.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section className="bg-white rounded-2xl p-8 border border-surface shadow-sm">
              <h2 className="text-2xl font-bold text-navy mb-4">Présentation du programme</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Notre programme d&apos;anglais général est conçu pour vous mettre à l&apos;aise dès le premier cours. Plutôt que de mémoriser des règles de grammaire sur un manuel, vous explorez des contenus authentiques issus de National Geographic et participez à des projets interactifs qui reproduisent de vraies situations de communication.
              </p>

              <h3 className="text-xl font-bold text-navy mb-3">À qui s&apos;adresse ce programme ?</h3>
              <p className="text-gray-600 leading-relaxed">
                Aux adultes (18 ans et +) de tous niveaux — des vrais débutants aux locuteurs avancés qui souhaitent entretenir ou affiner leur anglais. Votre niveau est évalué lors du test de positionnement afin de vous placer dans le groupe optimal.
              </p>
            </section>

            <section className="bg-white rounded-2xl p-8 border border-surface shadow-sm">
              <h2 className="text-2xl font-bold text-navy mb-4">Pourquoi choisir ce programme ?</h2>
              <ul className="space-y-4">
                {[
                  "Pas d'examens écrits — les progrès sont validés par de vraies situations de communication.",
                  "Apprentissage sur écrans interactifs, pas de simples tableaux blancs.",
                  "Des thèmes qui vont de la culture et du voyage aux actualités mondiales.",
                  "Horaires ultra-flexibles : 7 jours sur 7, du matin jusqu'en soirée.",
                ].map((benefit, i) => (
                  <li key={i} className="flex gap-3 text-gray-600">
                    <span className="text-red-accent font-bold" aria-hidden="true">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="md:col-span-1">
            <div className="bg-navy rounded-2xl p-6 text-white sticky top-24">
              <h3 className="text-2xl font-bold mb-6 border-b border-white/20 pb-4">Détails du programme</h3>

              <div className="space-y-4 mb-8">
                <div>
                  <p className="text-gray-400 text-sm">Durée</p>
                  <p className="font-semibold text-lg">3 h / semaine</p>
                  <p className="text-gray-300 text-sm">(Séances réparties ou regroupées)</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Tarif</p>
                  <p className="font-semibold text-lg text-red-accent">Nous contacter</p>
                </div>
              </div>

              <Button href="/placement-test" variant="primary-red" className="w-full">
                S&apos;inscrire
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
