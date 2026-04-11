import { Button } from "@/components/ui/Button";
import { CheckCircle2, Rocket, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programmes Enfants & Juniors | English Hills Language Center",
  description: "Programmes d'anglais pour les enfants de 6 à 17 ans, basés sur les supports National Geographic et l'apprentissage par projets. Casablanca.",
  openGraph: {
    title: "Programmes Enfants & Juniors — English Hills",
    description: "Formule Standard (2h/semaine) et Intensive (3h/semaine). Matériel tout-compris. Réductions famille disponibles.",
  },
};

export default function KidsProgramsPage() {
  return (
    <div className="py-24 bg-surface min-h-screen">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-20">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-6">
            <Rocket className="w-8 h-8 text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">Programmes Enfants & Juniors</h1>
          <p className="text-xl text-gray-500 leading-relaxed max-w-3xl">
            Conçus pour les 6–17 ans. Nous utilisons les contenus National Geographic et l&apos;apprentissage par projets pour développer la confiance à l&apos;oral et garantir que votre enfant repart en communiquant vraiment en anglais.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 border-b border-gray-200 pb-20 mb-20">

          {/* Formule Standard */}
          <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm flex flex-col hover:-translate-y-1 transition-transform duration-300">
            <h2 className="text-3xl font-bold text-foreground mb-4">Formule Standard</h2>
            <div className="bg-surface self-start px-4 py-2 rounded-full text-sm font-medium text-foreground mb-8">2 h / semaine</div>

            <div className="mb-8">
              <span className="text-4xl font-bold text-foreground">Tarif sur demande</span>
              <p className="text-gray-400 mt-2 text-sm uppercase tracking-wide">Tout-compris</p>
            </div>

            <p className="text-gray-600 text-lg mb-8 flex-1">
              Idéale pour une progression régulière et solide tout au long de l&apos;année scolaire. Votre enfant construit une vraie base en anglais, sans stress.
            </p>

            <ul className="space-y-4 mb-10 border-t border-gray-100 pt-8">
              <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" /><span className="text-gray-600">Modules progressifs en continu</span></li>
              <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" /><span className="text-gray-600">Présentations de projets pratiques</span></li>
              <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" /><span className="text-gray-600">Accès aux plateformes numériques</span></li>
            </ul>

            <Button href="/placement-test" variant="secondary-navy" className="w-full rounded-full py-4">S&apos;inscrire en Standard</Button>
          </div>

          {/* Formule Intensive */}
          <div className="bg-foreground rounded-3xl p-12 shadow-xl flex flex-col hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary px-6 py-2 rounded-bl-2xl text-white font-bold text-sm tracking-wider uppercase shadow-sm">
              Recommandé
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">Formule Intensive</h2>
            <div className="bg-white/10 self-start px-4 py-2 rounded-full text-sm font-medium text-white mb-8">3 h / semaine</div>

            <div className="mb-8">
              <span className="text-4xl font-bold text-white">Tarif sur demande</span>
              <p className="text-gray-400 mt-2 text-sm uppercase tracking-wide">Tout-compris</p>
            </div>

            <p className="text-gray-300 text-lg mb-8 flex-1">
              Un apprentissage accéléré pour les jeunes apprenants motivés qui veulent aller plus loin, plus vite. Idéal pour une acquisition linguistique en profondeur.
            </p>

            <ul className="space-y-4 mb-10 border-t border-gray-700 pt-8">
              <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" /><span className="text-gray-300">Plus de temps consacré à la conversation</span></li>
              <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" /><span className="text-gray-300">Projets plus complexes et stimulants</span></li>
              <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" /><span className="text-gray-300">Progression plus rapide entre les modules</span></li>
            </ul>

            <Button href="/placement-test" variant="primary-red" className="w-full rounded-full py-4 text-white">S&apos;inscrire en Intensif</Button>
          </div>

        </div>

        {/* Avantages famille */}
        <div className="mb-20 bg-surface-active/30 rounded-3xl p-10 md:p-14 border border-gray-100">
          <div className="text-center mb-10 text-navy-primary">
            <h2 className="text-3xl font-bold mb-4">Avantages famille exclusifs</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">L&apos;apprentissage des langues, c&apos;est encore mieux en famille. Nous rendons l&apos;éducation premium accessible à tout votre foyer.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform">
              <h3 className="text-2xl font-bold text-foreground mb-3">Tarif famille</h3>
              <p className="text-gray-500 leading-relaxed">
                Lorsque plusieurs membres de votre famille s&apos;inscrivent simultanément (enfants et adultes), nous appliquons une remise spéciale sur le total des frais. Plus votre famille est grande, plus l&apos;avantage est significatif.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:-translate-y-1 transition-transform">
              <h3 className="text-2xl font-bold text-foreground mb-3">Réduction fratrie automatique</h3>
              <p className="text-gray-500 leading-relaxed">
                Les familles avec plusieurs enfants bénéficient d&apos;un tarif préférentiel automatique. Qu&apos;ils soient dans le même programme ou à des niveaux différents, notre formule fratrie maximise vos économies.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground mb-4">Vous hésitez entre les deux formules ?</h3>
          <p className="text-gray-500 mb-8">
            Chaque enfant commence par un test de niveau pour évaluer précisément où il en est et recommander la formule la mieux adaptée à son profil.
          </p>
          <Link href="/placement-test" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
            Réserver un test de niveau <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>

      </div>
    </div>
  );
}
