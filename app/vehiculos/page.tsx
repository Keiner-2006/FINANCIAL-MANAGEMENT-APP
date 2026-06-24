import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VehicleList } from "@/components/vehiculos/vehicle-list"
import type { Vehiculo, DocumentoActivo } from "@/lib/types"

export default async function VehiculosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  let [{ data: vehiculos }, { data: documentos }] = await Promise.all([
    supabase.from("vehiculos").select("*").eq("user_id", user.id).eq("activo", true).order("created_at", { ascending: false }),
    supabase.from("documentos_activos").select("*").eq("user_id", user.id),
  ])

  if ((vehiculos ?? []).length === 0) {
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("tiene_vehiculo, tipo_vehiculo")
      .eq("id", user.id)
      .maybeSingle()

    if (usuario?.tiene_vehiculo && usuario.tipo_vehiculo && usuario.tipo_vehiculo !== "ninguno") {
      const { data: existente } = await supabase
        .from("vehiculos")
        .select("*")
        .eq("user_id", user.id)
        .eq("tipo", usuario.tipo_vehiculo)
          .order("activo", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()

        if (existente) {
          if (!existente.activo) {
            const { data: vehiculoActivado, error: errActivar } = await supabase
              .from("vehiculos")
              .update({ activo: true })
              .eq("id", existente.id)
              .select("*")
              .single()

            if (!errActivar && vehiculoActivado) {
              vehiculos = [vehiculoActivado as Vehiculo]
            } else {
              vehiculos = [existente as Vehiculo]
            }
          } else {
            vehiculos = [existente as Vehiculo]
          }
            tipo: usuario.tipo_vehiculo,
          })
          .select("*")
          .single()

        if (nuevoVehiculo) {
          vehiculos = [nuevoVehiculo as Vehiculo]
        }
      }
    }
  }

  return (
    <main className="mx-auto min-h-svh w-full max-w-md bg-background pb-24">
      <VehicleList
        vehiculos={(vehiculos ?? []) as Vehiculo[]}
        documentos={(documentos ?? []) as DocumentoActivo[]}
      />
    </main>
  )
}
