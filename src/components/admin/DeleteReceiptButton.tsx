'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export function DeleteReceiptButton({
  id,
  receiptNumber,
  redirectTo,
}: {
  id: string
  receiptNumber: string
  redirectTo?: string
}) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setDeleting(true)
    try {
      await fetch(`/api/admin/receipts/${id}`, { method: 'DELETE' })
      if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.refresh()
      }
    } finally {
      setDeleting(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1.5">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs px-2 py-1 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:opacity-60 whitespace-nowrap"
        >
          {deleting ? '...' : 'Confirmer'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-2 py-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 whitespace-nowrap"
        >
          Non
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded"
      title={`Supprimer ${receiptNumber}`}
    >
      <Trash2 size={14} />
    </button>
  )
}
