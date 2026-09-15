import { db } from './db';

/**
 * Atomically moves an entry to a target position.
 * All entries between target and current are shifted down by 1.
 * Implemented as a PostgreSQL stored procedure (move_to_position) for atomicity.
 */
export async function performPositionMove(
  entryId: string,
  targetPosition: number
): Promise<void> {
  try {
    await db.query('SELECT move_to_position($1, $2)', [entryId, targetPosition]);
  } catch (error: any) {
    throw new Error(`Position move failed: ${error.message}`);
  }
}

/**
 * Returns a random integer between min and max (inclusive).
 */
export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Masks an email for public display.
 * j***@gmail.com
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***@***';
  return `${local[0]}***@${domain}`;
}
