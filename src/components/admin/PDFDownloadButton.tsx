'use client'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { ReceiptDocument } from './ReceiptDocument'
import type { Receipt } from '@/types/receipt'

export function PDFDownloadButton({ receipt }: { receipt: Receipt }) {
  const logoUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/eh-logo-new.png`
      : '/eh-logo-new.png'

  return (
    <PDFDownloadLink
      document={<ReceiptDocument receipt={receipt} logoUrl={logoUrl} />}
      fileName={`${receipt.receipt_number}.pdf`}
    >
      {({ loading }) => (
        <button
          className="px-5 py-2.5 text-sm font-semibold bg-red-accent text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Génération PDF...' : 'Télécharger PDF'}
        </button>
      )}
    </PDFDownloadLink>
  )
}
