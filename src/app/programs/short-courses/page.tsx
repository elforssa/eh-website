import { Button } from "@/components/ui/Button";
import { CheckCircle2, Briefcase } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formations courtes & Programmes spécialisés | English Hills",
  description: "Cours thématiques, formations entreprise sur mesure, Summer Camp (juillet) et stage intensif de 10 jours à Casablanca.",
  openGraph: {
    title: "Formations courtes, Summer Camp & Intensif — English Hills",
    description: "Anglais de spécialité, B2B sur mesure et programmes saisonniers à fort impact linguistique.",
  },
};

export default function ShortCoursesPage() {
  return (
    <div className="py-24 bg-surface min-h-screen">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-6">
            <Briefcase className="w-8 h-8 text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">Formations courtes & Spécialisées</h1>
          <p className="text-xl text-gray-500 leading-relaxed max-w-3xl">
            Anglais de spécialité, cours thématiques et programmes entièrement sur mesure, adaptés à vos besoins professionnels ou académiques spécifiques.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm">
            <h3 className="text-2xl font-bold text-foreground mb-4">Communication thématique</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Des modules courts et ciblés autour de thèmes précis pour gagner en aisance et en confiance dans des contextes spécifiques.
            </p>
            <ul className="space-y-4">
              <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary" aria-hidden="true" /><span className="text-gray-600">Voyage & Culture</span></li>
              <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary" aria-hidden="true" /><span className="text-gray-600">Prise de parole en public</span></li>
              <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary" aria-hidden="true" /><span className="text-gray-600">Débat & Discussion</span></li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm">
            <h3 className="text-2xl font-bold text-foreground mb-4">Entreprise sur mesure</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Des programmes construits autour de votre secteur d&apos;activité, parfaits pour les équipes souhaitant monter en compétence.
            </p>
            <ul className="space-y-4">
              <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary" aria-hidden="true" /><span className="text-gray-600">Vocabulaire spécifique au secteur</span></li>
              <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary" aria-hidden="true" /><span className="text-gray-600">Formation présentielle ou à distance</span></li>
              <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-primary" aria-hidden="true" /><span className="text-gray-600">Horaires flexibles pour les équipes</span></li>
            </ul>
          </div>
        </div>

        {/* Programmes saisonniers */}
        <div className="mb-12 border-t border-gray-200 pt-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Programmes saisonniers à fort impact</h2>
          <p className="text-xl text-gray-500 mb-12 max-w-3xl leading-relaxed">
            En dehors de l&apos;année académique, English Hills propose des programmes intensifs saisonniers conçus pour générer un bond linguistique massif en un minimum de temps.
          </p>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-10 border-2 border-primary/20 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary px-4 py-1 rounded-bl-xl text-white text-xs font-bold uppercase">Enfants 5–15 ans</div>
              <h3 className="text-2xl font-bold text-navy-primary mb-4 flex items-center gap-2">☀️ Summer Camp — <span className="text-gray-500 font-medium">Juillet</span></h3>
              <p className="text-gray-500 leading-relaxed">
                Des aventures estivales dynamiques combinant une immersion totale en anglais avec des activités créatives, des sorties et des défis en équipe. Les enfants progressent naturellement tout en s&apos;amusant vraiment avec des animateurs anglophones.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-10 border-2 border-red-accent/20 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-red-accent px-4 py-1 rounded-bl-xl text-white text-xs font-bold uppercase">Adultes & Juniors</div>
              <h3 className="text-2xl font-bold text-red-accent mb-4 flex items-center gap-2">⚡ Stage intensif 10 jours — <span className="text-gray-500 font-medium text-lg">Juin, Juillet, Sept</span></h3>
              <p className="text-gray-500 leading-relaxed">
                Conçu pour faire voler la barrière linguistique en éclats. 3 heures d&apos;interaction orale pure par jour, 100% de temps de parole garanti. Nous sommes tellement confiants dans notre méthode communicative que <strong>l&apos;expression orale est garantie</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">Besoin d&apos;un programme sur mesure ?</h3>
          <p className="text-gray-500 text-lg mb-8 max-w-2xl mx-auto">Contactez notre équipe pédagogique pour construire une formation courte qui correspond exactement à ce que vous ou vos équipes souhaitez apprendre.</p>
          <Button href="/contact" variant="secondary-navy" className="rounded-full">
            Nous contacter
          </Button>
        </div>
      </div>
    </div>
  );
}
