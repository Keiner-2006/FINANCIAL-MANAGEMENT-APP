export type TipoIngreso = "quincenal" | "mensual"
export type TipoVehiculo = "moto" | "carro" | "ninguno"
export type TipoMetodoPago =
  | "efectivo"
  | "nequi"
  | "tarjeta_credito"
  | "tarjeta_debito"
  | "bolsillo_nequi"
  | "cuenta_ahorros"
export type TipoDocumento = "soat" | "tecnomecanica" | "aceite"

export interface Usuario {
  id: string
  nombre: string | null
  tipo_ingreso: TipoIngreso
  monto_ingreso: number
  dia_pago: number
  valor_almuerzo_diario: number
  almuerzos_activos: boolean
  tiene_vehiculo: boolean
  tipo_vehiculo: TipoVehiculo | null
  tiene_brilla: boolean
  cuota_brilla: number
  saldo_ahorros: number
  onboarding_completo: boolean
  created_at: string
}

export interface MetodoPago {
  id: string
  user_id: string
  nombre: string
  tipo: TipoMetodoPago
  activo: boolean
  created_at: string
}

export interface ObligacionFinanciera {
  id: string
  user_id: string
  nombre: string
  tipo: "fijo" | "variable"
  categoria: string
  monto: number
  meses_restantes: number | null
  activo: boolean
  created_at: string
}

export interface Vehiculo {
  id: string
  user_id: string
  nombre: string
  placa: string | null
  tipo: TipoVehiculo
  modelo: string | null
  anio: number | null
  activo: boolean
  created_at: string
}

export interface DocumentoActivo {
  id: string
  user_id: string
  vehiculo: string
  tipo: TipoDocumento
  fecha_vencimiento: string
  fecha_realizacion: string | null
  vehiculo_id: string | null
  precio_renovacion: number | null
  created_at: string
}

export interface HistorialServicio {
  id: string
  user_id: string
  vehiculo_id: string
  nombre: string
  monto: number
  fecha_realizacion: string
  notas: string | null
  created_at: string
}

export interface Gasto {
  id: string
  user_id: string
  categoria: string
  subcategoria: string | null
  monto: number
  fecha: string
  metodo_pago_id: string | null
  descripcion: string | null
  pagado_con_ahorros: boolean
  numero_cuotas: number
  es_diferido: boolean
  created_at: string
}

export interface IngresoExtra {
  id: string
  user_id: string
  monto: number
  fecha: string
  descripcion: string | null
  created_at: string
}

export interface AlmuerzoExcluido {
  id: string
  user_id: string
  fecha: string
  created_at: string
}

export interface Prestamo {
  id: string
  user_id: string
  persona: string
  monto: number
  tipo: "prestado" | "deuda"
  tasa_interes: number
  fecha_prestamo: string
  fecha_pago: string | null
  pagado: boolean
  notas: string | null
  created_at: string
}

// Categorias de gasto
export const CATEGORIAS: Record<string, { label: string; icon: string }> = {
  mercado_familia: { label: "Mercado Familiar", icon: "ShoppingCart" },
  almuerzo_laboral: { label: "Almuerzos Laborales", icon: "Utensils" },
  servicio_gas: { label: "Servicio de Gas", icon: "Flame" },
  deuda_brilla: { label: "Cuota Brilla", icon: "CreditCard" },
  deuda_financiada: { label: "Cuota Financiada", icon: "CreditCard" },
  transporte_gasolina: { label: "Gasolina", icon: "Fuel" },
  transporte_aceite: { label: "Aceite", icon: "Droplet" },
  transporte_mantenimiento: { label: "Mantenimiento", icon: "Wrench" },
  salidas_disfrutar: { label: "Salidas y Ocio", icon: "PartyPopper" },
  mascotas: { label: "Mascotas", icon: "PawPrint" },
  servicio_agua: { label: "Servicio de Agua", icon: "Droplets" },
  servicio_luz: { label: "Servicio de Luz", icon: "Zap" },
  otro: { label: "Otro", icon: "MoreHorizontal" },
}
