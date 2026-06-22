"use client"

import { useState } from "react"
import type { Vehiculo, HistorialServicio } from "@/lib/types"
import { agregarServicio } from "@/app/vehiculos/actions"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CurrencyInput } from "@/components/ui/currency-input"
import { toast } from "sonner"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehiculo: Vehiculo
  servicio: HistorialServicio
}

export function ServiceRenewalDialog({ open, onOpenChange, vehiculo, servicio }: Props) {
  const [monto, setMonto] = useState(Number(servicio.monto))
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [notas, setNotas] = useState("")
  const [loading, setLoading] = useState(false)

  const reset = () => {
    setMonto(Number(servicio.monto))
    setFecha(new Date().toISOString().slice(0, 10))
    setNotas("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!monto || monto <= 0) {
      toast.error("Ingresa el monto del servicio")
      return
    }
    setLoading(true)
    const res = await agregarServicio({
      vehiculo_id: vehiculo.id,
      nombre: servicio.nombre,
      monto,
      fecha_realizacion: fecha,
      notas: notas.trim() || null,
    })
    setLoading(false)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Servicio renovado")
      reset()
      onOpenChange(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Renovar servicio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Servicio: <span className="font-medium text-foreground">{servicio.nombre}</span>
          </p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="renew-monto">Monto (COP) *</Label>
            <CurrencyInput
              id="renew-monto"
              value={monto}
              onChange={setMonto}
              placeholder="150000"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="renew-fecha">Fecha de realización *</Label>
            <Input
              id="renew-fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="renew-notas">Notas (opcional)</Label>
            <Input
              id="renew-notas"
              placeholder="Taller, kilometraje, etc."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Renovar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
