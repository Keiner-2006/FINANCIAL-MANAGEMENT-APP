"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CurrencyInput } from "@/components/ui/currency-input"
import { registrarIngresoExtra } from "@/app/dashboard/actions"
import { toast } from "sonner"
import { Banknote } from "lucide-react"

interface IngresoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IngresoDialog({ open, onOpenChange }: IngresoDialogProps) {
  const [monto, setMonto] = useState(0)
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [descripcion, setDescripcion] = useState("")
  const [guardando, setGuardando] = useState(false)

  const reset = () => {
    setMonto(0)
    setFecha(new Date().toISOString().slice(0, 10))
    setDescripcion("")
  }

  const handleGuardar = async () => {
    if (monto <= 0) {
      toast.error("Ingresa un monto válido")
      return
    }
    setGuardando(true)
    const res = await registrarIngresoExtra({
      monto,
      fecha,
      descripcion: descripcion.trim() || null,
    })
    setGuardando(false)
    if (res?.error) {
      toast.error(res.error)
      return
    }
    toast.success("Ingreso registrado")
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
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-green-600" />
            Ingreso extra
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ingreso-monto">Monto</Label>
            <CurrencyInput id="ingreso-monto" value={monto} onChange={setMonto} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ingreso-fecha">Fecha</Label>
            <Input
              id="ingreso-fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ingreso-desc">Descripción (opcional)</Label>
            <Input
              id="ingreso-desc"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: bono por buen desempeño"
              className="h-11"
            />
          </div>

          <Button className="h-11 w-full bg-green-600 hover:bg-green-700" onClick={handleGuardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Registrar ingreso"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
