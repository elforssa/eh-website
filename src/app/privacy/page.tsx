import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité | English Hills Language Center",
  description: "Comment English Hills Language Center collecte, utilise et protège vos données personnelles.",
};

export default function PrivacyPage() {
  return (
    <div className="py-24 bg-surface min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="bg-white p-12 md:p-16 rounded-3xl border border-gray-100 shadow-sm">
          <h1 className="text-4xl font-bold text-foreground mb-4 tracking-tight">Politique de confidentialité</h1>
          <p className="text-sm text-gray-400 mb-10">Dernière mise à jour : avril 2025</p>

          <div className="prose prose-lg text-gray-600 max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">1. Données collectées</h2>
              <p>
                English Hills Language Center collecte les informations personnelles que vous nous fournissez volontairement lors d&apos;une réservation de test de niveau, d&apos;un formulaire de contact ou d&apos;une inscription à un programme. Il peut s&apos;agir de votre nom, adresse e-mail, numéro de téléphone et de tout objectif ou préférence que vous nous communiquez.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">2. Utilisation de vos données</h2>
              <p>Nous utilisons les informations collectées pour :</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Planifier et confirmer les tests de niveau et les rendez-vous d&apos;inscription</li>
                <li>Vous placer dans le groupe anglais correspondant à votre niveau</li>
                <li>Vous communiquer les mises à jour d&apos;horaires, les nouveautés et les rappels de cours</li>
                <li>Répondre à vos demandes</li>
              </ul>
              <p className="mt-3">Nous ne vendons, ne louons ni ne partageons vos données personnelles à des tiers à des fins commerciales.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">3. Stockage & sécurité</h2>
              <p>
                Toutes les soumissions de formulaires sont stockées de manière sécurisée via Supabase, une infrastructure de base de données conforme au RGPD. L&apos;accès à vos données est strictement limité au personnel autorisé d&apos;English Hills. Nous appliquons des mesures de sécurité conformes aux standards du secteur pour protéger vos informations contre tout accès ou divulgation non autorisé.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">4. Conservation des données</h2>
              <p>
                Nous conservons vos données personnelles aussi longtemps que nécessaire pour assurer nos services et répondre à nos obligations administratives. Vous pouvez demander la suppression de vos données à tout moment en nous contactant.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">5. Vos droits</h2>
              <p>Vous disposez des droits suivants :</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Accéder aux données personnelles que nous détenons vous concernant</li>
                <li>Demander la correction de données inexactes</li>
                <li>Demander la suppression de vos données</li>
                <li>Retirer votre consentement aux communications à tout moment</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">6. Contact</h2>
              <p>
                Pour toute question relative à cette politique ou pour exercer vos droits, contactez-nous à{" "}
                <a href="mailto:contact@english-hills.com" className="text-navy-primary underline">contact@english-hills.com</a>{" "}
                ou au <a href="tel:+212664239091" className="text-navy-primary underline">+212 6 64 23 90 91</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
