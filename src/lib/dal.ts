import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { decrypt } from '@/lib/session'

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get('eh-admin-session')?.value
  const session = await decrypt(cookie)

  if (!session?.userId) {
    redirect('/admin/login')
  }

  return { userId: session.userId }
})
