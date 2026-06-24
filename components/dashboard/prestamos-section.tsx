"use client"

import { useMemo } from "react"
import type { Prestamo } from "@/lib/types"
import { formatCOP, formatFecha } from "@/lib/format"
import { marcarPrestamoPagado, eliminarPrestamo } from "@/app/dashboard/actions"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Trash2, Clock, ArrowUpRight, ArrowDownLeft } from "lucide-react"

interface PrestamosSectionProps {
  prestamos: Prestamo[]
}

function calcularInteresAcumulado(p: Prestamo): number {
  if (p.tasa_interes <= 0 || p.pagado) return 0
  const inicio = new Date(p.fecha_prestamo + "T00:00:00")
  const hoy = new Date()
  const meses = (hoy.getFullYear() - inicio.getFullYear()) * 12 + (hoy.getMonth() - inicio.getMonth())
  if (meses <= 0) return 0
  return p.monto * (p.tasa_interes / 100) * meses
}

export function PrestamosSection({ prestamos }: PrestamosSectionProps) {
  const activos = useMemo(() => prestamos.filter((p) => !p.pagado), [prestamos])

  if (activos.length === 0) return null

  const handleMarcarPagado = async (id: string) => {
    const res = await marcarPrestamoPagado(id)
    if (res?.error) toast.error(res.error)
    else toast.success("Marcado como pagado")
  }

  const handleEliminar = async (id: string) => {
    const res = await eliminarPrestamo(id)
    if (res?.error) toast.error(res.error)
    else toast.success("Préstamo eliminado")
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
          <Clock className="h-4 w-4" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">Préstamos activos</h2>
      </div>
      <ul className="flex flex-col divide-y divide-border">
        {activos.map((p) => {
          const interes = calcularInteresAcumulado(p)
          const total = p.monto + interes
          return (
            <li key={p.id} className="flex items-center gap-3 py-2.5">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                p.tipo === "deuda"
                  ? "bg-red-500/10 text-red-600"
                  : "bg-green-500/10 text-green-600"
              }`}>
                {p.tipo === "deuda"
                  ? <ArrowDownLeft className="h-4 w-4" />
                  : <ArrowUpRight className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{p.persona}</p>
                  <Badge variant={p.tipo === "deuda" ? "destructive" : "default"} className="shrink-0 text-[10px]">
                    {p.tipo === "deuda" ? "Debo" : "Me deben"}
                  </Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {formatFecha(p.fecha_prestamo)}
                  {p.fecha_pago ? ` → ${formatFecha(p.fecha_pago)}` : " · Sin fecha"}
                  {p.tasa_interes > 0 ? ` · ${p.tasa_interes}% mensual` : ""}
                </p>
                {interes > 0 && (
                  <p className="text-xs text-amber-600">
                    Interés acumulado: {formatCOP(Math.round(interes))}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="shrink-0 text-sm font-semibold text-foreground">
                  {formatCOP(Math.round(total))}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleMarcarPagado(p.id)}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-green-500/10 hover:text-green-600"
                    aria-label="Marcar como pagado"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEliminar(p.id)}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Eliminar préstamo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
