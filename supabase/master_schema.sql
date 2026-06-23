-- =============================================================================
-- TuCierre — SQL MAESTRO (crea toda la base de datos desde cero)
-- =============================================================================
-- Este script consolida el ESTADO FINAL de las migraciones 001–015.
-- No reproduce el historial: aplica directamente el resultado final
-- (correcciones de RLS, función de tier por completed_at, sin trigger
-- duplicado de historial, categorías finales con sus documentos, etc.).
--
-- Ejecutar completo en el SQL Editor de Supabase sobre una base limpia.
-- Es idempotente en lo razonable (IF NOT EXISTS / DROP ... IF EXISTS).
-- =============================================================================

-- Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================================================
-- 1. TABLAS
-- =============================================================================

-- Brokers ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brokers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT,
  dni TEXT UNIQUE NOT NULL,
  tier TEXT DEFAULT 'bronce' CHECK (tier IN ('bronce', 'plata', 'oro')),
  total_tramites INTEGER DEFAULT 0,
  total_tramites_month INTEGER DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES brokers(id) ON DELETE SET NULL,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,              -- (004) rol admin / notaría
  notaria_name TEXT,                           -- (005)
  notaria_address TEXT,                         -- (005)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tipos de trámite -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tramite_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  estimated_days INTEGER NOT NULL,
  required_documents JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Solicitudes de cashout -------------------------------------------------------
-- (Se crea ANTES de tramites porque tramites.commission_cashout_id la referencia.)
CREATE TABLE IF NOT EXISTS cashout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('bank_transfer', 'yape', 'plin', 'otros')),
  payment_details JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  cashout_type TEXT NOT NULL DEFAULT 'referral_bonus'
    CHECK (cashout_type IN ('referral_bonus', 'commission')),
  admin_notes TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trámites (entidad central) ---------------------------------------------------
CREATE TABLE IF NOT EXISTS tramites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
  tramite_type_id UUID NOT NULL REFERENCES tramite_types(id),
  reference_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'cotizado' CHECK (status IN (
    'cotizado','solicitado','documentos_pendientes','en_revision',
    'en_firma','en_registro','completado','cancelado'
  )),
  property_address TEXT,
  property_district TEXT,
  property_value DECIMAL(12,2),
  parties JSONB NOT NULL DEFAULT '[]',
  quoted_price DECIMAL(10,2) NOT NULL,
  discount_applied DECIMAL(5,2) DEFAULT 0,
  final_price DECIMAL(10,2) NOT NULL,
  price_matched BOOLEAN DEFAULT false,
  price_match_reference TEXT,
  documents JSONB DEFAULT '[]',
  notes TEXT,
  estimated_completion DATE,
  completed_at TIMESTAMPTZ,
  notaria_id UUID REFERENCES brokers(id),                       -- (005)
  currency TEXT NOT NULL DEFAULT 'PEN' CHECK (currency IN ('PEN', 'USD')),  -- (014)
  commission_cashout_id UUID REFERENCES cashout_requests(id),    -- cashout de comisión
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON COLUMN tramites.currency IS 'Moneda de los montos del trámite: PEN (Soles) o USD (Dólares).';

-- Historial de estados ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS tramite_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tramite_id UUID NOT NULL REFERENCES tramites(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Mensajes ---------------------------------------------------------------------
-- Nota: se incluye 'admin' en sender_type para que la política
-- messages_insert_admin (que inserta sender_type = 'admin') sea coherente.
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tramite_id UUID NOT NULL REFERENCES tramites(id) ON DELETE CASCADE,
  sender_type TEXT CHECK (sender_type IN ('broker', 'notaria', 'admin')),
  sender_id UUID,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Recompensas ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('volume_discount', 'referral_bonus', 'price_match')),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  tramite_id UUID REFERENCES tramites(id) ON DELETE SET NULL,
  applied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Solicitudes de price match ---------------------------------------------------
CREATE TABLE IF NOT EXISTS price_match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
  tramite_type_id UUID NOT NULL REFERENCES tramite_types(id),
  competitor_name TEXT NOT NULL,
  competitor_price DECIMAL(10,2) NOT NULL,
  evidence_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  our_matched_price DECIMAL(10,2),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices ----------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tramites_broker_id ON tramites(broker_id);
CREATE INDEX IF NOT EXISTS idx_tramites_status ON tramites(status);
CREATE INDEX IF NOT EXISTS idx_tramites_created_at ON tramites(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_tramite_id ON messages(tramite_id);
CREATE INDEX IF NOT EXISTS idx_rewards_broker_id ON rewards(broker_id);
CREATE INDEX IF NOT EXISTS idx_price_match_broker_id ON price_match_requests(broker_id);
CREATE INDEX IF NOT EXISTS idx_tramite_history_tramite_id ON tramite_status_history(tramite_id);
CREATE INDEX IF NOT EXISTS idx_cashout_broker_id ON cashout_requests(broker_id);


-- =============================================================================
-- 2. FUNCIONES Y TRIGGERS
-- =============================================================================

-- Códigos de referencia: TC-YYYY-NNNNN ----------------------------------------
CREATE SEQUENCE IF NOT EXISTS tramite_seq START 1;

CREATE OR REPLACE FUNCTION generate_reference_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'TC-' || to_char(CURRENT_DATE, 'YYYY') || '-' ||
    LPAD(NEXTVAL('tramite_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_reference_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_code IS NULL OR NEW.reference_code = '' THEN
    NEW.reference_code := generate_reference_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_reference_code ON tramites;
CREATE TRIGGER trigger_set_reference_code
  BEFORE INSERT ON tramites
  FOR EACH ROW EXECUTE FUNCTION set_reference_code();

-- updated_at automático --------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_brokers_updated_at ON brokers;
CREATE TRIGGER trigger_brokers_updated_at
  BEFORE UPDATE ON brokers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_tramites_updated_at ON tramites;
CREATE TRIGGER trigger_tramites_updated_at
  BEFORE UPDATE ON tramites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Crear perfil de broker al registrarse (versión final, 004) -------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_referral_code TEXT;
  v_referral_code_used TEXT;
  v_referrer_id UUID;
  v_is_admin BOOLEAN;
  v_dni TEXT;
BEGIN
  v_is_admin := (NEW.email = 'cefd2350@gmail.com');

  IF v_is_admin THEN
    v_dni := 'ADMIN-' || substr(NEW.id::text, 1, 8);
  ELSE
    v_dni := COALESCE(NEW.raw_user_meta_data->>'dni', '');
  END IF;

  v_referral_code := 'TC-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  IF NOT v_is_admin THEN
    v_referral_code_used := trim(NEW.raw_user_meta_data->>'referral_code_used');
    IF v_referral_code_used IS NOT NULL AND v_referral_code_used != '' THEN
      SELECT id INTO v_referrer_id
      FROM public.brokers
      WHERE referral_code = v_referral_code_used
      LIMIT 1;
    END IF;
  END IF;

  INSERT INTO public.brokers (id, email, full_name, phone, dni, company_name, referral_code, referred_by, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN v_is_admin THEN 'Administrador' ELSE COALESCE(NEW.raw_user_meta_data->>'full_name', '') END,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    v_dni,
    NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'company_name', '')), ''),
    v_referral_code,
    v_referrer_id,
    v_is_admin
  )
  ON CONFLICT (id) DO NOTHING;

  IF v_referrer_id IS NOT NULL THEN
    INSERT INTO public.rewards (broker_id, type, description, amount, applied)
    VALUES (
      v_referrer_id,
      'referral_bonus',
      'Bono por referido: ' || COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      50.00,
      false
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Recalcular tier por trámites completados del mes (versión final, 010) --------
-- Cuenta por completed_at (no created_at).
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

-- NOTA: el trigger log_tramite_status_change de 003 se ELIMINÓ en 010
-- (insertaba un segundo registro 'system' duplicado). No se incluye aquí;
-- el historial lo escribe la server action updateTramiteStatus.

-- Helper de admin sin recursión (versión final, 007) ---------------------------
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, auth
AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  SELECT is_admin INTO v_is_admin
  FROM public.brokers
  WHERE id = auth.uid()
  LIMIT 1;
  RETURN COALESCE(v_is_admin, false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_user() TO anon, authenticated;


-- =============================================================================
-- 3. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE brokers                ENABLE ROW LEVEL SECURITY;
ALTER TABLE tramites               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tramite_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages               ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards                ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_match_requests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tramite_types          ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashout_requests       ENABLE ROW LEVEL SECURITY;

-- --- Brokers ------------------------------------------------------------------
DROP POLICY IF EXISTS "brokers_select_own"          ON brokers;
DROP POLICY IF EXISTS "brokers_update_own"          ON brokers;
DROP POLICY IF EXISTS "brokers_insert_own"          ON brokers;
DROP POLICY IF EXISTS "brokers_select_notarias"     ON brokers;
DROP POLICY IF EXISTS "brokers_select_admin"        ON brokers;
DROP POLICY IF EXISTS "brokers_select_my_referrals" ON brokers;

CREATE POLICY "brokers_select_own" ON brokers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "brokers_update_own" ON brokers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "brokers_insert_own" ON brokers FOR INSERT WITH CHECK (auth.uid() = id);
-- Cualquier autenticado puede ver notarías (is_admin=true) → selector de notaría
CREATE POLICY "brokers_select_notarias" ON brokers FOR SELECT USING (is_admin = true);
-- Admins ven todos los brokers (sin recursión: usa la función)
CREATE POLICY "brokers_select_admin" ON brokers FOR SELECT USING (public.is_admin_user());
-- Un broker puede ver a los brokers que él refirió (conteo en /recompensas)
CREATE POLICY "brokers_select_my_referrals" ON brokers FOR SELECT USING (referred_by = auth.uid());

-- --- Tramite types ------------------------------------------------------------
DROP POLICY IF EXISTS "tramite_types_select_active"  ON tramite_types;
DROP POLICY IF EXISTS "tramite_types_manage_admin"   ON tramite_types;

CREATE POLICY "tramite_types_select_active" ON tramite_types FOR SELECT USING (is_active = true);
CREATE POLICY "tramite_types_manage_admin" ON tramite_types
  FOR ALL USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- --- Tramites -----------------------------------------------------------------
DROP POLICY IF EXISTS "tramites_select_own"    ON tramites;
DROP POLICY IF EXISTS "tramites_insert_own"    ON tramites;
DROP POLICY IF EXISTS "tramites_update_own"    ON tramites;
DROP POLICY IF EXISTS "tramites_select_admin"  ON tramites;
DROP POLICY IF EXISTS "tramites_update_admin"  ON tramites;

CREATE POLICY "tramites_select_own" ON tramites FOR SELECT USING (broker_id = auth.uid());
CREATE POLICY "tramites_insert_own" ON tramites FOR INSERT WITH CHECK (broker_id = auth.uid());
-- El broker no puede auto-marcar 'completado' (evita cashouts fraudulentos) — (011)
CREATE POLICY "tramites_update_own" ON tramites
  FOR UPDATE
  USING (broker_id = auth.uid())
  WITH CHECK (broker_id = auth.uid() AND status != 'completado');
CREATE POLICY "tramites_select_admin" ON tramites FOR SELECT USING (public.is_admin_user());
CREATE POLICY "tramites_update_admin" ON tramites
  FOR UPDATE USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- --- Historial de estados -----------------------------------------------------
DROP POLICY IF EXISTS "history_select_own"    ON tramite_status_history;
DROP POLICY IF EXISTS "history_select_admin"  ON tramite_status_history;
DROP POLICY IF EXISTS "history_insert_admin"  ON tramite_status_history;

CREATE POLICY "history_select_own" ON tramite_status_history FOR SELECT
  USING (tramite_id IN (SELECT id FROM tramites WHERE broker_id = auth.uid()));
CREATE POLICY "history_select_admin" ON tramite_status_history FOR SELECT USING (public.is_admin_user());
CREATE POLICY "history_insert_admin" ON tramite_status_history FOR INSERT WITH CHECK (public.is_admin_user());

-- --- Mensajes -----------------------------------------------------------------
DROP POLICY IF EXISTS "messages_select_own"    ON messages;
DROP POLICY IF EXISTS "messages_insert_broker" ON messages;
DROP POLICY IF EXISTS "messages_select_admin"  ON messages;
DROP POLICY IF EXISTS "messages_insert_admin"  ON messages;

CREATE POLICY "messages_select_own" ON messages FOR SELECT
  USING (tramite_id IN (SELECT id FROM tramites WHERE broker_id = auth.uid()));
CREATE POLICY "messages_insert_broker" ON messages FOR INSERT
  WITH CHECK (
    sender_type = 'broker' AND
    sender_id = auth.uid() AND
    tramite_id IN (SELECT id FROM tramites WHERE broker_id = auth.uid())
  );
CREATE POLICY "messages_select_admin" ON messages FOR SELECT USING (public.is_admin_user());
CREATE POLICY "messages_insert_admin" ON messages FOR INSERT
  WITH CHECK (sender_type = 'admin' AND public.is_admin_user());

-- --- Recompensas --------------------------------------------------------------
DROP POLICY IF EXISTS "rewards_select_own" ON rewards;
CREATE POLICY "rewards_select_own" ON rewards FOR SELECT USING (broker_id = auth.uid());

-- --- Price match --------------------------------------------------------------
DROP POLICY IF EXISTS "price_match_select_own"   ON price_match_requests;
DROP POLICY IF EXISTS "price_match_insert_own"   ON price_match_requests;
DROP POLICY IF EXISTS "price_match_select_admin" ON price_match_requests;
DROP POLICY IF EXISTS "price_match_update_admin" ON price_match_requests;

CREATE POLICY "price_match_select_own" ON price_match_requests FOR SELECT USING (broker_id = auth.uid());
CREATE POLICY "price_match_insert_own" ON price_match_requests FOR INSERT WITH CHECK (broker_id = auth.uid());
CREATE POLICY "price_match_select_admin" ON price_match_requests FOR SELECT USING (public.is_admin_user());
CREATE POLICY "price_match_update_admin" ON price_match_requests
  FOR UPDATE USING (public.is_admin_user()) WITH CHECK (public.is_admin_user());

-- --- Cashout requests ---------------------------------------------------------
DROP POLICY IF EXISTS "cashout_select_own"   ON cashout_requests;
DROP POLICY IF EXISTS "cashout_insert_own"   ON cashout_requests;
DROP POLICY IF EXISTS "cashout_select_admin" ON cashout_requests;

CREATE POLICY "cashout_select_own" ON cashout_requests FOR SELECT USING (broker_id = auth.uid());
CREATE POLICY "cashout_insert_own" ON cashout_requests FOR INSERT WITH CHECK (broker_id = auth.uid());
CREATE POLICY "cashout_select_admin" ON cashout_requests FOR SELECT USING (public.is_admin_user());


-- =============================================================================
-- 4. VISTA SEGURA DE REFERIDOS (010)
-- =============================================================================
CREATE OR REPLACE VIEW public.my_referrals
  WITH (security_invoker = false)
AS
  SELECT b.id, b.full_name, b.email, b.tier, b.total_tramites, b.created_at
  FROM public.brokers b
  WHERE b.referred_by = auth.uid();

GRANT SELECT ON public.my_referrals TO authenticated;


-- =============================================================================
-- 5. STORAGE: bucket de evidencias de price match (012)
-- =============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'price-match-evidence',
  'price-match-evidence',
  true,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "price_match_evidence_insert_own" ON storage.objects;
CREATE POLICY "price_match_evidence_insert_own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'price-match-evidence'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "price_match_evidence_select" ON storage.objects;
CREATE POLICY "price_match_evidence_select"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'price-match-evidence');

DROP POLICY IF EXISTS "price_match_evidence_delete_own" ON storage.objects;
CREATE POLICY "price_match_evidence_delete_own"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'price-match-evidence'
  AND (storage.foldername(name))[1] = auth.uid()::text
);


-- =============================================================================
-- 6. SEED — Categorías finales y documentos requeridos
-- =============================================================================
-- Categorías activas: Compra y Venta, Donación, Arriendo.
-- Las 3 comparten los mismos 5 documentos requeridos:
--   HR, PU, Copia Literal, Constancia de no adeudo, Poder del apoderado.
INSERT INTO tramite_types (name, display_name, description, base_price, estimated_days, required_documents, is_active) VALUES
('compraventa', 'Compra y Venta', 'Transferencia de propiedad entre comprador y vendedor', 1500.00, 7,
  '[
    {"name":"Foto del DNI","description":"Foto legible del DNI vigente de las partes"},
    {"name":"HR","description":"Hoja de Resumen (HR) vigente del predio"},
    {"name":"PU","description":"Predio Urbano (PU) vigente del predio"},
    {"name":"Copia Literal","description":"Copia literal de la partida registral del inmueble"},
    {"name":"Constancia de no adeudo","description":"Constancia de no adeudo de tributos municipales"},
    {"name":"Poder del apoderado","description":"Poder vigente que acredita al apoderado"}
  ]'::jsonb, true),
('donacion', 'Donación', 'Donación de inmueble a tercero', 700.00, 5,
  '[
    {"name":"Foto del DNI","description":"Foto legible del DNI vigente de las partes"},
    {"name":"HR","description":"Hoja de Resumen (HR) vigente del predio"},
    {"name":"PU","description":"Predio Urbano (PU) vigente del predio"},
    {"name":"Copia Literal","description":"Copia literal de la partida registral del inmueble"},
    {"name":"Constancia de no adeudo","description":"Constancia de no adeudo de tributos municipales"},
    {"name":"Poder del apoderado","description":"Poder vigente que acredita al apoderado"}
  ]'::jsonb, true),
('arrendamiento', 'Arriendo', 'Contrato de arrendamiento sobre inmueble', 900.00, 5,
  '[
    {"name":"Foto del DNI","description":"Foto legible del DNI vigente de las partes"},
    {"name":"HR","description":"Hoja de Resumen (HR) vigente del predio"},
    {"name":"PU","description":"Predio Urbano (PU) vigente del predio"},
    {"name":"Copia Literal","description":"Copia literal de la partida registral del inmueble"},
    {"name":"Constancia de no adeudo","description":"Constancia de no adeudo de tributos municipales"},
    {"name":"Poder del apoderado","description":"Poder vigente que acredita al apoderado"}
  ]'::jsonb, true)
ON CONFLICT (name) DO UPDATE
SET display_name       = EXCLUDED.display_name,
    description        = EXCLUDED.description,
    required_documents = EXCLUDED.required_documents,
    is_active          = true;

-- =============================================================================
-- FIN
-- =============================================================================
