'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { User, Truck } from 'lucide-react'

export function NavBar() {
  const { user, loading } = useAuth()
  if (loading) return null

  return (
    <div className="flex items-center gap-2 mt-1">
      {user ? (
        <>
          <Link
            href="/fleet"
            className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Truck className="w-3 h-3" /> Fleet
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-xs font-medium text-white bg-gray-900 px-3 py-1.5 rounded-xl hover:bg-gray-700 transition-colors"
          >
            <User className="w-3 h-3" /> Dashboard
          </Link>
        </>
      ) : (
        <Link
          href="/login"
          className="text-xs font-medium text-white bg-gray-900 px-3 py-1.5 rounded-xl hover:bg-gray-700 transition-colors"
        >
          Sign In
        </Link>
      )}
    </div>
  )
}
