-- 004: Admin role + referral code processing

-- 1. Add is_admin flag to brokers
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Update handle_new_user to:
--    - Auto-generate referral code for every broker
--    - Process referral_code_used from signup metadata
--    - Auto-mark cefd2350@gmail.com as admin
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_referral_code TEXT;
  v_referral_code_used TEXT;
  v_referrer_id UUID;
  v_is_admin BOOLEAN;
  v_dni TEXT;
BEGIN
  -- Check if this is the admin account
  v_is_admin := (NEW.email = 'cefd2350@gmail.com');

  -- Admin gets a placeholder DNI to avoid UNIQUE conflicts with empty string
  IF v_is_admin THEN
    v_dni := 'ADMIN-' || substr(NEW.id::text, 1, 8);
  ELSE
    v_dni := COALESCE(NEW.raw_user_meta_data->>'dni', '');
  END IF;

  -- Generate a unique referral code: TC-XXXXXX
  v_referral_code := 'TC-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  -- Process referral code (only for regular brokers)
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

  -- Create referral bonus for the referrer
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

-- 3. Generate referral codes for existing brokers that don't have one
UPDATE brokers
SET referral_code = 'TC-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 6))
WHERE referral_code IS NULL;

-- 4. If admin already exists in auth.users but not yet in brokers, insert them
INSERT INTO public.brokers (id, email, full_name, phone, dni, is_admin, referral_code)
SELECT
  au.id,
  au.email,
  'Administrador',
  '',
  'ADMIN-' || substr(au.id::text, 1, 8),
  true,
  'TC-ADMIN1'
FROM auth.users au
LEFT JOIN public.brokers b ON b.id = au.id
WHERE au.email = 'cefd2350@gmail.com'
  AND b.id IS NULL
ON CONFLICT DO NOTHING;

-- 5. Ensure existing broker row for admin email has is_admin = true
UPDATE public.brokers
SET is_admin = true
WHERE email = 'cefd2350@gmail.com';
