"use client"

import { useState } from "react"
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
import { CurrencyInput } from "@/components/ui/currency-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { registrarReciboMixto, registrarGasto } from "@/app/dashboard/actions"
import type { MetodoPago } from "@/lib/types"
import { formatCOP } from "@/lib/format"
import { toast } from "sonner"
import { Flame, CreditCard } from "lucide-react"

interface ReciboDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tieneBrilla: boolean
  cuotaBrilla: number
  metodos: MetodoPago[]
}

export function ReciboDialog({ open, onOpenChange, tieneBrilla, cuotaBrilla, metodos }: ReciboDialogProps) {
  const [valorTotal, setValorTotal] = useState(0)
  const [metodoId, setMetodoId] = useState<string>(metodos[0]?.id ?? "")
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [guardando, setGuardando] = useState(false)

  const montoGas = Math.max(0, valorTotal - (tieneBrilla ? cuotaBrilla : 0))
  const totalMenorQueCuota = tieneBrilla && valorTotal > 0 && valorTotal < cuotaBrilla

  const reset = () => {
    setValorTotal(0)
    setFecha(new Date().toISOString().slice(0, 10))
  }

  const handleGuardar = async () => {
    if (valorTotal <= 0) {
      toast.error("Ingresa el valor total del recibo")
      return
    }
    if (totalMenorQueCuota) {
      toast.error("El valor total no puede ser menor que la cuota de Brilla")
      return
    }
    setGuardando(true)
    let res
    if (tieneBrilla) {
      res = await registrarReciboMixto({
        valorTotal,
        cuotaBrilla,
        metodo_pago_id: metodoId || null,
        fecha,
      })
    } else {
      res = await registrarGasto({
        categoria: "servicio_gas",
        subcategoria: "consumo",
        monto: valorTotal,
        fecha,
        metodo_pago_id: metodoId || null,
        descripcion: "Servicio público de gas",
      })
    }
    setGuardando(false)
    if (res?.error) {
      toast.error(res.error)
      return
    }
    toast.success("Recibo registrado")
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
          <DialogTitle>Recibo de {tieneBrilla ? "Brilla / Gas" : "Gas"}</DialogTitle>
          <DialogDescription>
            {tieneBrilla
              ? "Digita el valor total del recibo físico. Separamos la cuota y el gas automáticamente."
              : "Registra el valor del servicio público de gas."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="recibo-total">Valor total del recibo</Label>
            <CurrencyInput id="recibo-total" value={valorTotal} onChange={setValorTotal} placeholder="250.000" />
            {totalMenorQueCuota && (
              <p className="text-xs text-destructive">
                El total debe ser al menos {formatCOP(cuotaBrilla)} (cuota Brilla).
              </p>
            )}
          </div>

          {tieneBrilla && valorTotal > 0 && !totalMenorQueCuota && (
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/40 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Desglose automático</p>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-foreground">
                  <CreditCard className="h-4 w-4 text-primary" /> Cuota Brilla (fija)
                </span>
                <span className="font-semibold text-foreground">{formatCOP(cuotaBrilla)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-foreground">
                  <Flame className="h-4 w-4 text-accent" /> Consumo de gas
                </span>
                <span className="font-semibold text-accent">{formatCOP(montoGas)}</span>
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="recibo-fecha">Fecha</Label>
            <Input
              id="recibo-fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="grid gap-2">
            <Label>Método de pago</Label>
            <Select value={metodoId} onValueChange={(v) => v && setMetodoId(v)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {metodos.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button className="h-11 w-full" onClick={handleGuardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Registrar recibo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
