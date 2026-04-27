import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'

/*
  Run this SQL in the Supabase SQL editor before using this route:

  create table receipts (
    id              uuid primary key default gen_random_uuid(),
    receipt_number  text not null unique,
    date            date not null,
    nom_prenom      text not null,
    telephone       text not null,
    email           text,
    date_naissance  date,
    type_cours      text not null,
    niveau          text not null,
    duree_cours     text not null,
    date_debut      date,
    jours           text,
    horaires        text,
    montant_total   numeric(10,2) not null,
    montant_paye    numeric(10,2) not null,
    mode_paiement   text not null,
    observation     text,
    created_at      timestamptz default now()
  );

  alter table receipts enable row level security;
  create policy "Admin only" on receipts for all using (auth.role() = 'authenticated');
*/

async function requireAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('eh-admin-session')?.value
  const session = await decrypt(token)
  if (!session?.userId) return null
  return session
}

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function generateReceiptNumber(year: number, count: number): string {
  return `EH-${year}-${String(count).padStart(4, '0')}`
}

export async function GET() {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin()
    .from('receipts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Erreur base de données.' }, { status: 500 })
  }

  return NextResponse.json({ receipts: data })
}

export async function POST(req: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide.' }, { status: 400 })
  }

  const required = ['date', 'nom_prenom', 'telephone', 'type_cours', 'niveau', 'duree_cours', 'montant_total', 'montant_paye', 'mode_paiement']
  for (const field of required) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return NextResponse.json({ error: `Le champ "${field}" est requis.` }, { status: 400 })
    }
  }

  const supabase = supabaseAdmin()
  const year = new Date().getFullYear()

  const { count } = await supabase
    .from('receipts')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${year}-01-01`)
    .lte('created_at', `${year}-12-31T23:59:59`)

  const receipt_number = generateReceiptNumber(year, (count ?? 0) + 1)

  const { data, error } = await supabase
    .from('receipts')
    .insert([{ ...body, receipt_number }])
    .select()
    .single()

  if (error) {
    console.error('Receipt insert error:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du reçu.' }, { status: 500 })
  }

  return NextResponse.json({ receipt: data }, { status: 201 })
}
