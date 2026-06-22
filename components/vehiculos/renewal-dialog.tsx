"use client"

import { useState, useEffect } from "react"
import type { DocumentoActivo, Vehiculo } from "@/lib/types"
import { renovarDocumento } from "@/app/vehiculos/actions"
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
import { toast } from "sonner"

const TIPO_LABEL: Record<string, string> = {
  soat: "SOAT",
  tecnomecanica: "Tecnomecánica",
  aceite: "Aceite",
}

const INTERVALOS: Record<string, (d: Date) => string> = {
  soat: (d) => {
    const r = new Date(d); r.setFullYear(r.getFullYear() + 1); return r.toISOString().slice(0, 10)
  },
  tecnomecanica: (d) => {
    const r = new Date(d); r.setFullYear(r.getFullYear() + 2); return r.toISOString().slice(0, 10)
  },
  aceite: (d) => {
    const r = new Date(d); r.setMonth(r.getMonth() + 1); return r.toISOString().slice(0, 10)
  },
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  documento: DocumentoActivo
  vehiculo: Vehiculo
}

export function RenewalDialog({ open, onOpenChange, documento, vehiculo }: Props) {
  const [fechaRealizacion, setFechaRealizacion] = useState("")
  const [fechaVencimiento, setFechaVencimiento] = useState("")
  const [precio, setPrecio] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      const hoy = new Date().toISOString().slice(0, 10)
      setFechaRealizacion(hoy)
      const sug = INTERVALOS[documento.tipo]
      setFechaVencimiento(sug ? sug(new Date()) : "")
      setPrecio(documento.precio_renovacion ? String(documento.precio_renovacion) : "")
    }
  }, [open, documento.tipo, documento.precio_renovacion])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fechaRealizacion) {
      toast.error("Selecciona la fecha de renovación")
      return
    }
    if (!fechaVencimiento) {
      toast.error("Selecciona la nueva fecha de vencimiento")
      return
    }
    const precioNum = Number(precio.replace(/[^\d]/g, ""))
    if (!precioNum || precioNum <= 0) {
      toast.error("Ingresa el precio de renovación")
      return
    }
    setLoading(true)
    const res = await renovarDocumento({
      documento_id: documento.id,
      vehiculo_id: vehiculo.id,
      nueva_fecha: fechaVencimiento,
      fecha_realizacion: fechaRealizacion,
      precio: precioNum,
    })
    setLoading(false)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success(`${TIPO_LABEL[documento.tipo]} renovado exitosamente`)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Renovar {TIPO_LABEL[documento.tipo]}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Vehículo: <span className="font-medium text-foreground">{vehiculo.nombre}</span>
          </p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fecha-realizacion">¿Cuándo lo renovaste? *</Label>
            <Input
              id="fecha-realizacion"
              type="date"
              value={fechaRealizacion}
              onChange={(e) => setFechaRealizacion(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fecha-vencimiento">Nueva fecha de vencimiento *</Label>
            <Input
              id="fecha-vencimiento"
              type="date"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="precio">Precio de renovación (COP) *</Label>
            <Input
              id="precio"
              type="number"
              placeholder="350000"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Procesando..." : "Renovar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
