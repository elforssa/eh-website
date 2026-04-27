import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'

async function requireAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('eh-admin-session')?.value
  const session = await decrypt(token)
  if (!session?.userId) return null
  return session
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const { id } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Reçu introuvable.' }, { status: 404 })
  }

  return NextResponse.json({ receipt: data })
}
