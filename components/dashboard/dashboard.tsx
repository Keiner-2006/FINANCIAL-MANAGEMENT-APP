"use client"

import { useMemo, useState } from "react"
import type { Usuario, MetodoPago, DocumentoActivo, Gasto, ObligacionFinanciera, IngresoExtra } from "@/lib/types"
import { CATEGORIAS } from "@/lib/types"
import { formatCOP, formatFecha } from "@/lib/format"
import { getDiasHabiles } from "@/lib/finance"
import { cerrarSesion, eliminarGasto, eliminarIngresoExtra } from "@/app/dashboard/actions"
import { AlertBanner } from "./alert-banner"
import { AlmuerzosGrid } from "./almuerzos-grid"
import { GastoDialog } from "./gasto-dialog"
import { ReciboDialog } from "./recibo-dialog"
import { CierreCicloDialog } from "./cierre-ciclo-dialog"
import { IngresoDialog } from "./ingreso-dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import {
  Wallet,
  PiggyBank,
  ShoppingCart,
  Utensils,
  Flame,
  Fuel,
  PartyPopper,
  PawPrint,
  Plus,
  LogOut,
  Trash2,
  CalendarCheck,
  TrendingUp,
  CreditCard,
  Receipt,
  Banknote,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardProps {
  usuario: Usuario
  metodos: MetodoPago[]
  documentos: DocumentoActivo[]
  gastos: Gasto[]
  obligaciones: ObligacionFinanciera[]
  ingresosExtra: IngresoExtra[]
  excluidos: string[]
  periodo: { inicioISO: string; finISO: string; label: string }
  almuerzosTotal: number
  almuerzosDias: number
  esCierre: boolean
}

type DialogTipo =
  | { kind: "gasto"; categoria: string; titulo: string; descripcion?: string; sub?: any; desc?: boolean }
  | { kind: "recibo" }
  | { kind: "cierre" }
  | { kind: "ingreso" }
  | null

export function Dashboard({
  usuario,
  metodos,
  documentos,
  gastos,
  obligaciones,
  ingresosExtra,
  excluidos,
  periodo,
  almuerzosTotal,
  almuerzosDias,
  esCierre,
}: DashboardProps) {
  const [dialog, setDialog] = useState<DialogTipo>(null)

  const metodoNombre = useMemo(() => {
    const map: Record<string, string> = {}
    metodos.forEach((m) => (map[m.id] = m.nombre))
    return map
  }, [metodos])

  // Gastos presenciales (excluye diferidos y almuerzos que se calculan aparte)
  const gastosRegistrados = gastos.reduce((acc, g) => acc + Number(g.monto), 0)
  const gastosTotales = gastosRegistrados + almuerzosTotal

  // Gastos pagados con flujo regular (no ahorros, no diferidos) para el balance de la quincena
  const gastosFlujo = gastos
    .filter((g) => !g.pagado_con_ahorros && !g.es_diferido)
    .reduce((acc, g) => acc + Number(g.monto), 0)
  const gastoFlujoTotal = gastosFlujo + almuerzosTotal

  // Deudas fijas activas (financiaciones + Brilla)
  const deudasActivas = obligaciones.filter((o) => o.activo)

  const ingresoBase = Number(usuario.monto_ingreso)
  const ingresosExtras = ingresosExtra.reduce((acc, i) => acc + Number(i.monto), 0)
  const ingreso = ingresoBase + ingresosExtras
  const balance = ingreso - gastoFlujoTotal
  const excedente = balance
  const pctGastado = ingreso > 0 ? Math.min(100, (gastoFlujoTotal / ingreso) * 100) : 0

  const diasHabiles = useMemo(
    () =>
      getDiasHabiles({
        inicio: new Date(periodo.inicioISO + "T00:00:00"),
        fin: new Date(periodo.finISO + "T00:00:00"),
        inicioISO: periodo.inicioISO,
        finISO: periodo.finISO,
        label: periodo.label,
      }),
    [periodo],
  )

  const handleEliminar = async (id: string) => {
    const res = await eliminarGasto(id)
    if (res?.error) toast.error(res.error)
    else toast.success("Gasto eliminado")
  }

  const handleEliminarIngreso = async (id: string) => {
    const res = await eliminarIngresoExtra(id)
    if (res?.error) toast.error(res.error)
    else toast.success("Ingreso eliminado")
  }

  const abrirGasto = (categoria: string, titulo: string, opts?: { descripcion?: string; sub?: any; desc?: boolean }) =>
    setDialog({ kind: "gasto", categoria, titulo, descripcion: opts?.descripcion, sub: opts?.sub, desc: opts?.desc })

  return (
    <main className="mx-auto min-h-svh w-full max-w-md bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-foreground">
              {usuario.nombre ?? "Mi hogar"}
            </p>
            <p className="text-xs capitalize text-muted-foreground">{periodo.label}</p>
          </div>
        </div>
        <form action={cerrarSesion}>
          <Button variant="ghost" size="icon" type="submit" aria-label="Cerrar sesión">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </header>

      <div className="flex flex-col gap-4 p-4">
        {/* Alertas */}
        <AlertBanner documentos={documentos} />

        {/* Balance principal */}
        <section className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-sm">
          <p className="text-sm opacity-80">Disponible este ciclo</p>
          <p className="mt-1 text-4xl font-bold tracking-tight">{formatCOP(balance)}</p>
          <div className="mt-4 flex flex-col gap-1.5">
            <Progress value={pctGastado} className="h-2 bg-primary-foreground/20" />
            <div className="flex justify-between text-xs opacity-80">
              <span>Gastado: {formatCOP(gastoFlujoTotal)}</span>
              <span>Ingreso: {formatCOP(ingreso)}</span>
            </div>
          </div>
        </section>

        {/* Resumen ahorros + cierre */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-accent">
              <PiggyBank className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Ahorros</span>
            </div>
            <p className="text-xl font-bold text-foreground">{formatCOP(Number(usuario.saldo_ahorros))}</p>
          </div>
          <button
            type="button"
            onClick={() => setDialog({ kind: "cierre" })}
            className={cn(
              "flex flex-col gap-1 rounded-2xl border p-4 text-left transition-colors",
              esCierre
                ? "border-accent bg-accent/5 text-foreground hover:bg-accent/10"
                : "border-border bg-card text-foreground hover:bg-muted/50",
            )}
          >
            <div className="flex items-center gap-2 text-primary">
              <CalendarCheck className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Cerrar ciclo</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {esCierre ? "Es momento de cerrar" : "Ver excedente"}
            </p>
          </button>
        </div>

        {/* Deudas Fijas */}
        {deudasActivas.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Receipt className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Deudas fijas</h2>
            </div>
            <ul className="flex flex-col divide-y divide-border">
              {deudasActivas.map((o) => {
                const cat = CATEGORIAS[o.categoria]
                return (
                  <li key={o.id} className="flex items-center gap-3 py-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      {o.categoria === "deuda_financiada" ? (
                        <CreditCard className="h-4 w-4" />
                      ) : (
                        <Flame className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {cat?.label ?? o.nombre}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {o.meses_restantes ? `${o.meses_restantes} mes(es) restante(s)` : "Mensual"}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-foreground">{formatCOP(Number(o.monto))}/mes</span>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* Acciones rapidas */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-foreground">Registrar gasto</h2>
          <div className="grid grid-cols-3 gap-3">
            <QuickAction
              icon={<ShoppingCart className="h-5 w-5" />}
              label="Mercado"
              onClick={() =>
                abrirGasto("mercado_familia", "Mercado familiar", {
                  descripcion: "Compras grandes del hogar.",
                  desc: true,
                })
              }
            />
            <QuickAction
              icon={<Flame className="h-5 w-5" />}
              label={usuario.tiene_brilla ? "Brilla/Gas" : "Gas"}
              onClick={() => setDialog({ kind: "recibo" })}
            />
            <QuickAction
              icon={<PartyPopper className="h-5 w-5" />}
              label="Salidas"
              onClick={() => abrirGasto("salidas_disfrutar", "Salidas y ocio", { descripcion: "Gasto rápido de disfrute." })}
            />
            <QuickAction
              icon={<PawPrint className="h-5 w-5" />}
              label="Mascotas"
              onClick={() =>
                abrirGasto("mascotas", "Mascotas", { descripcion: "Comida, vacunas o estética.", desc: true })
              }
            />
            {usuario.tiene_vehiculo && (
              <QuickAction
                icon={<Fuel className="h-5 w-5" />}
                label="Vehículo"
                onClick={() =>
                  abrirGasto("transporte_gasolina", "Gasto de vehículo", {
                    descripcion: `Tu ${usuario.tipo_vehiculo}.`,
                    sub: {
                      label: "Tipo de gasto",
                      opciones: [
                        { value: "gasolina", label: "Gasolina" },
                        { value: "aceite", label: "Aceite" },
                        { value: "mantenimiento", label: "Mantenimiento" },
                      ],
                    },
                  })
                }
              />
            )}
          </div>
        </section>

        {/* Ingreso extra */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-foreground">Ingresos extra</h2>
          <div className="grid grid-cols-3 gap-3">
            <QuickAction
              icon={<Banknote className="h-5 w-5" />}
              label="Ingreso extra"
              onClick={() => setDialog({ kind: "ingreso" })}
            />
          </div>
        </section>

        {/* Almuerzos */}
        {usuario.almuerzos_activos && (
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Utensils className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Almuerzos laborales</h2>
                <p className="text-xs text-muted-foreground">
                  {formatCOP(Number(usuario.valor_almuerzo_diario))} por día hábil
                </p>
              </div>
            </div>
            <AlmuerzosGrid
              diasHabiles={diasHabiles}
              excluidosIniciales={excluidos}
              valorDiario={Number(usuario.valor_almuerzo_diario)}
            />
          </section>
        )}

        {/* Movimientos */}
        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Movimientos del ciclo</h2>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              {formatCOP(gastosTotales)}
            </span>
          </div>
          {gastos.length === 0 && ingresosExtra.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aún no hay movimientos en este ciclo.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {ingresosExtra.map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                    <Banknote className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">Ingreso extra</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatFecha(i.fecha)}
                      {i.descripcion ? ` · ${i.descripcion}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-green-600">+{formatCOP(Number(i.monto))}</span>
                  <button
                    type="button"
                    onClick={() => handleEliminarIngreso(i.id)}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Eliminar ingreso"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
              {gastos.map((g) => {
                const cat = CATEGORIAS[g.categoria]
                return (
                  <li key={g.id} className="flex items-center gap-3 py-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <CategoriaIcon categoria={g.categoria} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {cat?.label ?? g.categoria}
                        {g.subcategoria ? <span className="text-muted-foreground"> · {g.subcategoria}</span> : null}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatFecha(g.fecha)}
                        {g.metodo_pago_id ? ` · ${metodoNombre[g.metodo_pago_id] ?? ""}` : ""}
                        {g.pagado_con_ahorros ? " · Ahorros" : ""}
                        {g.es_diferido ? ` · ${g.numero_cuotas} cuotas` : ""}
                        {g.descripcion ? ` · ${g.descripcion}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-foreground">{formatCOP(Number(g.monto))}</span>
                    <button
                      type="button"
                      onClick={() => handleEliminar(g.id)}
                      className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Eliminar gasto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Dialogs */}
      {dialog?.kind === "gasto" && (
        <GastoDialog
          open
          onOpenChange={(o) => !o && setDialog(null)}
          categoria={dialog.categoria}
          titulo={dialog.titulo}
          descripcion={dialog.descripcion}
          metodos={metodos}
          saldoAhorros={Number(usuario.saldo_ahorros)}
          saldoDisponible={balance}
          conSubcategoria={dialog.sub}
          conDescripcion={dialog.desc}
        />
      )}
      {dialog?.kind === "recibo" && (
        <ReciboDialog
          open
          onOpenChange={(o) => !o && setDialog(null)}
          tieneBrilla={usuario.tiene_brilla}
          cuotaBrilla={Number(usuario.cuota_brilla)}
          metodos={metodos}
        />
      )}
      {dialog?.kind === "cierre" && (
        <CierreCicloDialog open onOpenChange={(o) => !o && setDialog(null)} excedente={excedente} />
      )}
      {dialog?.kind === "ingreso" && (
        <IngresoDialog open onOpenChange={(o) => !o && setDialog(null)} />
      )}
    </main>
  )
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[44px] flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card p-3 text-center transition-colors hover:border-primary/40 hover:bg-muted/50"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</span>
      <span className="text-xs font-medium text-foreground">{label}</span>
      <Plus className="sr-only h-3 w-3" />
    </button>
  )
}

function CategoriaIcon({ categoria }: { categoria: string }) {
  const map: Record<string, React.ReactNode> = {
    mercado_familia: <ShoppingCart className="h-4 w-4" />,
    almuerzo_laboral: <Utensils className="h-4 w-4" />,
    servicio_gas: <Flame className="h-4 w-4" />,
    deuda_brilla: <Flame className="h-4 w-4" />,
    transporte_gasolina: <Fuel className="h-4 w-4" />,
    transporte_aceite: <Fuel className="h-4 w-4" />,
    transporte_mantenimiento: <Fuel className="h-4 w-4" />,
    salidas_disfrutar: <PartyPopper className="h-4 w-4" />,
    mascotas: <PawPrint className="h-4 w-4" />,
  }
  return <>{map[categoria] ?? <Wallet className="h-4 w-4" />}</>
}
