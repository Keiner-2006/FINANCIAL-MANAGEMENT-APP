"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Vehiculo } from "@/lib/types"
import { crearVehiculo, actualizarVehiculo } from "@/app/vehiculos/actions"
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
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehiculo?: Vehiculo
}

export function VehicleFormDialog({ open, onOpenChange, vehiculo }: Props) {
  const router = useRouter()
  const [placa, setPlaca] = useState(vehiculo?.placa ?? "")
  const initialTipo = vehiculo?.tipo === "moto" || vehiculo?.tipo === "carro" ? vehiculo.tipo : "moto"
  const [tipo, setTipo] = useState<"moto" | "carro">(initialTipo)
  const [activo, setActivo] = useState(vehiculo?.activo ?? true)
  const [loading, setLoading] = useState(false)

  const isEdit = !!vehiculo

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const nombre = tipo === "moto" ? "Mi moto" : "Mi carro"
    const input = {
      nombre,
      placa: placa.trim() || null,
      tipo,
      modelo: null,
      anio: null,
    }
    const res = isEdit
      ? await actualizarVehiculo(vehiculo.id, { ...input, activo })
      : await crearVehiculo(input)
    setLoading(false)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success(isEdit ? "Vehículo actualizado" : "Vehículo registrado")
      onOpenChange(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar vehículo" : "Nuevo vehículo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Tipo de vehículo</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={tipo === "moto" ? "default" : "outline"}
                size="sm"
                onClick={() => setTipo("moto")}
              >
                Moto
              </Button>
              <Button
                type="button"
                variant={tipo === "carro" ? "default" : "outline"}
                size="sm"
                onClick={() => setTipo("carro")}
              >
                Carro
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="placa">Placa</Label>
            <Input
              id="placa"
              placeholder="ABC 123"
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
            />
          </div>
          {isEdit && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Activo</p>
                <p className="text-xs text-muted-foreground">Mostrar en el dashboard</p>
              </div>
              <Switch checked={activo} onCheckedChange={setActivo} />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEdit ? "Guardar" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
