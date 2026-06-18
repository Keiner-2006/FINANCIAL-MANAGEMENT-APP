"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CurrencyInput } from "@/components/ui/currency-input"

import { registrarGasto } from "@/app/dashboard/actions"
import type { MetodoPago } from "@/lib/types"
import { formatCOP } from "@/lib/format"
import { toast } from "sonner"
import { PiggyBank, CreditCard } from "lucide-react"

interface GastoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoria: string
  titulo: string
  descripcion?: string
  metodos: MetodoPago[]
  saldoAhorros: number
  saldoDisponible: number
  conSubcategoria?: { label: string; opciones: { value: string; label: string }[] }
  conDescripcion?: boolean
}

const metodoToId = (m: MetodoPago) => `${m.id}::${m.nombre}`

export function GastoDialog({
  open,
  onOpenChange,
  categoria,
  titulo,
  descripcion,
  metodos,
  saldoAhorros,
  saldoDisponible,
  conSubcategoria,
  conDescripcion,
}: GastoDialogProps) {
  const [monto, setMonto] = useState(0)
  const [metodoKey, setMetodoKey] = useState("")
  const [subcategoria, setSubcategoria] = useState("")
  const [desc, setDesc] = useState("")
  const [conAhorros, setConAhorros] = useState(false)
  const [cuotas, setCuotas] = useState(1)
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!metodoKey && metodos.length > 0) {
      setMetodoKey(metodoToId(metodos[0]))
    }
  }, [metodos, metodoKey])

  useEffect(() => {
    if (conSubcategoria?.opciones?.length) {
      setSubcategoria(conSubcategoria.opciones[0].value)
    }
  }, [conSubcategoria])

  const metodoSel = metodos.find((m) => metodoToId(m) === metodoKey)
  const esTarjetaCredito = metodoSel?.tipo === "tarjeta_credito"
  const esDiferido = esTarjetaCredito && cuotas > 1

  const reset = () => {
    setMonto(0)
    setDesc("")
    setConAhorros(false)
    setCuotas(1)
    setSubcategoria(conSubcategoria?.opciones[0]?.value ?? "")
    setFecha(new Date().toISOString().slice(0, 10))
  }

  const metodoId = metodoSel?.id ?? null

  const handleGuardar = async () => {
    if (monto <= 0) {
      toast.error("Ingresa un monto válido")
      return
    }
    if (!conAhorros && monto > saldoDisponible) {
      toast.error(`Saldo disponible insuficiente. Dispones de ${formatCOP(saldoDisponible)}.`)
      return
    }
    if (conAhorros && monto > saldoAhorros) {
      toast.error(`Saldo de ahorros insuficiente. Dispones de ${formatCOP(saldoAhorros)}.`)
      return
    }
    setGuardando(true)
    const res = await registrarGasto({
      categoria,
      subcategoria: conSubcategoria ? subcategoria : null,
      monto,
      fecha,
      metodo_pago_id: conAhorros ? null : metodoId,
      descripcion: conDescripcion ? desc : null,
      pagado_con_ahorros: conAhorros,
      numero_cuotas: esTarjetaCredito ? cuotas : 1,
    })
    setGuardando(false)
    if (res?.error) {
      toast.error(res.error)
      return
    }
    toast.success("Gasto registrado")
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          {descripcion && <DialogDescription>{descripcion}</DialogDescription>}
          <p className="text-xs text-muted-foreground">
            Disponible: <span className="font-medium text-foreground">{formatCOP(saldoDisponible)}</span>
          </p>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="gasto-monto">Monto</Label>
            <CurrencyInput id="gasto-monto" value={monto} onChange={setMonto} />
          </div>

          {conSubcategoria && (
            <div className="grid gap-2">
              <Label>{conSubcategoria.label}</Label>
              <select
                value={subcategoria}
                onChange={(e) => setSubcategoria(e.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {conSubcategoria.opciones.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="gasto-fecha">Fecha</Label>
            <Input
              id="gasto-fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="h-11"
            />
          </div>

          {conDescripcion && (
            <div className="grid gap-2">
              <Label htmlFor="gasto-desc">Descripción (opcional)</Label>
              <Input
                id="gasto-desc"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Ej: mercado de la semana"
                className="h-11"
              />
            </div>
          )}

          {!conAhorros && (
            <div className="grid gap-2">
              <Label>Método de pago</Label>
              <select
                value={metodoKey}
                onChange={(e) => setMetodoKey(e.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {metodos.map((m) => (
                  <option key={m.id} value={metodoToId(m)}>{m.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {esTarjetaCredito && (
            <div className="grid gap-2">
              <Label htmlFor="gasto-cuotas">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4" /> Número de cuotas
                </span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="gasto-cuotas"
                  type="number"
                  min={1}
                  max={60}
                  value={cuotas}
                  onChange={(e) => setCuotas(Math.max(1, Number(e.target.value)))}
                  className="h-11 w-24"
                />
                {cuotas > 1 && (
                  <div className="flex flex-1 items-center rounded-lg border border-border bg-muted/40 px-3 text-sm text-muted-foreground">
                    {formatCOP(Math.round(monto / cuotas))}/mes
                  </div>
                )}
              </div>
              {cuotas === 1 && (
                <p className="text-xs text-muted-foreground">Se liquidará en el siguiente corte de facturación.</p>
              )}
              {cuotas > 1 && (
                <p className="text-xs text-amber-600">
                  Gasto diferido a {cuotas} meses. No afecta el saldo disponible de este ciclo.
                </p>
              )}
            </div>
          )}

          {!esDiferido && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3">
              <div className="flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-sm font-medium text-foreground">Pagar con ahorros</p>
                  <p className="text-xs text-muted-foreground">Disponible: {formatCOP(saldoAhorros)}</p>
                </div>
              </div>
              <Switch checked={conAhorros} onCheckedChange={setConAhorros} disabled={saldoAhorros <= 0} />
            </div>
          )}

          <Button className="h-11 w-full" onClick={handleGuardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Registrar gasto"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
