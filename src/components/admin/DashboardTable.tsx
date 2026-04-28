'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { DeleteReceiptButton } from './DeleteReceiptButton'

type ReceiptRow = {
  id: string
  receipt_number: string
  nom_prenom: string
  date: string
  montant_total: number | string
  montant_paye: number | string
}

export function DashboardTable({ receipts }: { receipts: ReceiptRow[] }) {
  const [search, setSearch] = useState('')
  const [monthFilter, setMonthFilter] = useState('')

  const filtered = useMemo(() => {
    return receipts.filter(r => {
      const matchesSearch =
        !search ||
        r.nom_prenom.toLowerCase().includes(search.toLowerCase()) ||
        r.receipt_number.toLowerCase().includes(search.toLowerCase())
      const matchesMonth = !monthFilter || r.date.startsWith(monthFilter)
      return matchesSearch && matchesMonth
    })
  }, [receipts, search, monthFilter])

  function exportCSV() {
    const headers = ['N° Reçu', 'Client', 'Date', 'Montant total (MAD)', 'Montant payé (MAD)', 'Restant (MAD)']
    const rows = filtered.map(r => {
      const restant = Number(r.montant_total) - Number(r.montant_paye)
      return [
        r.receipt_number,
        r.nom_prenom,
        new Date(r.date).toLocaleDateString('fr-FR'),
        Number(r.montant_total),
        Number(r.montant_paye),
        restant,
      ]
    })
    const csv = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\r\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recus-english-hills-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (receipts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-surface-active p-16 text-center">
        <p className="text-gray-400 mb-4">Aucun reçu pour le moment.</p>
        <Link
          href="/admin/receipts/new"
          className="px-5 py-2.5 bg-navy-deep text-white text-sm font-semibold rounded-lg hover:bg-navy-primary transition-colors"
        >
          Créer le premier reçu
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Rechercher par nom ou N° reçu..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-surface-active text-sm focus:outline-none focus:ring-2 focus:ring-navy-primary bg-white"
        />
        <input
          type="month"
          value={monthFilter}
          onChange={e => setMonthFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-surface-active text-sm focus:outline-none focus:ring-2 focus:ring-navy-primary bg-white"
        />
        <button
          onClick={exportCSV}
          className="px-4 py-2 text-sm font-medium border border-surface-active rounded-lg text-navy-deep hover:bg-surface transition-colors whitespace-nowrap"
        >
          Exporter CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-active p-10 text-center">
          <p className="text-gray-400">Aucun reçu trouvé pour cette recherche.</p>
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
                {filtered.map((r, i) => {
                  const restant = Number(r.montant_total) - Number(r.montant_paye)
                  return (
                    <tr
                      key={r.id}
                      className={`border-b border-surface-active last:border-0 hover:bg-surface-soft ${i % 2 === 0 ? '' : 'bg-surface-soft/50'}`}
                    >
                      <td className="px-5 py-3 font-mono font-medium text-navy-deep">{r.receipt_number}</td>
                      <td className="px-5 py-3 text-gray-700">{r.nom_prenom}</td>
                      <td className="px-5 py-3 text-gray-500">{new Date(r.date).toLocaleDateString('fr-FR')}</td>
                      <td className="px-5 py-3 text-right font-medium text-green-700">
                        {Number(r.montant_paye).toLocaleString('fr-FR')} MAD
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-red-accent">
                        {restant.toLocaleString('fr-FR')} MAD
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <DeleteReceiptButton id={r.id} receiptNumber={r.receipt_number} />
                          <Link
                            href={`/admin/receipts/${r.id}`}
                            className="text-navy-primary hover:underline font-medium whitespace-nowrap"
                          >
                            Voir →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
