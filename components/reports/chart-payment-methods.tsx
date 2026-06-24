"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { formatCOP } from "@/lib/format"

interface Props {
  data: { metodo: string; total: number }[]
}

export function ChartPaymentMethods({ data }: Props) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Sin datos para mostrar</p>
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <YAxis type="category" dataKey="metodo" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" width={100} />
        <Tooltip
          formatter={(value: number) => formatCOP(value)}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid var(--border)",
            background: "var(--card)",
            fontSize: "12px",
          }}
        />
        <Bar dataKey="total" fill="oklch(0.379 0.138 265.52)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
