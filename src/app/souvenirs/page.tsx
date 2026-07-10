import type { Metadata } from "next";
import { hasValidCampAccess } from "./auth";
import { AccessGate } from "./AccessGate";
import { Gallery } from "./Gallery";

export const metadata: Metadata = {
  title: "Les souvenirs de l'été | Active Minds Summer Camp",
  description: "Galerie photo privée du camp d'été Active Minds, réservée aux familles.",
  robots: { index: false, follow: false },
};

// Reading the httpOnly cookie opts this route into dynamic rendering; be explicit
// so it is never statically cached.
export const dynamic = "force-dynamic";

export default async function SouvenirsPage() {
  const authorized = await hasValidCampAccess();

  if (!authorized) {
    return <AccessGate />;
  }

  return <Gallery />;
}
