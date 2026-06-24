"use client"

import type { DateRange } from "./reports-dashboard"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const options: { value: DateRange; label: string }[] = [
  { value: "1m", label: "1 mes" },
  { value: "3m", label: "3 meses" },
  { value: "6m", label: "6 meses" },
  { value: "1y", label: "1 año" },
  { value: "all", label: "Todo" },
]

interface Props {
  range: DateRange
  onChange: (r: DateRange) => void
}

export function ReportFilters({ range, onChange }: Props) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {options.map((o) => (
        <Button
          key={o.value}
          variant={range === o.value ? "default" : "outline"}
          size="sm"
          className={cn("shrink-0 text-xs", range === o.value && "")}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </Button>
      ))}
    </div>
  )
}
