import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: false });

// Startup validation: warn about required environment variables (but do not print secrets)
function printEnvStatus() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  console.log('Environment variables status:');
  for (const k of required) {
    const set = !!process.env[k];
    console.log(` - ${k}: ${set ? 'SET' : 'MISSING'}`);
  }
  console.log('Note: values are not printed to avoid leaking secrets. Ensure `.env.local` is in your `.gitignore`.');
}

/*
Safe, idempotent repair runner for Supabase.

Usage:
  Copy `.env.example` to `.env.local`, fill in `NEXT_PUBLIC_SUPABASE_URL` and
  `SUPABASE_SERVICE_ROLE_KEY`, then run: `node scripts/supabase-repair.mjs`

Notes:
- This script is intentionally conservative: it will not DROP data.
- It uses Supabase admin client auth and the service role key instead of a raw
  Postgres connection string.
*/

async function executeSqlViaRpc(url, key, sql) {
  const basePaths = ['rest/v1/rpc', 'rpc', 'functions/v1', 'supabase/functions/v1'];
  const candidateFunctions = ['run_sql', 'execute_sql', 'sql', 'pg_execute_sql', 'run_sql_command'];
  const headers = {
    Authorization: `Bearer ${key}`,
    apikey: key,
    'Content-Type': 'application/json'
  };

  for (const basePath of basePaths) {
    for (const fn of candidateFunctions) {
      const rpcUrl = `${url.replace(/\/$/, '')}/${basePath}/${fn}`;
      try {
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ sql })
        });
        const text = await response.text();
        if (response.ok) {
          return { success: true, data: text, rpcUrl };
        }
        if (response.status === 404 || response.status === 405) {
          continue;
        }
        return { success: false, error: `RPC function ${fn} at ${rpcUrl} failed: ${text}` };
      } catch (error) {
        continue;
      }
    }
  }

  return {
    success: false,
    error: 'No supported SQL RPC endpoint found. Ensure a SQL executor function is installed on your Supabase project or provide a direct database connection URL in .env.local.'
  };
}

async function executeSqlViaDatabaseUrl(databaseUrl, sql) {
  try {
    const { Client } = await import('pg');
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    await client.query(sql);
    await client.end();
    return { success: true, data: 'Database SQL executed successfully.' };
  } catch (error) {
    return { success: false, error: error?.message ?? String(error) };
  }
}

async function withDatabaseClient(databaseUrl, callback) {
  const { Client } = await import('pg');
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    return await callback(client);
  } finally {
    await client.end();
  }
}

async function ensureTablesAndColumns(supabase, url, key) {
  const sqlPath = path.resolve(process.cwd(), 'supabase', 'migrations', '20260527_repair_schema.sql');
  const sql = await fs.readFile(sqlPath, 'utf8');

  console.log('Applying repair migration (idempotent) via Supabase RPC...');
  let result = await executeSqlViaRpc(url, key, sql);

  if (!result.success) {
    const dbUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
    if (dbUrl) {
      console.log('SQL RPC endpoint unavailable; falling back to direct database connection.');
      result = await executeSqlViaDatabaseUrl(dbUrl, sql);
    }
  }

  if (!result.success) {
    throw new Error(result.error);
  }

  console.log('Migration applied successfully.');
}

async function main() {
  printEnvStatus();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('\nERROR: Missing required Supabase admin environment variables.');
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in `.env.local`.');
    console.error('You can copy `.env.example` to `.env.local` and fill values locally (do NOT commit `.env.local`).');
    process.exit(2);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  // Build results state for final status reporting
  const results = {
    auditTableVerified: false,
    leadTableVerified: false,
    auditCreation: false,
    leadPersistence: false,
    publicRetrieval: false,
    errors: []
  };

  try {
    await ensureTablesAndColumns(supabase, supabaseUrl, serviceRoleKey);
  } catch (error) {
    const message = error?.message ?? JSON.stringify(error);
    console.error('Schema repair failed:', message);
    results.errors.push(message);
  }

  try {
    const auditCheck = await supabase.from('audits').select('id').limit(1);
    if (auditCheck.error) {
      throw new Error(`audits table verification failed: ${auditCheck.error.message}`);
    }
    results.auditTableVerified = true;
    console.log('Audits table verified.');
  } catch (error) {
    console.error(error.message || error);
    results.errors.push(String(error));
  }

  try {
    const leadCheck = await supabase.from('leads').select('id').limit(1);
    if (leadCheck.error) {
      throw new Error(`leads table verification failed: ${leadCheck.error.message}`);
    }
    results.leadTableVerified = true;
    console.log('Leads table verified.');
  } catch (error) {
    console.error(error.message || error);
    results.errors.push(String(error));
  }

  try {
    const dbUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('Direct database URL is required for verification when Supabase SQL RPC is unavailable. Set SUPABASE_DATABASE_URL or DATABASE_URL in .env.local.');
    }

    await withDatabaseClient(dbUrl, async (client) => {
      const auditInsert = await client.query(
        `INSERT INTO audits (tools, recommendations, total_monthly_savings, total_annual_savings, confidence, summary, team_size, public)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [[], [], 0, 0, 1, 'repair-script-test-audit', 1, true]
      );

      if (!auditInsert.rows || auditInsert.rows.length !== 1) {
        throw new Error('Failed to insert test audit into database.');
      }

      const auditId = auditInsert.rows[0].id;
      console.log('Inserted test audit id=', auditId);
      results.auditCreation = true;

      const leadInsert = await client.query(
        `INSERT INTO leads (audit_id, email, company_name, role, team_size)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [auditId, `repair-test+${Date.now()}@example.com`, 'RepairCorp', 'QA', 1]
      );

      if (!leadInsert.rows || leadInsert.rows.length !== 1) {
        throw new Error('Failed to insert test lead into database.');
      }

      console.log('Inserted test lead id=', leadInsert.rows[0].id);
      results.leadPersistence = true;

      const publicFetch = await client.query(
        `SELECT id, summary, public FROM audits WHERE id = $1 AND public = true`,
        [auditId]
      );

      if (!publicFetch.rows || publicFetch.rows.length !== 1 || publicFetch.rows[0].public !== true) {
        throw new Error('Public audit retrieval failed for inserted test audit.');
      }

      console.log('Public audit retrieval OK for id=', auditId);
      results.publicRetrieval = true;
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error, null, 2) || String(error);
    console.error('Verification error:', message);
    results.errors.push(message);
  }

  console.log('FINAL_STATUS:', JSON.stringify(results, null, 2));

  if (!results.auditTableVerified || !results.leadTableVerified || !results.auditCreation || !results.leadPersistence || !results.publicRetrieval) {
    process.exit(4);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('Unexpected error:', err.message || err);
  process.exit(5);
});
