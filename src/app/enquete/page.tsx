import type { Metadata } from "next";
import { ParentSurveyForm } from "@/components/ui/ParentSurveyForm";

// Temporary one-time parent survey (Nov 2026), shared as a WhatsApp link.
// Not in the nav or sitemap; noindex. The Meta pixel is disabled on this route.

const title = "Enquête de satisfaction – English Hills";
const description = "Votre avis compte ! Merci de prendre quelques minutes pour évaluer votre expérience au sein de notre centre.";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: {
    title,
    description,
    type: "website",
    locale: "fr_MA",
    siteName: "English Hills",
  },
};

export default function ParentSurveyPage() {
  return (
    <div className="min-h-full bg-[#f5f7f9] px-4 py-6 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <ParentSurveyForm />
      </div>
    </div>
  );
}
