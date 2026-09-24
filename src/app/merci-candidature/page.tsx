import type { Metadata } from "next";
import Image from "next/image";
import { CheckCircle2, MapPin } from "lucide-react";
import { RecruitmentThankYouTracker } from "@/components/analytics/RecruitmentThankYouTracker";

export const metadata: Metadata = {
  title: "Candidature reçue | English Hills",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ application_id?: string; token?: string; duplicate?: string }> };

export default async function RecruitmentThankYouPage({ searchParams }: Props) {
  const params = await searchParams;
  const canTrack = Boolean(params.application_id && params.token && params.duplicate !== "1");

  return (
    <div className="min-h-screen bg-[#f4f7f9] px-5 py-8 text-navy-deep md:py-14">
      {canTrack && <RecruitmentThankYouTracker applicationId={params.application_id!} token={params.token!} />}
      <div className="mx-auto max-w-3xl">
        <Image src="/eh-logo-new.png" alt="English Hills" width={220} height={88} className="mx-auto h-14 w-auto object-contain" priority />
        <div className="mt-9 border border-[#d9e1e5] bg-white p-7 text-center shadow-xl shadow-navy-deep/5 md:p-12">
          <CheckCircle2 className="mx-auto h-14 w-14 text-[#2c7a69]" strokeWidth={1.8} aria-hidden="true" />
          <p className="mt-6 text-sm font-black uppercase text-red-accent">Candidature envoyée</p>
          <h1 className="mt-3 text-3xl font-black leading-tight md:text-5xl">Votre candidature a bien été reçue.</h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-gray-600 md:text-lg">Merci pour votre intérêt pour English Hills.</p>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-gray-600">Notre équipe examinera votre candidature. Si votre profil correspond au poste, nous vous contacterons par téléphone ou WhatsApp pour la prochaine étape.</p>
          <div className="mx-auto mt-8 flex w-fit items-center gap-2 border-t border-[#dce3e8] px-5 pt-6 text-sm font-bold text-navy-deep">
            <MapPin className="h-4 w-4 text-red-accent" aria-hidden="true" />
            English Hills — Almaz, Casablanca
          </div>
        </div>
      </div>
    </div>
  );
}
