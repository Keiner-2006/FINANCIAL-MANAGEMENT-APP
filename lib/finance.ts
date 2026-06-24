import type { TipoIngreso, Gasto, IngresoExtra, MetodoPago } from "./types"

function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export interface Periodo {
  inicio: Date
  fin: Date
  inicioISO: string
  finISO: string
  label: string
}

// Calcula el periodo actual segun el tipo de ingreso.
// Mensual: mes calendario en curso.
// Quincenal: 1-15 o 16-fin de mes segun el dia actual.
export function getPeriodoActual(tipo: TipoIngreso, ref = new Date()): Periodo {
  const year = ref.getFullYear()
  const month = ref.getMonth()
  const day = ref.getDate()

  if (tipo === "quincenal") {
    if (day <= 15) {
      const inicio = new Date(year, month, 1)
      const fin = new Date(year, month, 15)
      return {
        inicio,
        fin,
        inicioISO: toISO(inicio),
        finISO: toISO(fin),
        label: "Primera quincena",
      }
    }
    const inicio = new Date(year, month, 16)
    const fin = new Date(year, month + 1, 0)
    return {
      inicio,
      fin,
      inicioISO: toISO(inicio),
      finISO: toISO(fin),
      label: "Segunda quincena",
    }
  }

  const inicio = new Date(year, month, 1)
  const fin = new Date(year, month + 1, 0)
  return {
    inicio,
    fin,
    inicioISO: toISO(inicio),
    finISO: toISO(fin),
    label: ref.toLocaleDateString("es-CO", { month: "long", year: "numeric" }),
  }
}

// Devuelve todos los dias habiles (lunes a viernes) del periodo.
export function getDiasHabiles(periodo: Periodo): string[] {
  const dias: string[] = []
  const cursor = new Date(periodo.inicio)
  while (cursor <= periodo.fin) {
    const dow = cursor.getDay()
    if (dow >= 1 && dow <= 5) {
      dias.push(toISO(cursor))
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return dias
}

// Calcula el gasto de almuerzos del periodo restando los dias excluidos.
export function calcularAlmuerzos(
  periodo: Periodo,
  valorDiario: number,
  excluidos: string[],
): { diasContados: number; total: number } {
  const habiles = getDiasHabiles(periodo)
  const set = new Set(excluidos)
  const contados = habiles.filter((d) => !set.has(d)).length
  return { diasContados: contados, total: contados * valorDiario }
}

// Dias restantes hasta una fecha de vencimiento (puede ser negativo si vencido).
export function diasHastaVencimiento(fechaISO: string, ref = new Date()): number {
  const venc = new Date(fechaISO + "T00:00:00")
  const hoy = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate())
  const ms = venc.getTime() - hoy.getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

// True si hoy es la fecha de pago (cierre de ciclo) o posterior dentro del mes.
export function esFechaCierre(diaPago: number, ref = new Date()): boolean {
  const ultimoDiaMes = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate()
  const objetivo = Math.min(diaPago, ultimoDiaMes)
  return ref.getDate() >= objetivo
}

// Devuelve todos los periodos entre dos fechas.
export function getPeriodosEnRango(inicio: Date, fin: Date, tipo: TipoIngreso): Periodo[] {
  const periodos: Periodo[] = []
  const cursor = new Date(inicio)
  while (cursor <= fin) {
    const p = getPeriodoActual(tipo, cursor)
    if (!periodos.some((x) => x.inicioISO === p.inicioISO)) {
      periodos.push(p)
    }
    cursor.setDate(cursor.getDate() + (tipo === "quincenal" ? 16 : 32))
    cursor.setDate(1)
  }
  return periodos
}

// Agrupa gastos por categoría.
export function agruparPorCategoria(
  gastos: Gasto[],
  categorias: Record<string, { label: string }>
): { categoria: string; total: number; label: string }[] {
  const map = new Map<string, number>()
  gastos.forEach((g) => {
    map.set(g.categoria, (map.get(g.categoria) ?? 0) + Number(g.monto))
  })
  return Array.from(map.entries())
    .map(([cat, total]) => ({ categoria: cat, total, label: categorias[cat]?.label ?? cat }))
    .sort((a, b) => b.total - a.total)
}

// Agrupa gastos por mes (YYYY-MM).
export function agruparPorMes(gastos: Gasto[]): { mes: string; total: number }[] {
  const map = new Map<string, number>()
  gastos.forEach((g) => {
    const mes = g.fecha.slice(0, 7)
    map.set(mes, (map.get(mes) ?? 0) + Number(g.monto))
  })
  return Array.from(map.entries())
    .map(([mes, total]) => ({ mes, total }))
    .sort((a, b) => a.mes.localeCompare(b.mes))
}

// Agrupa gastos por método de pago.
export function agruparPorMetodoPago(
  gastos: Gasto[],
  metodos: MetodoPago[]
): { metodo: string; total: number }[] {
  const metodoMap = new Map<string, string>()
  metodos.forEach((m) => metodoMap.set(m.id, m.nombre))
  const map = new Map<string, number>()
  gastos.forEach((g) => {
    const key = g.metodo_pago_id ?? "sin Metodo"
    map.set(key, (map.get(key) ?? 0) + Number(g.monto))
  })
  return Array.from(map.entries())
    .map(([key, total]) => ({
      metodo: metodoMap.get(key) ?? (key === "sin Metodo" ? "Sin método" : "Otro"),
      total,
    }))
    .sort((a, b) => b.total - a.total)
}

// Totales diarios para heatmap.
export function gastosPorDia(gastos: Gasto[]): Record<string, number> {
  const map: Record<string, number> = {}
  gastos.forEach((g) => {
    map[g.fecha] = (map[g.fecha] ?? 0) + Number(g.monto)
  })
  return map
}

// Flujo de caja: balance acumulado diario.
export function flujoDeCaja(
  gastos: Gasto[],
  ingresos: IngresoExtra[],
  periodo: { inicioISO: string; finISO: string }
): { fecha: string; gastos: number; ingresos: number; balance: number }[] {
  const gastosMap = new Map<string, number>()
  const ingresosMap = new Map<string, number>()
  gastos.forEach((g) => {
    gastosMap.set(g.fecha, (gastosMap.get(g.fecha) ?? 0) + Number(g.monto))
  })
  ingresos.forEach((i) => {
    ingresosMap.set(i.fecha, (ingresosMap.get(i.fecha) ?? 0) + Number(i.monto))
  })

  const result: { fecha: string; gastos: number; ingresos: number; balance: number }[] = []
  let acum = 0
  const cursor = new Date(periodo.inicioISO + "T00:00:00")
  const fin = new Date(periodo.finISO + "T00:00:00")
  while (cursor <= fin) {
    const fecha = toISO(cursor)
    const g = gastosMap[fecha] ?? 0
    const i = ingresosMap[fecha] ?? 0
    acum += i - g
    result.push({ fecha, gastos: g, ingresos: i, balance: acum })
    cursor.setDate(cursor.getDate() + 1)
  }
  return result
}
