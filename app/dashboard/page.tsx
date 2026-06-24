import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getPeriodoActual, calcularAlmuerzos, esFechaCierre } from "@/lib/finance"
import { Dashboard } from "@/components/dashboard/dashboard"
import type { Gasto, MetodoPago, DocumentoActivo, Usuario, ObligacionFinanciera, IngresoExtra, Prestamo } from "@/lib/types"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: usuario } = await supabase.from("usuarios").select("*").eq("id", user.id).maybeSingle()

  if (!usuario) redirect("/auth/login")
  if (!usuario.onboarding_completo) redirect("/onboarding")

  const periodo = getPeriodoActual(usuario.tipo_ingreso)

  const [
    { data: metodos },
    { data: documentos },
    { data: gastos },
    { data: excluidosRows },
    { data: obligaciones },
    { data: ingresosExtraRows },
    { data: prestamosRows },
  ] = await Promise.all([
    supabase.from("metodos_pago").select("*").eq("user_id", user.id).eq("activo", true),
    supabase.from("documentos_activos").select("*").eq("user_id", user.id),
    supabase
      .from("gastos")
      .select("*")
      .eq("user_id", user.id)
      .gte("fecha", periodo.inicioISO)
      .lte("fecha", periodo.finISO)
      .order("fecha", { ascending: false }),
    supabase
      .from("almuerzos_excluidos")
      .select("fecha")
      .eq("user_id", user.id)
      .gte("fecha", periodo.inicioISO)
      .lte("fecha", periodo.finISO),
    supabase
      .from("obligaciones_financieras")
      .select("*")
      .eq("user_id", user.id)
      .eq("activo", true),
    supabase
      .from("ingresos_extra")
      .select("*")
      .eq("user_id", user.id)
      .gte("fecha", periodo.inicioISO)
      .lte("fecha", periodo.finISO)
      .order("fecha", { ascending: false }),
    supabase
      .from("prestamos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ])

  const excluidos = (excluidosRows ?? []).map((r) => r.fecha as string)
  const almuerzos = usuario.almuerzos_activos
    ? calcularAlmuerzos(periodo, Number(usuario.valor_almuerzo_diario), excluidos)
    : { diasContados: 0, total: 0 }

  return (
    <>
      <Dashboard
      usuario={usuario as Usuario}
      metodos={(metodos ?? []) as MetodoPago[]}
      documentos={(documentos ?? []) as DocumentoActivo[]}
      gastos={(gastos ?? []) as Gasto[]}
      obligaciones={(obligaciones ?? []) as ObligacionFinanciera[]}
      ingresosExtra={(ingresosExtraRows ?? []) as IngresoExtra[]}
      prestamos={(prestamosRows ?? []) as Prestamo[]}
      excluidos={excluidos}
      periodo={{
        inicioISO: periodo.inicioISO,
        finISO: periodo.finISO,
        label: periodo.label,
      }}
      almuerzosTotal={almuerzos.total}
      almuerzosDias={almuerzos.diasContados}
      esCierre={esFechaCierre(usuario.dia_pago)}
    />
    </>
  )
}
