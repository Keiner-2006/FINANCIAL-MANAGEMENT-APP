-- 1. Crear tabla vehiculos si no existe
create table if not exists public.vehiculos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.usuarios(id) on delete cascade,
  nombre text not null,
  placa text,
  tipo text not null check (tipo in ('moto','carro')),
  modelo text,
  anio integer check (anio >= 1950 and anio <= 2100),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_vehiculos_user on public.vehiculos(user_id);

alter table public.vehiculos enable row level security;

create policy "vehiculos_select_own" on public.vehiculos for select using (auth.uid() = user_id);
create policy "vehiculos_insert_own" on public.vehiculos for insert with check (auth.uid() = user_id);
create policy "vehiculos_update_own" on public.vehiculos for update using (auth.uid() = user_id);
create policy "vehiculos_delete_own" on public.vehiculos for delete using (auth.uid() = user_id);

-- 2. Sincronizar vehículos: si el usuario tiene tiene_vehiculo=true pero no tiene registro en vehiculos, crearlo
insert into public.vehiculos (user_id, nombre, tipo)
select
  u.id,
  case when u.tipo_vehiculo = 'moto' then 'Mi moto' else 'Mi carro' end,
  u.tipo_vehiculo
from public.usuarios u
where u.tiene_vehiculo = true
  and u.tipo_vehiculo is not null
  and u.tipo_vehiculo != 'ninguno'
  and not exists (
    select 1 from public.vehiculos v
    where v.user_id = u.id and v.activo = true
  );
