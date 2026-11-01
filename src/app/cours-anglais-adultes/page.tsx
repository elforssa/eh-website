import type { CrmWorkflow } from "@/lib/acquisition/workflow";
import type { Metadata } from "next";
import Image from "next/image";
import { BookOpen, ClipboardCheck, GraduationCap, Headset, MapPin, MessageCircle, UsersRound, Zap } from "lucide-react";
import { AdultClassesLeadForm } from "@/components/ui/AdultClassesLeadForm";

export const metadata: Metadata = {
  title: "Cours d'anglais pour adultes à Casablanca | English Hills",
  description: "Programme Communication Adultes : un anglais pratique, centré sur la conversation, en petits groupes au Quartier Almaz, Casablanca. Test de niveau gratuit.",
  openGraph: {
    title: "Cours d'anglais pour adultes — English Hills",
    description: "Prenez enfin la parole en anglais. Pratique réelle à chaque séance, petits groupes, test de niveau gratuit.",
  },
};

const heroPoints = [
  "Prise de parole à chaque séance",
  "Petits groupes selon votre niveau",
  "Test de niveau gratuit, sans engagement",
];

const strengths = [
  {
    title: "Vous parlez à chaque cours",
    text: "100 % de communication orale active. Pas de pages tournées en silence, pas de règles de grammaire à apprendre par cœur.",
    icon: MessageCircle,
  },
  {
    title: "Réalité virtuelle et écrans interactifs",
    text: "Des scénarios en réalité virtuelle et des écrans interactifs pour pratiquer l'anglais en situation réelle.",
    icon: Headset,
  },
  {
    title: "Manuel et plateforme inclus",
    text: "Le manuel officiel Language Hub et un accès 24h/24 à la plateforme en ligne pour réviser chez vous.",
    icon: BookOpen,
  },
  {
    title: "Des enseignants certifiés",
    text: "Des enseignants passionnés, titulaires de certifications internationales et expérimentés avec les adultes.",
    icon: GraduationCap,
  },
  {
    title: "Des groupes à taille limitée",
    text: "Une attention personnalisée, en groupe mixte ou non mixte, adapté à votre âge et à votre niveau.",
    icon: UsersRound,
  },
];

const formules = [
  {
    title: "Standard",
    rhythm: "3h par semaine",
    text: "Un rythme régulier pour progresser sans bousculer votre agenda.",
  },
  {
    title: "Intensif",
    rhythm: "6h par semaine",
    text: "Deux fois plus de pratique pour progresser plus vite.",
  },
];

export default function AdultClassesLandingPage() {
  return (
    <div className="bg-[#fbfcff] text-navy-deep">
      <section className="relative overflow-hidden border-b border-gray-200 bg-white">
        <div className="absolute inset-x-0 top-0 h-2 bg-[linear-gradient(90deg,var(--navy-primary),var(--red-accent),#C9A84C)]" aria-hidden="true" />

        <div className="container mx-auto max-w-7xl px-4 pt-8 md:px-6">
          <Image src="/eh-logo-new.png" alt="English Hills" width={220} height={88} className="h-12 w-auto object-contain md:h-14" priority />
        </div>

        <div className="container mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-8 md:px-6 md:pb-16 lg:grid-cols-[1fr_470px] lg:items-start lg:gap-16">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-accent/20 bg-red-accent/10 px-4 py-2 text-sm font-black text-red-accent">
              <Zap className="h-4 w-4" aria-hidden="true" />
              Programme Communication Adultes
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-normal text-navy-deep md:text-6xl">
              Osez enfin parler anglais.
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600 md:text-xl">
              Un programme pensé pour les adultes qui comprennent l&apos;anglais mais bloquent à l&apos;oral. Pas de cours magistraux : à chaque séance, vous pratiquez la conversation dans des situations réelles, avec un enseignant qui vous corrige.
            </p>

            <ul className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
              {heroPoints.map((point) => (
                <li key={point} className="flex items-start gap-2 rounded-2xl border border-gray-200 bg-white p-4 text-sm font-bold leading-6 shadow-sm shadow-navy-primary/5">
                  <ClipboardCheck className="mt-0.5 h-5 w-5 flex-none text-red-accent" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>

            <div className="relative mt-9 hidden aspect-[16/10] max-w-3xl overflow-hidden rounded-2xl border border-gray-200 lg:block">
              <Image src="/hero_classroom_students_1775450226096.png" alt="Adultes en conversation pendant un cours d'anglais" fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
          </div>

          <div id="formulaire" className="relative z-10 scroll-mt-6">
            <div className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-2xl shadow-navy-primary/10 md:p-7">
              <div className="mb-6">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-red-accent">Test de niveau gratuit</p>
                <h2 className="mt-2 text-2xl font-black text-navy-deep">Réservez votre évaluation</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Laissez vos coordonnées : un conseiller vous appelle pour fixer votre test de niveau oral et écrit, gratuit et sans engagement.
                </p>
              </div>
              <AdultClassesLeadForm campaign={{ destination: "crm", formSchema: "campaign_adult_lead_v1", visibleQuestions: ["current_level"] } satisfies CrmWorkflow} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-red-accent">Pourquoi English Hills</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight md:text-5xl">
            Un anglais pratique, pour parler avec assurance.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {strengths.map(({ title, text, icon: Icon }) => (
              <div key={title} className="rounded-2xl border border-gray-200 bg-white p-6">
                <Icon className="h-6 w-6 text-navy-primary" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-deep py-14 text-white md:py-20">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-white/60">Deux formules</p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">Choisissez votre rythme.</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/75">
                Votre conseiller vous présente la formule la plus adaptée à votre objectif lors de l&apos;appel.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {formules.map((formule) => (
                <div key={formule.title} className="rounded-2xl border border-white/15 bg-white/10 p-6">
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[#e9d49a]">{formule.title}</p>
                  <p className="mt-2 text-3xl font-black">{formule.rhythm}</p>
                  <p className="mt-3 text-sm leading-6 text-white/75">{formule.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-6">
          <ClipboardCheck className="mx-auto h-10 w-10 text-red-accent" aria-hidden="true" />
          <h2 className="mt-4 text-3xl font-black md:text-4xl">Commencez par un test de niveau gratuit</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600">
            Avant toute inscription, passez un test oral et écrit, gratuit et sans engagement. Vous êtes ensuite placé avec des personnes de votre niveau.
          </p>
          <a href="#formulaire" className="mt-8 inline-flex items-center justify-center rounded-full bg-red-accent px-8 py-4 text-base font-black text-white shadow-lg shadow-red-accent/20 transition-colors hover:bg-[#9d1726]">
            Réserver mon test de niveau gratuit
          </a>
          <p className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-gray-600">
            <MapPin className="h-4 w-4 text-red-accent" aria-hidden="true" />
            English Hills — Quartier Almaz, Casablanca
          </p>
        </div>
      </section>
    </div>
  );
}
