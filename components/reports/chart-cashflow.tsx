"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { formatCOP } from "@/lib/format"

interface Props {
  data: Record<string, number>
}

export function ChartCashflow({ data }: Props) {
  const entries = Object.entries(data)
  if (entries.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Sin datos para mostrar</p>
  }

  const formatted = entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, total]) => ({
      fecha,
      dia: new Date(fecha + "T00:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short" }),
      total,
    }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="dia" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" interval={Math.floor(formatted.length / 6)} />
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
        <Bar dataKey="total" fill="oklch(0.696 0.17 162.48)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
