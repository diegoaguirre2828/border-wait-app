'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { createClient } from './auth'

export type Tier = 'guest' | 'free' | 'pro' | 'business'

export function useTier(): { tier: Tier; loading: boolean } {
  const { user, loading: authLoading } = useAuth()
  const [tier, setTier] = useState<Tier>('guest')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setTier('guest')
      setLoading(false)
      return
    }

    const supabase = createClient()
    supabase
      .from('profiles')
      .select('tier')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setTier((data?.tier as Tier) || 'free')
        setLoading(false)
      })
  }, [user, authLoading])

  return { tier, loading }
}

export function canAccess(tier: Tier, feature: string): boolean {
  const access: Record<string, Tier[]> = {
    save_crossings:   ['free', 'pro', 'business'],
    driver_reports:   ['free', 'pro', 'business'],
    alerts:           ['pro', 'business'],
    ai_predictions:   ['pro', 'business'],
    route_optimizer:  ['pro', 'business'],
    fleet_panel:      ['business'],
    data_export:      ['business'],
    api_access:       ['business'],
    no_ads:           ['free', 'pro', 'business'],
  }
  return access[feature]?.includes(tier) ?? false
}
