"use client"

import { useState, useTransition } from "react"
import { toggleAlmuerzo } from "@/app/dashboard/actions"
import { formatCOP } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Utensils, Check, X } from "lucide-react"
import { toast } from "sonner"

interface AlmuerzosGridProps {
  diasHabiles: string[]
  excluidosIniciales: string[]
  valorDiario: number
}

export function AlmuerzosGrid({ diasHabiles, excluidosIniciales, valorDiario }: AlmuerzosGridProps) {
  const [excluidos, setExcluidos] = useState<Set<string>>(new Set(excluidosIniciales))
  const [, startTransition] = useTransition()

  const hoyISO = new Date().toISOString().slice(0, 10)
  const contados = diasHabiles.filter((d) => !excluidos.has(d)).length
  const total = contados * valorDiario

  const toggle = (fecha: string) => {
    const excluir = !excluidos.has(fecha)
    setExcluidos((prev) => {
      const next = new Set(prev)
      if (excluir) next.add(fecha)
      else next.delete(fecha)
      return next
    })
    startTransition(async () => {
      const res = await toggleAlmuerzo(fecha, excluir)
      if (res?.error) {
        toast.error(res.error)
        // revertir
        setExcluidos((prev) => {
          const next = new Set(prev)
          if (excluir) next.delete(fecha)
          else next.add(fecha)
          return next
        })
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{contados} días contados</span>
        </div>
        <span className="text-lg font-bold text-foreground">{formatCOP(total)}</span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {diasHabiles.map((fecha) => {
          const d = new Date(fecha + "T00:00:00")
          const activo = !excluidos.has(fecha)
          const esHoy = fecha === hoyISO
          return (
            <button
              key={fecha}
              type="button"
              onClick={() => toggle(fecha)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border text-xs font-medium transition-colors",
                activo
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-border bg-muted text-muted-foreground line-through",
                esHoy && "ring-2 ring-primary ring-offset-1",
              )}
              aria-label={`${activo ? "Excluir" : "Incluir"} almuerzo del ${fecha}`}
            >
              <span className="text-[10px] uppercase opacity-70">
                {d.toLocaleDateString("es-CO", { weekday: "short" }).slice(0, 2)}
              </span>
              <span className="text-sm">{d.getDate()}</span>
              {activo ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            </button>
          )
        })}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Utensils className="h-3 w-3" />
        Toca un día para desmarcarlo (incapacidad, vacaciones, invitación).
      </p>
    </div>
  )
}
