import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const portId = req.nextUrl.searchParams.get('portId')
  if (!portId) return NextResponse.json({ error: 'portId required' }, { status: 400 })

  const supabase = getSupabase()

  // Get historical averages by day_of_week + hour for this port
  const { data, error } = await supabase
    .from('wait_time_readings')
    .select('day_of_week, hour_of_day, vehicle_wait')
    .eq('port_id', portId)
    .not('vehicle_wait', 'is', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data || data.length < 10) {
    return NextResponse.json({ predictions: [], message: 'Not enough data yet' })
  }

  // Build prediction map: day+hour -> average wait
  const map: Record<string, number[]> = {}
  for (const row of data) {
    const key = `${row.day_of_week}-${row.hour_of_day}`
    if (!map[key]) map[key] = []
    map[key].push(row.vehicle_wait)
  }

  // Generate next 24 hours of predictions
  const now = new Date()
  const predictions = []

  for (let i = 0; i < 24; i++) {
    const future = new Date(now.getTime() + i * 60 * 60 * 1000)
    const day = future.getDay()
    const hour = future.getHours()
    const key = `${day}-${hour}`
    const samples = map[key]

    if (samples && samples.length > 0) {
      const avg = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length)
      const variance = samples.length >= 5
        ? Math.round(Math.sqrt(samples.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / samples.length))
        : null

      predictions.push({
        datetime: future.toISOString(),
        hour,
        day,
        predictedWait: avg,
        variance,
        confidence: samples.length >= 10 ? 'high' : samples.length >= 5 ? 'medium' : 'low',
        samples: samples.length,
      })
    } else {
      predictions.push({
        datetime: future.toISOString(),
        hour,
        day,
        predictedWait: null,
        confidence: 'none',
        samples: 0,
      })
    }
  }

  // Find best crossing window (lowest predicted wait, high confidence)
  const best = predictions
    .filter(p => p.predictedWait !== null && p.confidence !== 'none')
    .sort((a, b) => (a.predictedWait ?? 999) - (b.predictedWait ?? 999))
    .slice(0, 3)

  return NextResponse.json({ predictions, best })
}
