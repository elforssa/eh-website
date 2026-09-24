import type { Metadata } from "next";
import Image from "next/image";
import { ArrowDown, BadgeCheck, CalendarClock, MapPin, MessageCircle, PhoneCall, UsersRound } from "lucide-react";
import { JobApplicationForm } from "@/components/ui/JobApplicationForm";

export const metadata: Metadata = {
  title: "Chargé(e) d'Accueil & Admissions | English Hills",
  description: "English Hills recrute deux chargé(e)s d'accueil et admissions à Almaz, Casablanca.",
  robots: { index: false, follow: false },
};

const responsibilities = [
  "Accueillir les familles et répondre aux appels et messages WhatsApp",
  "Appeler et relancer les prospects intéressés par nos cours",
  "Expliquer les programmes et réserver les tests de niveau",
  "Suivre les prospects jusqu'à l'inscription",
  "Assurer les tâches administratives et de paiement courantes",
  "Utiliser notre CRM et nos outils internes",
];

export default function RecruitmentPage() {
  return (
    <div className="bg-[#f5f7f9] text-navy-deep">
      <section className="relative overflow-hidden border-b border-[#dce3e8] bg-white">
        <div className="absolute inset-x-0 top-0 h-2 bg-[linear-gradient(90deg,#b4232f_0_26%,#132b52_26%_74%,#2c7a69_74%)]" aria-hidden="true" />
        <div className="container mx-auto max-w-7xl px-5 pb-14 pt-8 md:px-8 md:pb-20">
          <div className="flex items-center justify-between gap-5">
            <Image src="/eh-logo-new.png" alt="English Hills" width={220} height={88} className="h-12 w-auto object-contain md:h-14" priority />
            <div className="hidden items-center gap-2 text-sm font-bold text-gray-600 sm:flex">
              <MapPin className="h-4 w-4 text-red-accent" aria-hidden="true" />
              Almaz, Casablanca
            </div>
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 border-l-4 border-red-accent bg-[#fff4f4] px-4 py-2 text-sm font-black uppercase text-red-accent">
                <UsersRound className="h-4 w-4" aria-hidden="true" />
                2 postes disponibles
              </div>
              <p className="mt-7 text-sm font-black uppercase text-[#2c7a69]">English Hills recrute</p>
              <h1 className="mt-3 max-w-4xl text-4xl font-black leading-[1.04] tracking-normal text-navy-deep md:text-6xl">
                Chargé(e) d’Accueil & Admissions
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600 md:text-xl">
                Vous êtes à l’aise au téléphone, aimez le contact client et savez accompagner un prospect intéressé jusqu’à la prise de rendez-vous ou l’inscription ? Rejoignez English Hills à Almaz, Casablanca.
              </p>

              <div className="mt-8 grid max-w-3xl gap-px overflow-hidden border border-[#dbe1e6] bg-[#dbe1e6] sm:grid-cols-3">
                <div className="bg-navy-deep p-5 text-white">
                  <p className="text-xs font-bold uppercase text-white/60">Rémunération</p>
                  <p className="mt-2 text-lg font-black">4 000 DH + commissions</p>
                </div>
                <div className="bg-white p-5">
                  <p className="text-xs font-bold uppercase text-gray-400">Poste 1</p>
                  <p className="mt-2 font-black">Matin · 09h00–15h00</p>
                </div>
                <div className="bg-white p-5">
                  <p className="text-xs font-bold uppercase text-gray-400">Poste 2</p>
                  <p className="mt-2 font-black">Après-midi · 15h00–20h00</p>
                </div>
              </div>

              <a href="#candidature" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 bg-red-accent px-7 py-3 font-black text-white transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-accent/25">
                Postuler maintenant
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden border border-[#dbe1e6] bg-gray-100 shadow-xl shadow-navy-deep/10">
              <Image src="/summer-camp-classroom.jpeg" alt="Centre English Hills à Almaz, Casablanca" fill className="object-cover" sizes="(min-width: 1024px) 42vw, 100vw" priority />
              <div className="absolute inset-x-0 bottom-0 bg-navy-deep/90 px-5 py-4 text-sm font-bold text-white">
                Une vraie mission d’accueil, de conseil et de suivi commercial.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#dce3e8] bg-[#eef3f5] py-14 md:py-20">
        <div className="container mx-auto grid max-w-7xl gap-10 px-5 md:px-8 lg:grid-cols-[.78fr_1.22fr]">
          <div>
            <p className="text-sm font-black uppercase text-red-accent">Le poste</p>
            <h2 className="mt-3 text-3xl font-black leading-tight md:text-4xl">Plus que de la réception : vous accompagnez chaque demande jusqu’à sa prochaine étape.</h2>
            <p className="mt-5 leading-7 text-gray-600">
              Ce poste inclut de la prospection et du suivi commercial. Vous échangez avec des parents et des apprenants qui ont déjà manifesté leur intérêt, puis vous les aidez à avancer vers un rendez-vous, un test de niveau ou une inscription.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden border border-[#d6dee3] bg-[#d6dee3] sm:grid-cols-2">
            {responsibilities.map((item, index) => (
              <div key={item} className="flex gap-3 bg-white p-5">
                {index % 3 === 0 ? <PhoneCall className="mt-0.5 h-5 w-5 flex-none text-[#2c7a69]" aria-hidden="true" /> : index % 3 === 1 ? <MessageCircle className="mt-0.5 h-5 w-5 flex-none text-[#2c7a69]" aria-hidden="true" /> : <BadgeCheck className="mt-0.5 h-5 w-5 flex-none text-[#2c7a69]" aria-hidden="true" />}
                <p className="text-sm font-bold leading-6 text-navy-deep">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="candidature" className="scroll-mt-5 py-14 md:py-20">
        <div className="container mx-auto grid max-w-7xl gap-10 px-5 md:px-8 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
          <div className="lg:sticky lg:top-8">
            <p className="text-sm font-black uppercase text-[#2c7a69]">Votre candidature</p>
            <h2 className="mt-3 text-3xl font-black leading-tight md:text-4xl">Vérifions si le poste vous correspond.</h2>
            <p className="mt-5 leading-7 text-gray-600">Le formulaire prend environ 6 minutes. Vos réponses nous aident à comprendre votre disponibilité, votre aisance avec les prospects et votre façon de communiquer.</p>
            <div className="mt-7 flex items-start gap-3 border-t border-[#d6dee3] pt-6">
              <CalendarClock className="mt-0.5 h-5 w-5 flex-none text-red-accent" aria-hidden="true" />
              <p className="text-sm leading-6 text-gray-600">Préparez votre CV au format PDF, 5 Mo maximum.</p>
            </div>
          </div>
          <div className="border border-[#d6dee3] bg-white p-5 shadow-sm md:p-8">
            <JobApplicationForm />
          </div>
        </div>
      </section>
    </div>
  );
}
