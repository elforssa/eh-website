import { Button } from "@/components/ui/Button";
import { CheckCircle2, GraduationCap, Target, BookOpen, PenTool } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Préparation aux examens (IELTS, TOEFL, Cambridge) | English Hills",
  description: "Préparation ciblée aux examens IELTS, TOEFL iBT et Cambridge à Casablanca. Coaching personnalisé pour atteindre le score dont vous avez besoin.",
  openGraph: {
    title: "Prépa IELTS, TOEFL & Cambridge — English Hills",
    description: "Examens blancs intensifs, feedback personnalisé et enrichissement du vocabulaire. Dépassez le score qu'il vous faut.",
  },
};

export default function ExamPrepPage() {
  return (
    <div className="py-24 bg-surface min-h-screen">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-6">
            <GraduationCap className="w-8 h-8 text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">Préparation aux examens</h1>
          <p className="text-xl text-gray-500 leading-relaxed max-w-3xl">
            Un entraînement ciblé et intensif pour l&apos;IELTS, le TOEFL, Cambridge et d&apos;autres certifications reconnues à l&apos;international. Obtenez le score qu&apos;il vous faut pour l&apos;université ou votre carrière.
          </p>
        </div>

        {/* Certifications */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-surface-soft rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-primary" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">IELTS</h3>
            <p className="text-gray-500">Préparation Academic & General Training sur les quatre compétences : expression orale, compréhension écrite, expression écrite et compréhension orale.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-surface-soft rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-primary" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">TOEFL iBT</h3>
            <p className="text-gray-500">Optimisation des stratégies pour l&apos;examen sur ordinateur, afin de produire des réponses de qualité sous contrainte de temps.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-surface-soft rounded-full flex items-center justify-center mx-auto mb-6">
              <PenTool className="w-8 h-8 text-primary" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Cambridge</h3>
            <p className="text-gray-500">Préparation au B2 First (FCE), C1 Advanced (CAE) et C2 Proficiency (CPE) pour une certification reconnue à vie.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-10 md:p-12 border border-primary/20 shadow-sm mb-12 flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-foreground mb-6">Structure & modalités</h2>
            <ul className="space-y-6 mb-8">
              {[
                "Examens blancs intensifs et sessions chronométrées",
                "Feedback personnalisé sur les productions orales et écrites",
                "Enrichissement avancé du vocabulaire et affinement grammatical"
              ].map((item, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-lg text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full md:w-1/3 bg-surface p-8 rounded-2xl text-center border border-gray-100">
            <p className="text-gray-500 font-medium mb-4 uppercase tracking-widest text-sm">Formules flexibles</p>
            <p className="text-3xl font-bold text-foreground mb-4">Sur mesure</p>
            <p className="text-gray-500 text-sm mb-8">Adaptées à votre date d&apos;examen et à votre écart de progression actuel.</p>
            <Button href="/contact" variant="primary-red" className="w-full rounded-full">Demander un devis</Button>
          </div>
        </div>

      </div>
    </div>
  );
}
