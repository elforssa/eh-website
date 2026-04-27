import { verifySession } from '@/lib/dal'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import type { Receipt } from '@/types/receipt'

export default async function DashboardPage() {
  await verifySession()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: receipts } = await supabase
    .from('receipts')
    .select('id, receipt_number, nom_prenom, date, montant_total, montant_paye, created_at')
    .order('created_at', { ascending: false })

  const list = (receipts ?? []) as Pick<Receipt, 'id' | 'receipt_number' | 'nom_prenom' | 'date' | 'montant_total' | 'montant_paye'>[]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-deep">Reçus de paiement</h1>
          <p className="text-sm text-gray-500 mt-1">{list.length} reçu{list.length !== 1 ? 's' : ''} enregistré{list.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/receipts/new"
          className="px-5 py-2.5 bg-navy-deep text-white text-sm font-semibold rounded-lg hover:bg-navy-primary transition-colors"
        >
          + Nouveau reçu
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-active p-16 text-center">
          <p className="text-gray-400 mb-4">Aucun reçu pour le moment.</p>
          <Link
            href="/admin/receipts/new"
            className="px-5 py-2.5 bg-navy-deep text-white text-sm font-semibold rounded-lg hover:bg-navy-primary transition-colors"
          >
            Créer le premier reçu
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-active overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="bg-surface border-b border-surface-active">
                <th className="text-left px-5 py-3 font-semibold text-navy-deep">N° Reçu</th>
                <th className="text-left px-5 py-3 font-semibold text-navy-deep">Client</th>
                <th className="text-left px-5 py-3 font-semibold text-navy-deep">Date</th>
                <th className="text-right px-5 py-3 font-semibold text-navy-deep">Montant payé</th>
                <th className="text-right px-5 py-3 font-semibold text-navy-deep">Restant</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((r, i) => {
                const restant = Number(r.montant_total) - Number(r.montant_paye)
                return (
                  <tr key={r.id} className={`border-b border-surface-active last:border-0 hover:bg-surface-soft ${i % 2 === 0 ? '' : 'bg-surface-soft/50'}`}>
                    <td className="px-5 py-3 font-mono font-medium text-navy-deep">{r.receipt_number}</td>
                    <td className="px-5 py-3 text-gray-700">{r.nom_prenom}</td>
                    <td className="px-5 py-3 text-gray-500">{new Date(r.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-5 py-3 text-right font-medium text-green-700">{Number(r.montant_paye).toLocaleString('fr-FR')} MAD</td>
                    <td className="px-5 py-3 text-right font-medium text-red-accent">{restant.toLocaleString('fr-FR')} MAD</td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/receipts/${r.id}`}
                        className="text-navy-primary hover:underline font-medium"
                      >
                        Voir →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}
