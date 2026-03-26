-- =====================================================
-- 005_notarias.sql
-- Adds notaria fields to brokers, notaria_id to tramites,
-- and RLS policies so admins can see all records
-- =====================================================

-- 1. Add notaria fields to brokers table
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS notaria_name TEXT;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS notaria_address TEXT;

-- 2. Add notaria_id to tramites (which notaria handles this tramite)
ALTER TABLE tramites ADD COLUMN IF NOT EXISTS notaria_id UUID REFERENCES brokers(id);

-- =====================================================
-- RLS: Admins can read ALL tramites
-- =====================================================
DROP POLICY IF EXISTS "tramites_select_admin" ON tramites;
CREATE POLICY "tramites_select_admin" ON tramites
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brokers
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS: Admins can update ALL tramites (for status changes)
DROP POLICY IF EXISTS "tramites_update_admin" ON tramites;
CREATE POLICY "tramites_update_admin" ON tramites
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM brokers
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS: Admins can insert status history for any tramite
DROP POLICY IF EXISTS "history_insert_admin" ON tramite_status_history;
CREATE POLICY "history_insert_admin" ON tramite_status_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brokers
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS: Admins can read ALL status history
DROP POLICY IF EXISTS "history_select_admin" ON tramite_status_history;
CREATE POLICY "history_select_admin" ON tramite_status_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brokers
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS: Admins can read ALL broker profiles
DROP POLICY IF EXISTS "brokers_select_admin" ON brokers;
CREATE POLICY "brokers_select_admin" ON brokers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brokers b2
      WHERE b2.id = auth.uid() AND b2.is_admin = true
    )
  );

-- RLS: Any authenticated user can read admin/notaria profiles
-- (needed so brokers can choose a notaria in the cotizador)
DROP POLICY IF EXISTS "brokers_select_notarias" ON brokers;
CREATE POLICY "brokers_select_notarias" ON brokers
  FOR SELECT
  USING (is_admin = true);

-- RLS: Admins can see ALL messages
DROP POLICY IF EXISTS "messages_select_admin" ON messages;
CREATE POLICY "messages_select_admin" ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brokers
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS: Admins can insert messages in any tramite
DROP POLICY IF EXISTS "messages_insert_admin" ON messages;
CREATE POLICY "messages_insert_admin" ON messages
  FOR INSERT
  WITH CHECK (
    sender_type = 'admin' AND
    EXISTS (
      SELECT 1 FROM brokers
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS: Admins can read all price match requests
DROP POLICY IF EXISTS "price_match_select_admin" ON price_match_requests;
CREATE POLICY "price_match_select_admin" ON price_match_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brokers
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS: Admins can update price match requests
DROP POLICY IF EXISTS "price_match_update_admin" ON price_match_requests;
CREATE POLICY "price_match_update_admin" ON price_match_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM brokers
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS: Admins can manage tramite types (INSERT/UPDATE/DELETE)
DROP POLICY IF EXISTS "tramite_types_manage_admin" ON tramite_types;
CREATE POLICY "tramite_types_manage_admin" ON tramite_types
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM brokers
      WHERE id = auth.uid() AND is_admin = true
    )
  );
