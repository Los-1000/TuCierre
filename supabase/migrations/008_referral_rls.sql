-- Permite que un broker vea los brokers que él mismo refirió
-- (necesario para contar referidos en /perfil y /recompensas)
DROP POLICY IF EXISTS "brokers_select_my_referrals" ON brokers;
CREATE POLICY "brokers_select_my_referrals" ON brokers
  FOR SELECT
  USING (referred_by = auth.uid());
