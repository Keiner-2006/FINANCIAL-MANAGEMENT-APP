"use client"

import { useState, useMemo } from "react"
import type { Gasto, IngresoExtra, MetodoPago, Vehiculo } from "@/lib/types"
import { CATEGORIAS } from "@/lib/types"
import {
  agruparPorCategoria,
  agruparPorMes,
  agruparPorMetodoPago,
  gastosPorDia,
  flujoDeCaja,
} from "@/lib/finance"
import { formatCOP } from "@/lib/format"
import { ReportFilters } from "./report-filters"
import { ReportSummaryCards } from "./report-summary-cards"
import { ChartPie } from "./chart-pie"
import { ChartTrend } from "./chart-trend"
import { ChartCashflow } from "./chart-cashflow"
import { ChartPaymentMethods } from "./chart-payment-methods"
import { ChartHeatmap } from "./chart-heatmap"
import { BarChart3 } from "lucide-react"

interface Props {
  gastos: Gasto[]
  ingresos: IngresoExtra[]
  metodos: MetodoPago[]
  vehiculos: Vehiculo[]
}

export type DateRange = "1m" | "3m" | "6m" | "1y" | "all"

export function ReportsDashboard({ gastos, ingresos, metodos, vehiculos }: Props) {
  const [range, setRange] = useState<DateRange>("6m")

  const filteredGastos = useMemo(() => {
    if (range === "all") return gastos
    const months = range === "1m" ? 1 : range === "3m" ? 3 : range === "6m" ? 6 : 12
    const desde = new Date()
    desde.setMonth(desde.getMonth() - months)
    const iso = desde.toISOString().slice(0, 10)
    return gastos.filter((g) => g.fecha >= iso)
  }, [gastos, range])

  const filteredIngresos = useMemo(() => {
    if (range === "all") return ingresos
    const months = range === "1m" ? 1 : range === "3m" ? 3 : range === "6m" ? 6 : 12
    const desde = new Date()
    desde.setMonth(desde.getMonth() - months)
    const iso = desde.toISOString().slice(0, 10)
    return ingresos.filter((i) => i.fecha >= iso)
  }, [ingresos, range])

  const porCategoria = useMemo(() => agruparPorCategoria(filteredGastos, CATEGORIAS), [filteredGastos])
  const porMes = useMemo(() => agruparPorMes(filteredGastos), [filteredGastos])
  const porMetodo = useMemo(() => agruparPorMetodoPago(filteredGastos, metodos), [filteredGastos, metodos])
  const porDia = useMemo(() => gastosPorDia(filteredGastos), [filteredGastos])

  const totalGastos = filteredGastos.reduce((a, g) => a + Number(g.monto), 0)
  const totalIngresos = filteredIngresos.reduce((a, i) => a + Number(i.monto), 0)
  const totalIngresosBase = totalIngresos

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Reportes</h1>
          <p className="text-sm text-muted-foreground">Análisis de tus gastos</p>
        </div>
      </header>

      <ReportFilters range={range} onChange={setRange} />

      <ReportSummaryCards
        totalGastos={totalGastos}
        totalIngresos={totalIngresosBase}
        numGastos={filteredGastos.length}
        categoriaTop={porCategoria[0]}
      />

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Gastos por categoría</h2>
        <ChartPie data={porCategoria} />
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Tendencia mensual</h2>
        <ChartTrend data={porMes} />
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Flujo de caja</h2>
        <ChartCashflow data={porDia} />
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Gastos por método de pago</h2>
        <ChartPaymentMethods data={porMetodo} />
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Mapa de calor</h2>
        <ChartHeatmap data={porDia} />
      </section>
    </div>
  )
}
