import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import Link from "next/link";

const faqs = [
  {
    question: "Comment savoir quel niveau correspond à moi ou à mon enfant ?",
    answer: "Nous proposons un test de positionnement gratuit et complet, qui évalue aussi bien les compétences écrites qu'orales. Il garantit que chaque apprenant intègre un groupe parfaitement adapté à son niveau actuel et à ses objectifs."
  },
  {
    question: "Les supports National Geographic sont-ils inclus dans les frais ?",
    answer: "Pour les programmes Enfants & Juniors, les frais annuels sont entièrement tout-compris (matériel, ressources numériques, suivi pédagogique). Pour les cours adultes, des frais uniques de matériel couvrent vos supports originaux National Geographic et l'accès aux plateformes numériques interactives."
  },
  {
    question: "Les débutants complets peuvent-ils rejoindre la formation intensive de 10 jours ?",
    answer: "Absolument ! Nos modules intensifs sont conçus pour tous les niveaux. Le format 10 jours est spécifiquement pensé pour briser la barrière linguistique et développer rapidement la confiance à l'oral, quel que soit le point de départ."
  },
  {
    question: "Le Summer Camp de juillet est-il uniquement axé sur l'apprentissage de l'anglais ?",
    answer: "L'immersion en anglais est au cœur du camp, mais il comprend aussi une grande variété d'activités créatives, de projets artistiques, de sorties et de défis en équipe. L'objectif, c'est un apprentissage naturel et ludique — pas une salle de classe."
  }
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-primary/20">

      {/* Hero */}
      <section className="relative pt-6 md:pt-10 lg:pt-12 pb-16">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-start">

            <div className="max-w-2xl pt-4 lg:pt-8">
              <h1 className="text-5xl md:text-7xl lg:text-[4.5rem] font-bold text-foreground mb-6 tracking-tighter leading-[1.05]">
                Bienvenue chez <br />
                <span className="font-bold tracking-normal uppercase text-navy-primary">English </span>
                <span className="font-bold tracking-normal uppercase text-red-accent">Hills</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-500 mb-10 leading-relaxed font-light">
                Là où la technologie de pointe rencontre l&apos;apprentissage par projets — pour un anglais captivant, efficace et vraiment fun, à tout âge.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Button href="/placement-test" variant="primary-red" className="text-lg px-8 py-4 rounded-full">
                  S&apos;inscrire
                </Button>
                <Button href="#programs" variant="secondary-navy" className="text-lg px-8 py-4 rounded-full">
                  Nos programmes
                </Button>
              </div>
            </div>

            <div className="relative h-[400px] md:h-[450px] lg:h-[500px] w-full rounded-2xl overflow-hidden bg-surface">
              <Image
                src="/hero_classroom_students_1775450226096.png"
                alt="Salle de classe moderne English Hills"
                fill
                className="object-cover"
                priority
              />
            </div>

          </div>
        </div>
      </section>

      {/* L'apprentissage autrement */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-16">

            <div className="lg:col-span-5 lg:sticky top-32 self-start">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">L&apos;apprentissage<br/>autrement.</h2>
              <p className="text-xl text-gray-500 leading-relaxed">
                English Hills, ce n&apos;est pas un centre de langues ordinaire. Nos salles sont équipées d&apos;écrans interactifs et de plateformes numériques alimentées par les contenus <strong className="text-foreground font-medium">National Geographic</strong>.
              </p>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-12">
              {[
                { num: "01", title: "Contenus National Geographic", desc: "Des médias riches et authentiques qui éveillent la curiosité et enrichissent le vocabulaire. Le monde entier dans chaque cours." },
                { num: "02", title: "Technologie interactive", desc: "Écrans intelligents et plateformes numériques pensés pour un apprentissage actif et multisensoriel." },
                { num: "03", title: "Programmes inclusifs", desc: "Conçus pour des profils variés — chaque apprenant a sa place ici, des enfants aux professionnels." }
              ].map(item => (
                <div key={item.num} className="group flex gap-6 md:gap-10">
                  <div className="text-5xl font-light text-gray-200 group-hover:text-navy-primary transition-colors duration-500">
                    {item.num}
                  </div>
                  <div className="flex-1 border-t border-gray-100 pt-4 mt-2">
                    <h3 className="text-2xl font-semibold text-foreground mb-4">{item.title}</h3>
                    <p className="text-lg text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Méthodologie */}
      <section className="py-32 bg-surface overflow-hidden relative">
        <div className="container mx-auto px-6 max-w-7xl relative z-10">

          <div className="flex flex-col md:flex-row justify-between items-end mb-32 border-b border-gray-200 pb-12">
            <div className="max-w-2xl">
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-navy-primary mb-4">Méthodologie</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">Apprendre en faisant.</h3>
            </div>
            <p className="text-lg text-gray-500 max-w-md mt-6 md:mt-0 text-left md:text-right">
              On rejette totalement les cours magistraux passifs. À la place, on garantit la production langagière à travers un cycle structuré d&apos;exploration, d&apos;action et de communication.
            </p>
          </div>

          <div className="flex flex-col gap-32 pb-16">
            {[
              { title: "EXPLORER", subtitle: "01. Exploration", desc: "L'apprentissage actif commence par l'engagement. Plutôt que de recevoir passivement un cours, on explore des thèmes, on formule des questions et on observe le monde réel à travers les riches médias National Geographic." },
              { title: "CRÉER", subtitle: "02. Production", desc: "On construit de vrais projets, des solutions concrètes. L'effort est concentré sur la création de résultats tangibles, l'expérimentation et la collaboration active avec ses pairs." },
              { title: "COMMUNIQUER", subtitle: "03. Présentation", desc: "On développe une confiance absolue en prenant la parole, en partageant ses découvertes et en défendant ses projets devant un public. C'est là que l'anglais devient vraiment le vôtre." }
            ].map((step, i) => (
              <div key={i} className="relative w-full h-[300px] md:h-[400px] flex items-center group">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-black text-black/[0.03] select-none pointer-events-none tracking-tighter whitespace-nowrap transition-colors duration-700">
                  {step.title}
                </div>

                <div className={`relative z-10 max-w-md bg-white/70 backdrop-blur-xl p-8 md:p-12 border border-white/50 shadow-2xl ${i % 2 === 0 ? 'mr-auto ml-4 md:ml-12' : 'ml-auto mr-4 md:mr-12'}`}>
                  <span className="text-xs font-bold tracking-widest uppercase text-red-accent mb-4 block">{step.subtitle}</span>
                  <h4 className="text-2xl md:text-3xl font-bold text-navy-deep mb-4">{step.title}</h4>
                  <p className="text-gray-600 leading-relaxed md:text-lg">{step.desc}</p>

                  <div className="mt-8 flex items-center gap-4 text-xs font-bold tracking-widest uppercase text-navy-primary group-hover:text-red-accent transition-colors duration-300">
                    <span className="w-8 h-px bg-current transition-all duration-300 group-hover:w-16"></span>
                    Phase active
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Programmes */}
      <section id="programs" className="py-40 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">

          {/* Enfants */}
          <div className="mb-32">
            <div className="flex items-center gap-6 mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">Programmes pour les enfants</h2>
              <div className="h-px bg-gray-200 flex-1 hidden sm:block"></div>
              <span className="text-sm font-medium tracking-widest uppercase text-gray-400">6–17 ans</span>
            </div>

            <p className="text-xl text-gray-500 max-w-3xl mb-16 leading-relaxed">
              Nos programmes annuels pour enfants sont structurés, stimulants et entièrement inclusifs — pensés pour accompagner votre enfant tout au long de l&apos;année.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="border border-gray-200 p-12 rounded-3xl hover:-translate-y-1 hover:border-navy-primary/30 hover:shadow-[0_20px_40px_-15px_var(--color-navy-primary)] transition-all">
                <div className="flex justify-between items-start mb-12">
                  <h3 className="text-3xl font-semibold text-foreground">Standard</h3>
                  <div className="bg-surface px-4 py-2 rounded-full text-sm font-medium text-foreground">2 h / semaine</div>
                </div>
                <p className="text-lg text-gray-500 mb-6">Idéal pour une progression régulière et solide, en parallèle de l&apos;école.</p>
                <ul className="space-y-2 mb-8 flex-1 text-sm text-gray-600">
                  <li>• Supports National Geographic inclus</li>
                  <li>• Ressources numériques & plateformes</li>
                  <li>• Suivi pédagogique régulier</li>
                </ul>
                <div className="mb-8 mt-auto">
                  <span className="text-xl font-bold text-foreground">Tarif sur demande</span>
                </div>
                <Button href="/programs/kids" variant="secondary-navy" className="w-full rounded-full">Voir le programme</Button>
              </div>

              <div className="border border-navy-primary/10 p-12 rounded-3xl hover:-translate-y-1 hover:border-navy-primary/30 hover:shadow-[0_20px_40px_-15px_var(--color-navy-primary)] transition-all bg-surface-soft">
                <div className="flex justify-between items-start mb-12">
                  <h3 className="text-3xl font-semibold text-navy-primary">Intensif</h3>
                  <div className="bg-white px-4 py-2 rounded-full text-sm font-medium text-navy-primary">3 h / semaine</div>
                </div>
                <p className="text-lg text-gray-600 mb-6">Un apprentissage accéléré pour les jeunes apprenants motivés qui veulent aller plus loin, plus vite.</p>
                <ul className="space-y-2 mb-8 flex-1 text-sm text-gray-600">
                  <li>• Modules National Geographic avancés</li>
                  <li>• Plus de temps consacré à la conversation</li>
                  <li>• Matériel & suivi tout-compris</li>
                </ul>
                <div className="mb-8 mt-auto">
                  <span className="text-xl font-bold text-foreground">Tarif sur demande</span>
                </div>
                <Button href="/programs/kids" variant="primary-red" className="w-full rounded-full">Voir le programme</Button>
              </div>
            </div>
          </div>

          {/* Adultes */}
          <div>
            <div className="flex items-center gap-6 mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">Programmes pour adultes</h2>
              <div className="h-px bg-gray-200 flex-1 hidden sm:block"></div>
              <span className="text-sm font-medium tracking-widest uppercase text-gray-400">Tous niveaux</span>
            </div>

            <p className="text-xl text-gray-500 max-w-3xl mb-16 leading-relaxed">
              Que vous souhaitiez gagner en aisance au quotidien ou viser des objectifs professionnels précis, English Hills a un programme fait pour vous. Les horaires flexibles vous laissent apprendre sans sacrifier votre vie.
            </p>

            <div className="grid lg:grid-cols-3 gap-8">

              <div className="border border-gray-200 p-10 rounded-3xl hover:-translate-y-1 hover:border-navy-primary/30 hover:shadow-[0_20px_40px_-15px_var(--color-navy-primary)] transition-all flex flex-col bg-white">
                <div className="flex justify-between items-start mb-10">
                  <h3 className="text-2xl lg:text-3xl font-semibold text-foreground">Anglais général</h3>
                  <div className="bg-surface px-4 py-2 rounded-full text-sm font-medium text-foreground whitespace-nowrap">3 h / semaine</div>
                </div>
                <p className="text-gray-500 mb-6 flex-1 leading-relaxed text-lg">
                  Pour gagner en aisance dans la vie quotidienne, avec un équilibre entre grammaire, vocabulaire et conversation.
                </p>
                <ul className="space-y-2 mb-8 text-sm text-gray-500">
                  <li>• Tâches communicatives du quotidien</li>
                  <li>• Écrans interactifs en cours</li>
                  <li>• Accès aux plateformes numériques</li>
                </ul>
                <div className="mb-6 mt-auto">
                  <span className="text-xl font-bold text-foreground">Tarif sur demande</span>
                </div>
                <Button href="/placement-test" variant="secondary-navy" className="w-full rounded-full mt-auto">Voir le programme</Button>
              </div>

              <div className="border border-navy-primary/10 p-10 rounded-3xl hover:-translate-y-1 hover:border-navy-primary/30 hover:shadow-[0_20px_40px_-15px_var(--color-navy-primary)] transition-all bg-surface-soft flex flex-col">
                <div className="flex justify-between items-start mb-10">
                  <h3 className="text-2xl lg:text-3xl font-semibold text-navy-primary">Business English</h3>
                  <div className="bg-white px-4 py-2 rounded-full text-sm font-medium text-navy-primary whitespace-nowrap">3 h / semaine</div>
                </div>
                <p className="text-gray-600 mb-6 flex-1 leading-relaxed text-lg">
                  Maîtrisez les outils langagiers qui ouvrent des portes : présentations, e-mails, négociations et communication d&apos;entreprise.
                </p>
                <ul className="space-y-2 mb-8 text-sm text-gray-600">
                  <li>• Cas pratiques professionnels</li>
                  <li>• Entraînement aux présentations</li>
                  <li>• Horaires adaptés aux actifs</li>
                </ul>
                <div className="mb-6 mt-auto">
                  <span className="text-xl font-bold text-foreground">Tarif sur demande</span>
                </div>
                <Button href="/programs/business-english" variant="primary-red" className="w-full rounded-full mt-auto">Découvrir</Button>
              </div>

              <div className="border border-gray-200 p-10 rounded-3xl hover:-translate-y-1 hover:border-navy-primary/30 hover:shadow-[0_20px_40px_-15px_var(--color-navy-primary)] transition-all flex flex-col bg-white">
                <div className="flex justify-between items-start mb-10">
                  <h3 className="text-2xl lg:text-3xl font-semibold text-foreground">Spécialisé & Examens</h3>
                  <div className="bg-surface px-4 py-2 rounded-full text-sm font-medium text-foreground whitespace-nowrap">Flexible</div>
                </div>
                <p className="text-gray-500 mb-6 flex-1 leading-relaxed text-lg">
                  Préparation ciblée IELTS / TOEFL, anglais de spécialité et formations B2B entièrement sur mesure pour les entreprises.
                </p>
                <ul className="space-y-2 mb-8 text-sm text-gray-500">
                  <li>• Stratégies de validation d&apos;examens</li>
                  <li>• Viser un band score précis</li>
                  <li>• Options groupe entreprise</li>
                </ul>
                <div className="mb-6 mt-auto">
                  <span className="text-xl font-bold text-foreground">Tarif sur demande</span>
                </div>
                <Button href="/programs/short-courses" variant="secondary-navy" className="w-full rounded-full mt-auto">Voir les options</Button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Un objectif, un programme */}
      <section className="py-32 bg-foreground text-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16">

            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Un programme pour chaque objectif.</h2>
              <p className="text-xl text-gray-400 leading-relaxed">
                De la fluidité quotidienne à l&apos;évolution professionnelle, English Hills propose un éventail complet de formations pensées autour de <span className="text-white">vrais besoins langagiers</span> — pas des cursus standardisés.
              </p>
            </div>

            <div className="space-y-8">
              {[
                { title: "Business English", desc: "La communication professionnelle pour les réunions, les rapports et les contextes de leadership.", href: "/programs/business-english" },
                { title: "Préparation aux examens", desc: "Un entraînement ciblé pour l'IELTS, le TOEFL, Cambridge et d'autres certifications reconnues.", href: "/programs/exam-prep" },
                { title: "Communication thématique", desc: "Des cours de conversation axés sur des sujets précis pour gagner en confiance à l'oral.", href: "/programs/short-courses" },
                { title: "Formations sur mesure", desc: "Des programmes construits autour de votre secteur ou de votre parcours personnel.", href: "/programs/short-courses" }
              ].map(item => (
                <Link href={item.href} key={item.title} className="block border-t border-gray-800 pt-8 group">
                  <h3 className="text-2xl font-semibold mb-3 flex justify-between items-center">
                    {item.title}
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-red-accent transition-colors transform group-hover:translate-x-2" aria-hidden="true" />
                  </h3>
                  <p className="text-gray-400 text-lg leading-relaxed">{item.desc}</p>
                </Link>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Évaluation par les projets */}
      <section className="py-0 flex flex-col lg:flex-row min-h-[800px]">
        <div className="w-full lg:w-1/2 relative min-h-[400px]">
          <Image src="/diverse_learners_1775450286839.png" alt="Apprenants English Hills" fill className="object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
        </div>
        <div className="w-full lg:w-1/2 bg-surface p-12 lg:p-24 flex items-center">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8 tracking-tight">Une évaluation qui prouve les progrès</h2>
            <p className="text-xl text-gray-500 leading-relaxed mb-16">
              Oubliez les examens écrits stressants. Chez English Hills, chaque module est validé par la présentation d&apos;un projet réel — une démonstration concrète des compétences acquises. <strong className="text-foreground font-medium">La production est garantie.</strong>
            </p>

            <ul className="space-y-8">
              {[
                { title: "Compléter un module", desc: "Explorer des thèmes, enrichir son vocabulaire et pratiquer la langue en contexte." },
                { title: "Préparer un projet", desc: "Appliquer ce qu'on a appris pour créer quelque chose de concret et de personnel." },
                { title: "Présenter & valider", desc: "Démontrer une vraie maîtrise à travers la communication orale." }
              ].map(step => (
                <li key={step.title} className="flex gap-6">
                  <CheckCircle2 className="w-6 h-6 text-navy-primary flex-shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <h4 className="text-xl font-semibold text-foreground mb-2">{step.title}</h4>
                    <p className="text-gray-500">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Comment rejoindre */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl mb-20 text-center mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">Comment rejoindre English Hills</h2>
            <p className="text-xl text-gray-500 leading-relaxed">
              C&apos;est simple. Notre processus d&apos;inscription est conçu pour vous placer dans exactement le bon cours, au bon moment.
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto mt-16">
            <div className="absolute top-[30px] left-[30px] right-[30px] h-0.5 bg-gray-100 hidden md:block" />
            <div className="absolute top-[30px] bottom-[30px] left-[30px] w-0.5 bg-gray-100 md:hidden" />

            <div className="grid md:grid-cols-4 gap-12 relative z-10">
              {[
                { num: "01", title: "Test de niveau", desc: "Un bilan rapide et bienveillant pour identifier votre niveau actuel." },
                { num: "02", title: "Choisir un programme", desc: "Sélectionner la formation qui correspond à vos objectifs et à votre groupe." },
                { num: "03", title: "Choisir un créneau", desc: "Parcourir les horaires flexibles disponibles chaque jour de la semaine." },
                { num: "04", title: "Rejoindre le cours", desc: "Entrer, rencontrer votre groupe et commencer à apprendre." }
              ].map((step) => (
                <div key={step.num} className="group relative flex md:flex-col items-start gap-8 md:gap-0">
                  <div className="w-[60px] h-[60px] rounded-full bg-white border-2 border-surface-active shadow-[0_0_0_8px_rgba(255,255,255,1)] flex items-center justify-center text-foreground font-bold text-lg md:mb-8 flex-shrink-0 z-10 transition-all duration-300 group-hover:bg-navy-primary group-hover:text-white group-hover:border-navy-primary">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">{step.title}</h3>
                    <p className="text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-20">
            <a
              href="https://admin.english-hills.com/register"
              className="inline-flex items-center justify-center font-medium rounded-full px-12 py-5 text-xl transition-colors duration-200 bg-red-accent text-white hover:bg-red-accent/90 shadow-sm"
            >
              S&apos;inscrire maintenant
            </a>
          </div>
        </div>
      </section>

      {/* Horaires flexibles */}
      <section className="py-32 bg-surface border-y border-gray-200">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-16 justify-between items-end mb-20">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">Des horaires flexibles, sept jours sur sept</h2>
              <p className="text-xl text-gray-500 leading-relaxed">
                La vie est chargée — votre cours d&apos;anglais doit s&apos;y adapter, pas l&apos;inverse. Nous proposons des créneaux tous les jours, du matin jusqu&apos;en soirée.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-12 divide-y md:divide-y-0 lg:divide-x divide-gray-200 border-y border-gray-200 py-12">
            <div className="pt-8 md:pt-0">
              <h3 className="text-2xl font-bold text-navy-primary mb-4">Après l&apos;école & enfants</h3>
              <p className="text-lg text-gray-500">Des séances dédiées le mercredi et le samedi pour les enfants et juniors, calées sur les horaires scolaires.</p>
            </div>
            <div className="pt-8 md:pt-0 md:pl-12 lg:pl-12">
              <h3 className="text-2xl font-bold text-navy-primary mb-4">Professionnels actifs</h3>
              <p className="text-lg text-gray-500">Des créneaux en soirée et à la pause déjeuner pour les actifs qui veulent progresser sans sacrifier leur travail.</p>
            </div>
            <div className="pt-8 md:pt-0 lg:pl-12 border-t md:border-t-0">
              <h3 className="text-2xl font-bold text-navy-primary mb-4">Week-ends intensifs</h3>
              <p className="text-lg text-gray-500">Des sessions concentrées le week-end pour ceux qui veulent consacrer leur temps libre à une progression rapide.</p>
            </div>
            <div className="pt-8 md:pt-0 md:pl-12 lg:pl-12 border-t md:border-t-0">
              <h3 className="text-2xl font-bold text-navy-primary mb-4">Formules adaptables</h3>
              <p className="text-lg text-gray-500">Des options modulaires selon vos objectifs. Choisissez un cours de 2 h ou une formule intensive de 3 h, ajustable en cours d&apos;année.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 bg-white flex flex-col justify-center">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-red-accent mb-4">FAQ</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-6">Questions fréquentes</h3>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Tout ce que vous devez savoir avant de commencer votre parcours chez English Hills.
            </p>
          </div>
          <FaqAccordion items={faqs} />
        </div>
      </section>

      {/* CTA final */}
      <section className="py-40 bg-white text-center">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-5xl md:text-7xl font-bold text-foreground mb-10 tracking-tighter">
            Votre parcours<br className="hidden sm:block" /> commence ici
          </h2>
          <p className="text-2xl text-gray-500 font-light leading-relaxed mb-16 max-w-3xl mx-auto">
            Rejoignez une communauté d&apos;apprenants qui découvrent que l&apos;anglais peut être stimulant, libérateur et à portée de main. Avec une technologie de pointe et une méthode qui a fait ses preuves.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button href="/placement-test" variant="primary-red" className="text-xl px-12 py-5 rounded-full">
              S&apos;inscrire maintenant
            </Button>
            <Button href="/contact" variant="secondary-navy" className="text-xl px-12 py-5 rounded-full">
              Nous contacter
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
