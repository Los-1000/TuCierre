-- Categorías de trámite y documentos requeridos.
-- Categorías activas finales: Compra y Venta, Donación, Arriendo.
-- Documentos requeridos (los mismos para las 3 categorías):
--   HR, PU, Copia Literal, Constancia de no adeudo, Poder del apoderado.

-- 1. Asegurar que exista la categoría 'donacion' (no estaba en el seed inicial).
INSERT INTO tramite_types (name, display_name, description, base_price, estimated_days, required_documents, is_active)
VALUES (
  'donacion',
  'Donación',
  'Donación de inmueble a tercero',
  700.00,
  5,
  '[]'::jsonb,
  true
)
ON CONFLICT (name) DO UPDATE
SET display_name = EXCLUDED.display_name,
    description  = EXCLUDED.description,
    is_active    = true;

-- 2. Aplicar la misma lista de 5 documentos requeridos y activar las 3 categorías.
UPDATE tramite_types
SET required_documents = '[
  {"name":"HR","description":"Hoja de Resumen (HR) vigente del predio"},
  {"name":"PU","description":"Predio Urbano (PU) vigente del predio"},
  {"name":"Copia Literal","description":"Copia literal de la partida registral del inmueble"},
  {"name":"Constancia de no adeudo","description":"Constancia de no adeudo de tributos municipales"},
  {"name":"Poder del apoderado","description":"Poder vigente que acredita al apoderado"}
]'::jsonb,
    is_active = true
WHERE name IN ('compraventa', 'donacion', 'arrendamiento');

-- 3. Normalizar los nombres visibles a los solicitados.
UPDATE tramite_types SET display_name = 'Compra y Venta' WHERE name = 'compraventa';
UPDATE tramite_types SET display_name = 'Arriendo'        WHERE name = 'arrendamiento';

-- 4. Desactivar cualquier otra categoría para que solo queden las 3 anteriores.
UPDATE tramite_types
SET is_active = false
WHERE name NOT IN ('compraventa', 'donacion', 'arrendamiento');
