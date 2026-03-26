-- Ejecutar este script en Supabase > SQL Editor
-- DESPUÉS de crear el usuario cefd2350@gmail.com desde Authentication > Users

-- Esto asegura que el usuario admin tenga is_admin = true
-- (el trigger lo hace automáticamente al registrarse, pero por si acaso)
UPDATE public.brokers
SET is_admin = true
WHERE email = 'cefd2350@gmail.com';

-- Verificar
SELECT id, email, full_name, is_admin FROM brokers WHERE email = 'cefd2350@gmail.com';
