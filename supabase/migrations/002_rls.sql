-- Enable RLS on all tables
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tramites ENABLE ROW LEVEL SECURITY;
ALTER TABLE tramite_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_match_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tramite_types ENABLE ROW LEVEL SECURITY;

-- Brokers: read/update own record
CREATE POLICY "brokers_select_own" ON brokers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "brokers_update_own" ON brokers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "brokers_insert_own" ON brokers FOR INSERT WITH CHECK (auth.uid() = id);

-- Tramites: broker sees own tramites
CREATE POLICY "tramites_select_own" ON tramites FOR SELECT USING (broker_id = auth.uid());
CREATE POLICY "tramites_insert_own" ON tramites FOR INSERT WITH CHECK (broker_id = auth.uid());
CREATE POLICY "tramites_update_own" ON tramites FOR UPDATE USING (broker_id = auth.uid());

-- Status history: broker sees own tramites history
CREATE POLICY "history_select_own" ON tramite_status_history FOR SELECT
  USING (tramite_id IN (SELECT id FROM tramites WHERE broker_id = auth.uid()));

-- Messages: broker sees messages for own tramites
CREATE POLICY "messages_select_own" ON messages FOR SELECT
  USING (tramite_id IN (SELECT id FROM tramites WHERE broker_id = auth.uid()));
CREATE POLICY "messages_insert_broker" ON messages FOR INSERT
  WITH CHECK (
    sender_type = 'broker' AND
    sender_id = auth.uid() AND
    tramite_id IN (SELECT id FROM tramites WHERE broker_id = auth.uid())
  );

-- Rewards: broker sees own rewards
CREATE POLICY "rewards_select_own" ON rewards FOR SELECT USING (broker_id = auth.uid());

-- Price match: broker sees own requests
CREATE POLICY "price_match_select_own" ON price_match_requests FOR SELECT USING (broker_id = auth.uid());
CREATE POLICY "price_match_insert_own" ON price_match_requests FOR INSERT WITH CHECK (broker_id = auth.uid());

-- Tramite types: anyone can read active types
CREATE POLICY "tramite_types_select_active" ON tramite_types FOR SELECT USING (is_active = true);

-- Service role bypass (for admin operations)
-- Admin uses service role key which bypasses RLS
