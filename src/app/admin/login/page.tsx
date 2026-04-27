'use client'
import { useActionState } from 'react'
import Image from 'next/image'
import { loginAction } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined)

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-surface-active p-8">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/eh-logo-new.png"
            alt="English Hills"
            width={80}
            height={80}
            className="mb-4"
          />
          <h1 className="text-xl font-bold text-navy-deep">Espace Admin</h1>
          <p className="text-sm text-gray-500 mt-1">English Hills Language Center</p>
        </div>

        {state?.error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {state.error}
          </div>
        )}

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-navy-deep mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-surface-active focus:outline-none focus:ring-2 focus:ring-navy-primary text-sm"
              placeholder="admin@english-hills.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-navy-deep mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 rounded-lg border border-surface-active focus:outline-none focus:ring-2 focus:ring-navy-primary text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 rounded-lg bg-navy-deep text-white font-semibold text-sm hover:bg-navy-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {pending ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
