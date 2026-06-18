"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { trasladarAhorros } from "@/app/dashboard/actions"
import { formatCOP } from "@/lib/format"
import { toast } from "sonner"
import { PiggyBank, TrendingUp, TrendingDown } from "lucide-react"

interface CierreCicloDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  excedente: number
}

export function CierreCicloDialog({ open, onOpenChange, excedente }: CierreCicloDialogProps) {
  const [guardando, setGuardando] = useState(false)
  const positivo = excedente > 0

  const handleTrasladar = async () => {
    setGuardando(true)
    const res = await trasladarAhorros(excedente)
    setGuardando(false)
    if (res?.error) {
      toast.error(res.error)
      return
    }
    toast.success(`Trasladaste ${formatCOP(excedente)} a tu bolsillo de ahorros`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>Cierre de ciclo</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
              positivo ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
            }`}
          >
            {positivo ? <TrendingUp className="h-8 w-8" /> : <TrendingDown className="h-8 w-8" />}
          </div>

          {positivo ? (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Te sobraron en este ciclo</p>
                <p className="text-3xl font-bold text-accent">{formatCOP(excedente)}</p>
              </div>
              <p className="text-sm text-pretty text-muted-foreground">
                ¿Deseas trasladarlos a tu bolsillo de ahorros para que sigan creciendo?
              </p>
              <div className="flex w-full flex-col gap-2">
                <Button className="h-11 w-full" onClick={handleTrasladar} disabled={guardando}>
                  <PiggyBank className="mr-2 h-4 w-4" />
                  {guardando ? "Trasladando..." : "Sí, ahorrar excedente"}
                </Button>
                <Button variant="ghost" className="h-11 w-full" onClick={() => onOpenChange(false)}>
                  Ahora no
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Resultado del ciclo</p>
                <p className="text-3xl font-bold text-destructive">{formatCOP(excedente)}</p>
              </div>
              <p className="text-sm text-pretty text-muted-foreground">
                Este ciclo cerró con déficit. Revisa tus gastos para el próximo periodo.
              </p>
              <Button className="h-11 w-full" onClick={() => onOpenChange(false)}>
                Entendido
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
