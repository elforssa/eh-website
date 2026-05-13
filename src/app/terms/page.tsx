import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'utilisation | English Hills Language Center",
  description: "Conditions générales d'inscription, de paiement, de présence et d'utilisation des services d'English Hills Language Center.",
};

export default function TermsPage() {
  return (
    <div className="py-24 bg-surface min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="bg-white p-12 md:p-16 rounded-3xl border border-gray-100 shadow-sm">
          <h1 className="text-4xl font-bold text-foreground mb-4 tracking-tight">Conditions d&apos;utilisation</h1>
          <p className="text-sm text-gray-400 mb-10">Dernière mise à jour : avril 2025</p>

          <div className="prose prose-lg text-gray-600 max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">1. Inscription aux programmes</h2>
              <p>
                En vous inscrivant chez English Hills Language Center, vous acceptez de respecter nos politiques internes. L&apos;inscription est soumise à la disponibilité des places.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">2. Paiement</h2>
              <p>
                Les frais de programme doivent être réglés selon le calendrier de paiement convenu au moment de l&apos;inscription. English Hills se réserve le droit de suspendre l&apos;accès aux cours en cas de frais impayés. Les frais couvrent l&apos;enseignement, l&apos;accès aux plateformes numériques et, selon le programme, les supports pédagogiques physiques.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">3. Politique de remboursement</h2>
              <p>
                Les demandes de remboursement sont examinées au cas par cas. Les demandes formulées avant le début du programme peuvent être éligibles à un remboursement total ou partiel. Aucun remboursement n&apos;est accordé une fois le programme commencé. Pour soumettre une demande, contactez-nous à{" "}
                <a href="mailto:contact@english-hills.com" className="text-navy-primary underline">contact@english-hills.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">4. Assiduité & conduite</h2>
              <p>
                Les apprenants sont tenus de suivre les cours de manière régulière. Notre cursus étant basé sur l&apos;apprentissage par projets, des absences répétées compromettent directement votre capacité à valider les modules. English Hills attend de tous les apprenants et membres du personnel qu&apos;ils maintiennent un environnement respectueux, inclusif et sécurisé. Tout comportement perturbateur peut entraîner une suspension ou une exclusion du programme, sans remboursement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">5. Modifications d&apos;horaires</h2>
              <p>
                English Hills se réserve le droit de modifier les horaires, les formateurs ou les salles si nécessaire. Nous vous préviendrons dans un délai raisonnable en cas de changement significatif. Les apprenants peuvent demander un changement de créneau en contactant l&apos;administration, sous réserve de disponibilité.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">6. Propriété intellectuelle</h2>
              <p>
                L&apos;ensemble des supports de cours, curricula et ressources numériques fournis par English Hills sont réservés à un usage personnel et pédagogique. Toute reproduction, diffusion ou utilisation commerciale sans autorisation écrite est strictement interdite.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">7. Modification des conditions</h2>
              <p>
                English Hills se réserve le droit de modifier ces conditions à tout moment. Les modifications prennent effet dès leur publication sur le site. La poursuite de votre inscription après une modification vaut acceptation des nouvelles conditions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">8. Contact</h2>
              <p>
                Pour toute question relative à ces conditions, contactez-nous à{" "}
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
