import type { Metadata } from "next";
import Image from "next/image";
import { BookOpenCheck, CalendarDays, CheckCircle2, Clock3, MapPin, School, UsersRound } from "lucide-react";
import { MiseANiveauLeadForm } from "@/components/ui/MiseANiveauLeadForm";

export const metadata: Metadata = {
  title: "Cours de Mise à Niveau Pré-Rentrée | English Hills Casablanca",
  description: "Programme pré-rentrée 2026 à Almaz, Casablanca : 6 semaines pour consolider l'anglais de votre enfant avant la rentrée.",
  openGraph: {
    title: "Cours de Mise à Niveau Pré-Rentrée — English Hills",
    description: "24h d'anglais sur 6 semaines pour consolider les bases, pratiquer l'oral et démarrer l'année scolaire avec confiance.",
  },
};

const proofPoints = [
  "6 semaines du 17 août au 25 septembre",
  "24h de cours avec supports pédagogiques inclus",
  "Groupes limités à 13 élèves maximum",
];

const programBlocks = [
  {
    title: "Révision ciblée",
    text: "Grammaire, vocabulaire et structures essentielles selon le niveau scolaire.",
    icon: BookOpenCheck,
  },
  {
    title: "Oral et confiance",
    text: "Jeux de rôle, ateliers d'expression et prise de parole active.",
    icon: UsersRound,
  },
  {
    title: "Préparation rentrée",
    text: "Lecture, écriture guidée et vocabulaire utile pour les matières scolaires.",
    icon: School,
  },
];

const levels = [
  "MS / GS",
  "CP / CE1",
  "CE2 / CM1",
  "CM2 / 6ème",
  "5ème / 4ème",
];

export default function MiseANiveauLandingPage() {
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

        <div className="container mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-8 md:px-6 md:pb-20 lg:grid-cols-[1fr_440px] lg:items-center lg:gap-16">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-navy-primary/15 bg-navy-primary/5 px-4 py-2 text-sm font-bold text-navy-primary">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Almaz, Casablanca
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-normal text-navy-deep md:text-6xl lg:text-7xl">
              Préparez la rentrée d'anglais de votre enfant avec confiance.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 md:text-xl">
              Un programme de mise à niveau pré-rentrée pour consolider les acquis, renforcer l'oral et aider votre enfant à commencer l'année scolaire plus sereinement.
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
                <p className="text-3xl font-black text-red-accent">1 290 DH</p>
                <p className="mt-1 text-sm font-semibold text-gray-600">24h + supports</p>
              </div>
              <div>
                <p className="text-3xl font-black text-navy-primary">18h-20h</p>
                <p className="mt-1 text-sm font-semibold text-gray-600">jours de semaine</p>
              </div>
              <div>
                <p className="text-3xl font-black text-[#1f8a70]">13 max</p>
                <p className="mt-1 text-sm font-semibold text-gray-600">élèves par groupe</p>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <div className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-2xl shadow-navy-primary/10 md:p-7">
              <div className="mb-6">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-red-accent">Pré-rentrée 2026</p>
                <h2 className="mt-2 text-2xl font-black text-navy-deep">Réserver une place</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Laissez vos coordonnées, le nombre d'enfants et leur âge. Notre équipe vous rappelle pour confirmer le groupe adapté.
                </p>
              </div>
              <MiseANiveauLeadForm />
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container mx-auto grid max-w-7xl gap-10 px-4 md:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface">
            <Image
              src="/interactive_smart_screens_1775450242014.png"
              alt="Salle de cours English Hills"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 42vw, 100vw"
            />
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-navy-primary">Programme & objectifs</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-navy-deep md:text-5xl">
              Une remise à niveau courte, claire et orientée rentrée.
            </h2>
            <div className="mt-8 grid gap-4">
              {programBlocks.map(({ title, text, icon: Icon }) => (
                <div key={title} className="rounded-2xl border border-gray-200 bg-white p-5">
                  <Icon className="h-6 w-6 text-navy-primary" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-black text-navy-deep">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-navy-deep py-12 text-white md:py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-white/60">Organisation</p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">Du 17 août au 25 septembre 2026.</h2>
              <div className="mt-6 grid gap-3 text-sm font-semibold text-white/85 sm:grid-cols-2">
                <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-4">
                  <CalendarDays className="h-5 w-5 text-white" aria-hidden="true" />
                  2 séances de 2h par semaine
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-4">
                  <Clock3 className="h-5 w-5 text-white" aria-hidden="true" />
                  Du lundi au vendredi, 18h-20h
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {levels.map((level) => (
                <div key={level} className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-center text-sm font-bold">
                  {level}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
