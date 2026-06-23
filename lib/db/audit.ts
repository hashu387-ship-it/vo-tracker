/**
 * Cryptographic audit-trail helpers (RICS/FIDIC compliance).
 *
 * Every status change is recorded as an append-only entry whose `hash` is the
 * SHA-256 of the previous entry's hash plus a canonical JSON of this entry's
 * payload. Any tampering with a historical row breaks the chain, which
 * `verifyAuditChain()` detects.
 */
import { createHash } from 'crypto';

export interface AuditPayload {
  projectId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  actorId?: string | null;
  actorName?: string | null;
  metadata?: unknown;
  createdAt: string; // ISO
}

/** Deterministic, stable stringify (sorted keys) for hashing. */
function canonical(payload: AuditPayload): string {
  return JSON.stringify(payload, Object.keys(payload).sort());
}

/** hash = sha256(prevHash + canonical(payload)) */
export function computeAuditHash(prevHash: string | null, payload: AuditPayload): string {
  return createHash('sha256')
    .update((prevHash ?? 'GENESIS') + '|' + canonical(payload))
    .digest('hex');
}

/** Short, human-facing verification tag shown on the "Verified" badge. */
export function shortHash(hash: string): string {
  return hash.slice(0, 8).toUpperCase();
}

/** Recompute the chain over ordered entries and report the first break (if any). */
export function verifyAuditChain(
  entries: Array<{ prevHash: string | null; hash: string } & AuditPayload>,
): { valid: boolean; brokenAtIndex: number | null } {
  let prev: string | null = null;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const expected = computeAuditHash(prev, e);
    if (expected !== e.hash) return { valid: false, brokenAtIndex: i };
    prev = e.hash;
  }
  return { valid: true, brokenAtIndex: null };
}
