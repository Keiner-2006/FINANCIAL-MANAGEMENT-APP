"use client"

import { useState } from "react"
import type { Vehiculo } from "@/lib/types"
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
}

export function ServiceDialog({ open, onOpenChange, vehiculo }: Props) {
  const [nombre, setNombre] = useState("")
  const [monto, setMonto] = useState(0)
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [notas, setNotas] = useState("")
  const [loading, setLoading] = useState(false)

  const reset = () => {
    setNombre("")
    setMonto(0)
    setFecha(new Date().toISOString().slice(0, 10))
    setNotas("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) {
      toast.error("Ingresa el nombre del servicio")
      return
    }
    if (!monto || monto <= 0) {
      toast.error("Ingresa el monto del servicio")
      return
    }
    if (!fecha) {
      toast.error("Selecciona la fecha de realización")
      return
    }
    setLoading(true)
    const res = await agregarServicio({
      vehiculo_id: vehiculo.id,
      nombre: nombre.trim(),
      monto,
      fecha_realizacion: fecha,
      notas: notas.trim() || null,
    })
    setLoading(false)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Servicio registrado")
      reset()
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
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
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Registrar servicio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Vehículo: <span className="font-medium text-foreground">{vehiculo.nombre}</span>
          </p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="servicio-nombre">Nombre del servicio *</Label>
            <Input
              id="servicio-nombre"
              placeholder="Ej: Cambio llantas, Frenos, Cadena..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="servicio-monto">Monto (COP) *</Label>
            <CurrencyInput
              id="servicio-monto"
              value={monto}
              onChange={setMonto}
              placeholder="150000"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="servicio-fecha">Fecha de realización *</Label>
            <Input
              id="servicio-fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="servicio-notas">Notas (opcional)</Label>
            <Input
              id="servicio-notas"
              placeholder="Taller, kilometraje, etc."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
