-- =====================================================
-- 011_restrict_broker_status.sql
-- Brokers must not be able to self-mark tramites as
-- 'completado' via the Supabase API, which would let
-- them generate fraudulent commission cashouts.
--
-- The USING clause already limits updates to rows
-- the broker owns. We add a WITH CHECK clause so the
-- resulting row cannot have status = 'completado'.
-- All other status transitions are admin-only and go
-- through the service role (bypasses RLS entirely).
-- =====================================================

DROP POLICY IF EXISTS "tramites_update_own" ON tramites;

CREATE POLICY "tramites_update_own" ON tramites
  FOR UPDATE
  USING (broker_id = auth.uid())
  WITH CHECK (
    broker_id = auth.uid() AND
    status != 'completado'
  );
