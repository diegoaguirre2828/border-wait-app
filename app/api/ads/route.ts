import { NextRequest, NextResponse } from 'next/server'
import { getSupabase, getServiceClient } from '@/lib/supabase'

// GET /api/ads?portId=xxx&region=xxx — fetch ads for a crossing
export async function GET(req: NextRequest) {
  const portId = req.nextUrl.searchParams.get('portId')
  const region = req.nextUrl.searchParams.get('region')
  const waitTime = parseInt(req.nextUrl.searchParams.get('wait') || '0')

  const supabase = getSupabase()
  const now = new Date().toISOString()

  let query = supabase
    .from('ads')
    .select('id, title, description, cta_text, cta_url, image_url, ad_type, target_regions, target_ports, min_wait_trigger')
    .eq('active', true)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .lte('starts_at', now)

  const { data: ads } = await query

  if (!ads) return NextResponse.json({ ads: [] })

  // Filter by targeting
  const filtered = ads.filter(ad => {
    if (ad.target_ports?.length && portId && !ad.target_ports.includes(portId)) return false
    if (ad.target_regions?.length && region && !ad.target_regions.includes(region)) return false
    if (ad.min_wait_trigger && waitTime < ad.min_wait_trigger) return false
    return true
  })

  return NextResponse.json({ ads: filtered })
}

// POST /api/ads/event — track impression or click
export async function POST(req: NextRequest) {
  const { adId, eventType, portId } = await req.json()
  if (!adId || !eventType) return NextResponse.json({ ok: true })

  const supabase = getServiceClient()
  await supabase.from('ad_events').insert({ ad_id: adId, event_type: eventType, port_id: portId })

  // Increment counter
  const col = eventType === 'click' ? 'clicks' : 'impressions'
  await supabase.rpc('increment_ad_stat', { ad_id: adId, col_name: col }).maybeSingle()

  return NextResponse.json({ ok: true })
}
