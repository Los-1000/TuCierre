-- =====================================================
-- 007_admin_rls_final.sql
-- Solución definitiva para RLS de admin.
-- Ejecutar completo en Supabase SQL Editor.
-- =====================================================

-- 1. Limpiar todo lo anterior
DROP POLICY IF EXISTS "brokers_select_admin"      ON brokers;
DROP POLICY IF EXISTS "brokers_select_notarias"   ON brokers;
DROP POLICY IF EXISTS "tramites_select_admin"     ON tramites;
DROP POLICY IF EXISTS "tramites_update_admin"     ON tramites;
DROP POLICY IF EXISTS "history_select_admin"      ON tramite_status_history;
DROP POLICY IF EXISTS "history_insert_admin"      ON tramite_status_history;
DROP POLICY IF EXISTS "messages_select_admin"     ON messages;
DROP POLICY IF EXISTS "messages_insert_admin"     ON messages;
DROP POLICY IF EXISTS "price_match_select_admin"  ON price_match_requests;
DROP POLICY IF EXISTS "price_match_update_admin"  ON price_match_requests;
DROP POLICY IF EXISTS "tramite_types_manage_admin" ON tramite_types;

DROP FUNCTION IF EXISTS public.is_admin_user();

-- 2. Función helper sin recursión
--    SECURITY DEFINER = corre como superusuario, bypasea RLS
--    auth.uid() sigue funcionando (lee del JWT, no de tabla)
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

-- Dar acceso a anon y authenticated
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO anon, authenticated;

-- 3. Políticas de brokers
--    Cualquier usuario autenticado puede ver filas de notarías (is_admin=true)
--    → necesario para el selector de notaría en cotizador
CREATE POLICY "brokers_select_notarias" ON brokers
  FOR SELECT USING (is_admin = true);

--    Admins pueden ver TODOS los brokers (sin recursión, usa la función)
CREATE POLICY "brokers_select_admin" ON brokers
  FOR SELECT USING (public.is_admin_user());

-- 4. Políticas de tramites
CREATE POLICY "tramites_select_admin" ON tramites
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "tramites_update_admin" ON tramites
  FOR UPDATE USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- 5. Status history
CREATE POLICY "history_select_admin" ON tramite_status_history
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "history_insert_admin" ON tramite_status_history
  FOR INSERT WITH CHECK (public.is_admin_user());

-- 6. Mensajes
CREATE POLICY "messages_select_admin" ON messages
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "messages_insert_admin" ON messages
  FOR INSERT WITH CHECK (
    sender_type = 'admin' AND public.is_admin_user()
  );

-- 7. Price match
CREATE POLICY "price_match_select_admin" ON price_match_requests
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "price_match_update_admin" ON price_match_requests
  FOR UPDATE USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- 8. Tipos de trámite (admins pueden gestionar)
CREATE POLICY "tramite_types_manage_admin" ON tramite_types
  FOR ALL USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Verificación: debería mostrar las políticas creadas
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE policyname LIKE '%admin%' OR policyname LIKE '%notaria%'
ORDER BY tablename, policyname;
