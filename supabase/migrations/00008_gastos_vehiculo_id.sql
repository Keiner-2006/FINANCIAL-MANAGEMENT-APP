-- Add vehiculo_id to gastos so vehicle detail can filter by vehicle
alter table public.gastos
  add column if not exists vehiculo_id uuid references public.vehiculos(id) on delete set null;

create index if not exists idx_gastos_vehiculo
  on public.gastos(vehiculo_id);
