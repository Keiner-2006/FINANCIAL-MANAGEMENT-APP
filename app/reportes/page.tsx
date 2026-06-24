import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ReportsDashboard } from "@/components/reports/reports-dashboard"
import type { Gasto, IngresoExtra, MetodoPago, Vehiculo } from "@/lib/types"

export default async function ReportesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const seisMesesAtras = new Date()
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6)
  const inicioISO = seisMesesAtras.toISOString().slice(0, 10)

  const [{ data: gastos }, { data: ingresos }, { data: metodos }, { data: vehiculos }] =
    await Promise.all([
      supabase
        .from("gastos")
        .select("*")
        .eq("user_id", user.id)
        .gte("fecha", inicioISO)
        .order("fecha", { ascending: false }),
      supabase
        .from("ingresos_extra")
        .select("*")
        .eq("user_id", user.id)
        .gte("fecha", inicioISO)
        .order("fecha", { ascending: false }),
      supabase.from("metodos_pago").select("*").eq("user_id", user.id).eq("activo", true),
      supabase.from("vehiculos").select("*").eq("user_id", user.id).eq("activo", true),
    ])

  return (
    <main className="mx-auto min-h-svh w-full max-w-md bg-background pb-24">
      <ReportsDashboard
        gastos={(gastos ?? []) as Gasto[]}
        ingresos={(ingresos ?? []) as IngresoExtra[]}
        metodos={(metodos ?? []) as MetodoPago[]}
        vehiculos={(vehiculos ?? []) as Vehiculo[]}
      />
    </main>
  )
}
