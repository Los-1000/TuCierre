-- Trámites can be denominated in Soles (PEN) or Dollars (USD).
-- The property value and fees of a given trámite are all expressed in this currency.
ALTER TABLE tramites
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'PEN'
  CHECK (currency IN ('PEN', 'USD'));

COMMENT ON COLUMN tramites.currency IS 'Currency for this trámite''s amounts: PEN (Soles) or USD (Dólares).';
