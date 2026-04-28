'use client'
import { pdf } from '@react-pdf/renderer'
import { useState } from 'react'
import { ReceiptDocument } from './ReceiptDocument'
import type { Receipt } from '@/types/receipt'

export function PDFPrintButton({ receipt }: { receipt: Receipt }) {
  const [loading, setLoading] = useState(false)

  async function handlePrint() {
    setLoading(true)
    try {
      const logoUrl = `${window.location.origin}/eh-logo-new.png`
      const blob = await pdf(<ReceiptDocument receipt={receipt} logoUrl={logoUrl} />).toBlob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePrint}
      disabled={loading}
      className="px-5 py-2.5 text-sm font-medium border border-surface-active rounded-lg text-navy-deep hover:bg-surface transition-colors disabled:opacity-60"
    >
      {loading ? 'Génération...' : 'Imprimer PDF'}
    </button>
  )
}
