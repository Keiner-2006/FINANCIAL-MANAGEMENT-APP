"use client"

import { Input } from "@/components/ui/input"
import { parseCOP } from "@/lib/format"
import { cn } from "@/lib/utils"

interface CurrencyInputProps {
  value: number
  onChange: (value: number) => void
  id?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function CurrencyInput({ value, onChange, id, placeholder, className, disabled }: CurrencyInputProps) {
  const display = value > 0 ? new Intl.NumberFormat("es-CO").format(value) : ""

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        $
      </span>
      <Input
        id={id}
        inputMode="numeric"
        placeholder={placeholder ?? "0"}
        value={display}
        disabled={disabled}
        onChange={(e) => onChange(parseCOP(e.target.value))}
        className={cn("h-11 pl-7", className)}
      />
    </div>
  )
}
