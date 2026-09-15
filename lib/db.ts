import { Pool, QueryResult, QueryResultRow } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export interface WaitlistEntry extends QueryResultRow {
  id: number;
  email: string;
  position: number;
  referral_code: string;
  referred_by: string | null;
  total_spent_cents: number;
  top_spot_count: number;
  created_at: string;
}

export interface ActivityFeedItem extends QueryResultRow {
  id: number;
  type: 'join' | 'bump' | 'referral';
  user_email: string;
  new_position: number;
  created_at: string;
}

export const db = {
  query: <T extends QueryResultRow = any>(text: string, params?: unknown[]): Promise<QueryResult<T>> => 
    pool.query<T>(text, params),
};
