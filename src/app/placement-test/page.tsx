import type { Metadata } from "next";
import PlacementTestClient from "./PlacementTestClient";

export const metadata: Metadata = {
  title: "Test de niveau gratuit | English Hills Language Center",
  description: "Réservez votre test de positionnement gratuit chez English Hills à Casablanca. Sans engagement — on vous place dans le groupe idéal selon votre niveau et vos objectifs.",
  openGraph: {
    title: "Test de niveau gratuit — English Hills",
    description: "Choisissez une date, remplissez vos informations et faites le premier pas vers un anglais fluide.",
  },
};

export default function PlacementTestPage() {
  return <PlacementTestClient />;
}
