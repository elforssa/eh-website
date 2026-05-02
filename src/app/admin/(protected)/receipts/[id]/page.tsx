import { verifySession } from '@/lib/dal'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Receipt } from '@/types/receipt'
import { ReceiptViewClient } from '@/components/admin/ReceiptViewClient'

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  await verifySession()

  const { id } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from('receipts')
    .select('*')
    .eq('id', id)
    .single()

  if (!data) notFound()

  const receipt = data as Receipt

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 no-print">
        <Link href="/admin/dashboard" className="text-sm text-navy-primary hover:underline">
          ← Retour au tableau de bord
        </Link>
        <ReceiptViewClient receipt={receipt} />
      </div>

      {/* Printable receipt HTML preview */}
      <div id="receipt-print" className="bg-white rounded-xl border border-surface-active max-w-3xl mx-auto overflow-x-auto text-sm">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/eh-logo-new.png" alt="English Hills" className="h-14 w-auto" />
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-navy-deep">ENGLISH HILLS</p>
            <p className="text-xs tracking-widest text-gray-500 uppercase">English Language Center</p>
            <p className="text-xs text-gray-500 mt-1">Centre Almaz, Etg 1 N° 6, Oulad Azouz</p>
            <p className="text-xs text-gray-500">Nouaceur, Casablanca 20000 — Maroc</p>
            <p className="text-xs text-gray-500">Tél : 0664 23 90 91</p>
            <p className="text-xs text-navy-primary">contact@english-hills.com</p>
          </div>
        </div>

        {/* Title bar */}
        <div className="flex items-center bg-navy-deep px-6 py-3">
          <p className="text-white font-bold text-lg flex-1">REÇU DE PAIEMENT</p>
          <div className="flex gap-4">
            <div className="bg-surface px-4 py-2 rounded text-center min-w-[100px]">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">N° DE REÇU</p>
              <p className="font-mono font-bold text-navy-deep text-sm">{receipt.receipt_number}</p>
            </div>
            <div className="bg-surface px-4 py-2 rounded text-center min-w-[100px]">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">DATE</p>
              <p className="font-bold text-navy-deep text-sm">{new Date(receipt.date).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* DONNÉES D'INSCRIPTION */}
          <section>
            <h2 className="text-xs font-bold tracking-widest text-navy-primary uppercase border-b border-navy-primary pb-1 mb-3">Données d&apos;inscription</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border-b border-gray-200 pb-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Nom et prénom</p>
                <p className="font-medium text-gray-800 mt-1">{receipt.nom_prenom}</p>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Téléphone</p>
                <p className="font-medium text-gray-800 mt-1">{receipt.telephone}</p>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Email</p>
                <p className="font-medium text-gray-800 mt-1">{receipt.email || '—'}</p>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Date de naissance</p>
                <p className="font-medium text-gray-800 mt-1">{receipt.date_naissance ? new Date(receipt.date_naissance).toLocaleDateString('fr-FR') : '—'}</p>
              </div>
            </div>
          </section>

          {/* DÉTAILS DU COURS */}
          <section>
            <h2 className="text-xs font-bold tracking-widest text-navy-primary uppercase border-b border-navy-primary pb-1 mb-3">Détails du cours</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="border-b border-gray-200 pb-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Catégorie</p>
                <p className="font-medium text-gray-800 mt-1">{receipt.type_cours}</p>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Niveau (CECRL)</p>
                <p className="font-medium text-gray-800 mt-1">{receipt.niveau}</p>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Durée du cours</p>
                <p className="font-medium text-gray-800 mt-1">{receipt.duree_cours}</p>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Type de cours</p>
                <p className="font-medium text-gray-800 mt-1">{receipt.formule || '—'}</p>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Jours</p>
                <p className="font-medium text-gray-800 mt-1">{receipt.jours || '—'}</p>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Plage horaire</p>
                <p className="font-medium text-gray-800 mt-1">{receipt.horaires || '—'}</p>
              </div>
            </div>
          </section>

          {/* DÉTAILS DE PAIEMENT */}
          <section>
            <h2 className="text-xs font-bold tracking-widest text-navy-primary uppercase border-b border-navy-primary pb-1 mb-3">Détails de paiement</h2>
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <div className="flex justify-between items-center px-4 py-3 bg-white">
                <span className="font-semibold text-gray-700">Montant total du cours</span>
                <span className="font-bold text-gray-800">{Number(receipt.montant_total).toLocaleString('fr-FR')} MAD</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-navy-deep">
                <span className="font-semibold text-white">Montant payé ce jour</span>
                <span className="font-bold text-white">{Number(receipt.montant_paye).toLocaleString('fr-FR')} MAD</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-surface">
                <span className="font-semibold text-gray-700">Montant restant</span>
                <span className="font-bold text-red-accent">{(Number(receipt.montant_total) - Number(receipt.montant_paye)).toLocaleString('fr-FR')} MAD</span>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Mode de paiement</p>
              <div className="flex flex-wrap gap-4">
                {(['Espèces', 'Carte bancaire', 'Virement', 'Chèque'] as const).map(m => (
                  <div key={m} className="flex items-center gap-1.5">
                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${receipt.mode_paiement === m ? 'border-navy-deep bg-navy-deep' : 'border-gray-300'}`}>
                      {receipt.mode_paiement === m && <span className="text-white text-[10px] font-bold">✓</span>}
                    </div>
                    <span className={`text-sm ${receipt.mode_paiement === m ? 'font-semibold text-navy-deep' : 'text-gray-500'}`}>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* OBSERVATION */}
          {receipt.observation && (
            <section>
              <h2 className="text-xs font-bold tracking-widest text-navy-primary uppercase border-b border-navy-primary pb-1 mb-3">Observation</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{receipt.observation}</p>
            </section>
          )}

          {/* SIGNATURES */}
          <div className="grid grid-cols-2 gap-8 pt-6 mt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="border-b border-gray-300 mb-2 h-12"></div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Signature du client</p>
            </div>
            <div className="text-center">
              <div className="border-b border-gray-300 mb-2 h-12"></div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Cachet et signature du centre</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-surface border-t border-gray-200 px-6 py-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
            English Hills • Learn Today, Lead Tomorrow
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Centre Almaz, Etg 1 N° 6, Oulad Azouz, Nouaceur — Casablanca 20000 | Tél : 0664 23 90 91 | contact@english-hills.com
          </p>
        </div>
      </div>
    </div>
  )
}
