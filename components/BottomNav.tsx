'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '@/lib/LangContext'
import { useAuth } from '@/lib/useAuth'

// Pages where the bottom nav should not appear
const HIDDEN_PATHS = ['/login', '/signup', '/dashboard', '/account', '/business', '/advertise', '/admin']

export function BottomNav() {
  const pathname = usePathname()
  const { lang } = useLang()
  const { user } = useAuth()

  if (HIDDEN_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) return null

  const tabs = [
    {
      href: '/',
      label: lang === 'es' ? 'Cruces' : 'Crossings',
      icon: (active: boolean) => (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h4l2 10h6l2-10h4M3 7l9-4 9 4M12 3v4" />
        </svg>
      ),
      active: pathname === '/',
    },
    {
      href: '/services',
      label: lang === 'es' ? 'Servicios' : 'Services',
      icon: (active: boolean) => (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-10h2m4 0h2M9 7h1m4 0h1M9 17h6" />
        </svg>
      ),
      active: pathname === '/services' || pathname.startsWith('/services'),
    },
    {
      href: '/guide',
      label: lang === 'es' ? 'Guía' : 'Guide',
      icon: (active: boolean) => (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      active: pathname === '/guide' || pathname === '/customs' || pathname === '/insurance',
    },
    {
      href: user ? '/dashboard' : '/signup',
      label: lang === 'es' ? 'Yo' : 'Me',
      icon: (active: boolean) => (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      active: pathname === '/dashboard' || pathname === '/account',
    },
  ]

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-stretch">
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
              tab.active
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            {tab.icon(tab.active)}
            <span className={`text-[10px] font-medium leading-none ${tab.active ? 'font-semibold' : ''}`}>
              {tab.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
