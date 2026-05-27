import { NextResponse } from 'next/server';
import { leadPayloadSchema } from '@/services/validation';
import { hasSupabaseConfig } from '@/lib/supabase';
import { insertLeadToSupabase, insertAuditRecordToSupabase } from '@/lib/supabase-data';
import { getAuditRecord } from '@/lib/audit-store';
import { sendAuditEmail } from '@/lib/resend';

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const parseResult = leadPayloadSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.flatten().fieldErrors }, { status: 400 });
  }

  const { auditId, email, companyName, role, teamSize, honey } = parseResult.data;

  if (honey) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json({ error: 'Supabase is not configured. Contact your administrator.' }, { status: 503 });
    }

    // Try to insert the lead. If it fails because the audit row is missing,
    // attempt to repair by inserting the audit from the local store into Supabase,
    // then retry the lead insert.
    let leadResult = await insertLeadToSupabase({
      auditId,
      email,
      companyName,
      role,
      teamSize,
    });

    if (!leadResult.ok) {
      console.error('Lead insert error', leadResult.error);

      const errMsg = String(leadResult.error || '').toLowerCase();
      const fkMissing = errMsg.includes('foreign key') || errMsg.includes('leads_audit_id_fkey') || errMsg.includes('could not find the table');

      if (fkMissing) {
        // Attempt to find the audit locally and push it to Supabase, then retry
        const local = getAuditRecord(auditId);
        if (local) {
          try {
            const auditInsert = await insertAuditRecordToSupabase(local as any);
            if (auditInsert.ok) {
              // Retry lead insert once
              leadResult = await insertLeadToSupabase({
                auditId,
                email,
                companyName,
                role,
                teamSize,
              });
            } else {
              console.error('Repair audit insert failed', auditInsert.error);
            }
          } catch (repairError) {
            console.error('Repair audit exception', repairError);
          }
        } else {
          console.error('No local audit record found to repair FK for', auditId);
        }
      }

      if (!leadResult.ok) {
        // Final fallback: save lead locally to avoid losing data
        try {
          const { saveLeadLocal } = await import('@/lib/lead-store');
          const leadToSave = {
            id: crypto.randomUUID(),
            auditId,
            email,
            companyName: companyName ?? undefined,
            role: role ?? undefined,
            teamSize: teamSize ?? undefined,
            createdAt: new Date().toISOString(),
          } as any;
          saveLeadLocal(leadToSave);
          return NextResponse.json({ success: true, leadId: leadToSave.id, note: 'Saved locally due to Supabase error.' }, { status: 201 });
        } catch (localSaveError) {
          console.error('Local lead save failed', localSaveError);
          return NextResponse.json({ error: leadResult.error || 'Failed to save lead.' }, { status: 500 });
        }
      }
    }

    try {
      await sendAuditEmail({
        to: email,
        subject: 'Your AI Spend Audit Summary',
        body: `<p>Thanks for reviewing your audit. We captured your savings opportunity and are ready to help optimize your AI spend.</p><p><strong>Company:</strong> ${companyName?.trim() || 'N/A'}</p><p><strong>Team size:</strong> ${teamSize ?? 'Unspecified'}</p><p><strong>Next step:</strong> Review your detailed audit report and keep an eye on the recommendation email for a Credex consultation note.</p>`,
      });
    } catch (emailError) {
      console.error('Email send error', emailError);
    }

    return NextResponse.json({ success: true, leadId: leadResult.data.id }, { status: 201 });
  } catch (error) {
    console.error('Lead create error', error);
    return NextResponse.json({ error: 'Failed to create lead.' }, { status: 500 });
  }
}
