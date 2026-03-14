import { createClient } from '@supabase/supabase-js';

// Browser client (anon key — safe to expose)
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Server client (service role — server only, never expose to browser)
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Types
export interface WaitlistEntry {
  id: string;
  email: string;
  position: number;
  joined_at: string;
  confirmed: boolean;
  confirmation_token: string;
  total_spent_cents: number;
  bump_count: number;
  top_spot_count: number;
  referral_code: string;
  referred_by: string | null;
}

export interface ActivityFeedItem {
  id: string;
  event_type: 'joined' | 'random_bump' | 'top_spot' | 'referral_bump' | 'system';
  entry_id: string | null;
  position_before: number | null;
  position_after: number | null;
  amount_cents: number | null;
  display_text: string;
  created_at: string;
}
