"use client"

import { useState } from "react"
import Link from "next/link"
import type { Vehiculo, DocumentoActivo } from "@/lib/types"
import { diasHastaVencimiento } from "@/lib/finance"
import { VehicleFormDialog } from "./vehicle-form-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Car, Bike, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  vehiculos: Vehiculo[]
  documentos: DocumentoActivo[]
}

export function VehicleList({ vehiculos, documentos }: Props) {
  const [openForm, setOpenForm] = useState(false)

  const getDocStatus = (vehiculoId: string, tipo: string) => {
    const doc = documentos.find((d) => d.vehiculo_id === vehiculoId && d.tipo === tipo)
    if (!doc) return null
    const dias = diasHastaVencimiento(doc.fecha_vencimiento)
    return { dias, vencido: dias < 0, proximo: dias <= 15 && dias >= 0, doc }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Mis Vehículos</h1>
          <p className="text-sm text-muted-foreground">{vehiculos.length} vehículo(s) registrado(s)</p>
        </div>
        <Button size="sm" onClick={() => setOpenForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Agregar
        </Button>
      </header>

      {vehiculos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <Car className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Sin vehículos registrados</p>
          <p className="text-xs text-muted-foreground mt-1">Agrega tu moto o carro para gestionar documentos y gastos</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {vehiculos.map((v) => {
            const soat = getDocStatus(v.id, "soat")
            const tecno = getDocStatus(v.id, "tecnomecanica")
            const aceite = getDocStatus(v.id, "aceite")
            return (
              <Link
                key={v.id}
                href={`/vehiculos/${v.id}`}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {v.tipo === "moto" ? <Bike className="h-6 w-6" /> : <Car className="h-6 w-6" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{v.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {v.placa ? `${v.placa}` : ""}
                    {v.modelo ? ` · ${v.modelo}` : ""}
                    {v.anio ? ` · ${v.anio}` : ""}
                  </p>
                  <div className="mt-1.5 flex gap-2">
                    <DocBadge label="SOAT" status={soat} />
                    <DocBadge label="Tecno" status={tecno} />
                    <DocBadge label="Aceite" status={aceite} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <VehicleFormDialog open={openForm} onOpenChange={setOpenForm} />
    </div>
  )
}

function DocBadge({
  label,
  status,
}: {
  label: string
  status: { dias: number; vencido: boolean; proximo: boolean } | null
}) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
        {label}: sin registro
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
        status.vencido && "bg-destructive/10 text-destructive",
        status.proximo && "bg-amber-500/10 text-amber-700",
        !status.vencido && !status.proximo && "bg-accent/10 text-accent",
      )}
    >
      {status.vencido ? (
        <XCircle className="h-3 w-3" />
      ) : status.proximo ? (
        <AlertTriangle className="h-3 w-3" />
      ) : (
        <CheckCircle className="h-3 w-3" />
      )}
      {label}
    </span>
  )
}
