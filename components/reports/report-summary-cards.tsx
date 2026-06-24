"use client"

import { formatCOP } from "@/lib/format"
import { TrendingDown, TrendingUp, Receipt, Crown } from "lucide-react"

interface Props {
  totalGastos: number
  totalIngresos: number
  numGastos: number
  categoriaTop: { categoria: string; total: number; label: string } | undefined
}

export function ReportSummaryCards({ totalGastos, totalIngresos, numGastos, categoriaTop }: Props) {
  const balance = totalIngresos - totalGastos
  const promedio = numGastos > 0 ? totalGastos / numGastos : 0

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card
        icon={<TrendingDown className="h-4 w-4" />}
        label="Total gastos"
        value={formatCOP(totalGastos)}
        color="text-destructive"
        bg="bg-destructive/10"
      />
      <Card
        icon={<TrendingUp className="h-4 w-4" />}
        label="Balance"
        value={formatCOP(balance)}
        color={balance >= 0 ? "text-accent" : "text-destructive"}
        bg={balance >= 0 ? "bg-accent/10" : "bg-destructive/10"}
      />
      <Card
        icon={<Receipt className="h-4 w-4" />}
        label="Promedio/gasto"
        value={formatCOP(promedio)}
        color="text-primary"
        bg="bg-primary/10"
      />
      <Card
        icon={<Crown className="h-4 w-4" />}
        label="Mayor gasto"
        value={categoriaTop?.label ?? "N/A"}
        color="text-amber-600"
        bg="bg-amber-500/10"
        isText
      />
    </div>
  )
}

function Card({
  icon,
  label,
  value,
  color,
  bg,
  isText,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
  bg: string
  isText?: boolean
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${bg} ${color} mb-2`}>
        {icon}
      </div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`text-sm font-bold text-foreground ${isText ? "truncate" : ""}`}>{value}</p>
    </div>
  )
}
