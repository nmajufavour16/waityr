-- =============================================================
-- Waityr — Supabase Schema
-- Run this in Supabase SQL Editor before deploying the app.
-- =============================================================

-- ---------------------------------------------------------------
-- waitlist_entries
-- ---------------------------------------------------------------
CREATE TABLE waitlist_entries (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email              TEXT NOT NULL UNIQUE,
  position           INTEGER NOT NULL,
  joined_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed          BOOLEAN NOT NULL DEFAULT false,
  confirmation_token UUID DEFAULT gen_random_uuid(),
  total_spent_cents  INTEGER NOT NULL DEFAULT 0,
  bump_count         INTEGER NOT NULL DEFAULT 0,
  top_spot_count     INTEGER NOT NULL DEFAULT 0,
  referral_code      TEXT UNIQUE DEFAULT substring(md5(random()::text), 1, 8),
  referred_by        UUID REFERENCES waitlist_entries(id)
);

CREATE INDEX idx_waitlist_position ON waitlist_entries(position);
CREATE INDEX idx_waitlist_email    ON waitlist_entries(email);

-- ---------------------------------------------------------------
-- activity_feed
-- ---------------------------------------------------------------
CREATE TABLE activity_feed (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type      TEXT NOT NULL CHECK (event_type IN (
                    'joined','random_bump','top_spot','referral_bump','system'
                  )),
  entry_id        UUID REFERENCES waitlist_entries(id),
  position_before INTEGER,
  position_after  INTEGER,
  amount_cents    INTEGER,
  display_text    TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_feed_created ON activity_feed(created_at DESC);

-- ---------------------------------------------------------------
-- paystack_events  (idempotency — critical)
-- ---------------------------------------------------------------
CREATE TABLE paystack_events (
  reference    TEXT PRIMARY KEY,
  event_type   TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------
-- position_lock  (single-row advisory lock anchor)
-- ---------------------------------------------------------------
CREATE TABLE position_lock (
  id        INTEGER PRIMARY KEY DEFAULT 1,
  locked_at TIMESTAMPTZ,
  CONSTRAINT single_row CHECK (id = 1)
);
INSERT INTO position_lock (id) VALUES (1);

-- ---------------------------------------------------------------
-- RPC: move_to_position
-- Atomically moves an entry to p_target, shifting others down.
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION move_to_position(p_entry_id UUID, p_target INT)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_current INT;
BEGIN
  PERFORM pg_advisory_xact_lock(1);

  SELECT position INTO v_current
    FROM waitlist_entries WHERE id = p_entry_id;

  IF v_current IS NULL THEN
    RAISE EXCEPTION 'Entry not found';
  END IF;

  IF v_current = p_target THEN RETURN; END IF;

  -- Shift everyone between target and current position down by 1
  UPDATE waitlist_entries
    SET position = position + 1
    WHERE position >= p_target AND position < v_current;

  -- Place entry at target
  UPDATE waitlist_entries
    SET position = p_target
    WHERE id = p_entry_id;
END;
$$;

-- ---------------------------------------------------------------
-- RPC: join_waitlist
-- Atomically assigns the next position.
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION join_waitlist(p_email TEXT, p_referral_code TEXT DEFAULT NULL)
RETURNS TABLE(
  new_id               UUID,
  new_position         INTEGER,
  new_confirmation_token UUID,
  referrer_id          UUID,
  referrer_position    INTEGER
) LANGUAGE plpgsql AS $$
DECLARE
  v_max_position   INTEGER;
  v_new_position   INTEGER;
  v_new_id         UUID;
  v_token          UUID;
  v_referrer_id    UUID;
  v_referrer_pos   INTEGER;
BEGIN
  PERFORM pg_advisory_xact_lock(1);

  SELECT COALESCE(MAX(position), 0) INTO v_max_position FROM waitlist_entries;
  v_new_position := v_max_position + 1;

  INSERT INTO waitlist_entries (email, position)
  VALUES (p_email, v_new_position)
  RETURNING id, confirmation_token
  INTO v_new_id, v_token;

  -- Handle referral
  IF p_referral_code IS NOT NULL AND p_referral_code != '' THEN
    SELECT id, position INTO v_referrer_id, v_referrer_pos
    FROM waitlist_entries
    WHERE referral_code = p_referral_code
      AND id != v_new_id;

    IF v_referrer_id IS NOT NULL AND v_referrer_pos > 1 THEN
      PERFORM move_to_position(v_referrer_id, v_referrer_pos - 1);

      UPDATE waitlist_entries
        SET referred_by = v_referrer_id
        WHERE id = v_new_id;
    END IF;
  END IF;

  RETURN QUERY SELECT v_new_id, v_new_position, v_token, v_referrer_id, v_referrer_pos;
END;
$$;

-- ---------------------------------------------------------------
-- Enable Realtime on activity_feed
-- ---------------------------------------------------------------
ALTER TABLE activity_feed REPLICA IDENTITY FULL;

-- ---------------------------------------------------------------
-- Row Level Security (basic — tighten in production)
-- ---------------------------------------------------------------
ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed    ENABLE ROW LEVEL SECURITY;

-- Public can read activity feed
CREATE POLICY "activity_feed_select" ON activity_feed
  FOR SELECT USING (true);

-- Public cannot read waitlist entries (only via API with service role)
CREATE POLICY "waitlist_no_public_read" ON waitlist_entries
  FOR SELECT USING (false);

-- Public stats view (used by /api/stats)
CREATE VIEW waitlist_stats AS
SELECT
  COUNT(*)::INT                                        AS total_waiters,
  COALESCE(SUM(total_spent_cents), 0)::INT             AS total_revenue_cents,
  COALESCE(MAX(top_spot_count), 0)::INT               AS top_spot_record_purchases,
  (SELECT email FROM waitlist_entries ORDER BY top_spot_count DESC LIMIT 1) AS top_spender_email,
  (SELECT joined_at FROM waitlist_entries WHERE position = 1 LIMIT 1)       AS number_one_since
FROM waitlist_entries;
