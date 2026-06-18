-- ============================================================
-- MÓDULO DE TARJETAS DE CRÉDITO - Gastos financiados
-- ============================================================

-- 1. Agregar columna numero_cuotas a gastos (1 = corriente, >1 = diferido)
alter table public.gastos
  add column if not exists numero_cuotas integer not null default 1 check (numero_cuotas >= 1);

-- 2. Agregar columna es_diferido para filtrar gastos diferidos del flujo de caja
alter table public.gastos
  add column if not exists es_diferido boolean not null default false;

-- 3. Agregar columna meses_restantes a obligaciones_financieras
--    para rastrear la vigencia de financiaciones
alter table public.obligaciones_financieras
  add column if not exists meses_restantes integer check (meses_restantes >= 1);
