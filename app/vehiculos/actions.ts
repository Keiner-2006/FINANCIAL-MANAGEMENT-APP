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

export async function crearVehiculo(input: {
  nombre: string
  placa?: string | null
  tipo: "moto" | "carro"
  modelo?: string | null
  anio?: number | null
}) {
  const { supabase, userId } = await getUserId()
  if (!userId) return { error: "No autenticado" }

  const { data, error } = await supabase
    .from("vehiculos")
    .insert({
      user_id: userId,
      nombre: input.nombre,
      placa: input.placa || null,
      tipo: input.tipo,
      modelo: input.modelo || null,
      anio: input.anio || null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  await supabase
    .from("usuarios")
    .update({ tiene_vehiculo: true, tipo_vehiculo: input.tipo })
    .eq("id", userId)

  revalidatePath("/vehiculos")
  revalidatePath("/dashboard")
  revalidatePath("/perfil")
  return { success: true, vehiculo: data }
}

export async function actualizarVehiculo(
  id: string,
  input: {
    nombre: string
    placa?: string | null
    tipo: "moto" | "carro"
    modelo?: string | null
    anio?: number | null
    activo?: boolean
  }
) {
  const { supabase, userId } = await getUserId()
  if (!userId) return { error: "No autenticado" }

  const updateData: Record<string, any> = {
    nombre: input.nombre,
    placa: input.placa || null,
    tipo: input.tipo,
    modelo: input.modelo || null,
    anio: input.anio || null,
  }
  if (input.activo !== undefined) {
    updateData.activo = input.activo
  }

  const { error } = await supabase
    .from("vehiculos")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", userId)

  if (error) return { error: error.message }

  revalidatePath("/vehiculos")
  revalidatePath(`/vehiculos/${id}`)
  revalidatePath("/perfil")
  return { success: true }
}

export async function eliminarVehiculo(id: string) {
  const { supabase, userId } = await getUserId()
  if (!userId) return { error: "No autenticado" }

  const { error } = await supabase.from("vehiculos").delete().eq("id", id).eq("user_id", userId)
  if (error) return { error: error.message }

  const { count } = await supabase
    .from("vehiculos")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("activo", true)

  if (!count || count === 0) {
    await supabase
      .from("usuarios")
      .update({ tiene_vehiculo: false, tipo_vehiculo: "ninguno" })
      .eq("id", userId)
  }

  revalidatePath("/vehiculos")
  revalidatePath("/dashboard")
  revalidatePath("/perfil")
  return { success: true }
}

export async function crearDocumento(input: {
  vehiculo_id: string
  vehiculo: string
  tipo: "soat" | "tecnomecanica" | "aceite"
  fecha_vencimiento: string
  fecha_realizacion?: string | null
  precio_renovacion?: number | null
}) {
  const { supabase, userId } = await getUserId()
  if (!userId) return { error: "No autenticado" }

  const { error } = await supabase.from("documentos_activos").insert({
    user_id: userId,
    vehiculo_id: input.vehiculo_id,
    vehiculo: input.vehiculo,
    tipo: input.tipo,
    fecha_vencimiento: input.fecha_vencimiento,
    fecha_realizacion: input.fecha_realizacion ?? null,
    precio_renovacion: input.precio_renovacion ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath("/vehiculos")
  revalidatePath(`/vehiculos/${input.vehiculo_id}`)
  return { success: true }
}

const TIPO_DESC: Record<string, { label: string; subcat: string }> = {
  soat: { label: "SOAT", subcat: "soat" },
  tecnomecanica: { label: "Tecnomecánica", subcat: "tecnomecanica" },
  aceite: { label: "Aceite", subcat: "aceite" },
}

export async function renovarDocumento(input: {
  documento_id: string
  vehiculo_id: string
  nueva_fecha: string
  fecha_realizacion: string
  precio: number
}) {
  const { supabase, userId } = await getUserId()
  if (!userId) return { error: "No autenticado" }

  const { error: errUpd } = await supabase
    .from("documentos_activos")
    .update({
      fecha_vencimiento: input.nueva_fecha,
      fecha_realizacion: input.fecha_realizacion,
      precio_renovacion: input.precio,
    })
    .eq("id", input.documento_id)
    .eq("user_id", userId)

  if (errUpd) return { error: errUpd.message }

  const { data: doc } = await supabase
    .from("documentos_activos")
    .select("tipo, vehiculo")
    .eq("id", input.documento_id)
    .single()

  const info = TIPO_DESC[doc?.tipo ?? ""] ?? { label: "Documento", subcat: "otro" }

  const { error: errGasto } = await supabase.from("gastos").insert({
    user_id: userId,
    vehiculo_id: input.vehiculo_id,
    categoria: "transporte_mantenimiento",
    subcategoria: info.subcat,
    monto: input.precio,
    fecha: input.fecha_realizacion,
    descripcion: `Renovación ${info.label} - ${doc?.vehiculo ?? ""}`,
    pagado_con_ahorros: false,
    numero_cuotas: 1,
    es_diferido: false,
  })

  if (errGasto) return { error: errGasto.message }

  revalidatePath("/vehiculos")
  revalidatePath(`/vehiculos/${input.vehiculo_id}`)
  revalidatePath("/dashboard")
  return { success: true }
}

export async function agregarServicio(input: {
  vehiculo_id: string
  nombre: string
  monto: number
  fecha_realizacion: string
  notas?: string | null
}) {
  const { supabase, userId } = await getUserId()
  if (!userId) return { error: "No autenticado" }

  const { error } = await supabase.from("historial_servicios").insert({
    user_id: userId,
    vehiculo_id: input.vehiculo_id,
    nombre: input.nombre,
    monto: input.monto,
    fecha_realizacion: input.fecha_realizacion,
    notas: input.notas ?? null,
  })

  if (error) return { error: error.message }

  const { error: errGasto } = await supabase.from("gastos").insert({
    user_id: userId,
    categoria: "transporte_mantenimiento",
    subcategoria: "servicio",
    monto: input.monto,
    fecha: input.fecha_realizacion,
    descripcion: input.nombre,
    pagado_con_ahorros: false,
    numero_cuotas: 1,
    es_diferido: false,
  })

  if (errGasto) return { error: errGasto.message }

  revalidatePath(`/vehiculos/${input.vehiculo_id}`)
  revalidatePath("/dashboard")
  return { success: true }
}

export async function eliminarServicio(id: string, vehiculo_id: string) {
  const { supabase, userId } = await getUserId()
  if (!userId) return { error: "No autenticado" }

  const { data: servicio } = await supabase
    .from("historial_servicios")
    .select("nombre, monto, fecha_realizacion")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  const { error } = await supabase
    .from("historial_servicios")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)

  if (error) return { error: error.message }

  if (servicio) {
    await supabase
      .from("gastos")
      .delete()
      .eq("user_id", userId)
      .eq("categoria", "transporte_mantenimiento")
      .eq("subcategoria", "servicio")
      .eq("descripcion", servicio.nombre)
      .eq("fecha", servicio.fecha_realizacion)
      .eq("monto", servicio.monto)
  }

  revalidatePath(`/vehiculos/${vehiculo_id}`)
  revalidatePath("/dashboard")
  return { success: true }
}
