import type { TipoIngreso } from "./types"

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
