'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { useLang } from '@/lib/LangContext'
import { User } from 'lucide-react'

export function NavBar() {
  const { user, loading } = useAuth()
  const { lang, t, toggle } = useLang()
  if (loading) return null

  return (
    <div className="flex items-center gap-2 mt-1">
      <button
        onClick={toggle}
        className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
      >
        {lang === 'en' ? 'ES' : 'EN'}
      </button>
      <Link href="/advertise" className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors">
        {t.localBusiness}
      </Link>
      {user ? (
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-xs font-medium text-white bg-gray-900 px-3 py-1.5 rounded-xl hover:bg-gray-700 transition-colors"
        >
          <User className="w-3 h-3" /> {t.me}
        </Link>
      ) : (
        <Link
          href="/signup"
          className="text-xs font-medium text-white bg-gray-900 px-3 py-1.5 rounded-xl hover:bg-gray-700 transition-colors"
        >
          {t.signUpFree}
        </Link>
      )}
    </div>
  )
}
