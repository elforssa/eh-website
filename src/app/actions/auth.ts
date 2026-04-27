'use server'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { createSession, deleteSession } from '@/lib/session'

type LoginState = { error: string } | undefined

export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email?.trim() || !password?.trim()) {
    return { error: 'Veuillez remplir tous les champs.' }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return { error: 'Identifiants incorrects.' }
  }

  await createSession(data.user.id)
  redirect('/admin/dashboard')
}

export async function logoutAction(): Promise<void> {
  await deleteSession()
  redirect('/admin/login')
}
