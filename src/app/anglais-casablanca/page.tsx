import type { Metadata } from "next";
import Image from "next/image";
import { CheckCircle2, Clock3, MapPin, MonitorPlay, Sparkles } from "lucide-react";
import { AdLeadForm } from "@/components/ui/AdLeadForm";

export const metadata: Metadata = {
  title: "Cours d'anglais à Casablanca | English Hills",
  description: "Demandez un rappel gratuit pour trouver le programme d'anglais adapté à votre niveau à English Hills Casablanca.",
  openGraph: {
    title: "Cours d'anglais à Casablanca — English Hills",
    description: "Adultes, enfants et entreprises : trouvez votre programme et réservez un rappel gratuit.",
  },
};

const proofPoints = [
  "Cours pour adultes, enfants et entreprises",
  "Supports National Geographic et écrans interactifs",
  "Horaires flexibles, 7 jours sur 7",
];

const programs = [
  "Anglais général",
  "Business English",
  "Enfants & Juniors",
  "IELTS / TOEFL",
  "Camp d'été",
  "Cours particuliers",
  "Programme personnalisé",
];

export default function EnglishCasablancaLandingPage() {
  return (
    <div className="bg-[#fbfcff]">
      <section className="relative overflow-hidden border-b border-gray-200 bg-white">
        <div className="absolute inset-x-0 top-0 h-2 bg-[linear-gradient(90deg,var(--red-accent),var(--navy-primary),#1f8a70)]" aria-hidden="true" />

        <div className="container mx-auto max-w-7xl px-4 pt-8 md:px-6">
          <Image
            src="/eh-logo-new.png"
            alt="English Hills"
            width={220}
            height={88}
            className="h-12 w-auto object-contain md:h-14"
            priority
          />
        </div>

        <div className="container mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-8 md:px-6 md:pb-20 lg:grid-cols-[1fr_460px] lg:items-center lg:gap-16">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-navy-primary/15 bg-navy-primary/5 px-4 py-2 text-sm font-bold text-navy-primary">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Almaz 2, Casablanca
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-normal text-navy-deep md:text-6xl lg:text-7xl">
              Améliorez votre anglais avec un centre qui vous fait parler dès le premier cours.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 md:text-xl">
              English Hills combine projets pratiques, contenus National Geographic et technologie interactive pour vous aider à gagner en confiance rapidement.
            </p>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {proofPoints.map((point) => (
                <div key={point} className="flex items-start gap-2 rounded-xl bg-surface-soft p-4 text-sm font-semibold text-gray-700 ring-1 ring-gray-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-green-700" aria-hidden="true" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              <div>
                <p className="text-3xl font-black text-red-accent">7j/7</p>
                <p className="mt-1 text-sm font-semibold text-gray-600">créneaux flexibles</p>
              </div>
              <div>
                <p className="text-3xl font-black text-navy-primary">6+</p>
                <p className="mt-1 text-sm font-semibold text-gray-600">ans et adultes</p>
              </div>
              <div>
                <p className="text-3xl font-black text-[#1f8a70]">24h</p>
                <p className="mt-1 text-sm font-semibold text-gray-600">réponse rapide</p>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <div className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-2xl shadow-navy-primary/10 md:p-7">
              <div className="mb-6">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-red-accent">Rappel gratuit</p>
                <h2 className="mt-2 text-2xl font-black text-navy-deep">Trouvez votre programme</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Remplissez ce formulaire. Nous vous rappelons pour vérifier votre niveau et vous orienter vers le bon programme.
                </p>
              </div>
              <AdLeadForm />
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container mx-auto grid max-w-7xl gap-10 px-4 md:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface">
            <Image
              src="/interactive_smart_screens_1775450242014.png"
              alt="Cours avec écran interactif chez English Hills"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 42vw, 100vw"
            />
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-navy-primary">Pourquoi ça marche</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-navy-deep md:text-5xl">
              Une méthode active, pas seulement des leçons à mémoriser.
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <MonitorPlay className="h-6 w-6 text-navy-primary" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-black text-navy-deep">Technologie interactive</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">Des séances vivantes pour pratiquer, écouter, parler et collaborer.</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <Sparkles className="h-6 w-6 text-red-accent" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-black text-navy-deep">Contenus captivants</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">Des thèmes du monde réel pour enrichir le vocabulaire naturellement.</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:col-span-2">
                <Clock3 className="h-6 w-6 text-[#1f8a70]" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-black text-navy-deep">Horaires adaptés</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">Matin, soir ou week-end : l&apos;équipe vous propose le format le plus réaliste selon votre rythme.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-navy-deep py-12 text-white md:py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-white/60">Programmes disponibles</p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">Choisissez votre objectif.</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {programs.map((program) => (
                <div key={program} className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-center text-sm font-bold">
                  {program}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
