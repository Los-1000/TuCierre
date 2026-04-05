-- =====================================================
-- 010_security_fixes.sql
-- Security fixes from code review:
-- 1. Enable RLS on cashout_requests
-- 2. Drop duplicate status-history trigger
-- 3. Fix update_broker_tier to use completed_at
-- 4. Referral data: restore row-access policy + add safe view
-- =====================================================


-- -------------------------------------------------------
-- 1. cashout_requests RLS
--    The table was created outside migrations; add RLS now.
-- -------------------------------------------------------
ALTER TABLE cashout_requests ENABLE ROW LEVEL SECURITY;

-- Brokers can only see and create their own cashout requests.
-- (Service role used by server actions bypasses RLS entirely.)
DROP POLICY IF EXISTS "cashout_select_own" ON cashout_requests;
CREATE POLICY "cashout_select_own" ON cashout_requests
  FOR SELECT USING (broker_id = auth.uid());

DROP POLICY IF EXISTS "cashout_insert_own" ON cashout_requests;
CREATE POLICY "cashout_insert_own" ON cashout_requests
  FOR INSERT WITH CHECK (broker_id = auth.uid());

-- Admins can read all cashout requests (for the admin panel)
DROP POLICY IF EXISTS "cashout_select_admin" ON cashout_requests;
CREATE POLICY "cashout_select_admin" ON cashout_requests
  FOR SELECT USING (public.is_admin_user());


-- -------------------------------------------------------
-- 2. Drop the duplicate status-history trigger.
--    updateTramiteStatus (server action) already inserts a
--    history row with the real user ID. The trigger fired
--    simultaneously and added a second row with
--    changed_by = 'system', producing two entries per change.
-- -------------------------------------------------------
DROP TRIGGER IF EXISTS trigger_log_status_change ON tramites;
DROP FUNCTION IF EXISTS log_tramite_status_change();


-- -------------------------------------------------------
-- 3. Fix update_broker_tier: count by completed_at, not
--    created_at. A tramite created this month but completed
--    later was being counted in the wrong period.
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION update_broker_tier(broker_uuid UUID)
RETURNS VOID AS $$
DECLARE
  monthly_count INTEGER;
  new_tier TEXT;
BEGIN
  SELECT COUNT(*) INTO monthly_count
  FROM tramites
  WHERE broker_id = broker_uuid
    AND status = 'completado'
    AND completed_at >= date_trunc('month', CURRENT_DATE);

  IF monthly_count >= 8 THEN new_tier := 'oro';
  ELSIF monthly_count >= 4 THEN new_tier := 'plata';
  ELSE new_tier := 'bronce';
  END IF;

  UPDATE brokers
  SET tier = new_tier, total_tramites_month = monthly_count, updated_at = now()
  WHERE id = broker_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- -------------------------------------------------------
-- 4. Referral data access
--
--    The brokers_select_my_referrals RLS policy grants row-level
--    access to referred brokers. This is needed for the count
--    query in /recompensas (SELECT id, count only).
--    We restore the policy and add a SECURITY DEFINER view
--    that exposes only non-sensitive columns for any code that
--    needs to display referral broker info.
--    App code should query `my_referrals` instead of SELECT *
--    on the brokers table for referral display purposes.
-- -------------------------------------------------------
DROP POLICY IF EXISTS "brokers_select_my_referrals" ON brokers;
CREATE POLICY "brokers_select_my_referrals" ON brokers
  FOR SELECT
  USING (referred_by = auth.uid());

-- Safe view: exposes only non-sensitive columns.
-- SECURITY DEFINER so auth.uid() is evaluated as the calling user
-- while the underlying brokers RLS is bypassed (the WHERE clause
-- already enforces the same restriction).
CREATE OR REPLACE VIEW public.my_referrals
  WITH (security_invoker = false)
AS
  SELECT
    b.id,
    b.full_name,
    b.email,
    b.tier,
    b.total_tramites,
    b.created_at
  FROM public.brokers b
  WHERE b.referred_by = auth.uid();

GRANT SELECT ON public.my_referrals TO authenticated;
