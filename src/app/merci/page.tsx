import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { CheckCircle2, MessageCircle, PhoneCall } from "lucide-react";
import { InquiryThankYouTracker } from "@/components/analytics/InquiryThankYouTracker";
import { receiptCookie, verifyReceipt } from "@/lib/crm/receipt";

export const metadata: Metadata = {
  title: "Merci | English Hills",
  description: "Votre demande a bien été reçue par English Hills.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MerciPage() {
  const proof = verifyReceipt((await cookies()).get(receiptCookie)?.value);
  if (!proof) {
    return (
      <div className="bg-[#fbfcff] py-16 md:py-24">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <div className="rounded-[1.75rem] border border-gray-200 bg-white p-8 text-center shadow-xl shadow-navy-primary/10 md:p-12">
            <h1 className="text-3xl font-black text-navy-deep md:text-5xl">Aucune demande récente à confirmer.</h1>
            <p className="mt-5 text-gray-600">Pour nous écrire, utilisez le formulaire de contact.</p>
            <Link href="/contact" className="mt-8 inline-flex rounded-full bg-red-accent px-6 py-4 font-bold text-white">Nous contacter</Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-[#fbfcff] py-16 md:py-24">
      <InquiryThankYouTracker />

      <div className="container mx-auto max-w-3xl px-4 md:px-6">
        <div className="mb-8 flex justify-center">
          <Image
            src="/eh-logo-new.png"
            alt="English Hills"
            width={220}
            height={88}
            className="h-12 w-auto object-contain md:h-14"
            priority
          />
        </div>

        <div className="rounded-[1.75rem] border border-gray-200 bg-white p-8 text-center shadow-2xl shadow-navy-primary/10 md:p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-9 w-9 text-green-700" aria-hidden="true" />
          </div>

          <p className="text-sm font-black uppercase tracking-[0.18em] text-red-accent">Demande envoyée</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-navy-deep md:text-5xl">
            Merci, nous avons bien reçu votre demande.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            Un conseiller English Hills vous contactera rapidement pour confirmer vos objectifs et vous orienter vers le programme le plus adapté.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a
              href="https://wa.me/212664239091"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-4 font-bold text-white transition-colors hover:bg-green-700"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Écrire sur WhatsApp
            </a>
            <a
              href="tel:+212664239091"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-navy-primary px-6 py-4 font-bold text-navy-primary transition-colors hover:bg-navy-primary hover:text-white"
            >
              <PhoneCall className="h-5 w-5" aria-hidden="true" />
              Appeler le centre
            </a>
          </div>

          <Link
            href="/"
            className="mt-8 inline-flex text-sm font-bold text-gray-500 underline underline-offset-4 transition-colors hover:text-navy-primary"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
