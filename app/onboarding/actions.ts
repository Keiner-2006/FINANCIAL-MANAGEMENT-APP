"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface OnboardingPayload {
  tipo_ingreso: "quincenal" | "mensual"
  monto_ingreso: number
  dia_pago: number
  // metodos de pago adicionales (efectivo y nequi siempre activos)
  metodos: { tipo: string; nombre: string }[]
  // vehiculo
  tiene_vehiculo: boolean
  tipo_vehiculo: "moto" | "carro" | "ninguno"
  documentos: { tipo: "soat" | "tecnomecanica"; fecha_vencimiento: string }[]
  // brilla / gas
  tiene_brilla: boolean
  cuota_brilla: number
  // almuerzos
  almuerzos_activos: boolean
  valor_almuerzo_diario: number
  // bolsillo nequi
  saldo_ahorros_inicial: number
}

export async function guardarOnboarding(payload: OnboardingPayload) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autenticado" }
  }

  // 1. Crear o actualizar perfil de usuario (upsert)
  const { error: errUsuario } = await supabase
    .from("usuarios")
    .upsert({
      id: user.id,
      nombre: user.user_metadata?.nombre ?? null,
      tipo_ingreso: payload.tipo_ingreso,
      monto_ingreso: payload.monto_ingreso,
      dia_pago: payload.dia_pago,
      tiene_vehiculo: payload.tiene_vehiculo,
      tipo_vehiculo: payload.tipo_vehiculo,
      tiene_brilla: payload.tiene_brilla,
      cuota_brilla: payload.tiene_brilla ? payload.cuota_brilla : 0,
      almuerzos_activos: payload.almuerzos_activos,
      valor_almuerzo_diario: payload.almuerzos_activos ? payload.valor_almuerzo_diario : 0,
      saldo_ahorros: payload.saldo_ahorros_inicial,
      onboarding_completo: true,
    })

  if (errUsuario) return { error: errUsuario.message }

  // 2. Limpiar y crear metodos de pago (efectivo y nequi siempre)
  await supabase.from("metodos_pago").delete().eq("user_id", user.id)
  const metodosBase = [
    { user_id: user.id, tipo: "efectivo", nombre: "Efectivo", activo: true },
    { user_id: user.id, tipo: "nequi", nombre: "Nequi", activo: true },
    ...payload.metodos.map((m) => ({
      user_id: user.id,
      tipo: m.tipo,
      nombre: m.nombre,
      activo: true,
    })),
  ]
  const { error: errMetodos } = await supabase.from("metodos_pago").insert(metodosBase)
  if (errMetodos) return { error: errMetodos.message }

  // 3. Obligacion financiera Brilla (si aplica)
  await supabase.from("obligaciones_financieras").delete().eq("user_id", user.id).eq("categoria", "deuda_brilla")
  if (payload.tiene_brilla && payload.cuota_brilla > 0) {
    const { error: errOblig } = await supabase.from("obligaciones_financieras").insert({
      user_id: user.id,
      nombre: "Cuota Brilla (financiación)",
      tipo: "fijo",
      categoria: "deuda_brilla",
      monto: payload.cuota_brilla,
      activo: true,
    })
    if (errOblig) return { error: errOblig.message }
  }

  // 4. Documentos de activos (vehiculo)
  await supabase.from("documentos_activos").delete().eq("user_id", user.id)
  if (payload.tiene_vehiculo && payload.documentos.length > 0) {
    const docs = payload.documentos
      .filter((d) => d.fecha_vencimiento)
      .map((d) => ({
        user_id: user.id,
        vehiculo: payload.tipo_vehiculo,
        tipo: d.tipo,
        fecha_vencimiento: d.fecha_vencimiento,
      }))
    if (docs.length > 0) {
      const { error: errDocs } = await supabase.from("documentos_activos").insert(docs)
      if (errDocs) return { error: errDocs.message }
    }
  }

  revalidatePath("/", "layout")
  return { success: true }
}
