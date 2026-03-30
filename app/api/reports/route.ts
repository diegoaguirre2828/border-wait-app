import { NextRequest, NextResponse } from 'next/server'
import { getSupabase, getServiceClient } from '@/lib/supabase'

// GET /api/reports?portId=xxx  — fetch recent reports for a port
export async function GET(req: NextRequest) {
  const portId = req.nextUrl.searchParams.get('portId')
  if (!portId) return NextResponse.json({ error: 'portId required' }, { status: 400 })

  const since = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // last 12 hours

  const { data, error } = await getSupabase()
    .from('crossing_reports')
    .select('id, report_type, description, severity, upvotes, created_at')
    .eq('port_id', portId)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reports: data })
}

// POST /api/reports — submit a new report (anonymous allowed)
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { portId, reportType, description, severity } = body

  if (!portId || !reportType) {
    return NextResponse.json({ error: 'portId and reportType required' }, { status: 400 })
  }

  const validTypes = ['delay', 'accident', 'inspection', 'clear', 'other']
  if (!validTypes.includes(reportType)) {
    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
  }

  // Use service client so anonymous users can submit
  const supabase = getServiceClient()
  const { error } = await supabase.from('crossing_reports').insert({
    port_id: portId,
    report_type: reportType,
    description: description?.slice(0, 500) || null,
    severity: severity || 'medium',
    user_id: null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
