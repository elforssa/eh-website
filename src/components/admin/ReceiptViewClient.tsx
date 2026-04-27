'use client'
import dynamic from 'next/dynamic'
import type { Receipt } from '@/types/receipt'

const PDFDownloadButton = dynamic(
  () => import('@/components/admin/PDFDownloadButton').then(m => m.PDFDownloadButton),
  { ssr: false, loading: () => <button className="px-4 py-2 text-sm bg-surface border border-surface-active rounded-lg text-gray-400" disabled>Chargement PDF...</button> }
)

export function ReceiptViewClient({ receipt }: { receipt: Receipt }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => window.print()}
        className="px-4 py-2 text-sm font-medium border border-surface-active rounded-lg text-navy-deep hover:bg-surface transition-colors"
      >
        Imprimer
      </button>
      <PDFDownloadButton receipt={receipt} />
    </div>
  )
}
