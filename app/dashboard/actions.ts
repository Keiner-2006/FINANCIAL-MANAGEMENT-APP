"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, userId: user?.id ?? null }
}

export interface GastoInput {
  categoria: string
  subcategoria?: string | null
  monto: number
  fecha?: string
  metodo_pago_id?: string | null
  descripcion?: string | null
  pagado_con_ahorros?: boolean
  numero_cuotas?: number
}

// Registra un gasto. Si se paga con ahorros, debita del saldo del bolsillo.
// Si numero_cuotas > 1 (tarjeta de crédito), crea obligacion_financiera diferida.
export async function registrarGasto(input: GastoInput) {
  const { supabase, userId } = await getUserId()
  if (!userId) return { error: "No autenticado" }

  const pagadoConAhorros = input.pagado_con_ahorros ?? false
  const cuotas = input.numero_cuotas ?? 1
  const esDiferido = cuotas > 1

  if (esDiferido && pagadoConAhorros) {
    return { error: "No puedes pagar con ahorros un gasto financiado a cuotas." }
  }

  if (pagadoConAhorros) {
    const { data: usuario } = await supabase.from("usuarios").select("saldo_ahorros").eq("id", userId).single()
    const saldo = Number(usuario?.saldo_ahorros ?? 0)
    if (input.monto > saldo) {
      return { error: "Saldo de ahorros insuficiente para este gasto." }
    }
    const { error: errUpd } = await supabase
      .from("usuarios")
      .update({ saldo_ahorros: saldo - input.monto })
      .eq("id", userId)
    if (errUpd) return { error: errUpd.message }
  }

  const { error } = await supabase.from("gastos").insert({
    user_id: userId,
    categoria: input.categoria,
    subcategoria: input.subcategoria ?? null,
    monto: input.monto,
    fecha: input.fecha ?? new Date().toISOString().slice(0, 10),
    metodo_pago_id: input.metodo_pago_id ?? null,
    descripcion: input.descripcion ?? null,
    pagado_con_ahorros: pagadoConAhorros,
    numero_cuotas: cuotas,
    es_diferido: esDiferido,
  })
  if (error) return { error: error.message }

  // Si es diferido, crear obligacion financiera mensual
  if (esDiferido) {
    const montoMensual = Math.round(input.monto / cuotas)
    const { error: errOblig } = await supabase.from("obligaciones_financieras").insert({
      user_id: userId,
      nombre: `Financiación - ${input.descripcion || input.categoria}`,
      tipo: "fijo",
      categoria: "deuda_financiada",
      monto: montoMensual,
      meses_restantes: cuotas,
      activo: true,
    })
    if (errOblig) return { error: errOblig.message }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

// Registra el recibo mixto Brilla/Gas: inserta cuota fija + sobrante de gas.
export async function registrarReciboMixto(input: {
  valorTotal: number
  cuotaBrilla: number
  metodo_pago_id?: string | null
  fecha?: string
}) {
  const { supabase, userId } = await getUserId()
  if (!userId) return { error: "No autenticado" }

  const fecha = input.fecha ?? new Date().toISOString().slice(0, 10)
  const montoGas = Math.max(0, input.valorTotal - input.cuotaBrilla)

  const registros = [
    {
      user_id: userId,
      categoria: "deuda_brilla",
      subcategoria: "cuota_fija",
      monto: input.cuotaBrilla,
      fecha,
      metodo_pago_id: input.metodo_pago_id ?? null,
      descripcion: "Cuota fija financiación Brilla",
      pagado_con_ahorros: false,
    },
    {
      user_id: userId,
      categoria: "servicio_gas",
      subcategoria: "consumo",
      monto: montoGas,
      fecha,
      metodo_pago_id: input.metodo_pago_id ?? null,
      descripcion: "Consumo de gas del recibo",
      pagado_con_ahorros: false,
    },
  ]

  const { error } = await supabase.from("gastos").insert(registros)
  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  return { success: true, montoGas }
}

// Alterna la exclusion de un dia de almuerzo.
export async function toggleAlmuerzo(fecha: string, excluir: boolean) {
  const { supabase, userId } = await getUserId()
  if (!userId) return { error: "No autenticado" }

  if (excluir) {
    const { error } = await supabase
      .from("almuerzos_excluidos")
      .upsert({ user_id: userId, fecha }, { onConflict: "user_id,fecha" })
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from("almuerzos_excluidos").delete().eq("user_id", userId).eq("fecha", fecha)
    if (error) return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

// Cierre de ciclo: traslada el excedente al bolsillo de ahorros.
export async function trasladarAhorros(excedente: number) {
  const { supabase, userId } = await getUserId()
  if (!userId) return { error: "No autenticado" }

  const { data: usuario } = await supabase.from("usuarios").select("saldo_ahorros").eq("id", userId).single()
  const saldo = Number(usuario?.saldo_ahorros ?? 0)

  const { error } = await supabase
    .from("usuarios")
    .update({ saldo_ahorros: saldo + excedente })
    .eq("id", userId)
  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  return { success: true, nuevoSaldo: saldo + excedente }
}

export async function eliminarGasto(id: string) {
  const { supabase, userId } = await getUserId()
  if (!userId) return { error: "No autenticado" }

  const { data: gasto } = await supabase
    .from("gastos")
    .select("monto, pagado_con_ahorros, es_diferido, descripcion, categoria")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  if (!gasto) return { error: "Gasto no encontrado" }

  // Si fue pagado con ahorros, reintegrar al bolsillo
  if (gasto.pagado_con_ahorros) {
    const { data: usuario } = await supabase.from("usuarios").select("saldo_ahorros").eq("id", userId).single()
    const saldo = Number(usuario?.saldo_ahorros ?? 0)
    await supabase
      .from("usuarios")
      .update({ saldo_ahorros: saldo + Number(gasto.monto) })
      .eq("id", userId)
  }

  // Si era diferido, eliminar la obligacion financiera asociada
  if (gasto.es_diferido) {
    const nombreRef = `Financiación - ${gasto.descripcion || gasto.categoria}`
    await supabase
      .from("obligaciones_financieras")
      .delete()
      .eq("user_id", userId)
      .eq("nombre", nombreRef)
      .eq("categoria", "deuda_financiada")
  }

  const { error } = await supabase.from("gastos").delete().eq("id", id).eq("user_id", userId)
  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function cerrarSesion() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
}
