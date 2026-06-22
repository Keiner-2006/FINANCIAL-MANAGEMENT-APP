import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VehicleDetail } from "@/components/vehiculos/vehicle-detail"
import type { Vehiculo, DocumentoActivo, Gasto, HistorialServicio } from "@/lib/types"

export default async function VehiculoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: vehiculo } = await supabase
    .from("vehiculos")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!vehiculo) notFound()

  const [{ data: documentos }, { data: gastos }, { data: servicios }] = await Promise.all([
    supabase.from("documentos_activos").select("*").eq("user_id", user.id).eq("vehiculo_id", id),
    supabase
      .from("gastos")
      .select("*")
      .eq("user_id", user.id)
      .eq("vehiculo_id", id)
      .order("fecha", { ascending: false }),
    supabase
      .from("historial_servicios")
      .select("*")
      .eq("user_id", user.id)
      .eq("vehiculo_id", id)
      .order("fecha_realizacion", { ascending: false }),
  ])

  return (
    <main className="mx-auto min-h-svh w-full max-w-md bg-background pb-24">
      <VehicleDetail
        vehiculo={vehiculo as Vehiculo}
        documentos={(documentos ?? []) as DocumentoActivo[]}
        gastos={(gastos ?? []) as Gasto[]}
        servicios={(servicios ?? []) as HistorialServicio[]}
      />
    </main>
  )
}
