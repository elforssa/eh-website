import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business English | English Hills Language Center",
  description: "Maîtrisez la communication professionnelle en anglais : réunions, e-mails, négociations, présentations. Formation entreprise à Casablanca.",
  openGraph: {
    title: "Business English — English Hills Casablanca",
    description: "Formations sur mesure pour les professionnels et les entreprises. Présentiel au centre ou dans vos locaux.",
  },
};

export default function BusinessEnglishPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="mb-12">
          <div className="inline-block bg-navy/10 text-navy font-bold px-4 py-1 rounded-full text-sm mb-4">
            B2B & Entreprises
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-4">Business English</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Donnez à votre carrière ou à vos équipes l&apos;avantage qu&apos;elles méritent. Une formation linguistique taillée pour les professionnels de Casablanca et au-delà.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section className="bg-white rounded-2xl p-8 border border-surface shadow-sm">
              <h2 className="text-2xl font-bold text-navy mb-4">Communication professionnelle</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Nos modules Business English vont bien au-delà du vocabulaire générique. On travaille sur des compétences à haute valeur ajoutée, directement applicables au bureau.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-gray-600">
                <li className="flex gap-2"><span className="text-red-accent" aria-hidden="true">✓</span> Animer des réunions</li>
                <li className="flex gap-2"><span className="text-red-accent" aria-hidden="true">✓</span> Négociation</li>
                <li className="flex gap-2"><span className="text-red-accent" aria-hidden="true">✓</span> Présentations</li>
                <li className="flex gap-2"><span className="text-red-accent" aria-hidden="true">✓</span> E-mails professionnels</li>
                <li className="flex gap-2"><span className="text-red-accent" aria-hidden="true">✓</span> Rapports et comptes rendus</li>
                <li className="flex gap-2"><span className="text-red-accent" aria-hidden="true">✓</span> Réseautage</li>
              </ul>
            </section>

            <section className="bg-navy rounded-2xl p-8 text-white shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-red-accent">Solutions entreprise</h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Bien placés dans l&apos;axe économique de Casablanca, English Hills est le partenaire idéal pour les multinationales et les PME de la région.
              </p>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Nous concevons des programmes entièrement sur mesure, adaptés au secteur, aux objectifs et aux contraintes d&apos;agenda de votre entreprise. Les formations peuvent se tenir dans notre centre ou directement dans vos locaux.
              </p>
              <Button href="/contact" variant="secondary-navy" className="border-white text-white hover:bg-white hover:text-navy-primary">
                Demander un devis entreprise
              </Button>
            </section>
          </div>

          <div className="md:col-span-1">
            <div className="bg-surface rounded-2xl p-6 border border-gray-200 sticky top-24">
              <h3 className="text-2xl font-bold mb-4 text-navy">Par où commencer ?</h3>
              <p className="text-sm text-gray-600 mb-6">
                Les besoins en Business English étant très spécifiques, on commence toujours par une consultation initiale.
              </p>

              <div className="space-y-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="font-bold text-navy text-sm mb-1">Étape 1</h4>
                  <p className="text-gray-600 text-sm">Consultation initiale</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="font-bold text-navy text-sm mb-1">Étape 2</h4>
                  <p className="text-gray-600 text-sm">Analyse des besoins et proposition sur mesure</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="font-bold text-navy text-sm mb-1">Étape 3</h4>
                  <p className="text-gray-600 text-sm">Démarrage de la formation avec production garantie</p>
                </div>
              </div>

              <a
                href="https://admin.english-hills.com/inscription"
                className="inline-flex items-center justify-center font-medium rounded-lg px-6 py-3 w-full transition-colors duration-200 bg-red-accent text-white hover:bg-red-accent/90 shadow-sm"
              >
                S&apos;inscrire
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
