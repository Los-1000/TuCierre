-- Asigna la notaría "Ramos" a la cuenta admin cefd2350@gmail.com
UPDATE brokers
SET
  notaria_name    = 'Notaría Ramos',
  notaria_address = 'Lima, Perú'
WHERE email = 'cefd2350@gmail.com';
