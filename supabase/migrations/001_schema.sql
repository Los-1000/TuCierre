-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Brokers table
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tramite types
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

-- Tramites (core entity)
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tramite status history
CREATE TABLE IF NOT EXISTS tramite_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tramite_id UUID NOT NULL REFERENCES tramites(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tramite_id UUID NOT NULL REFERENCES tramites(id) ON DELETE CASCADE,
  sender_type TEXT CHECK (sender_type IN ('broker', 'notaria')),
  sender_id UUID,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rewards
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

-- Price match requests
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tramites_broker_id ON tramites(broker_id);
CREATE INDEX IF NOT EXISTS idx_tramites_status ON tramites(status);
CREATE INDEX IF NOT EXISTS idx_tramites_created_at ON tramites(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_tramite_id ON messages(tramite_id);
CREATE INDEX IF NOT EXISTS idx_rewards_broker_id ON rewards(broker_id);
CREATE INDEX IF NOT EXISTS idx_price_match_broker_id ON price_match_requests(broker_id);
CREATE INDEX IF NOT EXISTS idx_tramite_history_tramite_id ON tramite_status_history(tramite_id);

-- Seed tramite types (solo compraventa y arrendamiento activos)
INSERT INTO tramite_types (name, display_name, description, base_price, estimated_days, required_documents, is_active) VALUES
('compraventa', 'Compraventa', 'Transferencia de propiedad entre comprador y vendedor', 1500.00, 7, '[{"name":"DNI Comprador","description":"DNI vigente del comprador"},{"name":"DNI Vendedor","description":"DNI vigente del vendedor"},{"name":"Partida Registral","description":"Partida registral del inmueble"},{"name":"HR y PU","description":"Hoja de resumen y predio urbano vigentes"},{"name":"Minuta","description":"Minuta de compraventa firmada por abogado"}]', true),
('hipoteca', 'Hipoteca', 'Constitución de hipoteca sobre un inmueble', 800.00, 5, '[{"name":"DNI Propietario","description":"DNI vigente del propietario"},{"name":"Partida Registral","description":"Partida registral del inmueble"},{"name":"Contrato de préstamo","description":"Contrato de mutuo o préstamo"},{"name":"HR y PU","description":"Hoja de resumen y predio urbano vigentes"}]', false),
('poder', 'Poder Notarial', 'Otorgamiento de poder a tercero para actuar en su nombre', 350.00, 2, '[{"name":"DNI Poderdante","description":"DNI vigente de quien otorga el poder"},{"name":"DNI Apoderado","description":"DNI vigente de quien recibe el poder"},{"name":"Descripción del poder","description":"Descripción detallada de las facultades a otorgar"}]', false),
('constitucion_empresa', 'Constitución de Empresa', 'Elevación a escritura pública de constitución de empresa', 1200.00, 10, '[{"name":"DNI Socios","description":"DNI de todos los socios"},{"name":"Minuta de constitución","description":"Minuta elaborada por abogado"},{"name":"Depósito de capital","description":"Voucher de depósito del capital social en banco"}]', false),
('levantamiento_hipoteca', 'Levantamiento de Hipoteca', 'Cancelación y levantamiento de hipoteca inscrita', 600.00, 5, '[{"name":"DNI Propietario","description":"DNI vigente del propietario"},{"name":"Partida Registral","description":"Partida registral con hipoteca inscrita"},{"name":"Carta de no adeudo","description":"Carta del banco o acreedor confirmando cancelación de deuda"}]', false),
('arrendamiento', 'Arrendamiento', 'Contrato de arrendamiento sobre inmueble', 900.00, 5, '[{"name":"DNI Propietario","description":"DNI vigente del propietario"},{"name":"DNI Arrendatario","description":"DNI vigente del arrendatario"},{"name":"Partida Registral","description":"Partida registral del inmueble"},{"name":"HR y PU","description":"Hoja de resumen y predio urbano vigentes"}]', true)
ON CONFLICT (name) DO NOTHING;
