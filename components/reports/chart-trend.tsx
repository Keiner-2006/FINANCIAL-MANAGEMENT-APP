"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { formatCOP } from "@/lib/format"

interface Props {
  data: { mes: string; total: number }[]
}

export function ChartTrend({ data }: Props) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Sin datos para mostrar</p>
  }

  const formatted = data.map((d) => ({
    ...d,
    mesLabel: new Date(d.mes + "-01").toLocaleDateString("es-CO", { month: "short" }),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="mesLabel" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
        <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(value: unknown) => formatCOP(Number(value))}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid var(--border)",
            background: "var(--card)",
            fontSize: "12px",
          }}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="oklch(0.379 0.138 265.52)"
          strokeWidth={2}
          dot={{ r: 4, fill: "oklch(0.379 0.138 265.52)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
