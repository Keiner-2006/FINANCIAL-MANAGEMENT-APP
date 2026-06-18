create extension if not exists "pgcrypto";

create table if not exists public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  tipo_ingreso text not null default 'mensual' check (tipo_ingreso in ('quincenal','mensual')),
  monto_ingreso numeric not null default 0 check (monto_ingreso >= 0),
  dia_pago integer not null default 30 check (dia_pago between 1 and 31),
  valor_almuerzo_diario numeric not null default 0 check (valor_almuerzo_diario >= 0),
  almuerzos_activos boolean not null default false,
  tiene_vehiculo boolean not null default false,
  tipo_vehiculo text check (tipo_vehiculo in ('moto','carro','ninguno')),
  tiene_brilla boolean not null default false,
  cuota_brilla numeric not null default 0 check (cuota_brilla >= 0),
  saldo_ahorros numeric not null default 0 check (saldo_ahorros >= 0),
  onboarding_completo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.metodos_pago (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.usuarios(id) on delete cascade,
  nombre text not null,
  tipo text not null,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_metodos_pago_user on public.metodos_pago(user_id);

create table if not exists public.obligaciones_financieras (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.usuarios(id) on delete cascade,
  nombre text not null,
  tipo text not null check (tipo in ('fijo','variable')),
  categoria text not null,
  monto numeric not null default 0 check (monto >= 0),
  meses_restantes integer check (meses_restantes >= 1),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_obligaciones_user on public.obligaciones_financieras(user_id);

create table if not exists public.documentos_activos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.usuarios(id) on delete cascade,
  vehiculo text not null,
  tipo text not null check (tipo in ('soat','tecnomecanica')),
  fecha_vencimiento date not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_documentos_user on public.documentos_activos(user_id);

create table if not exists public.gastos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.usuarios(id) on delete cascade,
  categoria text not null,
  subcategoria text,
  monto numeric not null check (monto > 0),
  fecha date not null default current_date,
  metodo_pago_id uuid references public.metodos_pago(id) on delete set null,
  descripcion text,
  pagado_con_ahorros boolean not null default false,
  numero_cuotas integer not null default 1 check (numero_cuotas >= 1),
  es_diferido boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_gastos_user on public.gastos(user_id);
create index if not exists idx_gastos_user_fecha on public.gastos(user_id, fecha);

create table if not exists public.almuerzos_excluidos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.usuarios(id) on delete cascade,
  fecha date not null,
  created_at timestamptz not null default now(),
  unique (user_id, fecha)
);

create index if not exists idx_almuerzos_excluidos_user on public.almuerzos_excluidos(user_id);

alter table public.usuarios enable row level security;
alter table public.metodos_pago enable row level security;
alter table public.obligaciones_financieras enable row level security;
alter table public.documentos_activos enable row level security;
alter table public.gastos enable row level security;
alter table public.almuerzos_excluidos enable row level security;

create policy "usuarios_select_own" on public.usuarios for select using (auth.uid() = id);
create policy "usuarios_insert_own" on public.usuarios for insert with check (auth.uid() = id);
create policy "usuarios_update_own" on public.usuarios for update using (auth.uid() = id);

create policy "metodos_pago_select_own" on public.metodos_pago for select using (auth.uid() = user_id);
create policy "metodos_pago_insert_own" on public.metodos_pago for insert with check (auth.uid() = user_id);
create policy "metodos_pago_update_own" on public.metodos_pago for update using (auth.uid() = user_id);
create policy "metodos_pago_delete_own" on public.metodos_pago for delete using (auth.uid() = user_id);

create policy "obligaciones_select_own" on public.obligaciones_financieras for select using (auth.uid() = user_id);
create policy "obligaciones_insert_own" on public.obligaciones_financieras for insert with check (auth.uid() = user_id);
create policy "obligaciones_update_own" on public.obligaciones_financieras for update using (auth.uid() = user_id);
create policy "obligaciones_delete_own" on public.obligaciones_financieras for delete using (auth.uid() = user_id);

create policy "documentos_select_own" on public.documentos_activos for select using (auth.uid() = user_id);
create policy "documentos_insert_own" on public.documentos_activos for insert with check (auth.uid() = user_id);
create policy "documentos_update_own" on public.documentos_activos for update using (auth.uid() = user_id);
create policy "documentos_delete_own" on public.documentos_activos for delete using (auth.uid() = user_id);

create policy "gastos_select_own" on public.gastos for select using (auth.uid() = user_id);
create policy "gastos_insert_own" on public.gastos for insert with check (auth.uid() = user_id);
create policy "gastos_update_own" on public.gastos for update using (auth.uid() = user_id);
create policy "gastos_delete_own" on public.gastos for delete using (auth.uid() = user_id);

create policy "almuerzos_excluidos_select_own" on public.almuerzos_excluidos for select using (auth.uid() = user_id);
create policy "almuerzos_excluidos_insert_own" on public.almuerzos_excluidos for insert with check (auth.uid() = user_id);
create policy "almuerzos_excluidos_delete_own" on public.almuerzos_excluidos for delete using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.usuarios (id, nombre)
  values (new.id, new.raw_user_meta_data ->> 'nombre');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
