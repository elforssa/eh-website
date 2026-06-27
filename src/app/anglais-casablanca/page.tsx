import type { Metadata } from "next";
import Image from "next/image";
import { CheckCircle2, MapPin, Palette, ShieldCheck, UsersRound } from "lucide-react";
import { AdLeadForm } from "@/components/ui/AdLeadForm";

export const metadata: Metadata = {
  title: "Summer Camp d'anglais à Casablanca | English Hills",
  description: "Réservez une place pour le Summer Camp English Hills à Almaz 2, Casablanca.",
  openGraph: {
    title: "Summer Camp d'anglais à Casablanca — English Hills",
    description: "Un camp d'été en anglais pour aider votre enfant à parler, créer et gagner confiance.",
  },
};

const proofPoints = [
  "Activités en anglais, pas de cours passifs",
  "Encadrement sérieux à Almaz 2, Casablanca",
  "Places limitées pour garder des groupes vivants",
];

const campHighlights = [
  {
    title: "Parler avec confiance",
    text: "Chaque journée pousse les enfants à utiliser l'anglais dans des jeux, projets et échanges simples.",
    icon: UsersRound,
  },
  {
    title: "Créer et participer",
    text: "Des activités manuelles, défis d'équipe et présentations courtes pour apprendre sans pression.",
    icon: Palette,
  },
  {
    title: "Un vrai cadre",
    text: "Une équipe sur place, un programme clair et un environnement pensé pour les enfants.",
    icon: ShieldCheck,
  },
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
              Summer Camp d'anglais à Casablanca pour enfants.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 md:text-xl">
              Un programme d'été à Almaz 2 où les enfants pratiquent l'anglais à travers des activités, des jeux, des projets créatifs et des moments de prise de parole.
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
                <p className="text-3xl font-black text-red-accent">100%</p>
                <p className="mt-1 text-sm font-semibold text-gray-600">activités en anglais</p>
              </div>
              <div>
                <p className="text-3xl font-black text-navy-primary">6+</p>
                <p className="mt-1 text-sm font-semibold text-gray-600">enfants et juniors</p>
              </div>
              <div>
                <p className="text-3xl font-black text-[#1f8a70]">Almaz</p>
                <p className="mt-1 text-sm font-semibold text-gray-600">Casablanca</p>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <div className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-2xl shadow-navy-primary/10 md:p-7">
              <div className="mb-6">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-red-accent">Inscription Summer Camp</p>
                <h2 className="mt-2 text-2xl font-black text-navy-deep">Réservez une place</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Laissez vos coordonnées. Notre équipe vous rappelle avec les détails du camp et les disponibilités.
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
              src="/hero_classroom_students_1775450226096.png"
              alt="Enfants en activité chez English Hills"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 42vw, 100vw"
            />
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-navy-primary">Pourquoi ce camp</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-navy-deep md:text-5xl">
              Des vacances utiles, sans transformer l'été en salle de classe.
            </h2>
            <div className="mt-8 grid gap-4">
              {campHighlights.map(({ title, text, icon: Icon }) => (
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
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-white/60">Dernière étape</p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">Vérifiez que le centre à Almaz vous convient, puis réservez.</h2>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-sm font-semibold leading-7 text-white/85 md:max-w-md">
              Le formulaire est volontairement court pour que notre équipe puisse vous rappeler vite et confirmer les informations importantes.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
