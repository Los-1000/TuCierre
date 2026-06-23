-- Agrega "Foto del DNI" como documento requerido en las 3 categorías activas.
-- Lista final (6 documentos): Foto del DNI, HR, PU, Copia Literal,
-- Constancia de no adeudo, Poder del apoderado.
UPDATE tramite_types
SET required_documents = '[
  {"name":"Foto del DNI","description":"Foto legible del DNI vigente de las partes"},
  {"name":"HR","description":"Hoja de Resumen (HR) vigente del predio"},
  {"name":"PU","description":"Predio Urbano (PU) vigente del predio"},
  {"name":"Copia Literal","description":"Copia literal de la partida registral del inmueble"},
  {"name":"Constancia de no adeudo","description":"Constancia de no adeudo de tributos municipales"},
  {"name":"Poder del apoderado","description":"Poder vigente que acredita al apoderado"}
]'::jsonb
WHERE name IN ('compraventa', 'donacion', 'arrendamiento');
