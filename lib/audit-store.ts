import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { AuditResult } from '@/types/audit';

const storePath = join(dirname(fileURLToPath(import.meta.url)), '..', '.ai-spend-audit-store.json');

function ensureStoreDirectory() {
  const directory = dirname(storePath);
  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }
}

function readStore(): Record<string, AuditResult> {
  ensureStoreDirectory();
  if (!existsSync(storePath)) {
    return {};
  }

  try {
    const raw = readFileSync(storePath, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, AuditResult>;
    return parsed;
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, AuditResult>) {
  ensureStoreDirectory();
  writeFileSync(storePath, JSON.stringify(store, null, 2));
}

export function saveAuditRecord(record: AuditResult) {
  const store = readStore();
  store[record.id] = record;
  writeStore(store);
  return record;
}

export function getAuditRecord(id: string): AuditResult | null {
  const store = readStore();
  return store[id] ?? null;
}

export function clearAuditStore() {
  writeStore({});
}
