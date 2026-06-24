"use client"

import { useMemo } from "react"
import { formatCOP } from "@/lib/format"
import { cn } from "@/lib/utils"

interface Props {
  data: Record<string, number>
}

const DIAS = ["L", "M", "X", "J", "V", "S", "D"]

export function ChartHeatmap({ data }: Props) {
  const { weeks, maxVal } = useMemo(() => {
    const entries = Object.entries(data)
    if (entries.length === 0) return { weeks: [], maxVal: 0 }

    const maxVal = Math.max(...entries.map(([, v]) => v))
    const sorted = entries.sort(([a], [b]) => a.localeCompare(b))

    const firstDate = new Date(sorted[0][0] + "T00:00:00")
    const lastDate = new Date(sorted[sorted.length - 1][0] + "T00:00:00")

    const startDate = new Date(firstDate)
    const dayOfWeek = startDate.getDay()
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    startDate.setDate(startDate.getDate() - offset)

    const weeks: { label: string; days: { date: string; value: number }[] }[] = []
    const cursor = new Date(startDate)

    while (cursor <= lastDate || cursor.getDay() !== 1) {
      const weekDays: { date: string; value: number }[] = []
      let weekLabel = ""
      for (let i = 0; i < 7; i++) {
        const fecha = cursor.toISOString().slice(0, 10)
        if (i === 0) {
          weekLabel = cursor.toLocaleDateString("es-CO", { month: "short" })
        }
        weekDays.push({ fecha, value: data[fecha] ?? 0 })
        cursor.setDate(cursor.getDate() + 1)
      }
      weeks.push({ label: weekLabel, days: weekDays })
      if (cursor > lastDate && cursor.getDay() === 1) break
    }

    return { weeks, maxVal }
  }, [data])

  if (weeks.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Sin datos para mostrar</p>
  }

  const getIntensity = (value: number) => {
    if (value === 0) return "bg-muted"
    const ratio = value / maxVal
    if (ratio < 0.25) return "bg-primary/20"
    if (ratio < 0.5) return "bg-primary/40"
    if (ratio < 0.75) return "bg-primary/60"
    return "bg-primary/80"
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-0.5 min-w-fit">
        <div className="flex flex-col gap-0.5 mr-1">
          {DIAS.map((d) => (
            <div key={d} className="h-3.5 w-4 flex items-center text-[9px] text-muted-foreground">
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.days.map((day, di) => (
              <div
                key={di}
                className={cn("h-3.5 w-3.5 rounded-sm", getIntensity(day.value))}
                title={`${day.fecha}: ${formatCOP(day.value)}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1 text-[9px] text-muted-foreground">
        <span>Menos</span>
        <div className="h-3 w-3 rounded-sm bg-muted" />
        <div className="h-3 w-3 rounded-sm bg-primary/20" />
        <div className="h-3 w-3 rounded-sm bg-primary/40" />
        <div className="h-3 w-3 rounded-sm bg-primary/60" />
        <div className="h-3 w-3 rounded-sm bg-primary/80" />
        <span>Más</span>
      </div>
    </div>
  )
}
