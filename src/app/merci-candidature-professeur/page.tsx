import type { Metadata } from "next";
import Image from "next/image";
import { cookies } from "next/headers";
import { CheckCircle2, MapPin } from "lucide-react";
import { TeacherThankYouTracker } from "@/components/analytics/TeacherThankYouTracker";
import { TEACHER_RECEIPT_COOKIE, verifyReceipt } from "@/lib/teacher-applications/receipt";

export const metadata: Metadata = {
  title: "Application received | English Hills",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TeacherThankYouPage() {
  const cookieStore = await cookies();
  const secret = process.env.JOB_APPLICATION_FORM_SECRET || "";
  let hasReceipt = false;
  try {
    hasReceipt = secret.length >= 32 && Boolean(verifyReceipt(cookieStore.get(TEACHER_RECEIPT_COOKIE)?.value, secret));
  } catch {
    hasReceipt = false;
  }

  return (
    <div className="min-h-screen bg-[#f4f7f9] px-5 py-8 text-navy-deep md:py-14">
      {hasReceipt && <TeacherThankYouTracker />}
      <div className="mx-auto max-w-3xl">
        <Image src="/eh-logo-new.png" alt="English Hills" width={220} height={88} className="mx-auto h-14 w-auto object-contain" priority />
        <div className="mt-9 border border-[#d9e1e5] bg-white p-7 text-center shadow-xl shadow-navy-deep/5 md:p-12">
          <CheckCircle2 className="mx-auto h-14 w-14 text-[#2c7a69]" strokeWidth={1.8} aria-hidden="true" />
          <p className="mt-6 text-sm font-black uppercase text-red-accent">Application sent</p>
          <h1 className="mt-3 text-3xl font-black leading-tight md:text-5xl">Thank you, we received your application.</h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-gray-600 md:text-lg">Our team will review your CV and video. If your profile matches the role, we will contact you on WhatsApp or by phone for the next step.</p>
          <div className="mx-auto mt-8 flex w-fit items-center gap-2 border-t border-[#dce3e8] px-5 pt-6 text-sm font-bold text-navy-deep">
            <MapPin className="h-4 w-4 text-red-accent" aria-hidden="true" />
            English Hills — Almaz, Casablanca
          </div>
        </div>
      </div>
    </div>
  );
}
