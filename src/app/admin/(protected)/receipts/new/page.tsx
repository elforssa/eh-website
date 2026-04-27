import { verifySession } from '@/lib/dal'
import { ReceiptForm } from '@/components/admin/ReceiptForm'

export const metadata = { title: 'Nouveau reçu | Admin English Hills' }

export default async function NewReceiptPage() {
  await verifySession()
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-deep mb-8">Nouveau reçu de paiement</h1>
      <ReceiptForm />
    </div>
  )
}
