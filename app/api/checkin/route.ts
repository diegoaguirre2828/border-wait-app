import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET: fetch driver info by token (for check-in page)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

  const db = getServiceClient()
  const { data: driver, error } = await db
    .from('drivers')
    .select('id, name, carrier, current_status, current_port_id, last_checkin_at')
    .eq('checkin_token', token)
    .single()

  if (error || !driver) return NextResponse.json({ error: 'Invalid link' }, { status: 404 })

  // Also fetch current wait times for their port if they have one
  let portData = null
  if (driver.current_port_id) {
    const { data: ports } = await db
      .from('wait_time_readings')
      .select('vehicle_wait, commercial_wait, recorded_at')
      .eq('port_id', driver.current_port_id)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single()
    portData = ports
  }

  return NextResponse.json({ driver, portData })
}

// POST: driver updates their status
export async function POST(req: NextRequest) {
  const { token, status, portId, etaMinutes } = await req.json()
  if (!token || !status) return NextResponse.json({ error: 'token and status required' }, { status: 400 })

  const validStatuses = ['available', 'en_route', 'in_line', 'at_bridge', 'cleared', 'delivered']
  if (!validStatuses.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

  const db = getServiceClient()

  const updates: Record<string, unknown> = {
    current_status: status,
    last_checkin_at: new Date().toISOString(),
  }
  if (portId !== undefined) updates.current_port_id = portId || null
  if (etaMinutes !== undefined) updates.eta_minutes = etaMinutes || null

  const { error } = await db
    .from('drivers')
    .update(updates)
    .eq('checkin_token', token)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
