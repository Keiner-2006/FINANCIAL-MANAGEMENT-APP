"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface OnboardingPayload {
  tipo_ingreso: "quincenal" | "mensual"
  monto_ingreso: number
  dia_pago: number
  // metodos de pago
  metodos: { tipo: string; nombre: string; bolsillo?: boolean; saldo_bolsillo?: number }[]
  // vehiculo
  tiene_vehiculo: boolean
  tipo_vehiculo: "moto" | "carro" | "ninguno"
  placa_vehiculo?: string
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

  // 2. Limpiar y crear metodos de pago
  await supabase.from("metodos_pago").delete().eq("user_id", user.id)
  const metodosBase = payload.metodos.map((m) => ({
    user_id: user.id,
    tipo: m.tipo,
    nombre: m.nombre,
    activo: true,
  }))
  const { error: errMetodos } = await supabase.from("metodos_pago").insert(metodosBase)
  if (errMetodos) return { error: errMetodos.message }

  // 2.1 Si hay saldos de bolsillo, sumarlos al saldo de ahorros
  const totalBolsillo = payload.metodos
    .filter((m) => m.bolsillo && m.saldo_bolsillo && m.saldo_bolsillo > 0)
    .reduce((acc, m) => acc + (m.saldo_bolsillo ?? 0), 0)
  if (totalBolsillo > 0) {
    const { data: usuario } = await supabase.from("usuarios").select("saldo_ahorros").eq("id", user.id).single()
    const saldoActual = Number(usuario?.saldo_ahorros ?? 0)
    await supabase.from("usuarios").update({ saldo_ahorros: saldoActual + totalBolsillo }).eq("id", user.id)
  }

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

  // 4. Vehiculo + documentos de activos
  if (payload.tiene_vehiculo && payload.tipo_vehiculo !== "ninguno") {
    const { data: existingVehiculo } = await supabase
      .from("vehiculos")
      .select("id")
      .eq("user_id", user.id)
      .eq("tipo", payload.tipo_vehiculo)
      .eq("activo", true)
      .limit(1)
      .maybeSingle()

    let vehiculoId = existingVehiculo?.id

    if (vehiculoId) {
      if (payload.placa_vehiculo?.trim()) {
        await supabase
          .from("vehiculos")
          .update({ placa: payload.placa_vehiculo.trim() })
          .eq("id", vehiculoId)
          .eq("user_id", user.id)
      }
    } else {
      const { data: nuevoVehiculo, error: errVehiculo } = await supabase
        .from("vehiculos")
        .insert({
          user_id: user.id,
          nombre: payload.tipo_vehiculo === "moto" ? "Mi moto" : "Mi carro",
          tipo: payload.tipo_vehiculo,
          placa: payload.placa_vehiculo?.trim() || null,
        })
        .select("id")
        .single()

      if (errVehiculo) return { error: errVehiculo.message }
      vehiculoId = nuevoVehiculo.id
    }

    await supabase.from("documentos_activos").delete().eq("user_id", user.id)
    if (payload.documentos.length > 0) {
      const docs = payload.documentos
        .filter((d) => d.fecha_vencimiento)
        .map((d) => ({
          user_id: user.id,
          vehiculo_id: vehiculoId,
          vehiculo: payload.tipo_vehiculo,
          tipo: d.tipo,
          fecha_vencimiento: d.fecha_vencimiento,
        }))
      if (docs.length > 0) {
        const { error: errDocs } = await supabase.from("documentos_activos").insert(docs)
        if (errDocs) return { error: errDocs.message }
      }
    }
  } else {
    await supabase.from("documentos_activos").delete().eq("user_id", user.id)
  }

  revalidatePath("/", "layout")
  return { success: true }
}
