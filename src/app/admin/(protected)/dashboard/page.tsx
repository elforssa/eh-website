import { verifySession } from '@/lib/dal'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import type { Receipt } from '@/types/receipt'
import { DashboardTable } from '@/components/admin/DashboardTable'

export default async function DashboardPage() {
  await verifySession()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: receipts } = await supabase
    .from('receipts')
    .select('id, receipt_number, nom_prenom, date, montant_total, montant_paye')
    .order('created_at', { ascending: false })

  const list = (receipts ?? []) as Pick<Receipt, 'id' | 'receipt_number' | 'nom_prenom' | 'date' | 'montant_total' | 'montant_paye'>[]

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const thisMonthList = list.filter(r => r.date.startsWith(thisMonth))
  const thisMonthCount = thisMonthList.length
  const thisMonthCollected = thisMonthList.reduce((s, r) => s + Number(r.montant_paye), 0)
  const totalCollected = list.reduce((s, r) => s + Number(r.montant_paye), 0)
  const totalOutstanding = list.reduce((s, r) => {
    const restant = Number(r.montant_total) - Number(r.montant_paye)
    return restant > 0 ? s + restant : s
  }, 0)

  const monthLabel = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-deep">Reçus de paiement</h1>
          <p className="text-sm text-gray-500 mt-1">
            {list.length} reçu{list.length !== 1 ? 's' : ''} enregistré{list.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/receipts/new"
          className="px-5 py-2.5 bg-navy-deep text-white text-sm font-semibold rounded-lg hover:bg-navy-primary transition-colors"
        >
          + Nouveau reçu
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-surface-active p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Reçus ce mois</p>
          <p className="text-2xl font-bold text-navy-deep">{thisMonthCount}</p>
          <p className="text-xs text-gray-400 mt-1 capitalize">{monthLabel}</p>
        </div>
        <div className="bg-white rounded-xl border border-surface-active p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Collecté ce mois</p>
          <p className="text-2xl font-bold text-green-700">{thisMonthCollected.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-gray-400 mt-1">MAD</p>
        </div>
        <div className="bg-white rounded-xl border border-surface-active p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total collecté</p>
          <p className="text-2xl font-bold text-navy-deep">{totalCollected.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-gray-400 mt-1">MAD (tous)</p>
        </div>
        <div className="bg-white rounded-xl border border-surface-active p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">En attente</p>
          <p className="text-2xl font-bold text-red-accent">{totalOutstanding.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-gray-400 mt-1">MAD restant</p>
        </div>
      </div>

      <DashboardTable receipts={list} />
    </div>
  )
}
