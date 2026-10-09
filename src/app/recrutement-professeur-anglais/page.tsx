import type { Metadata } from "next";
import Image from "next/image";
import { ArrowDown, BadgeCheck, CalendarClock, MapPin, MessageCircle, Mic, UsersRound } from "lucide-react";
import { TeacherApplicationForm } from "@/components/ui/TeacherApplicationForm";

export const metadata: Metadata = {
  title: "English Teacher (Part-time) | English Hills",
  description: "English Hills is hiring part-time English teachers in Almaz, Casablanca.",
  robots: { index: false, follow: false },
};

const requirements = [
  "At least 3 years of English teaching experience",
  "CELTA certificate",
  "C1 English or higher",
  "Able to commute to Almaz, Casablanca",
  "A communicative, speaking-focused teaching style",
  "Reliable, punctual and good with students of all ages",
];

export default function TeacherRecruitmentPage() {
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
                Part-time role
              </div>
              <p className="mt-7 text-sm font-black uppercase text-[#2c7a69]">English Hills is hiring</p>
              <h1 className="mt-3 max-w-4xl text-4xl font-black leading-[1.04] tracking-normal text-navy-deep md:text-6xl">
                English Teacher
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600 md:text-xl">
                Do you teach English with real conversation, not just grammar drills? Join our team of CELTA-qualified teachers at English Hills in Almaz, Casablanca.
              </p>

              <div className="mt-8 grid max-w-3xl gap-px overflow-hidden border border-[#dbe1e6] bg-[#dbe1e6] sm:grid-cols-3">
                <div className="bg-navy-deep p-5 text-white">
                  <p className="text-xs font-bold uppercase text-white/60">Pay</p>
                  <p className="mt-2 text-lg font-black">200 DH / hour, net</p>
                </div>
                <div className="bg-white p-5">
                  <p className="text-xs font-bold uppercase text-gray-400">Schedule</p>
                  <p className="mt-2 font-black">Part-time</p>
                </div>
                <div className="bg-white p-5">
                  <p className="text-xs font-bold uppercase text-gray-400">Location</p>
                  <p className="mt-2 font-black">Almaz, Casablanca</p>
                </div>
              </div>

              <a href="#application" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 bg-red-accent px-7 py-3 font-black text-white transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-accent/25">
                Apply now
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden border border-[#dbe1e6] bg-gray-100 shadow-xl shadow-navy-deep/10">
              <Image src="/summer-camp-classroom.jpeg" alt="English Hills classroom in Almaz, Casablanca" fill className="object-cover" sizes="(min-width: 1024px) 42vw, 100vw" priority />
              <div className="absolute inset-x-0 bottom-0 bg-navy-deep/90 px-5 py-4 text-sm font-bold text-white">
                Small classes. Real speaking practice. A team that supports its teachers.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#dce3e8] bg-[#eef3f5] py-14 md:py-20">
        <div className="container mx-auto grid max-w-7xl gap-10 px-5 md:px-8 lg:grid-cols-[.78fr_1.22fr]">
          <div>
            <p className="text-sm font-black uppercase text-red-accent">Who we are looking for</p>
            <h2 className="mt-3 text-3xl font-black leading-tight md:text-4xl">Experienced teachers who get students speaking.</h2>
            <p className="mt-5 leading-7 text-gray-600">
              Please apply only if you meet the requirements. The application takes about 8 minutes and includes a short video introduction, which is the part we look at first.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden border border-[#d6dee3] bg-[#d6dee3] sm:grid-cols-2">
            {requirements.map((item, index) => (
              <div key={item} className="flex gap-3 bg-white p-5">
                {index % 3 === 0 ? <BadgeCheck className="mt-0.5 h-5 w-5 flex-none text-[#2c7a69]" aria-hidden="true" /> : index % 3 === 1 ? <MessageCircle className="mt-0.5 h-5 w-5 flex-none text-[#2c7a69]" aria-hidden="true" /> : <Mic className="mt-0.5 h-5 w-5 flex-none text-[#2c7a69]" aria-hidden="true" />}
                <p className="text-sm font-bold leading-6 text-navy-deep">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="application" className="scroll-mt-5 py-14 md:py-20">
        <div className="container mx-auto grid max-w-7xl gap-10 px-5 md:px-8 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
          <div className="lg:sticky lg:top-8">
            <p className="text-sm font-black uppercase text-[#2c7a69]">Your application</p>
            <h2 className="mt-3 text-3xl font-black leading-tight md:text-4xl">Let&apos;s see if the role fits you.</h2>
            <p className="mt-5 leading-7 text-gray-600">Before you start, have these ready:</p>
            <div className="mt-5 space-y-4 border-t border-[#d6dee3] pt-6">
              <div className="flex items-start gap-3">
                <CalendarClock className="mt-0.5 h-5 w-5 flex-none text-red-accent" aria-hidden="true" />
                <p className="text-sm leading-6 text-gray-600">Your CV as a PDF, 5 MB maximum.</p>
              </div>
              <div className="flex items-start gap-3">
                <Mic className="mt-0.5 h-5 w-5 flex-none text-red-accent" aria-hidden="true" />
                <p className="text-sm leading-6 text-gray-600">A video of about 1 minute, in English, uploaded to Google Drive, YouTube (unlisted), Loom or Vimeo, with the link ready to paste.</p>
              </div>
            </div>
          </div>
          <div className="border border-[#d6dee3] bg-white p-5 shadow-sm md:p-8">
            <TeacherApplicationForm />
          </div>
        </div>
      </section>
    </div>
  );
}
