import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET() {
  const supabase = getServiceClient()
  const { data } = await supabase
    .from('advertisers')
    .select('*')
    .order('created_at', { ascending: false })
  return NextResponse.json({ advertisers: data || [] })
}
