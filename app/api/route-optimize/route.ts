import { NextRequest, NextResponse } from 'next/server'
import { fetchRgvWaitTimes } from '@/lib/cbp'
import { PORT_META } from '@/lib/portMeta'

// US cities mapped to nearest crossing regions
const ORIGIN_REGIONS: Record<string, string[]> = {
  'McAllen':      ['RGV – McAllen / Hidalgo', 'RGV – Progreso / Donna'],
  'Laredo':       ['Laredo'],
  'Eagle Pass':   ['Eagle Pass'],
  'Del Rio':      ['Del Rio'],
  'El Paso':      ['El Paso'],
  'San Antonio':  ['Laredo', 'Eagle Pass'],
  'Houston':      ['Laredo', 'RGV – McAllen / Hidalgo'],
  'Brownsville':  ['Brownsville'],
  'San Diego':    ['San Diego'],
  'Los Angeles':  ['San Diego', 'Calexico / Imperial Valley'],
  'Phoenix':      ['Nogales, AZ', 'San Luis, AZ'],
  'Tucson':       ['Nogales, AZ'],
  'Dallas':       ['Laredo', 'Eagle Pass'],
  'Corpus Christi': ['RGV – McAllen / Hidalgo', 'Brownsville'],
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.searchParams.get('origin') || 'McAllen'
  const urgency = req.nextUrl.searchParams.get('urgency') || 'now' // now | flexible

  const ports = await fetchRgvWaitTimes()

  const regions = ORIGIN_REGIONS[origin] || Object.keys(ORIGIN_REGIONS).flatMap(k => ORIGIN_REGIONS[k])

  // Score each port in the relevant regions
  const candidates = ports
    .filter(p => {
      const meta = PORT_META[p.portId]
      return meta && regions.includes(meta.region)
    })
    .map(p => {
      const meta = PORT_META[p.portId]
      const wait = p.vehicle ?? p.pedestrian ?? 999
      const commercial = p.commercial ?? 999

      // Composite score: lower is better
      const score = urgency === 'freight'
        ? commercial * 0.8 + wait * 0.2
        : wait

      return {
        portId: p.portId,
        portName: p.portName,
        crossingName: p.crossingName,
        region: meta.region,
        vehicleWait: p.vehicle,
        pedestrianWait: p.pedestrian,
        commercialWait: p.commercial,
        sentriWait: p.sentri,
        score,
        recommendation: score < 20 ? 'Best option — low wait' :
                        score < 45 ? 'Moderate wait — acceptable' :
                        'High wait — consider alternatives',
      }
    })
    .sort((a, b) => a.score - b.score)

  const top = candidates.slice(0, 3)
  const best = top[0] || null

  return NextResponse.json({
    origin,
    urgency,
    best,
    alternatives: top.slice(1),
    allCandidates: candidates,
    generatedAt: new Date().toISOString(),
  })
}
