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
          <p className="text-sm text-gray-400 mb-10">Dernière mise à jour : septembre 2026</p>

          <div className="prose prose-lg text-gray-600 max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">1. Données collectées</h2>
              <p>
                English Hills Language Center collecte les informations personnelles que vous nous fournissez volontairement lors d&apos;un formulaire de contact ou d&apos;une inscription à un programme. Il peut s&apos;agir de votre nom, adresse e-mail, numéro de téléphone et de tout objectif ou préférence que vous nous communiquez.
              </p>
              <p className="mt-3">
                Lors d&apos;une candidature, nous pouvons également collecter votre zone de résidence, vos disponibilités, votre expérience, vos niveaux de langue, vos réponses au questionnaire et votre CV.
              </p>
              <p className="mt-3">
                Pour les demandes envoyées depuis ce site, nous transmettons vos coordonnées, vos réponses et, lorsqu&apos;ils sont disponibles, les paramètres de campagne et la page d&apos;origine à notre système de gestion des demandes English Hills. Cela permet à notre équipe de vous recontacter au sujet de votre demande. L&apos;envoi d&apos;une demande ne crée pas d&apos;inscription ni de paiement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">2. Utilisation de vos données</h2>
              <p>Nous utilisons les informations collectées pour :</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Planifier et confirmer les rendez-vous d&apos;inscription</li>
                <li>Vous placer dans le groupe anglais correspondant à votre niveau</li>
                <li>Vous communiquer les mises à jour d&apos;horaires, les nouveautés et les rappels de cours</li>
                <li>Répondre à vos demandes</li>
                <li>Examiner et gérer les candidatures à nos offres d&apos;emploi</li>
              </ul>
              <p className="mt-3">Nous ne vendons ni ne louons vos données personnelles. Lorsque la mesure publicitaire Meta est activée, des identifiants de contact hachés et des informations de navigation peuvent être transmis à Meta pour mesurer les demandes reçues. Les demandes issues des anciens formulaires peuvent également être copiées dans nos feuilles de suivi Google.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">3. Stockage & sécurité</h2>
              <p>
                Les demandes de contact et de cours sont traitées dans notre CRM. Les candidatures et certaines données des anciens formulaires peuvent être conservées dans Supabase. L&apos;accès à ces données est limité au personnel autorisé d&apos;English Hills. Nous appliquons des mesures de sécurité pour protéger vos informations contre tout accès ou divulgation non autorisé.
              </p>
              <p className="mt-3">Les CV de candidature sont conservés dans un espace privé et ne disposent pas de lien public.</p>
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
