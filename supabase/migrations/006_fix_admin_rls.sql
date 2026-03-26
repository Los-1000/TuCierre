-- =====================================================
-- 006_fix_admin_rls.sql
-- FIXES: infinite recursion in brokers RLS policy.
--
-- The policy "brokers_select_admin" in 005 queries
-- the brokers table FROM WITHIN a brokers policy,
-- causing an infinite loop. We fix this by using a
-- SECURITY DEFINER function that bypasses RLS.
-- =====================================================

-- Step 1: Drop the recursive policy immediately
DROP POLICY IF EXISTS "brokers_select_admin" ON brokers;

-- Step 2: Create a helper function that checks admin
-- status WITHOUT triggering RLS (SECURITY DEFINER runs
-- as the function owner = postgres, bypassing RLS).
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM brokers WHERE id = auth.uid() LIMIT 1),
    false
  )
$$;

-- Step 3: Recreate brokers_select_admin using the function
-- (no recursion because the function bypasses RLS)
CREATE POLICY "brokers_select_admin" ON brokers
  FOR SELECT
  USING (public.is_admin_user());

-- Step 4: Also update all other admin policies to use the
-- function for consistency (avoids RLS cross-table issues)

-- Tramites
DROP POLICY IF EXISTS "tramites_select_admin" ON tramites;
CREATE POLICY "tramites_select_admin" ON tramites
  FOR SELECT USING (public.is_admin_user());

DROP POLICY IF EXISTS "tramites_update_admin" ON tramites;
CREATE POLICY "tramites_update_admin" ON tramites
  FOR UPDATE USING (public.is_admin_user());

-- Status history
DROP POLICY IF EXISTS "history_select_admin" ON tramite_status_history;
CREATE POLICY "history_select_admin" ON tramite_status_history
  FOR SELECT USING (public.is_admin_user());

DROP POLICY IF EXISTS "history_insert_admin" ON tramite_status_history;
CREATE POLICY "history_insert_admin" ON tramite_status_history
  FOR INSERT WITH CHECK (public.is_admin_user());

-- Messages
DROP POLICY IF EXISTS "messages_select_admin" ON messages;
CREATE POLICY "messages_select_admin" ON messages
  FOR SELECT USING (public.is_admin_user());

DROP POLICY IF EXISTS "messages_insert_admin" ON messages;
CREATE POLICY "messages_insert_admin" ON messages
  FOR INSERT WITH CHECK (
    sender_type = 'admin' AND public.is_admin_user()
  );

-- Price match
DROP POLICY IF EXISTS "price_match_select_admin" ON price_match_requests;
CREATE POLICY "price_match_select_admin" ON price_match_requests
  FOR SELECT USING (public.is_admin_user());

DROP POLICY IF EXISTS "price_match_update_admin" ON price_match_requests;
CREATE POLICY "price_match_update_admin" ON price_match_requests
  FOR UPDATE USING (public.is_admin_user());

-- Tramite types
DROP POLICY IF EXISTS "tramite_types_manage_admin" ON tramite_types;
CREATE POLICY "tramite_types_manage_admin" ON tramite_types
  FOR ALL USING (public.is_admin_user());
