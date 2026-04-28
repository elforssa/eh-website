'use client'
import dynamic from 'next/dynamic'
import type { Receipt } from '@/types/receipt'

const PDFDownloadButton = dynamic(
  () => import('@/components/admin/PDFDownloadButton').then(m => m.PDFDownloadButton),
  { ssr: false, loading: () => <button className="px-4 py-2 text-sm bg-surface border border-surface-active rounded-lg text-gray-400" disabled>Chargement...</button> }
)

const PDFPrintButton = dynamic(
  () => import('@/components/admin/PDFPrintButton').then(m => m.PDFPrintButton),
  { ssr: false, loading: () => <button className="px-4 py-2 text-sm bg-surface border border-surface-active rounded-lg text-gray-400" disabled>Chargement...</button> }
)

const DeleteReceiptButton = dynamic(
  () => import('@/components/admin/DeleteReceiptButton').then(m => m.DeleteReceiptButton),
  { ssr: false }
)

export function ReceiptViewClient({ receipt }: { receipt: Receipt }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <PDFPrintButton receipt={receipt} />
      <PDFDownloadButton receipt={receipt} />
      <DeleteReceiptButton id={receipt.id} receiptNumber={receipt.receipt_number} redirectTo="/admin/dashboard" />
    </div>
  )
}
