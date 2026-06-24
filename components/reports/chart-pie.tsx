"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { formatCOP } from "@/lib/format"

const COLORS = [
  "oklch(0.379 0.138 265.52)",
  "oklch(0.696 0.17 162.48)",
  "oklch(0.637 0.237 25.33)",
  "oklch(0.769 0.13 75)",
  "oklch(0.554 0.041 257.42)",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
]

interface Props {
  data: { categoria: string; total: number; label: string }[]
}

export function ChartPie({ data }: Props) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Sin datos para mostrar</p>
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="total"
          nameKey="label"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatCOP(value)}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid var(--border)",
            background: "var(--card)",
            fontSize: "12px",
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "11px" }}
          formatter={(value: string) => value.length > 16 ? value.slice(0, 16) + "…" : value}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
