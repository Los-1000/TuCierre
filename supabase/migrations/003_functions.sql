-- Auto-generate reference codes: TC-YYYY-NNNNN
CREATE SEQUENCE IF NOT EXISTS tramite_seq START 1;

CREATE OR REPLACE FUNCTION generate_reference_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'TC-' || to_char(CURRENT_DATE, 'YYYY') || '-' ||
    LPAD(NEXTVAL('tramite_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set reference code
CREATE OR REPLACE FUNCTION set_reference_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_code IS NULL OR NEW.reference_code = '' THEN
    NEW.reference_code := generate_reference_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_reference_code
  BEFORE INSERT ON tramites
  FOR EACH ROW EXECUTE FUNCTION set_reference_code();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_brokers_updated_at
  BEFORE UPDATE ON brokers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_tramites_updated_at
  BEFORE UPDATE ON tramites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create broker profile on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.brokers (id, email, full_name, phone, dni)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'dni', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update broker tier based on monthly tramites
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
    AND created_at >= date_trunc('month', CURRENT_DATE);

  IF monthly_count >= 8 THEN new_tier := 'oro';
  ELSIF monthly_count >= 4 THEN new_tier := 'plata';
  ELSE new_tier := 'bronce';
  END IF;

  UPDATE brokers
  SET tier = new_tier, total_tramites_month = monthly_count, updated_at = now()
  WHERE id = broker_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-log status changes
CREATE OR REPLACE FUNCTION log_tramite_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO tramite_status_history (tramite_id, status, changed_by)
    VALUES (NEW.id, NEW.status, 'system');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_status_change
  AFTER UPDATE ON tramites
  FOR EACH ROW EXECUTE FUNCTION log_tramite_status_change();
