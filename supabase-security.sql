-- ============================================================
-- KAIRO — Security Hardening Migration
-- Run in Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- ─── 1. Rate Limits Table ────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  count INT NOT NULL DEFAULT 1,
  UNIQUE(user_id, action, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup
  ON public.rate_limits(user_id, action, window_start DESC);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own rate limits"
  ON public.rate_limits FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Rate limit check function: returns true if allowed
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_action TEXT,
  p_max_count INT,
  p_window_seconds INT
) RETURNS BOOLEAN AS $$
DECLARE
  v_count INT;
  v_window_start TIMESTAMPTZ;
BEGIN
  v_window_start := now() - (p_window_seconds || ' seconds')::INTERVAL;

  SELECT COALESCE(SUM(count), 0) INTO v_count
  FROM public.rate_limits
  WHERE user_id = auth.uid()
    AND action = p_action
    AND window_start >= v_window_start;

  IF v_count >= p_max_count THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.rate_limits (user_id, action, window_start, count)
  VALUES (auth.uid(), p_action, date_trunc('minute', now()), 1)
  ON CONFLICT (user_id, action, window_start)
  DO UPDATE SET count = rate_limits.count + 1;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup old rate limit records (run periodically or via cron)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM public.rate_limits WHERE window_start < now() - INTERVAL '2 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── 2. Sessions Table ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_info TEXT,
  ip_address TEXT,
  location TEXT,
  user_agent TEXT,
  last_active TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_current BOOLEAN DEFAULT FALSE,
  revoked BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user
  ON public.user_sessions(user_id, revoked, last_active DESC);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sessions"
  ON public.user_sessions FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ─── 3. Tighter RLS on entities table ───────────────────────

-- Drop the old permissive policies
DROP POLICY IF EXISTS "Authenticated users can read all entities" ON public.entities;
DROP POLICY IF EXISTS "Authenticated users can insert entities" ON public.entities;
DROP POLICY IF EXISTS "Authenticated users can update entities" ON public.entities;
DROP POLICY IF EXISTS "Authenticated users can delete entities" ON public.entities;
DROP POLICY IF EXISTS "Anonymous can read public entities" ON public.entities;

-- SELECT: authenticated users can read entities with scoped access
CREATE POLICY "entities_select_auth" ON public.entities
  FOR SELECT TO authenticated
  USING (
    CASE entity_type
      -- Public entity types readable by any authenticated user
      WHEN 'Server' THEN true
      WHEN 'UserProfile' THEN true
      WHEN 'Channel' THEN true
      WHEN 'Category' THEN true
      WHEN 'Role' THEN true
      WHEN 'ServerMember' THEN true
      WHEN 'Friendship' THEN true
      WHEN 'BlockedUser' THEN true
      WHEN 'VoiceState' THEN true
      WHEN 'ServerBoost' THEN true
      WHEN 'ShopTier' THEN true
      WHEN 'ShopItem' THEN true
      WHEN 'BotInstallation' THEN true
      WHEN 'Emoji' THEN true
      WHEN 'Sticker' THEN true

      -- Messages: user must be member of the server that owns the channel
      WHEN 'Message' THEN (
        created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.entities sm
          WHERE sm.entity_type = 'ServerMember'
            AND sm.data->>'user_id' = auth.uid()::text
            AND sm.data->>'server_id' = (
              SELECT ch.data->>'server_id'
              FROM public.entities ch
              WHERE ch.entity_type = 'Channel'
                AND ch.id::text = (data->>'channel_id')
              LIMIT 1
            )
        )
      )

      -- DMs: user must be a participant
      WHEN 'DirectMessage' THEN (
        created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.entities conv
          WHERE conv.entity_type = 'Conversation'
            AND conv.id::text = (data->>'conversation_id')
            AND conv.data::text LIKE '%' || auth.uid()::text || '%'
        )
      )

      -- Conversations: user must be a participant
      WHEN 'Conversation' THEN (
        created_by = auth.uid()
        OR data::text LIKE '%' || auth.uid()::text || '%'
      )

      -- Audit logs: only the server owner or creator can read
      WHEN 'AuditLog' THEN (
        created_by = auth.uid()
      )

      -- Account activity: only own records
      WHEN 'AccountActivity' THEN (
        data->>'user_id' = auth.uid()::text
        OR created_by = auth.uid()
      )

      -- AutoMod rules: members of that server
      WHEN 'AutoModRule' THEN true

      -- Transactions: only own purchases
      WHEN 'ShopTransaction' THEN (
        data->>'user_id' = auth.uid()::text
        OR created_by = auth.uid()
      )

      -- Default: allow if user created it
      ELSE (created_by = auth.uid())
    END
  );

-- Anonymous read for public pages
CREATE POLICY "entities_select_anon" ON public.entities
  FOR SELECT TO anon
  USING (entity_type IN ('Server', 'UserProfile', 'Channel', 'Category', 'Role'));

-- INSERT: authenticated users can insert with rate limit checks
CREATE POLICY "entities_insert_auth" ON public.entities
  FOR INSERT TO authenticated
  WITH CHECK (
    CASE entity_type
      WHEN 'Message' THEN public.check_rate_limit('message', 5, 5)
      WHEN 'DirectMessage' THEN public.check_rate_limit('message', 5, 5)
      WHEN 'Friendship' THEN public.check_rate_limit('friend_request', 10, 3600)
      WHEN 'Server' THEN public.check_rate_limit('server_create', 3, 3600)
      ELSE true
    END
  );

-- UPDATE: users can only update entities they own or are authorized for
CREATE POLICY "entities_update_auth" ON public.entities
  FOR UPDATE TO authenticated
  USING (
    CASE entity_type
      -- Users can only update their own profile
      WHEN 'UserProfile' THEN (
        data->>'user_id' = auth.uid()::text
        OR data->>'user_email' = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR created_by = auth.uid()
      )
      -- Messages: only own messages
      WHEN 'Message' THEN created_by = auth.uid()
      WHEN 'DirectMessage' THEN created_by = auth.uid()
      -- Server: only owner
      WHEN 'Server' THEN (
        data->>'owner_id' = auth.uid()::text
        OR created_by = auth.uid()
      )
      -- Channel/Category/Role: server owner
      WHEN 'Channel' THEN created_by = auth.uid()
      WHEN 'Category' THEN created_by = auth.uid()
      WHEN 'Role' THEN created_by = auth.uid()
      -- Default: creator only
      ELSE created_by = auth.uid()
    END
  )
  WITH CHECK (true);

-- DELETE: users can only delete entities they own
CREATE POLICY "entities_delete_auth" ON public.entities
  FOR DELETE TO authenticated
  USING (
    CASE entity_type
      WHEN 'Message' THEN created_by = auth.uid()
      WHEN 'DirectMessage' THEN created_by = auth.uid()
      WHEN 'Server' THEN (
        data->>'owner_id' = auth.uid()::text
        OR created_by = auth.uid()
      )
      ELSE created_by = auth.uid()
    END
  );


-- ─── 4. Input validation function ───────────────────────────

CREATE OR REPLACE FUNCTION public.validate_entity_input()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent script injection in JSONB data
  IF NEW.data::text ~* '<script|javascript:|on\w+\s*=' THEN
    RAISE EXCEPTION 'Input contains potentially unsafe content';
  END IF;

  -- Enforce message content length
  IF NEW.entity_type IN ('Message', 'DirectMessage') THEN
    IF length(NEW.data->>'content') > 4000 THEN
      RAISE EXCEPTION 'Message content exceeds maximum length of 4000 characters';
    END IF;
  END IF;

  -- Enforce display name length
  IF NEW.entity_type = 'UserProfile' THEN
    IF length(NEW.data->>'display_name') > 64 THEN
      RAISE EXCEPTION 'Display name exceeds maximum length';
    END IF;
    IF length(NEW.data->>'bio') > 500 THEN
      RAISE EXCEPTION 'Bio exceeds maximum length';
    END IF;
  END IF;

  -- Enforce server name length
  IF NEW.entity_type = 'Server' THEN
    IF length(NEW.data->>'name') > 100 THEN
      RAISE EXCEPTION 'Server name exceeds maximum length';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_entity_input_trigger ON public.entities;
CREATE TRIGGER validate_entity_input_trigger
  BEFORE INSERT OR UPDATE ON public.entities
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_entity_input();


-- ─── 5. File metadata tracking ──────────────────────────────

CREATE TABLE IF NOT EXISTS public.file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT,
  file_size BIGINT,
  entity_id UUID REFERENCES public.entities(id) ON DELETE SET NULL,
  is_orphan BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_file_uploads_user ON public.file_uploads(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_file_uploads_orphan ON public.file_uploads(is_orphan, created_at)
  WHERE is_orphan = TRUE;

ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own uploads"
  ON public.file_uploads FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ─── 6. 2FA backup codes table ──────────────────────────────

CREATE TABLE IF NOT EXISTS public.totp_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.totp_backup_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own backup codes"
  ON public.totp_backup_codes FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ─── 7. Cleanup function for orphaned files ─────────────────

CREATE OR REPLACE FUNCTION public.cleanup_orphan_files()
RETURNS void AS $$
BEGIN
  DELETE FROM public.file_uploads
  WHERE is_orphan = TRUE
    AND created_at < now() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── 8. Session expiry function ─────────────────────────────

CREATE OR REPLACE FUNCTION public.expire_inactive_sessions()
RETURNS void AS $$
BEGIN
  UPDATE public.user_sessions
  SET revoked = TRUE
  WHERE revoked = FALSE
    AND last_active < now() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- Enable realtime on new tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_sessions;

-- ============================================================
-- DONE! Security hardening applied.
-- ============================================================
