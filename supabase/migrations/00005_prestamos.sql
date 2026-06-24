create table if not exists public.prestamos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.usuarios(id) on delete cascade,
  persona text not null,
  monto numeric not null check (monto > 0),
  tipo text not null check (tipo in ('prestado', 'deuda')),
  tasa_interes numeric not null default 0 check (tasa_interes >= 0),
  fecha_prestamo date not null default current_date,
  fecha_pago date,
  pagado boolean not null default false,
  notas text,
  created_at timestamptz not null default now()
);

create index if not exists idx_prestamos_user on public.prestamos(user_id);

alter table public.prestamos enable row level security;

create policy "prestamos_select_own" on public.prestamos for select using (auth.uid() = user_id);
create policy "prestamos_insert_own" on public.prestamos for insert with check (auth.uid() = user_id);
create policy "prestamos_update_own" on public.prestamos for update using (auth.uid() = user_id);
create policy "prestamos_delete_own" on public.prestamos for delete using (auth.uid() = user_id);
