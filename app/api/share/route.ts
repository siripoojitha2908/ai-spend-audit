import { NextResponse } from 'next/server';
import { getAuditRecord } from '@/lib/audit-store';
import { fetchPublicAuditFromSupabase } from '@/lib/supabase-data';
import { hasSupabaseConfig } from '@/lib/supabase';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing audit id' }, { status: 400 });
  }

  try {
    if (!hasSupabaseConfig()) {
      const localAudit = getAuditRecord(id);
      if (!localAudit) {
        return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
      }

      return NextResponse.json({ data: localAudit }, { status: 200 });
    }

    const supabaseResult = await fetchPublicAuditFromSupabase(id);
    if (!supabaseResult.ok) {
      const localAudit = getAuditRecord(id);
      if (!localAudit) {
        return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
      }

      return NextResponse.json({ data: localAudit }, { status: 200 });
    }

    return NextResponse.json({ data: supabaseResult.data }, { status: 200 });
  } catch (error) {
    console.error('Share lookup error', error);
    return NextResponse.json({ error: 'Failed to load shareable audit.' }, { status: 500 });
  }
}
