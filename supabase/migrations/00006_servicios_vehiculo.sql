-- Add fecha_realizacion to documentos_activos
alter table public.documentos_activos
  add column if not exists fecha_realizacion date;

-- Allow aceite as a tipo
alter table public.documentos_activos
  drop constraint if exists documentos_activos_tipo_check;

alter table public.documentos_activos
  add constraint documentos_activos_tipo_check
    check (tipo in ('soat', 'tecnomecanica', 'aceite'));

-- New table for general service history
create table if not exists public.historial_servicios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.usuarios(id) on delete cascade,
  vehiculo_id uuid not null references public.vehiculos(id) on delete cascade,
  nombre text not null,
  monto numeric not null check (monto >= 0),
  fecha_realizacion date not null,
  notas text,
  created_at timestamptz not null default now()
);

create index if not exists idx_historial_servicios_user
  on public.historial_servicios(user_id);

create index if not exists idx_historial_servicios_vehiculo
  on public.historial_servicios(vehiculo_id);

alter table public.historial_servicios enable row level security;

drop policy if exists "historial_servicios_select_own" on public.historial_servicios;
create policy "historial_servicios_select_own"
  on public.historial_servicios for select
  using (auth.uid() = user_id);

drop policy if exists "historial_servicios_insert_own" on public.historial_servicios;
create policy "historial_servicios_insert_own"
  on public.historial_servicios for insert
  with check (auth.uid() = user_id);

drop policy if exists "historial_servicios_delete_own" on public.historial_servicios;
create policy "historial_servicios_delete_own"
  on public.historial_servicios for delete
  using (auth.uid() = user_id);
