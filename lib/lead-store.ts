import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { LeadRecord } from '@/types/audit';

const storePath = join(dirname(fileURLToPath(import.meta.url)), '..', '.ai-spend-leads.json');

function ensureDir() {
  const dir = dirname(storePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function readStore(): LeadRecord[] {
  ensureDir();
  if (!existsSync(storePath)) return [];
  try {
    return JSON.parse(readFileSync(storePath, 'utf8')) as LeadRecord[];
  } catch {
    return [];
  }
}

function writeStore(leads: LeadRecord[]) {
  ensureDir();
  writeFileSync(storePath, JSON.stringify(leads, null, 2));
}

export function saveLeadLocal(lead: LeadRecord) {
  const leads = readStore();
  leads.push(lead);
  writeStore(leads);
  return lead;
}

export function getLocalLeads() {
  return readStore();
}
