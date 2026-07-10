import { Header } from "@/components/layout/Header";
import { hasValidCampAccess } from "./auth";
import { SouvenirsBanner } from "./SouvenirsBanner";

/**
 * /souvenirs owns its own Header placement so the enrollment banner can sit
 * ABOVE the nav bar (PublicShell skips its Header for this route to avoid a
 * duplicate). The banner is server-side auth-gated: it shows only on the
 * authenticated gallery view, never on the AccessGate.
 */
export default async function SouvenirsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authorized = await hasValidCampAccess();

  return (
    <>
      {authorized && <SouvenirsBanner />}
      <Header />
      {children}
    </>
  );
}
