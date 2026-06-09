import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, MessageCircle, Target, UserRoundCheck, UsersRound } from "lucide-react";
import { OnlineLeadForm } from "@/components/ui/OnlineLeadForm";

export const metadata: Metadata = {
  title: "Cours d'anglais en ligne | English Hills",
  description: "Cours particuliers d'anglais en ligne avec une vraie école marocaine, un programme structuré et un suivi personnalisé.",
  openGraph: {
    title: "Apprenez l'anglais en ligne — English Hills",
    description: "1:1 ou petit groupe en ligne, avec un vrai programme, un vrai prof et un vrai suivi.",
  },
};

const trustPillars = [
  {
    title: "Méthode certifiée",
    text: "Programme National Geographic Learning, utilisé dans plus de 150 pays",
    icon: BadgeCheck,
  },
  {
    title: "100% temps de parole",
    text: "En 1:1, vous parlez dès la première minute de chaque cours",
    icon: MessageCircle,
  },
  {
    title: "Suivi personnalisé",
    text: "Votre progression est suivie semaine après semaine par votre prof attitré",
    icon: UserRoundCheck,
  },
];

const formats = [
  {
    title: "Cours particulier 1:1",
    text: "Un parcours construit autour de votre objectif, votre niveau et votre rythme.",
  },
  {
    title: "Petit groupe jusqu'à 8",
    text: "Une classe courte, encadree et active pour parler sans se cacher au fond.",
  },
];

export default function EnglishOnlineLandingPage() {
  return (
    <div className="bg-[#f7fbff] text-navy-deep">
      <section className="relative overflow-hidden border-b border-gray-200 bg-white">
        <div className="absolute inset-x-0 top-0 h-2 bg-[linear-gradient(90deg,#1f8a70,var(--navy-primary),var(--red-accent))]" aria-hidden="true" />
        <div className="absolute right-[-12rem] top-20 h-96 w-96 rounded-full border border-[#1f8a70]/20" aria-hidden="true" />
        <div className="absolute right-[-6rem] top-32 h-64 w-64 rounded-full border border-red-accent/20" aria-hidden="true" />

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

        <div className="container mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-8 md:px-6 md:pb-16 lg:grid-cols-[1fr_470px] lg:items-center lg:gap-16">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1f8a70]/20 bg-[#1f8a70]/10 px-4 py-2 text-sm font-black text-[#176d59]">
              <UsersRound className="h-4 w-4" aria-hidden="true" />
              Cours en ligne 1:1 ou petit groupe
            </div>

            <h1 className="max-w-5xl text-4xl font-black leading-[1.02] tracking-normal text-navy-deep md:text-6xl lg:text-7xl">
              Apprenez l&apos;anglais en ligne — avec une vraie école marocaine
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600 md:text-xl">
              Que vous prépariez l&apos;IELTS, que vous vouliez enfin parler avec aisance au travail, ou que vous cherchiez un encadrement sérieux pour votre enfant — English Hills propose des cours particuliers en ligne construits autour de votre objectif. Pas des cours improvisés. Un vrai programme, un vrai prof, un vrai suivi.
            </p>

            <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
              {trustPillars.map(({ title, text, icon: Icon }) => (
                <div key={title} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-navy-primary/5">
                  <Icon className="h-5 w-5 text-[#1f8a70]" aria-hidden="true" />
                  <h2 className="mt-3 text-sm font-black text-navy-deep">{title}</h2>
                  <p className="mt-1 text-xs font-semibold leading-5 text-gray-600">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-9 grid max-w-3xl gap-4 sm:grid-cols-2">
              {formats.map((format) => (
                <div key={format.title} className="flex gap-3 rounded-2xl bg-navy-deep p-5 text-white">
                  <Target className="mt-0.5 h-5 w-5 flex-none text-[#82e0c8]" aria-hidden="true" />
                  <div>
                    <h2 className="text-base font-black">{format.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-white/75">{format.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <div className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-2xl shadow-navy-primary/10 md:p-7">
              <div className="mb-6">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1f8a70]">Évaluation gratuite</p>
                <h2 className="mt-2 text-2xl font-black text-navy-deep">Recevez votre plan de cours</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Répondez a quelques questions. Nous vous contactons pour proposer le format en ligne le plus adapté.
                </p>
              </div>
              <OnlineLeadForm />
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container mx-auto grid max-w-7xl gap-10 px-4 md:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <Image
              src="/diverse_learners_1775450286839.png"
              alt="Apprenants English Hills"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 44vw, 100vw"
            />
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1f8a70]">Pour adultes sceptiques</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-navy-deep md:text-5xl">
              Vous ne payez pas pour une video. Vous avancez avec un prof qui vous corrige.
            </h2>
            <div className="mt-8 grid gap-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-lg font-black text-navy-deep">Un vrai diagnostic avant de commencer</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">Votre objectif, votre niveau et vos disponibilites servent a construire le parcours.</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-lg font-black text-navy-deep">Des cours centres sur la parole</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">Le cours est concu pour pratiquer, etre corrige et progresser avec des situations utiles.</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-lg font-black text-navy-deep">Un suivi, pas une inscription oubliee</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">Votre prof attitré suit votre progression et ajuste le travail semaine après semaine.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-navy-deep py-12 text-white md:py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-white/60">Objectifs possibles</p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">Un parcours pour parler, préparer un examen ou accompagner votre enfant.</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {["Anglais professionnel", "IELTS / TOEFL", "Anglais général", "Enfant / Junior"].map((objective) => (
                <div key={objective} className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-center text-sm font-bold">
                  {objective}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
