import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { businessName, email, phone, website, description, package: pkg, regions } = body

  if (!businessName || !email) {
    return NextResponse.json({ error: 'Name and email required' }, { status: 400 })
  }

  const supabase = getServiceClient()
  const { error } = await supabase.from('advertisers').insert({
    business_name: businessName,
    contact_email: email,
    contact_phone: phone || null,
    website: website || null,
    description: `Package: ${pkg}\nRegions: ${regions?.join(', ') || 'All'}\n\n${description || ''}`,
    status: 'pending',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
