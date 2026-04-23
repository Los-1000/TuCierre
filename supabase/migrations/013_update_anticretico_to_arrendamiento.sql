DO $$ 
DECLARE
    v_arrendamiento_id UUID;
    v_anticretico_id UUID;
BEGIN
    -- 1. Obtener los IDs de ambos si es que existen
    SELECT id INTO v_arrendamiento_id FROM tramite_types WHERE name = 'arrendamiento';
    SELECT id INTO v_anticretico_id FROM tramite_types WHERE name = 'anticretico';

    -- 2. Asegurarse de que el registro 'arrendamiento' esté activo y tenga la data correcta
    IF v_arrendamiento_id IS NOT NULL THEN
        UPDATE tramite_types
        SET 
          display_name = 'Arrendamiento',
          description = 'Contrato de arrendamiento sobre inmueble',
          required_documents = '[{"name":"DNI Propietario","description":"DNI vigente del propietario"},{"name":"DNI Arrendatario","description":"DNI vigente del arrendatario"},{"name":"Partida Registral","description":"Partida registral del inmueble"},{"name":"HR y PU","description":"Hoja de resumen y predio urbano vigentes"}]'::jsonb,
          is_active = true
        WHERE id = v_arrendamiento_id;
    END IF;

    -- 3. Si hay trámites bajo 'anticretico', migrarlos a 'arrendamiento'
    IF v_arrendamiento_id IS NOT NULL AND v_anticretico_id IS NOT NULL THEN
        -- Migrar registros de tramites
        UPDATE tramites 
        SET tramite_type_id = v_arrendamiento_id 
        WHERE tramite_type_id = v_anticretico_id;
        
        -- Migrar registros de solicitudes de price match
        UPDATE price_match_requests 
        SET tramite_type_id = v_arrendamiento_id 
        WHERE tramite_type_id = v_anticretico_id;
        
        -- 4. Una vez migrados los datos, borrar el tipo viejo para evitar basura
        DELETE FROM tramite_types WHERE id = v_anticretico_id;
    END IF;

END $$;
