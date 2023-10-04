-- TRANSACCIONES por cuenta
SELECT cuenta_id, tipo, SUM(monto) 
FROM proyecto2.transacciones
WHERE tipo='deposito'
GROUP BY cuenta_id, tipo
ORDER BY cuenta_id ASC;

SELECT cuenta_id, tipo, SUM(monto) 
FROM proyecto2.transacciones
WHERE tipo='retiro'
GROUP BY cuenta_id, tipo
ORDER BY cuenta_id ASC;

-- TRANSACCIONES total
SELECT SUM(monto)
FROM proyecto2.transacciones
WHERE tipo="deposito";

-- Total saldo en cuentas 
SELECT SUM(saldo) 
FROM proyecto2.cuentas;

-- BORRADO de transacciones y cuentas
DELETE FROM proyecto2.transacciones;
UPDATE proyecto2.cuentas SET saldo=0;

-- TODO de momento deposito ni retiros tienen bloqueos, funciona mal que es lo esperado

-- TODO las transferencias estan haciendo mas de 6000 transacciones y deben ser 6000

SELECT COUNT(*) FROM proyecto2.transacciones;

