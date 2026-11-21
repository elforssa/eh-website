import type { Metadata } from "next";
import { AdultSurveyForm } from "@/components/ui/AdultSurveyForm";

// Temporary one-time adult learner survey (Nov 2026), shared as a WhatsApp link.
// Not in the nav or sitemap; noindex. The Meta pixel is disabled on this route.

const title = "Enquête de satisfaction – Apprenants adultes | English Hills";
const description = "Votre avis compte ! Merci de prendre quelques minutes pour évaluer votre expérience au sein d'English Hills.";

export const metadata: Metadata = {
  // Absolute www URLs for og:image, so WhatsApp doesn't go through the apex → www redirect.
  metadataBase: new URL("https://www.english-hills.com"),
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

export default function AdultSurveyPage() {
  return (
    <div className="min-h-full bg-[#f5f7f9] px-4 py-6 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <AdultSurveyForm />
      </div>
    </div>
  );
}
