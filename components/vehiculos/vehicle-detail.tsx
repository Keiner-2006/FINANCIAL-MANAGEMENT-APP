"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Vehiculo, DocumentoActivo, Gasto, HistorialServicio } from "@/lib/types"
import { CATEGORIAS } from "@/lib/types"
import { diasHastaVencimiento } from "@/lib/finance"
import { formatCOP, formatFecha } from "@/lib/format"
import { eliminarVehiculo, eliminarServicio } from "@/app/vehiculos/actions"
import { RenewalDialog } from "./renewal-dialog"
import { ServiceDialog } from "./service-dialog"
import { ServiceRenewalDialog } from "./service-renewal-dialog"
import { VehicleFormDialog } from "./vehicle-form-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  ArrowLeft,
  Car,
  Bike,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  Pencil,
  Fuel,
  Droplet,
  Wrench,
  Wallet,
  Plus,
  Clock,
  Shell,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  vehiculo: Vehiculo
  documentos: DocumentoActivo[]
  gastos: Gasto[]
  servicios: HistorialServicio[]
}

export function VehicleDetail({ vehiculo, documentos, gastos, servicios }: Props) {
  const router = useRouter()
  const [renewalDoc, setRenewalDoc] = useState<DocumentoActivo | null>(null)
  const [renewalServicio, setRenewalServicio] = useState<HistorialServicio | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [serviceOpen, setServiceOpen] = useState(false)

  const soat = documentos.find((d) => d.tipo === "soat")
  const tecno = documentos.find((d) => d.tipo === "tecnomecanica")
  const aceite = documentos.find((d) => d.tipo === "aceite")

  const totalGastos = gastos.reduce((acc, g) => acc + Number(g.monto), 0)

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este vehículo y todos sus documentos?")) return
    const res = await eliminarVehiculo(vehiculo.id)
    if (res?.error) toast.error(res.error)
    else {
      toast.success("Vehículo eliminado")
      router.push("/vehiculos")
    }
  }

  const handleDeleteServicio = async (s: HistorialServicio) => {
    if (!confirm(`¿Eliminar servicio "${s.nombre}"?`)) return
    const res = await eliminarServicio(s.id, vehiculo.id)
    if (res?.error) toast.error(res.error)
    else toast.success("Servicio eliminado")
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex items-center gap-3">
        <Link href="/vehiculos" className="rounded-lg p-2 hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{vehiculo.nombre}</h1>
          <p className="text-sm text-muted-foreground capitalize">
            {vehiculo.tipo}
            {vehiculo.placa ? ` · ${vehiculo.placa}` : ""}
            {vehiculo.modelo ? ` · ${vehiculo.modelo}` : ""}
            {vehiculo.anio ? ` · ${vehiculo.anio}` : ""}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </header>

      {/* Documentos + Aceite */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Documentos</h2>
        <div className="flex flex-col gap-3">
          <DocCard
            doc={soat ?? null}
            vehiculo={vehiculo}
            tipo="soat"
            label="SOAT"
            onRenew={setRenewalDoc}
          />
          <DocCard
            doc={tecno ?? null}
            vehiculo={vehiculo}
            tipo="tecnomecanica"
            label="Tecnomecánica"
            onRenew={setRenewalDoc}
          />
          <DocCard
            doc={aceite ?? null}
            vehiculo={vehiculo}
            tipo="aceite"
            label="Aceite"
            onRenew={setRenewalDoc}
          />
        </div>
      </section>

      {/* Historial de servicios */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Historial de servicios</h2>
          <Button size="sm" variant="outline" onClick={() => setServiceOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>
        {servicios.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Sin servicios registrados
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {servicios.map((s) => (
              <li key={s.id} className="flex items-start gap-3 py-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Shell className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{s.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFecha(s.fecha_realizacion)}
                    {s.notas ? ` · ${s.notas}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold text-foreground">
                    {formatCOP(Number(s.monto))}
                  </span>
                  <button
                    onClick={() => setRenewalServicio(s)}
                    className="text-muted-foreground hover:text-primary"
                    title="Renovar"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteServicio(s)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Resumen gastos */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Gastos del vehículo</h2>
          <span className="text-sm font-bold text-foreground">{formatCOP(totalGastos)}</span>
        </div>
        {gastos.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Sin gastos registrados</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {gastos.slice(0, 10).map((g) => {
              const cat = CATEGORIAS[g.categoria]
              return (
                <li key={g.id} className="flex items-center gap-3 py-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <GastoIcon categoria={g.categoria} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {cat?.label ?? g.categoria}
                      {g.subcategoria ? ` · ${g.subcategoria}` : ""}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatFecha(g.fecha)}
                      {g.descripcion ? ` · ${g.descripcion}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-foreground">{formatCOP(Number(g.monto))}</span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {renewalDoc && (
        <RenewalDialog
          open
          onOpenChange={(o) => !o && setRenewalDoc(null)}
          documento={renewalDoc}
          vehiculo={vehiculo}
        />
      )}
      <ServiceDialog open={serviceOpen} onOpenChange={setServiceOpen} vehiculo={vehiculo} />
      {renewalServicio && (
        <ServiceRenewalDialog
          open
          onOpenChange={(o) => !o && setRenewalServicio(null)}
          vehiculo={vehiculo}
          servicio={renewalServicio}
        />
      )}
      <VehicleFormDialog open={editOpen} onOpenChange={setEditOpen} vehiculo={vehiculo} />
    </div>
  )
}

function DocCard({
  doc,
  vehiculo,
  tipo,
  label,
  onRenew,
}: {
  doc: DocumentoActivo | null
  vehiculo: Vehiculo
  tipo: "soat" | "tecnomecanica" | "aceite"
  label: string
  onRenew: (doc: DocumentoActivo) => void
}) {
  if (!doc) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-dashed border-border p-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">{label}: sin registro</span>
        </div>
      </div>
    )
  }

  const dias = diasHastaVencimiento(doc.fecha_vencimiento)
  const vencido = dias < 0
  const proximo = dias <= 15 && dias >= 0

  return (
    <div
      className={cn(
        "rounded-xl border p-3",
        vencido
          ? "border-destructive/30 bg-destructive/5"
          : proximo
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-border",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {vencido ? (
            <XCircle className="h-4 w-4 text-destructive" />
          ) : proximo ? (
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-accent" />
          )}
          <div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">
              Vence: {new Date(doc.fecha_vencimiento + "T00:00:00").toLocaleDateString("es-CO")}
            </p>
          </div>
        </div>
        {(vencido || proximo) && (
          <Button size="sm" variant="destructive" onClick={() => onRenew(doc)}>
            Renovar
          </Button>
        )}
      </div>
      {doc.precio_renovacion && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          Último precio: {formatCOP(Number(doc.precio_renovacion))}
        </p>
      )}
    </div>
  )
}

function GastoIcon({ categoria }: { categoria: string }) {
  const map: Record<string, React.ReactNode> = {
    transporte_gasolina: <Fuel className="h-4 w-4" />,
    transporte_aceite: <Droplet className="h-4 w-4" />,
    transporte_mantenimiento: <Wrench className="h-4 w-4" />,
  }
  return <>{map[categoria] ?? <Wallet className="h-4 w-4" />}</>
}
