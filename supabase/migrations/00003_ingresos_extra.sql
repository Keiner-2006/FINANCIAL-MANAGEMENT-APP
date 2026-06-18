-- ============================================================
-- MÓDULO DE INGRESOS EXTRA
-- Permite registrar ingresos adicionales por periodo
-- (bonos, trabajo extra, regalos, etc.)
-- ============================================================

-- 1. TABLA: ingresos_extra
create table if not exists public.ingresos_extra (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.usuarios(id) on delete cascade,
  monto       numeric not null check (monto > 0),
  fecha       date not null default current_date,
  descripcion text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_ingresos_extra_user on public.ingresos_extra(user_id);
create index if not exists idx_ingresos_extra_user_fecha on public.ingresos_extra(user_id, fecha);

-- 2. RLS
alter table public.ingresos_extra enable row level security;

create policy "ingresos_extra_select_own" on public.ingresos_extra
  for select using (auth.uid() = user_id);
create policy "ingresos_extra_insert_own" on public.ingresos_extra
  for insert with check (auth.uid() = user_id);
create policy "ingresos_extra_delete_own" on public.ingresos_extra
  for delete using (auth.uid() = user_id);
