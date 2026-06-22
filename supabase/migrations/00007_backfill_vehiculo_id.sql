-- Add vehiculo_id column if missing (originally from migration 00004)
alter table public.documentos_activos
  add column if not exists vehiculo_id uuid references public.vehiculos(id) on delete cascade;

-- Backfill vehiculo_id for existing rows that have NULL vehiculo_id.
-- Strategy:
--   1) Match by exact vehicle name (documentos.vehiculo = vehiculos.nombre)
--   2) If user has only ONE vehicle, link all their unlinked documents to it
--   3) Otherwise, try matching by normalized name (lowercase, trimmed)
update public.documentos_activos d
set vehiculo_id = v.id
from public.vehiculos v
where d.user_id = v.user_id
  and d.vehiculo_id is null
  and (
    d.vehiculo = v.nombre
    or (
      (select count(*) from public.vehiculos v2 where v2.user_id = d.user_id and v2.activo = true) = 1
      and v.activo = true
    )
    or lower(trim(d.vehiculo)) = lower(trim(v.nombre))
  );
