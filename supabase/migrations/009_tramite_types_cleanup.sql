-- Desactivar tipos de trámite no utilizados.
-- Solo se mantienen activos: compraventa y arrendamiento.
UPDATE tramite_types
SET is_active = false
WHERE name IN ('hipoteca', 'poder', 'constitucion_empresa', 'levantamiento_hipoteca');
