import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const sessionCookie = req.cookies.get('eh-admin-session')?.value
  const session = await decrypt(sessionCookie)

  if (path === '/admin' || path === '/admin/') {
    const dest = session?.userId ? '/admin/dashboard' : '/admin/login'
    return NextResponse.redirect(new URL(dest, req.nextUrl))
  }

  if (path === '/admin/login') {
    if (session?.userId) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.nextUrl))
    }
    return NextResponse.next()
  }

  if (!session?.userId) {
    return NextResponse.redirect(new URL('/admin/login', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
