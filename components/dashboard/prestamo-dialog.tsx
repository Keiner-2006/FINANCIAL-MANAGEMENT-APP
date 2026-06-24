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
import { Switch } from "@/components/ui/switch"
import { CurrencyInput } from "@/components/ui/currency-input"
import { registrarPrestamo } from "@/app/dashboard/actions"
import { toast } from "sonner"
import { CalendarOff, Percent } from "lucide-react"

interface PrestamoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrestamoDialog({ open, onOpenChange }: PrestamoDialogProps) {
  const [persona, setPersona] = useState("")
  const [monto, setMonto] = useState(0)
  const [tipo, setTipo] = useState<"prestado" | "deuda">("deuda")
  const [tasaInteres, setTasaInteres] = useState(0)
  const [fechaPrestamo, setFechaPrestamo] = useState(new Date().toISOString().slice(0, 10))
  const [sinFecha, setSinFecha] = useState(true)
  const [fechaPago, setFechaPago] = useState("")
  const [notas, setNotas] = useState("")
  const [guardando, setGuardando] = useState(false)

  const reset = () => {
    setPersona("")
    setMonto(0)
    setTipo("deuda")
    setTasaInteres(0)
    setFechaPrestamo(new Date().toISOString().slice(0, 10))
    setSinFecha(true)
    setFechaPago("")
    setNotas("")
  }

  const handleGuardar = async () => {
    if (!persona.trim()) {
      toast.error("Ingresa el nombre de la persona")
      return
    }
    if (monto <= 0) {
      toast.error("Ingresa un monto válido")
      return
    }
    setGuardando(true)
    const res = await registrarPrestamo({
      persona,
      monto,
      tipo,
      tasa_interes: tasaInteres,
      fecha_prestamo: fechaPrestamo,
      fecha_pago: sinFecha ? null : (fechaPago || null),
      notas: notas || null,
    })
    setGuardando(false)
    if (res?.error) {
      toast.error(res.error)
      return
    }
    toast.success(tipo === "deuda" ? "Deuda registrada" : "Préstamo registrado")
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
          <DialogTitle>{tipo === "deuda" ? "Pedir prestado" : "Prestar dinero"}</DialogTitle>
          <DialogDescription>
            {tipo === "deuda"
              ? "Registra el dinero que te han prestado."
              : "Registra el dinero que prestaste a alguien."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label>Tipo</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTipo("deuda")}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  tipo === "deuda"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted/40 text-muted-foreground hover:bg-muted/60"
                }`}
              >
                Me prestaron
              </button>
              <button
                type="button"
                onClick={() => setTipo("prestado")}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  tipo === "prestado"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted/40 text-muted-foreground hover:bg-muted/60"
                }`}
              >
                Presté dinero
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="prest-persona">
              {tipo === "deuda" ? "¿Quién te prestó?" : "¿A quién le prestaste?"}
            </Label>
            <Input
              id="prest-persona"
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              placeholder="Nombre de la persona"
              className="h-11"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="prest-monto">Monto</Label>
            <CurrencyInput id="prest-monto" value={monto} onChange={setMonto} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="prest-fecha-prestamo">Fecha del préstamo</Label>
            <Input
              id="prest-fecha-prestamo"
              type="date"
              value={fechaPrestamo}
              onChange={(e) => setFechaPrestamo(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3">
            <div className="flex items-center gap-2">
              <CalendarOff className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Sin fecha de pago</p>
                <p className="text-xs text-muted-foreground">Cuando tenga el dinero</p>
              </div>
            </div>
            <Switch checked={sinFecha} onCheckedChange={setSinFecha} />
          </div>

          {!sinFecha && (
            <div className="grid gap-2">
              <Label htmlFor="prest-fecha-pago">Fecha a pagar</Label>
              <Input
                id="prest-fecha-pago"
                type="date"
                value={fechaPago}
                onChange={(e) => setFechaPago(e.target.value)}
                className="h-11"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="prest-interes">
              <span className="flex items-center gap-1.5">
                <Percent className="h-4 w-4" /> Interés mensual (%)
              </span>
            </Label>
            <Input
              id="prest-interes"
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={tasaInteres}
              onChange={(e) => setTasaInteres(Math.max(0, Number(e.target.value)))}
              className="h-11"
              placeholder="0 = sin interés"
            />
            {tasaInteres > 0 && !sinFecha && fechaPago && (
              <p className="text-xs text-muted-foreground">
                El interés se calculará automáticamente según los meses transcurridos.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="prest-notas">Notas (opcional)</Label>
            <Input
              id="prest-notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: para el negocio"
              className="h-11"
            />
          </div>

          <Button className="h-11 w-full" onClick={handleGuardar} disabled={guardando}>
            {guardando ? "Guardando..." : tipo === "deuda" ? "Registrar deuda" : "Registrar préstamo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
